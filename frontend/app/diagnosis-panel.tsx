"use client";

import { FormEvent, startTransition, useEffect, useState } from "react";

type Symptom = {
  code: string;
  name: string;
  name_en: string;
  weight: number;
};

type MatchedRule = {
  rule_code: string;
  disease_code: string;
  disease_name: string;
  matched_symptoms: string[];
};

type PerDiseaseDetail = {
  code: string;
  name: string;
  symptoms: string[];
  matched: string[];
  unmatched: string[];
  matched_weight: number;
  total_weight: number;
  similarity: number;
  formula: string;
  is_winner: boolean;
};

type DiagnosisResult = {
  method: "RBR" | "CBR";
  disease_code: string | null;
  disease_name: string | null;
  similarity: number | null;
  requires_review: boolean;
  message: string | null;
  input_symptoms: string[];
  matched_rule: MatchedRule | null;
  per_disease: PerDiseaseDetail[];
};

const percentFormatter = new Intl.NumberFormat("id-ID", {
  style: "percent",
  maximumFractionDigits: 1,
});

const GROUPS = [
  {
    title: "Bobot Tinggi",
    helper: "High-impact symptoms",
    weight: 5,
    tone: "border-teal-300/30 bg-teal-300/10 text-teal-100",
  },
  {
    title: "Bobot Sedang",
    helper: "Moderate-impact symptoms",
    weight: 3,
    tone: "border-sky-300/30 bg-sky-300/10 text-sky-100",
  },
  {
    title: "Bobot Rendah",
    helper: "Supporting symptoms",
    weight: 1,
    tone: "border-slate-300/20 bg-white/5 text-slate-200",
  },
];

function describeError(value: unknown): string {
  if (typeof value === "object" && value !== null && "detail" in value) {
    const detail = (value as { detail: unknown }).detail;
    if (typeof detail === "string") {
      return detail;
    }
  }

  return "Permintaan gagal diproses. Periksa koneksi backend lalu coba lagi.";
}

