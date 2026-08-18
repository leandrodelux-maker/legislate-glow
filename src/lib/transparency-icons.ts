import {
  Banknote,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  ExternalLink,
  FileCheck2,
  FileClock,
  FileSignature,
  FileText,
  Gavel,
  HandCoins,
  Landmark,
  Receipt,
  Scale,
  ShieldCheck,
  Users,
  WalletCards,
  type LucideIcon,
} from "lucide-react";

export const TRANSPARENCY_ICONS: Record<string, LucideIcon> = {
  Banknote,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  ExternalLink,
  FileCheck2,
  FileClock,
  FileSignature,
  FileText,
  Gavel,
  HandCoins,
  Landmark,
  Receipt,
  Scale,
  ShieldCheck,
  Users,
  WalletCards,
};

export const TRANSPARENCY_ICON_NAMES = Object.keys(TRANSPARENCY_ICONS);

export function getTransparencyIcon(name: string | null | undefined): LucideIcon {
  if (!name) return ExternalLink;
  return TRANSPARENCY_ICONS[name] ?? ExternalLink;
}
