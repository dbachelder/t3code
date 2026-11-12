import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Path from "effect/Path";
import * as Schema from "effect/Schema";
import * as SqlClient from "effect/sql/SqlClient";

import * as NodeSqliteClient from "@t3tools/shared/nodeSqliteClient";

export interface ImportedCookie {
  readonly url: string;
  readonly name: string;
  readonly value: string;
  /** Leave host-only cookies undefined; Electron widens any supplied domain and rejects __Host- cookies with one. */
  readonly domain: string | undefined;
  readonly path: string;
  readonly secure: boolean;
  readonly httpOnly: boolean;
  readonly expirationDate: number | undefined;
  readonly sameSite: "unspecified" | "no_restriction" | "lax" | "strict";
}

export interface CookieReadResult {
  readonly cookies: ReadonlyArray<ImportedCookie>;
  readonly undecryptable: number;
  readonly undecryptableHosts: ReadonlyArray<string>;
}

export const cookieScope = (
  host: string,
  path: string,
  secure: boolean,
): { readonly url: string; readonly domain: string | undefined } => {
  const isDomainCookie = host.startsWith(".");
  const unwrappedHost = bareHost(host);
  const authority =
    unwrappedHost.includes(":") && !(unwrappedHost.startsWith("[") && unwrappedHost.endsWith("]"))
      ? `[${unwrappedHost}]`
      : unwrappedHost;
  return {
    url: `${secure ? "https" : "http"}://${authority}${path}`,
    domain: isDomainCookie ? host : undefined,
  };
};

export const bareHost = (host: string): string => (host.startsWith(".") ? host.slice(1) : host);

class CookieDatabaseCopyTornError extends Schema.TaggedError<CookieDatabaseCopyTornError>()(
  "CookieDatabaseCopyTornError",
  { cookiePath: Schema.String },
) {
  override get message(): string {
    return `The copy of ${this.cookiePath} changed while it was copied.`;
  }
}

const SQLITE_SIDECARS = ["-wal", "-journal"] as const;

/**
 * Copy the files instead of opening the source: a SQLite lock on a running browser's jar can make
 * its own cookie writes fail. A copy torn by a concurrent write fails the integrity check and retries.
 */
export const snapshotCookieDatabase = Effect.fn("CookieDatabase.snapshotCookieDatabase")(function* (
  cookiePath: string,
  tempPrefix = "t3code-cookie-import-",
) {
  const fileSystem = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const directory = yield* fileSystem.makeTempDirectoryScoped({ prefix: tempPrefix });
  const target = path.join(directory, path.basename(cookiePath));
  const copyOnce = Effect.gen(function* () {
    yield* fileSystem.copyFile(cookiePath, target);
    for (const suffix of SQLITE_SIDECARS) {
      yield* fileSystem.remove(`${target}${suffix}`, { force: true });
      if (yield* fileSystem.exists(`${cookiePath}${suffix}`)) {
        yield* fileSystem.copyFile(`${cookiePath}${suffix}`, `${target}${suffix}`);
      }
    }
    // Read-write, so SQLite can replay a copied WAL or roll back a copied hot journal.
    const rows = yield* Effect.gen(function* () {
      const sql = yield* SqlClient.SqlClient;
      return yield* sql<{ readonly quick_check: string }>`PRAGMA quick_check`;
    }).pipe(Effect.provide(NodeSqliteClient.layer({ filename: target })));
    if (rows[0]?.quick_check !== "ok") {
      return yield* new CookieDatabaseCopyTornError({ cookiePath });
    }
  });
  yield* copyOnce.pipe(Effect.retry({ times: 2 }));
  return target;
});
