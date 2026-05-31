import Link from "next/link";
import { Stethoscope } from "lucide-react";

import { Badge } from "@/components/ui/badge";

export default function AppHeader() {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-card focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-foreground focus:outline-none focus-visible:ring-4 focus-visible:ring-ring/35"
      >
        Lewati ke konten utama
      </a>

      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/88 backdrop-blur-xl supports-[backdrop-filter]:bg-background/78">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3 rounded-2xl focus:outline-none focus-visible:ring-4 focus-visible:ring-ring/35">
            <span className="flex size-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm shadow-cyan-900/15 sm:size-11">
              <Stethoscope className="size-5" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-[0.68rem] font-bold uppercase tracking-[0.22em] text-primary sm:text-xs">
                Clinical Expert System
              </span>
              <span className="mt-1 block text-sm font-bold text-foreground sm:text-lg">Sistem Pakar Gizi Buruk</span>
            </span>
          </Link>

          <nav aria-label="Informasi sistem" className="hidden sm:block">
            <Badge className="h-7 rounded-full bg-primary text-primary-foreground">Hybrid RBR + CBR</Badge>
          </nav>
        </div>
      </header>
    </>
  );
}
