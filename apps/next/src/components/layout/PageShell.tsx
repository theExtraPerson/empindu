import { ReactNode, ElementType, HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/**
 * Shared brutalist Lekton layout primitives.
 * Use these across every page for consistent typography + spacing.
 */

type SectionTone =
  | "default"
  | "muted"
  | "cream"
  | "dark"
  | "primary-soft"
  | "accent";

const toneClass: Record<SectionTone, string> = {
  default: "bg-background text-foreground",
  muted: "bg-muted text-foreground",
  cream: "bg-warm-cream text-foreground",
  dark: "bg-bark-brown text-warm-cream",
  "primary-soft": "bg-primary-soft text-foreground",
  accent: "bg-accent text-accent-foreground",
};

interface SectionProps extends HTMLAttributes<HTMLElement> {
  tone?: SectionTone;
  bordered?: boolean;
  as?: ElementType;
  size?: "sm" | "md" | "lg";
  children: ReactNode;
}

const sizeClass = {
  sm: "py-12 md:py-16",
  md: "py-16 md:py-20",
  lg: "py-20 md:py-28",
};

export function Section({
  tone = "default",
  bordered = true,
  as: As = "section",
  size = "md",
  className,
  children,
  ...rest
}: SectionProps) {
  return (
    <As
      className={cn(
        toneClass[tone],
        bordered && "border-b-2 border-foreground",
        tone === "dark" && bordered && "border-warm-cream",
        className
      )}
      {...rest}
    >
      <div className={cn("mx-auto max-w-7xl px-4 sm:px-6 lg:px-8", sizeClass[size])}>
        {children}
      </div>
    </As>
  );
}

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}
export function Container({ className, children, ...rest }: ContainerProps) {
  return (
    <div className={cn("mx-auto max-w-7xl px-4 sm:px-6 lg:px-8", className)} {...rest}>
      {children}
    </div>
  );
}

interface EyebrowProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: "dark" | "light" | "accent";
  children: ReactNode;
}
export function Eyebrow({ tone = "dark", className, children, ...rest }: EyebrowProps) {
  const t =
    tone === "light"
      ? "border-warm-cream text-warm-cream"
      : tone === "accent"
      ? "border-foreground text-primary"
      : "border-foreground text-foreground";
  return (
    <span
      className={cn(
        "inline-block border-2 px-3 py-1 font-display text-[11px] tracking-[0.35em] uppercase",
        t,
        className
      )}
      {...rest}
    >
      {children}
    </span>
  );
}

interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  as?: "h1" | "h2" | "h3";
  size?: "display" | "xl" | "lg" | "md";
  children: ReactNode;
}
const headingSize = {
  display: "text-5xl md:text-7xl lg:text-8xl leading-[0.95]",
  xl: "text-4xl md:text-5xl lg:text-6xl leading-[1]",
  lg: "text-3xl md:text-4xl lg:text-5xl leading-tight",
  md: "text-2xl md:text-3xl leading-tight",
};
export function Heading({
  as: As = "h2",
  size = "lg",
  className,
  children,
  ...rest
}: HeadingProps) {
  return (
    <As
      className={cn(
        "font-display uppercase tracking-tight",
        headingSize[size],
        className
      )}
      {...rest}
    >
      {children}
    </As>
  );
}

interface LeadProps extends HTMLAttributes<HTMLParagraphElement> {
  children: ReactNode;
}
export function Lead({ className, children, ...rest }: LeadProps) {
  return (
    <p
      className={cn(
        "font-body text-lg leading-8 text-muted-foreground max-w-2xl",
        className
      )}
      {...rest}
    >
      {children}
    </p>
  );
}

