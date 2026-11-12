// Accordion toggle icon: "+" when closed, "−" when open. The vertical bar
// shrinks away so the plus morphs into a minus. Drawn in currentColor, so the
// parent's text colour sets it.
export default function PlusMinus({
  open,
  size = 14,
  strokeWidth = 1.6,
  className = "",
}: {
  open: boolean;
  size?: number;
  strokeWidth?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      aria-hidden="true"
      className={`flex-none ${className}`}
    >
      <path d="M2.5 7h9" />
      <path
        d="M7 2.5v9"
        className="origin-center transition-transform duration-240 ease-site motion-reduce:transition-none"
        style={{ transform: open ? "scaleY(0)" : "scaleY(1)", transformBox: "fill-box" }}
      />
    </svg>
  );
}
