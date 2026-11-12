import type { ReactNode } from "react";

// Long contact values (emails) have no natural break points, so narrow columns
// split them mid-word ("globaleliteopc.co / m"). A <wbr> after "@" lets the
// browser wrap cleanly as "name@" / "domain.com"; pair with `wrap-anywhere`
// as the last-resort fallback.
export function breakable(text: string): ReactNode {
  const at = text.indexOf("@");
  if (at === -1) return text;
  return (
    <>
      {text.slice(0, at + 1)}
      <wbr />
      {text.slice(at + 1)}
    </>
  );
}