interface SectionHeaderProps {
  eyebrow?: ReactNode;
  title: ReactNode;
  lead?: ReactNode;
  align?: "left" | "center" | "between";
  tone?: "dark" | "light" | "accent";
  size?: "xl" | "lg" | "md";
  as?: "h1" | "h2" | "h3";
  className?: string;
}
export function SectionHeader({
  eyebrow,
  title,
  lead,
  align = "left",
  tone = "dark",
  size = "lg",
  as = "h2",
  className,
}: SectionHeaderProps) {
  if (align === "between") {
    return (
      <div className={cn("mb-12 grid gap-6 md:grid-cols-2 md:items-end", className)}>
        <div>
          {eyebrow ? <Eyebrow tone={tone}>{eyebrow}</Eyebrow> : null}
          <Heading as={as} size={size} className={cn(eyebrow ? "mt-4" : "")}>
            {title}
          </Heading>
        </div>
        {lead ? (
          <Lead className={tone === "light" ? "text-warm-cream/80 max-w-none" : "max-w-none"}>
            {lead}
          </Lead>
        ) : null}
      </div>
    );
  }
  return (
    <div
      className={cn(
        "mb-12",
        align === "center" && "text-center flex flex-col items-center",
        className
      )}
    >
      {eyebrow ? <Eyebrow tone={tone}>{eyebrow}</Eyebrow> : null}
      <Heading as={as} size={size} className={cn(eyebrow ? "mt-4" : "")}>
        {title}
      </Heading>
      {lead ? (
        <Lead
          className={cn(
            "mt-6",
            align === "center" && "mx-auto",
            tone === "light" && "text-warm-cream/80"
          )}
        >
          {lead}
        </Lead>
      ) : null}
    </div>
  );
}

interface BrutalCardProps extends HTMLAttributes<HTMLDivElement> {
  as?: ElementType;
  hover?: boolean;
  tone?: "card" | "muted" | "dark" | "cream";
  padding?: "sm" | "md" | "lg";
  shadow?: "none" | "sm" | "md" | "lg";
  children: ReactNode;
}
const cardTone = {
  card: "bg-card text-card-foreground",
  muted: "bg-muted text-foreground",
  dark: "bg-bark-brown text-warm-cream border-warm-cream/60",
  cream: "bg-warm-cream text-foreground",
};
const cardPad = { sm: "p-5", md: "p-6", lg: "p-8" };
const cardShadow = {
  none: "",
  sm: "shadow-brutal-sm",
  md: "shadow-brutal",
  lg: "shadow-brutal-lg",
};
export function BrutalCard({
  as: As = "div",
  hover = false,
  tone = "card",
  padding = "md",
  shadow = "md",
  className,
  children,
  ...rest
}: BrutalCardProps) {
  return (
    <As
      className={cn(
        "border-2 border-foreground",
        cardTone[tone],
        cardPad[padding],
        cardShadow[shadow],
        hover &&
          "transition-transform duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal-lg motion-reduce:hover:transform-none",
        className
      )}
      {...rest}
    >
      {children}
    </As>
  );
}

interface PageHeroProps {
  eyebrow?: ReactNode;
  title: ReactNode;
  lead?: ReactNode;
  aside?: ReactNode;
  tone?: "dark" | "cream" | "default";
  children?: ReactNode;
}
export function PageHero({
  eyebrow,
  title,
  lead,
  aside,
  tone = "dark",
  children,
}: PageHeroProps) {
  const sectionTone: SectionTone =
    tone === "dark" ? "dark" : tone === "cream" ? "cream" : "default";
  const ebTone = tone === "dark" ? "light" : "dark";
  return (
    <Section tone={sectionTone} size="lg" className="pt-28">
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
        <div className={aside ? "lg:col-span-8" : "lg:col-span-12"}>
          {eyebrow ? <Eyebrow tone={ebTone}>{eyebrow}</Eyebrow> : null}
          <Heading as="h1" size="display" className={cn(eyebrow ? "mt-6" : "")}>
            {title}
          </Heading>
          {lead ? (
            <Lead
              className={cn(
                "mt-8",
                tone === "dark" ? "text-warm-cream/80" : "text-muted-foreground"
              )}
            >
              {lead}
            </Lead>
          ) : null}
          {children}
        </div>
        {aside ? <aside className="lg:col-span-4 flex flex-col justify-end">{aside}</aside> : null}
      </div>
    </Section>
  );
}
