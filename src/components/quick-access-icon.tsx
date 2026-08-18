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

const MAP: Record<string, LucideIcon> = {
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
  name: string;
  className?: string;
}) {
  const Icon = MAP[name] ?? FileText;
  return <Icon className={className} />;
}
