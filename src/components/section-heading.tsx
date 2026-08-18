import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
  light = false,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
  light?: boolean;
}) {
  return (
    <div
      className={cn(
        "max-w-3xl",
        align === "center" && "mx-auto text-center",
        className
      )}
    >
      {eyebrow && (
        <div
          className={cn(
            "flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em]",
            light ? "text-gold" : "text-primary",
            align === "center" && "justify-center"
          )}
        >
          <span className="gold-divider" />
          {eyebrow}
        </div>
      )}
      <h2 className={cn(
        "mt-4 font-display text-3xl md:text-4xl lg:text-5xl font-semibold",
        light ? "text-white" : "text-foreground"
      )}>
        {title}
      </h2>
      {description && (
        <p className={cn(
          "mt-4 text-base md:text-lg leading-relaxed",
          light ? "text-white/80" : "text-muted-foreground"
        )}>
          {description}
        </p>
      )}
    </div>
  );
}
