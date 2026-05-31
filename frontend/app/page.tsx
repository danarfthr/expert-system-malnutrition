import Link from "next/link";
import { Activity, ArrowRight, ClipboardCheck, GitBranch, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import { ContentSection, PageIntro, PageShell, ProcessStep } from "./page-shell";

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
    <PageShell>
      <PageIntro
        eyebrow="Diagnosa dini untuk balita"
        title="Sistem pakar gizi buruk yang ringkas, klinis, dan transparan."
        description="Pilih gejala klinis yang terlihat, lalu sistem menjalankan aturan pakar terlebih dahulu dan memakai pembandingan kasus hanya saat aturan tidak cocok penuh."
        className="py-12 sm:py-20 lg:py-24"
      >
        <div className="flex flex-col items-center gap-4">
          <Button
            asChild
            size="lg"
            className="h-12 rounded-full bg-primary px-7 text-base shadow-lg shadow-cyan-900/15 hover:bg-cyan-800"
          >
            <Link href="/diagnose">
              Mulai Diagnosa
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
          <div className="flex max-w-xl items-center justify-center gap-2 text-center text-sm font-medium leading-6 text-muted-foreground">
            <ShieldCheck className="size-4 shrink-0 text-accent" aria-hidden="true" />
            Hasil adalah dukungan keputusan, bukan pengganti pemeriksaan klinis.
          </div>
        </div>
      </PageIntro>

      <Separator className="mx-auto max-w-3xl" />

      <ContentSection
        eyebrow="Alur singkat"
        title="Cara sistem mengambil keputusan"
        description="Urutannya sengaja sederhana: aturan pakar menjadi filter utama, kemudian CBR dipakai sebagai fallback yang tetap dapat ditelusuri."
      >
        <div className="mx-auto grid max-w-4xl gap-4">
          {METHOD_CARDS.map((card, index) => (
            <ProcessStep key={card.label} {...card} highlighted={index === 0} />
          ))}
        </div>
      </ContentSection>
    </PageShell>
  );
}
