import type { ElementType, ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import AppHeader from "./app-header";

export function PageShell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className="min-h-screen overflow-x-hidden text-foreground">
      <AppHeader />
      <main id="main-content" className={cn("mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8", className)}>
        {children}
      </main>
    </div>
  );
}

export function PageIntro({
  eyebrow,
  title,
  description,
  children,
  className,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("mx-auto max-w-4xl text-center", className)}>
      <Badge variant="secondary" className="mb-5 h-8 rounded-full px-4 text-sm text-secondary-foreground">
        {eyebrow}
      </Badge>
      <h1 className="text-balance text-4xl font-black leading-[1.04] text-foreground sm:text-5xl lg:text-6xl">
        {title}
      </h1>
      <p className="mx-auto mt-5 max-w-2xl text-pretty text-base leading-8 text-muted-foreground sm:text-lg">
        {description}
      </p>
      {children ? <div className="mt-8">{children}</div> : null}
    </section>
  );
}

export function ContentSection({
  eyebrow,
  title,
  description,
  children,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("py-12 sm:py-16", className)}>
      <div className="mx-auto mb-8 max-w-3xl text-center">
        {eyebrow ? (
          <Badge variant="outline" className="mb-3 rounded-full bg-card/80">
            {eyebrow}
          </Badge>
        ) : null}
        <h2 className="text-balance text-2xl font-black sm:text-3xl">{title}</h2>
        {description ? <p className="mt-3 text-pretty leading-7 text-muted-foreground">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

export function ProcessStep({
  icon: Icon,
  title,
  label,
  description,
  helper,
  highlighted = false,
}: {
  icon: ElementType;
  title: string;
  label: string;
  description: string;
  helper: string;
  highlighted?: boolean;
}) {
  return (
    <Card className="border-border/70 bg-card/90 shadow-sm shadow-cyan-900/5 transition-colors hover:border-primary/35">
      <CardHeader className="gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-secondary text-primary">
              <Icon className="size-5" aria-hidden="true" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold">{title}</CardTitle>
              <CardDescription className="mt-2 leading-6">{description}</CardDescription>
            </div>
          </div>
          <Badge variant={highlighted ? "default" : "outline"} className="shrink-0 rounded-full" translate="no">
            {label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm font-medium text-muted-foreground">{helper}</p>
      </CardContent>
    </Card>
  );
}
