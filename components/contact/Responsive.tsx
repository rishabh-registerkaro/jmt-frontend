// The contact page's phone frame (Figma 304:2) shortens several labels. Both
// versions are in the HTML; CSS shows one (`display: none` also hides the
// other from screen readers).
export function Responsive({ desktop, mobile }: { desktop: string; mobile: string }) {
  if (desktop === mobile) return <>{desktop}</>;
  return (
    <>
      <span className="max-md:hidden">{desktop}</span>
      <span className="md:hidden">{mobile}</span>
    </>
  );
}

/** Heading with the orange accent phrase from the design. */
export function AccentHeading({ heading }: { heading: { lead: string; accent: string; tail?: string } }) {
  const tail = heading.tail ? (/^[.,!?]/.test(heading.tail) ? heading.tail : ` ${heading.tail}`) : null;
  return (
    <>
      {heading.lead} <span className="text-orange">{heading.accent}</span>
      {tail}
    </>
  );
}
