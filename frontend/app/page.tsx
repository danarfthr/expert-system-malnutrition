import DiagnosisPanel from "./diagnosis-panel";

const METHOD_CARDS = [
  {
    title: "Rule-Based Reasoning",
    label: "RBR",
    description: "Forward Chaining memeriksa apakah semua gejala dalam aturan terpenuhi.",
    helper: "Exact rule match first",
  },
  {
    title: "Case-Based Reasoning",
    label: "CBR",
    description: "Nearest Neighbor Retrieval menghitung similarity berbobot saat RBR tidak cocok penuh.",
    helper: "Weighted similarity fallback",
  },
  {
    title: "Review Pakar",
    label: "Revise",
    description: "Kasus dengan similarity rendah ditandai untuk validasi pakar.",
    helper: "Human review when confidence is low",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-950 text-slate-100">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-slate-950 focus:outline-none focus-visible:ring-4 focus-visible:ring-teal-300"
      >
        Lewati ke konten utama
      </a>

      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-teal-300">
              Expert System Demo
            </p>
            <p className="mt-1 text-lg font-bold text-white">Sistem Pakar Gizi Buruk</p>
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            <span className="rounded-full border border-teal-300/30 bg-teal-300/10 px-3 py-1 text-teal-100">
              Hybrid RBR + CBR
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-300">
              FastAPI Proxy via Next.js
            </span>
          </div>
        </div>
      </header>

      <main id="main-content" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="grid gap-8 py-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <div>
            <div className="mb-5 inline-flex rounded-full border border-teal-300/30 bg-teal-300/10 px-4 py-2 text-sm font-medium text-teal-100">
              Diagnosa dini untuk balita
            </div>
            <h1 className="max-w-4xl text-balance text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
              Analisis gejala gizi buruk dengan alur pakar yang transparan.
            </h1>
            <p className="mt-5 max-w-2xl text-pretty text-lg leading-8 text-slate-300">
              Pilih gejala yang terlihat pada anak, lalu sistem menjalankan aturan RBR terlebih dahulu.
              Jika tidak ada aturan yang cocok 100%, sistem memakai CBR untuk memberi rekomendasi berbasis similarity.
            </p>
            <p className="mt-3 text-sm text-slate-400">
              Select symptoms, run diagnosis, then inspect why the system chose RBR or CBR.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {METHOD_CARDS.map((card) => (
              <article
                key={card.label}
                className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 shadow-2xl shadow-slate-950/20"
              >
                <div className="mb-4 inline-flex rounded-full bg-teal-300 px-3 py-1 text-xs font-black uppercase tracking-[0.22em] text-slate-950">
                  {card.label}
                </div>
                <h2 className="text-lg font-bold text-white">{card.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">{card.description}</p>
                <p className="mt-3 text-xs text-slate-500">{card.helper}</p>
              </article>
            ))}
          </div>
        </section>

        <DiagnosisPanel />
      </main>
    </div>
  );
}
