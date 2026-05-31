import Link from "next/link";
import { Activity, ArrowRight, ClipboardCheck, GitBranch, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import AppHeader from "./app-header";

const METHOD_CARDS = [
  {
    title: "1. RBR memeriksa aturan",
    label: "RBR",
    description: "Forward Chaining mencoba menemukan aturan yang cocok 100% dari gejala yang dipilih.",
    helper: "Jika cocok penuh, hasil langsung diberikan.",
    icon: GitBranch,
  },
  {
    title: "2. CBR membandingkan kasus",
    label: "CBR",
    description: "Jika RBR tidak cocok penuh, sistem menghitung similarity ke basis kasus dengan bobot gejala.",
    helper: "Hasil terdekat menjadi rekomendasi diagnosis.",
    icon: Activity,
  },
  {
    title: "3. Pakar meninjau kasus rendah",
    label: "Revise",
    description: "Similarity rendah ditandai agar pakar dapat melakukan validasi sebelum kasus disimpan.",
    helper: "Menjaga rekomendasi tetap hati-hati dan dapat ditelusuri.",
    icon: ClipboardCheck,
  },
];

export default function Home() {
  return (
    <div className="min-h-screen overflow-x-hidden text-foreground">
      <AppHeader actionHref="/diagnose" actionLabel="Mulai Diagnosa" />

      <main id="main-content" className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="py-10 sm:py-16">
          <Badge variant="secondary" className="mb-5 h-8 rounded-full px-4 text-sm text-secondary-foreground">
            Diagnosa dini untuk balita
          </Badge>
          <h1 className="max-w-4xl text-balance text-4xl font-black leading-[1.05] text-foreground sm:text-5xl lg:text-6xl">
            Sistem pakar yang menjelaskan proses diagnosis gizi buruk secara singkat dan transparan.
          </h1>
          <p className="mt-5 max-w-3xl text-pretty text-lg leading-8 text-muted-foreground">
            Aplikasi ini membantu memilih gejala klinis, menjalankan aturan pakar terlebih dahulu, lalu memakai
            pembandingan kasus jika aturan tidak terpenuhi penuh.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              asChild
              size="lg"
              className="h-12 rounded-full bg-primary px-6 text-base shadow-lg shadow-cyan-900/15 hover:bg-cyan-800"
            >
              <Link href="/diagnose">
                Mulai Diagnosa
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <ShieldCheck className="size-4 text-accent" aria-hidden="true" />
              Hasil adalah dukungan keputusan, bukan pengganti pemeriksaan klinis.
            </div>
          </div>
        </section>

        <Separator />

        <section className="space-y-4 py-10 sm:py-12" aria-labelledby="workflow-title">
          <div>
            <Badge variant="outline" className="mb-3 rounded-full bg-card/80">
              Alur singkat
            </Badge>
            <h2 id="workflow-title" className="text-2xl font-black sm:text-3xl">
              Cara sistem mengambil keputusan
            </h2>
          </div>

          <div className="space-y-4">
            {METHOD_CARDS.map((card, index) => {
              const Icon = card.icon;

              return (
                <Card key={card.label} className="border-border/80 bg-card/88 shadow-sm shadow-cyan-900/5">
                  <CardHeader>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-secondary text-primary">
                          <Icon className="size-5" aria-hidden="true" />
                        </div>
                        <div>
                          <CardTitle className="text-lg font-bold">{card.title}</CardTitle>
                          <CardDescription className="mt-2 leading-6">{card.description}</CardDescription>
                        </div>
                      </div>
                      <Badge variant={index === 0 ? "default" : "outline"} className="w-fit rounded-full" translate="no">
                        {card.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm font-medium text-muted-foreground">{card.helper}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
