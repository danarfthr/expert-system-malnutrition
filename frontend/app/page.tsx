import {
  Activity,
  ArrowRight,
  ClipboardCheck,
  GitBranch,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import DiagnosisPanel from "./diagnosis-panel";

const METHOD_CARDS = [
  {
    title: "Rule-Based Reasoning",
    label: "RBR",
    description: "Forward Chaining memeriksa apakah semua gejala dalam aturan terpenuhi.",
    helper: "Exact rule match first",
    icon: GitBranch,
  },
  {
    title: "Case-Based Reasoning",
    label: "CBR",
    description: "Nearest Neighbor Retrieval menghitung similarity berbobot saat RBR tidak cocok penuh.",
    helper: "Weighted similarity fallback",
    icon: Activity,
  },
  {
    title: "Review Pakar",
    label: "Revise",
    description: "Kasus dengan similarity rendah ditandai untuk validasi pakar.",
    helper: "Human review when confidence is low",
    icon: ClipboardCheck,
  },
];

export default function Home() {
  return (
    <div className="min-h-screen overflow-x-hidden text-foreground">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-card focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-foreground focus:outline-none focus-visible:ring-4 focus-visible:ring-ring/35"
      >
        Lewati ke konten utama
      </a>

      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/82 backdrop-blur-xl supports-[backdrop-filter]:bg-background/72">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm shadow-cyan-900/15">
              <Stethoscope className="size-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
                Clinical Expert System
              </p>
              <p className="mt-1 text-base font-bold text-foreground sm:text-lg">Sistem Pakar Gizi Buruk</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge className="h-7 rounded-full bg-primary text-primary-foreground">Hybrid RBR + CBR</Badge>
            <Badge variant="outline" className="h-7 rounded-full bg-card/70 text-foreground">
              Transparan & terukur
            </Badge>
          </div>
        </div>
      </header>

      <main id="main-content" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="grid gap-8 py-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <div className="max-w-4xl">
            <Badge variant="secondary" className="mb-5 h-8 rounded-full px-4 text-sm text-secondary-foreground">
              Diagnosa dini untuk balita
            </Badge>
            <h1 className="text-balance text-4xl font-black leading-[1.05] text-foreground sm:text-5xl lg:text-6xl">
              Analisis gejala gizi buruk dengan alur pakar yang jelas.
            </h1>
            <p className="mt-5 max-w-2xl text-pretty text-lg leading-8 text-muted-foreground">
              Pilih gejala berdasarkan kategori klinis, lalu sistem menjalankan RBR terlebih dahulu.
              Jika tidak ada aturan yang cocok penuh, CBR memberi rekomendasi dengan similarity yang bisa ditelusuri.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                asChild
                size="lg"
                className="h-12 rounded-full bg-primary px-6 text-base shadow-lg shadow-cyan-900/15 hover:bg-cyan-800"
              >
                <a href="#diagnosis-panel">
                  Mulai Diagnosa
                  <ArrowRight className="size-4" aria-hidden="true" />
                </a>
              </Button>
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <ShieldCheck className="size-4 text-accent" aria-hidden="true" />
                Hasil adalah dukungan keputusan, bukan pengganti pemeriksaan klinis.
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {METHOD_CARDS.map((card, index) => {
              const Icon = card.icon;

              return (
                <Card key={card.label} className="border-border/80 bg-card/86 shadow-sm shadow-cyan-900/5">
                  <CardHeader>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex size-10 items-center justify-center rounded-2xl bg-secondary text-primary">
                        <Icon className="size-5" aria-hidden="true" />
                      </div>
                      <Badge variant={index === 0 ? "default" : "outline"} className="rounded-full" translate="no">
                        {card.label}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg font-bold">{card.title}</CardTitle>
                    <CardDescription className="leading-6">{card.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Separator className="mb-3" />
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      {card.helper}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <DiagnosisPanel />
      </main>
    </div>
  );
}
