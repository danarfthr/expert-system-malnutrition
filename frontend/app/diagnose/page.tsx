import { ArrowDown, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";

import DiagnosisPanel from "../diagnosis-panel";
import { PageShell } from "../page-shell";

export default function DiagnosePage() {
  return (
    <PageShell className="max-w-5xl">
      <section className="space-y-8 pb-12 pt-4 sm:pt-8">
        <div className="mx-auto max-w-3xl text-center">
          <Badge variant="secondary" className="mb-4 rounded-full px-4 py-1.5 text-sm text-secondary-foreground">
            Halaman diagnosa
          </Badge>
          <h1 className="text-balance text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
            Pilih gejala klinis, lalu tinjau hasil dengan alur yang jelas.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-base leading-8 text-muted-foreground">
            Pemeriksaan dibuat linear: checklist gejala, ringkasan pilihan, hasil diagnosis, lalu detail RBR atau CBR
            jika diperlukan.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 text-sm text-muted-foreground sm:flex-row sm:gap-5">
            <span className="flex items-center gap-2 font-medium">
              <ShieldCheck className="size-4 text-accent" aria-hidden="true" />
              Pendukung keputusan klinis
            </span>
            <span className="flex items-center gap-2 font-semibold text-primary">
              Scroll otomatis ke hasil
              <ArrowDown className="size-4" aria-hidden="true" />
            </span>
          </div>
        </div>

        <DiagnosisPanel />
      </section>
    </PageShell>
  );
}
