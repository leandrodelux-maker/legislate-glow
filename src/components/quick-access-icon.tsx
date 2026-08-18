import {
  FileText,
  ClipboardList,
  Monitor,
  BookOpen,
  Users,
  Building2,
  Phone,
  Mail,
  Gavel,
  Scale,
  ShieldCheck,
  Calendar,
  Wallet,
  Receipt,
  Landmark,
  Globe,
  type LucideIcon,
} from "lucide-react";
import type { QuickAccessIcon } from "@/lib/quick-access-store";

const MAP: Record<QuickAccessIcon, LucideIcon> = {
  FileText,
  ClipboardList,
  Monitor,
  BookOpen,
  Users,
  Building2,
  Phone,
  Mail,
  Gavel,
  Scale,
  ShieldCheck,
  Calendar,
  Wallet,
  Receipt,
  Landmark,
  Globe,
};

export function QuickAccessIconRender({
  name,
  className,
}: {
  name: QuickAccessIcon;
  className?: string;
}) {
  const Icon = MAP[name] ?? FileText;
  return <Icon className={className} />;
}
