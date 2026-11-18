import { Minus, Plus } from "lucide-react";

// Accordion toggle icon: "+" when closed, "−" when open. The plus fades away
// over the minus. Drawn in currentColor, so the parent's text colour sets it.
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
  const icon = { size, strokeWidth, absoluteStrokeWidth: true };
  return (
    <span aria-hidden="true" className={`relative flex-none ${className}`} style={{ width: size, height: size }}>
      <Minus {...icon} className="absolute inset-0" />
      <Plus
        {...icon}
        className={`absolute inset-0 transition-opacity duration-240 ease-site motion-reduce:transition-none ${open ? "opacity-0" : "opacity-100"}`}
      />
    </span>
  );
}
