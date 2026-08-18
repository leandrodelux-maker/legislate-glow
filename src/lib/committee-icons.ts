import { Scale, Coins, GraduationCap, Gavel, Landmark, Leaf, HeartPulse, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/** Ícones disponíveis para as comissões permanentes. */
export const COMMITTEE_ICONS: Record<string, LucideIcon> = {
  Scale,
  Coins,
  GraduationCap,
  Gavel,
  Landmark,
  Leaf,
  HeartPulse,
  Users,
};

export const COMMITTEE_ICON_NAMES: string[] = Object.keys(COMMITTEE_ICONS);

export function getCommitteeIcon(name?: string | null): LucideIcon {
  return (name && COMMITTEE_ICONS[name]) || Scale;
}
