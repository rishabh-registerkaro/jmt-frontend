"use client";

import { ArrowRight, Check } from "lucide-react";
import Photo from "@/components/common/Photo";
import type { RolesContent } from "@/types/service";
import { useRoleSelection } from "./RoleSelection";

interface RolesPickerProps {
  content: Omit<RolesContent, "copy">;
}

// Figma "Roles available" 237:264 — four 302×472 trade cards with tickable
// roles, then a brown summary pill that leads to the request form.
// Phones (242:230): one card per row, 120px photo with the role count beside
// the trade name, roles as wrapping pill toggles, full-width summary bar.
const cls = {
  grid: "m-0 grid list-none grid-cols-1 gap-[12px] p-0 sm:grid-cols-2 md:gap-[24px] xl:grid-cols-4",
  card: "flex flex-col overflow-hidden rounded-[16px] border border-sand bg-white md:rounded-[20px] xl:min-h-[472px]",
  photo: "relative h-[120px] flex-none overflow-hidden bg-navy-card md:h-[200px]",
  shade: [
    "absolute inset-0 bg-[linear-gradient(180deg,rgba(8,27,48,0)_30%,rgba(8,27,48,0.88)_100%)]",
    "md:bg-[linear-gradient(180deg,rgba(8,27,48,0)_35%,rgba(8,27,48,0.8)_100%)]",
  ].join(" "),
  head: "absolute inset-x-0 bottom-0 m-0 flex items-center gap-[8px] p-[18px] md:p-[20px]",
  tradeName: "text-[17px] leading-[normal] font-bold text-white md:text-[19px]",
  countInline: "rounded-full bg-white/90 px-[8px] py-[2px] text-[11px] leading-[normal] font-bold text-brown md:hidden",
  count: [
    "absolute top-[16px] right-[16px] hidden rounded-full bg-white/90 px-[10px] py-[4px]",
    "text-[12px] leading-[normal] font-bold text-brown md:block",
  ].join(" "),
  roles: [
    "m-0 flex list-none flex-wrap gap-[8px] p-[14px]",
    "md:flex-col md:flex-nowrap md:gap-[4px] md:pb-[16px]",
  ].join(" "),
  role: [
    "flex cursor-pointer items-center gap-[7px] rounded-full border border-sand bg-white py-[8px] pr-[12px] pl-[8px]",
    "transition-colors duration-160 has-checked:border-orange has-checked:bg-peach-100",
    "has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-orange",
    "md:gap-[12px] md:rounded-[12px] md:border-0 md:bg-transparent md:px-[12px] md:py-[10px] md:hover:bg-peach-100/60",
  ].join(" "),
  box: [
    "flex size-[18px] flex-none items-center justify-center rounded-full border-[1.5px] border-sand bg-white",
    "md:size-[22px] md:rounded-[6px]",
    "peer-checked:border-orange peer-checked:bg-orange [&>svg]:opacity-0 peer-checked:[&>svg]:opacity-100",
  ].join(" "),
  roleName: "text-[13.5px] leading-[normal] font-semibold whitespace-nowrap text-ink md:whitespace-normal md:text-[15px]",
  roleLevel: "hidden text-[12.5px] leading-[normal] text-slate md:block",
  summary: [
    "flex w-full items-center justify-between gap-[12px] rounded-full bg-brown py-[10px] pr-[10px] pl-[16px]",
    "md:w-auto md:max-w-full md:flex-wrap md:justify-start md:gap-x-[16px] md:gap-y-[10px] md:self-start md:py-[14px] md:pr-[14px] md:pl-[24px]",
  ].join(" "),
  summaryText: "m-0 min-w-0 truncate text-[13.5px] leading-[normal] font-semibold text-white md:text-[16px] md:whitespace-normal",
  continue: [
    "btn-primary flex-none [--btn-h:34px] gap-[6px] px-[14px] py-[8px] text-[13.5px] leading-[normal] [--focus-color:#fff]",
    "md:[--btn-h:40px] md:gap-[8px] md:px-[18px] md:text-[15px]",
  ].join(" "),
};

const fill = (template: string, names: string[]) =>
  template.replace("{n}", String(names.length)).replace("{list}", names.join(", "));

export default function RolesPicker({ content }: RolesPickerProps) {
  // Shared with the request form at the bottom of the page (RoleSelectionProvider).
  const selection = useRoleSelection();
  if (!selection) throw new Error("RolesPicker must be rendered inside RoleSelectionProvider");
  const { isSelected, toggle } = selection;
  const selectedNames = selection.selectedRoles.map((role) => role.name);
  const none = selectedNames.length === 0;

  return (
    <>
      <ul className={cls.grid} data-reveal-stagger>
        {content.trades.map((trade, index) => {
          const countLabel = `${trade.roles.length} ${trade.roles.length === 1 ? "role" : "roles"}`;
          return (
            <li key={trade.id} className={cls.card} style={{ "--i": index } as React.CSSProperties}>
              <div className={cls.photo}>
                <Photo image={trade.image} sizes="(min-width: 1280px) 24vw, (min-width: 640px) 50vw, 100vw" />
                <span className={cls.shade} aria-hidden="true" />
                <h3 className={cls.head}>
                  <span className={cls.tradeName}>{trade.name}</span>
                  <span className={cls.countInline}>{countLabel}</span>
                </h3>
                <span className={cls.count}>{countLabel}</span>
              </div>
              <ul className={cls.roles} aria-label={trade.name}>
                {trade.roles.map((role) => (
                  <li key={role.id}>
                    <label className={cls.role}>
                      <input
                        type="checkbox"
                        className="peer sr-only"
                        checked={isSelected(role.id)}
                        onChange={() => toggle(role.id)}
                      />
                      <span className={cls.box} aria-hidden="true">
                        <Check strokeWidth={3} className="size-[11px] text-white md:size-[13px]" aria-hidden="true" />
                      </span>
                      <span className="flex min-w-0 flex-col">
                        <span className={cls.roleName}>{role.name}</span>
                        <span className={cls.roleLevel}>{role.level}</span>
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ul>

      <div className={cls.summary} data-reveal>
        <p className={cls.summaryText} aria-live="polite">
          {none ? (
            content.emptySummary
          ) : (
            <>
              <span className="md:hidden">{fill(content.summaryShort, selectedNames)}</span>
              <span className="hidden md:inline">{fill(content.summary, selectedNames)}</span>
            </>
          )}
        </p>
        <a href="#contact" className={cls.continue}>
          <span className="md:hidden">{content.continueShort}</span>
          <span className="hidden md:inline">{content.continueCta}</span>
          <ArrowRight className="size-[14px] text-white md:size-[16px]" aria-hidden="true" />
        </a>
      </div>
    </>
  );
}
