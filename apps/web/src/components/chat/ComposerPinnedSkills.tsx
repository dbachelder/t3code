import type { ServerProviderSkill, ServerProviderSlashCommand } from "@t3tools/contracts";
import {
  getPinnableProviderSkills,
  getPinnedProviderSkills,
  getProviderSkillArgumentHint,
  providerSkillArgumentHintIsRequired,
  setProviderSkillPinned,
} from "@t3tools/client-runtime/providerSkills";
import { formatProviderSkillDisplayName } from "@t3tools/shared/inlineSkills";
import { PinIcon } from "lucide-react";
import { T, useGT } from "gt-react";
import { useState } from "react";

import { updateClientSettings } from "../../hooks/useSettings";
import {
  Menu,
  MenuCheckboxItem,
  MenuItem,
  MenuPopup,
  MenuSearchInput,
  MenuTrigger,
} from "../ui/menu";
import { Tooltip, TooltipPopup, TooltipTrigger } from "../ui/tooltip";
import { ComposerControl, ComposerControlIcon } from "./ComposerControl";
import { useComposerMenuProps } from "./composerEventScope";

function skillDescription(skill: ServerProviderSkill): string | undefined {
  return skill.shortDescription ?? skill.description;
}

function skillMatchesQuery(skill: ServerProviderSkill, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return [skill.name, skill.displayName, skillDescription(skill)].some((text) =>
    text?.toLowerCase().includes(needle),
  );
}

/** Pinned skill buttons beside the composer, plus the menu that pins and unpins them. */
export function ComposerPinnedSkills({
  skills,
  slashCommands,
  pinnedSkillNames,
  disabled,
  onRunSkill,
}: {
  readonly skills: ReadonlyArray<ServerProviderSkill>;
  readonly slashCommands: ReadonlyArray<ServerProviderSlashCommand>;
  readonly pinnedSkillNames: ReadonlyArray<string>;
  readonly disabled: boolean;
  /** `requiresArgument` is set when the skill's hint marks an argument as required. */
  readonly onRunSkill: (skillName: string, requiresArgument: boolean) => void;
}) {
  const gt = useGT();
  const [query, setQuery] = useState("");
  const menuProps = useComposerMenuProps();
  const pinnable = getPinnableProviderSkills(skills);
  if (pinnable.length === 0) return null;

  const pinned = getPinnedProviderSkills(skills, pinnedSkillNames);
  const pinnedKeys = new Set(pinnedSkillNames.map((name) => name.trim().toLowerCase()));
  const visible = pinnable.filter((skill) => skillMatchesQuery(skill, query));

  return (
    <div className="me-2 flex shrink-0 items-center gap-0.5">
      {pinned.map((skill) => {
        const hint = getProviderSkillArgumentHint(skill.name, slashCommands);
        const description = skillDescription(skill);
        return (
          <Tooltip key={skill.name}>
            <TooltipTrigger
              render={
                <ComposerControl
                  disabled={disabled}
                  aria-label={gt("Send ${skill}", { skill: skill.name })}
                  onPointerDown={(event) => event.preventDefault()}
                  onClick={() => onRunSkill(skill.name, providerSkillArgumentHintIsRequired(hint))}
                />
              }
            >
              <span data-composer-control-label>{formatProviderSkillDisplayName(skill)}</span>
            </TooltipTrigger>
            <TooltipPopup side="top">
              <div className="font-mono">
                ${skill.name}
                {hint ? <span className="text-muted-foreground"> {hint}</span> : null}
              </div>
              {description ? <div className="mt-0.5">{description}</div> : null}
            </TooltipPopup>
          </Tooltip>
        );
      })}
      <Menu
        onOpenChange={(open) => {
          if (!open) setQuery("");
        }}
      >
        <Tooltip>
          <TooltipTrigger
            render={<MenuTrigger render={<ComposerControl aria-label={gt("Pin skills")} />} />}
          >
            <ComposerControlIcon icon={PinIcon} />
          </TooltipTrigger>
          <TooltipPopup side="top">
            <T>Pin skills</T>
          </TooltipPopup>
        </Tooltip>
        <MenuPopup align="start" className="w-[min(24rem,calc(100vw-2rem))]" {...menuProps}>
          <MenuSearchInput
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.currentTarget.value)}
            placeholder={gt("Search skills")}
            aria-label={gt("Search skills")}
          />
          {visible.length === 0 ? (
            <MenuItem disabled>
              <T>No skills found</T>
            </MenuItem>
          ) : null}
          {visible.map((skill) => {
            const hint = getProviderSkillArgumentHint(skill.name, slashCommands);
            const description = skillDescription(skill);
            return (
              <MenuCheckboxItem
                key={skill.name}
                checked={pinnedKeys.has(skill.name.trim().toLowerCase())}
                onCheckedChange={(next) => {
                  void updateClientSettings({
                    pinnedSkills: setProviderSkillPinned(pinnedSkillNames, skill.name, next),
                  });
                }}
                {...(description ? { title: description } : {})}
              >
                <span className="flex min-w-0 items-baseline gap-2">
                  <span className="shrink-0">{formatProviderSkillDisplayName(skill)}</span>
                  {hint ? (
                    <span className="min-w-0 truncate font-mono text-muted-foreground text-xs">
                      {hint}
                    </span>
                  ) : null}
                </span>
              </MenuCheckboxItem>
            );
          })}
        </MenuPopup>
      </Menu>
    </div>
  );
}
