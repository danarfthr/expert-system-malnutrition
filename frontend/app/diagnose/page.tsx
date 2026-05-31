import { ArrowDown, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import AppHeader from "../app-header";
import DiagnosisPanel from "../diagnosis-panel";

export default function DiagnosePage() {
  return (
    <div className="min-h-screen overflow-x-hidden text-foreground">
      <AppHeader actionHref="/" actionLabel="Beranda" />

      <main id="main-content" className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="space-y-6 py-8">
          <Card className="border-border/80 bg-card/90 shadow-xl shadow-cyan-950/6">
            <CardHeader className="gap-4">
              <Badge variant="secondary" className="w-fit rounded-full px-4 py-1.5 text-sm text-secondary-foreground">
                Halaman diagnosa
              </Badge>
              <div className="space-y-3">
                <CardTitle className="max-w-4xl text-balance text-3xl font-black leading-tight sm:text-4xl">
                  Pilih gejala dari atas ke bawah, lalu lihat hasil diagnosis di bagian berikutnya.
                </CardTitle>
                <CardDescription className="max-w-3xl text-base leading-7">
                  Urutan halaman ini dibuat linear agar pemeriksaan terasa lebih ringan: checklist gejala, ringkasan,
                  hasil diagnosis, lalu detail RBR atau CBR.
                </CardDescription>
              </div>
              <div className="flex flex-col gap-3 rounded-3xl border border-border bg-background/65 p-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                <span className="flex items-center gap-2 font-medium">
                  <ShieldCheck className="size-4 text-accent" aria-hidden="true" />
                  Gunakan hasil sebagai pendukung keputusan klinis.
                </span>
                <span className="flex items-center gap-2 font-semibold text-primary">
                  Scroll otomatis ke hasil setelah diagnosa
                  <ArrowDown className="size-4" aria-hidden="true" />
                </span>
              </div>
            </CardHeader>
          </Card>

          <DiagnosisPanel />
        </section>
      </main>
    </div>
  );
}
