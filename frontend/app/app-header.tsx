import Link from "next/link";
import { ArrowRight, Home, Stethoscope } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function AppHeader({
  actionHref,
  actionLabel,
}: {
  actionHref: string;
  actionLabel: string;
}) {
  const isHomeAction = actionHref === "/";
  const ActionIcon = isHomeAction ? Home : ArrowRight;

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-card focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-foreground focus:outline-none focus-visible:ring-4 focus-visible:ring-ring/35"
      >
        Lewati ke konten utama
      </a>

      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/82 backdrop-blur-xl supports-[backdrop-filter]:bg-background/72">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-4 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <Link href="/" className="flex items-center gap-3 rounded-2xl focus:outline-none focus-visible:ring-4 focus-visible:ring-ring/35">
            <span className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm shadow-cyan-900/15">
              <Stethoscope className="size-5" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-xs font-bold uppercase tracking-[0.24em] text-primary">
                Clinical Expert System
              </span>
              <span className="mt-1 block text-base font-bold text-foreground sm:text-lg">Sistem Pakar Gizi Buruk</span>
            </span>
          </Link>

          <nav aria-label="Navigasi utama" className="flex flex-wrap items-center gap-2">
            <Badge className="h-7 rounded-full bg-primary text-primary-foreground">Hybrid RBR + CBR</Badge>
            <Button
              asChild
              variant={isHomeAction ? "outline" : "default"}
              className="h-10 rounded-full px-4"
            >
              <Link href={actionHref}>
                {actionLabel}
                <ActionIcon className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          </nav>
        </div>
      </header>
    </>
  );
}
