import Image from "next/image";
import type { HomeImage, ImageFocus } from "@/types/homepage";

const FOCUS_CLASS: Record<ImageFocus, string> = {
  center: "object-center",
  top: "object-top",
  // Keeps headroom above a portrait subject (Figma founder crop: y 110 of 941).
  upper: "object-[center_30%]",
  left: "object-left",
  right: "object-[78%_center]",
};

interface PhotoProps {
  image: HomeImage;
  /** Responsive `sizes` hint — the rendered slot width at each breakpoint. */
  sizes: string;
  priority?: boolean;
  className?: string;
}

/**
 * Cover-cropped photo that fills its nearest positioned ancestor.
 * Works for bundled assets and arbitrary CMS URLs alike, since `fill` doesn't
 * depend on the source's intrinsic size.
 */
export default function Photo({ image, sizes, priority = false, className }: PhotoProps) {
  return (
    <Image
      src={image.src}
      alt={image.alt}
      fill
      sizes={sizes}
      preload={priority} /* Next 16: `priority` is deprecated in favour of `preload` */
      className={["object-cover", FOCUS_CLASS[image.focus ?? "center"], className].filter(Boolean).join(" ")}
    />
  );
}