export default function DiagnosisPanel() {
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null);
  const [expertMode, setExpertMode] = useState(false);
  const [isLoadingSymptoms, setIsLoadingSymptoms] = useState(true);
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [isSavingCase, setIsSavingCase] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function loadSymptoms() {
      try {
        const response = await fetch("/api/symptoms");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(describeError(data));
        }

        if (!ignore) {
          setSymptoms(data.symptoms ?? []);
        }
      } catch (fetchError) {
        if (!ignore) {
          setError(
            fetchError instanceof Error
              ? fetchError.message
              : "Tidak dapat memuat gejala. Pastikan backend berjalan di port 8000.",
          );
        }
      } finally {
        if (!ignore) {
          setIsLoadingSymptoms(false);
        }
      }
    }

    loadSymptoms();

    return () => {
      ignore = true;
    };
  }, []);

  function toggleSymptom(code: string) {
    setSelectedSymptoms((current) =>
      current.includes(code)
        ? current.filter((selectedCode) => selectedCode !== code)
        : [...current, code],
    );
    setSaveMessage(null);
  }

  async function handleDiagnose(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (selectedSymptoms.length === 0) {
      setError("Pilih minimal 1 gejala sebelum menjalankan diagnosa.");
      return;
    }

    setIsDiagnosing(true);
    setError(null);
    setSaveMessage(null);

    try {
      const response = await fetch("/api/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptoms: selectedSymptoms }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(describeError(data));
      }

      startTransition(() => {
        setDiagnosis(data);
      });
    } catch (diagnoseError) {
      setDiagnosis(null);
      setError(
        diagnoseError instanceof Error
          ? diagnoseError.message
          : "Diagnosa gagal. Pastikan backend berjalan lalu coba lagi.",
      );
    } finally {
      setIsDiagnosing(false);
    }
  }

  async function handleSaveCase() {
    if (!diagnosis?.disease_code || !diagnosis.disease_name) {
      return;
    }

    setIsSavingCase(true);
    setError(null);
    setSaveMessage(null);

    try {
      const response = await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: diagnosis.disease_code,
          name: diagnosis.disease_name,
          symptoms: selectedSymptoms,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(describeError(data));
      }

      setSaveMessage("Kasus berhasil disimpan ke basis kasus.");
    } catch (saveError) {
      setSaveMessage(
        saveError instanceof Error
          ? saveError.message
          : "Kasus gagal disimpan. Periksa data dan coba lagi.",
      );
    } finally {
      setIsSavingCase(false);
    }
  }

  function resetDiagnosis() {
    setSelectedSymptoms([]);
    setDiagnosis(null);
    setError(null);
    setSaveMessage(null);
  }

  const selectedSet = new Set(selectedSymptoms);
  const selectedDetails = symptoms.filter((symptom) => selectedSet.has(symptom.code));

  return (
    <section className="grid gap-6 pb-12 lg:grid-cols-[1.15fr_0.85fr]">
      <form
        className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-5 shadow-2xl shadow-slate-950/30 sm:p-6"
        onSubmit={handleDiagnose}
      >
        <div className="flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-2xl font-black text-white">Pilih Gejala</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              Centang semua gejala yang terlihat. Bobot tinggi memberi pengaruh lebih besar pada similarity CBR.
            </p>
            <p className="mt-1 text-xs text-slate-500">Choose observed symptoms before running diagnosis.</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-slate-200 transition-colors hover:bg-white/10 focus:outline-none focus-visible:ring-4 focus-visible:ring-teal-300 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={resetDiagnosis}
              disabled={isDiagnosing || selectedSymptoms.length === 0}
            >
              Reset Pilihan
            </button>
          </div>
        </div>

        {isLoadingSymptoms ? (
          <div className="mt-6 rounded-3xl border border-white/10 bg-slate-900/70 p-6 text-slate-300" aria-live="polite">
            Memuat daftar gejala…
          </div>
        ) : null}

        {!isLoadingSymptoms && symptoms.length === 0 ? (
          <div className="mt-6 rounded-3xl border border-amber-300/30 bg-amber-300/10 p-6 text-amber-100" aria-live="polite">
            Gejala belum tersedia. Pastikan backend berjalan dan endpoint <span translate="no">/symptoms</span> dapat diakses.
          </div>
        ) : null}

        <div className="mt-6 space-y-6">
          {GROUPS.map((group) => {
            const groupedSymptoms = symptoms.filter((symptom) => symptom.weight === group.weight);

            if (groupedSymptoms.length === 0) {
              return null;
            }

            return (
              <fieldset key={group.weight} className="space-y-3">
                <legend className="flex flex-wrap items-center gap-3 text-lg font-bold text-white">
                  {group.title}
                  <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${group.tone}`}>
                    Bobot {group.weight}
                  </span>
                  <span className="text-xs font-normal text-slate-500">{group.helper}</span>
                </legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  {groupedSymptoms.map((symptom) => {
                    const inputId = `symptom-${symptom.code}`;
                    const checked = selectedSet.has(symptom.code);

                    return (
                      <label
                        key={symptom.code}
                        htmlFor={inputId}
                        className={`group flex min-w-0 cursor-pointer gap-3 rounded-3xl border p-4 transition-colors hover:border-teal-300/60 hover:bg-teal-300/10 ${
                          checked
                            ? "border-teal-300/70 bg-teal-300/15"
                            : "border-white/10 bg-slate-950/40"
                        }`}
                      >
                        <input
                          id={inputId}
                          name="symptoms"
                          type="checkbox"
                          value={symptom.code}
                          checked={checked}
                          onChange={() => toggleSymptom(symptom.code)}
                          className="mt-1 h-5 w-5 rounded border-white/30 bg-slate-950 text-teal-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-teal-300"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-2">
                            <span className="rounded-full bg-white/10 px-2 py-1 text-xs font-black text-teal-100" translate="no">
                              {symptom.code}
                            </span>
                            <span className="break-words font-semibold text-white">{symptom.name}</span>
                          </span>
                          <span className="mt-2 block break-words text-sm leading-6 text-slate-400">
                            {symptom.name_en}
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            );
          })}
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-400" aria-live="polite">
            {selectedSymptoms.length} gejala dipilih
          </p>
          <button
            type="submit"
            className="rounded-full bg-teal-300 px-6 py-3 text-sm font-black text-slate-950 shadow-lg shadow-teal-950/30 transition-colors hover:bg-teal-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-teal-300 disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-slate-300"
            disabled={isDiagnosing || isLoadingSymptoms || selectedSymptoms.length === 0}
          >
            {isDiagnosing ? "Mendiagnosa…" : "Jalankan Diagnosa"}
          </button>
        </div>
      </form>

      <aside className="space-y-6">
        <section className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-5 shadow-2xl shadow-slate-950/30 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-white">Ringkasan</h2>
              <p className="mt-1 text-sm text-slate-400">Diagnosis output and explainability.</p>
            </div>
            <label className="flex cursor-pointer items-center gap-2 rounded-full border border-white/10 px-3 py-2 text-sm text-slate-200 hover:bg-white/10">
              <input
                name="expert-mode"
                type="checkbox"
                checked={expertMode}
                onChange={(event) => setExpertMode(event.target.checked)}
                className="h-4 w-4 rounded border-white/30 bg-slate-950 text-teal-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-teal-300"
              />
              Mode Pakar
            </label>
          </div>

          <div className="mt-5 rounded-3xl border border-white/10 bg-slate-950/45 p-4">
            <h3 className="font-bold text-white">Gejala Terpilih</h3>
            {selectedDetails.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedDetails.map((symptom) => (
                  <span
                    key={symptom.code}
                    className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-sm text-slate-200"
                  >
                    <span className="font-black text-teal-200" translate="no">{symptom.code}</span> {symptom.name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-500">Belum ada gejala dipilih.</p>
            )}
          </div>

          {error ? (
            <div className="mt-5 rounded-3xl border border-red-300/30 bg-red-300/10 p-4 text-sm leading-6 text-red-100" aria-live="polite">
              {error}
            </div>
          ) : null}

          <DiagnosisResultCard diagnosis={diagnosis} />

          {expertMode && diagnosis?.disease_code ? (
            <div className="mt-5 rounded-3xl border border-amber-300/30 bg-amber-300/10 p-4">
              <h3 className="font-bold text-amber-50">Panel Retain Pakar</h3>
              <p className="mt-2 text-sm leading-6 text-amber-100/90">
                Simpan kombinasi gejala ini ke basis kasus jika pakar menyetujui hasil diagnosa.
              </p>
              <dl className="mt-4 grid gap-3 text-sm">
                <div>
                  <dt className="text-amber-100/70">Kode Penyakit</dt>
                  <dd className="font-bold text-amber-50" translate="no">{diagnosis.disease_code}</dd>
                </div>
                <div>
                  <dt className="text-amber-100/70">Nama Penyakit</dt>
                  <dd className="font-bold text-amber-50">{diagnosis.disease_name}</dd>
                </div>
              </dl>
              <button
                type="button"
                className="mt-4 w-full rounded-full bg-amber-200 px-5 py-3 text-sm font-black text-slate-950 transition-colors hover:bg-amber-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-200 disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-slate-300"
                onClick={handleSaveCase}
                disabled={isSavingCase}
              >
                {isSavingCase ? "Menyimpan…" : "Simpan ke Basis Kasus"}
              </button>
              {saveMessage ? (
                <p className="mt-3 text-sm leading-6 text-amber-50" aria-live="polite">
                  {saveMessage}
                </p>
              ) : null}
            </div>
          ) : null}
        </section>

        {diagnosis?.matched_rule ? <MatchedRuleDetail rule={diagnosis.matched_rule} /> : null}
        {diagnosis?.per_disease?.length ? <CbrDetails details={diagnosis.per_disease} /> : null}
      </aside>
    </section>
  );
}

function DiagnosisResultCard({ diagnosis }: { diagnosis: DiagnosisResult | null }) {
  if (!diagnosis) {
    return (
      <div className="mt-5 rounded-3xl border border-dashed border-white/15 bg-slate-950/35 p-5 text-sm leading-6 text-slate-400">
        Hasil diagnosa akan tampil di sini setelah gejala dipilih dan diproses.
      </div>
    );
  }

  const isRbr = diagnosis.method === "RBR";
  const tone = diagnosis.requires_review
    ? "border-amber-300/40 bg-amber-300/10 text-amber-50"
    : isRbr
      ? "border-teal-300/40 bg-teal-300/10 text-teal-50"
      : "border-sky-300/40 bg-sky-300/10 text-sky-50";

  return (
    <div className={`mt-5 rounded-3xl border p-5 ${tone}`} aria-live="polite">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-black uppercase tracking-[0.22em]" translate="no">
          {diagnosis.method}
        </span>
        <span className="text-sm font-semibold">
          {diagnosis.requires_review ? "Memerlukan Review Pakar" : "Rekomendasi Siap"}
        </span>
      </div>
      <h3 className="mt-4 text-2xl font-black">
        {diagnosis.disease_name ?? "Tidak ada diagnosa"}
      </h3>
      {diagnosis.disease_code ? (
        <p className="mt-1 text-sm opacity-80" translate="no">{diagnosis.disease_code}</p>
      ) : null}
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <Metric label="Metode" value={isRbr ? "RBR" : "CBR"} helper={isRbr ? "Rule matched exactly" : "Case similarity used"} />
        <Metric
          label="Similarity"
          value={diagnosis.similarity === null ? "-" : percentFormatter.format(diagnosis.similarity)}
          helper={diagnosis.similarity === null ? "CBR tidak dijalankan" : "Weighted nearest neighbor"}
        />
      </div>
      {diagnosis.message ? <p className="mt-4 text-sm leading-6 opacity-90">{diagnosis.message}</p> : null}
    </div>
  );
}

function Metric({ label, value, helper }: { label: string; value: string; helper: string }) {
  return (
    <div className="rounded-2xl bg-slate-950/30 p-4">
      <p className="text-xs uppercase tracking-[0.2em] opacity-70">{label}</p>
      <p className="mt-1 text-xl font-black tabular-nums">{value}</p>
      <p className="mt-1 text-xs opacity-70">{helper}</p>
    </div>
  );
}

function MatchedRuleDetail({ rule }: { rule: MatchedRule }) {
  return (
    <section className="rounded-[2rem] border border-teal-300/30 bg-teal-300/10 p-5 sm:p-6">
      <h2 className="text-xl font-black text-teal-50">Detail Aturan RBR</h2>
      <p className="mt-2 text-sm text-teal-100/80">Aturan terpenuhi 100%, sehingga CBR tidak dijalankan.</p>
      <div className="mt-4 rounded-3xl bg-slate-950/35 p-4">
        <p className="text-sm text-teal-100/70">Aturan Cocok</p>
        <p className="mt-1 text-lg font-black text-white" translate="no">{rule.rule_code}</p>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {rule.matched_symptoms.map((symptomCode) => (
          <span key={symptomCode} className="rounded-full bg-teal-200 px-3 py-1 text-sm font-bold text-slate-950" translate="no">
            {symptomCode}
          </span>
        ))}
      </div>
    </section>
  );
}

function CbrDetails({ details }: { details: PerDiseaseDetail[] }) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.07] p-5 sm:p-6">
      <h2 className="text-xl font-black text-white">Detail Similarity CBR</h2>
      <p className="mt-2 text-sm text-slate-400">Nearest Neighbor Retrieval calculation by disease.</p>
      <div className="mt-5 space-y-3">
        {details.map((disease) => (
          <details
            key={disease.code}
            className={`rounded-3xl border p-4 ${
              disease.is_winner
                ? "border-teal-300/50 bg-teal-300/10"
                : "border-white/10 bg-slate-950/35"
            }`}
            open={disease.is_winner}
          >
            <summary className="cursor-pointer list-none focus:outline-none focus-visible:ring-4 focus-visible:ring-teal-300">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="truncate font-black text-white">
                    <span translate="no">{disease.code}</span> - {disease.name}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {disease.is_winner ? "Kasus terdekat" : "Kandidat pembanding"}
                  </p>
                </div>
                <span className="rounded-full bg-white/10 px-3 py-1 text-sm font-black text-teal-100 tabular-nums">
                  {percentFormatter.format(disease.similarity)}
                </span>
              </div>
            </summary>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-teal-300" style={{ width: `${Math.round(disease.similarity * 100)}%` }} />
            </div>
            <div className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
              <SymptomCodeList title="Matched Symptoms" codes={disease.matched} />
              <SymptomCodeList title="Unmatched Symptoms" codes={disease.unmatched} />
            </div>
            <div className="mt-4 rounded-2xl bg-slate-950/60 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Formula</p>
              <code className="mt-2 block break-words text-sm text-slate-200">{disease.formula}</code>
              <p className="mt-3 text-sm text-slate-400">
                Matched weight: {disease.matched_weight} / {disease.total_weight}
              </p>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}

function SymptomCodeList({ title, codes }: { title: string; codes: string[] }) {
  return (
    <div>
      <h3 className="font-bold text-white">{title}</h3>
      {codes.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {codes.map((code) => (
            <span key={code} className="rounded-full border border-white/10 bg-white/10 px-2 py-1 text-xs text-slate-200" translate="no">
              {code}
            </span>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-sm text-slate-500">-</p>
      )}
    </div>
  );
}
