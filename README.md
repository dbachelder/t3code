# T3 Code daily

Upstream [T3 Code](https://github.com/pingdotgg/t3code) nightlies with a few local patches.

- `daily`: the patches, on top of an upstream nightly tag.
- `fork-ci` (default branch): `.github/workflows/daily-release.yml`. Every 4 hours it takes the
  newest upstream nightly tag, cherry-picks `daily` onto it, builds the macOS arm64 app and the
  Linux x64 `t3` archive, and publishes them here as a release with the same version. If the
  patches stop applying, the run fails and nothing is published.

The macOS app is signed with a self-signed certificate (secrets `CSC_LINK`, `CSC_KEY_PASSWORD`). The in-app
updater only installs builds signed by the same certificate, so do not replace it.

## Machines

**macOS desktop:** quit T3 Code, install the `.dmg` from the newest release over
`/Applications/T3 Code (Nightly).app`, then run
`xattr -dr com.apple.quarantine "/Applications/T3 Code (Nightly).app"` (the app is not notarized).
After that, Settings → About updates from this repository.

**`t3` hosts (Linux x64):** point the service and your shell at this repository's archives:

```sh
mkdir -p ~/.config/systemd/user/t3code.service.d
printf '[Service]\nEnvironment=T3CODE_RELEASE_BASE_URL=https://github.com/dbachelder/t3code/releases/download\n' \
  > ~/.config/systemd/user/t3code.service.d/daily.conf
systemctl --user daemon-reload
echo 'export T3CODE_RELEASE_BASE_URL=https://github.com/dbachelder/t3code/releases/download' >> ~/.profile
T3CODE_RELEASE_BASE_URL=https://github.com/dbachelder/t3code/releases/download \
  t3 update <newest release version, e.g. 0.1.8-nightly.20261107.4340> --yes
```

`t3 update` without a version picks the newest upstream nightly, which fails until this
repository has published it.

## Changing the patches

```sh
git fetch upstream --tags
git switch daily && git rebase --onto <new nightly tag> <old base tag> daily
git push --force-with-lease fork daily
gh workflow run daily-release.yml -R dbachelder/t3code
```
