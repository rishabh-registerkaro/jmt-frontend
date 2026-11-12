import type { ComponentType, SVGProps } from "react";
import { Building, TrainFront } from "lucide-react";
import { TbBuildingBridge, TbBuildingWarehouse, TbRoad } from "react-icons/tb";

export type SiteIconKey = "bridge" | "train" | "station" | "building" | "road";

type StrokeIcon = ComponentType<SVGProps<SVGSVGElement> & { size?: number | string }>;

/**
 * "Sites we staff" glyphs (About strip, Join "Where you'll work").
 * Lucide + Tabler stroke icons; both follow currentColor and take `strokeWidth`.
 * Figma draws them at stroke 1.65/22 = 1.8 on a 24 grid.
 */
export const SITE_ICONS: Record<SiteIconKey, StrokeIcon> = {
  bridge: TbBuildingBridge,
  train: TrainFront,
  station: TbBuildingWarehouse,
  building: Building,
  road: TbRoad,
};

export const SITE_ICON_STROKE = 1.8;
