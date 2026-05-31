"use client";

import { FormEvent, startTransition, useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  Activity,
  BadgeCheck,
  CheckCircle2,
  ClipboardList,
  Droplets,
  Eye,
  Gauge,
  Layers3,
  Leaf,
  Loader2,
  RotateCcw,
  Save,
  ScanSearch,
  ShieldAlert,
  Sparkles,
  Stethoscope,
} from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

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

const SYMPTOM_CATEGORIES = [
  {
    title: "Cairan & Pembengkakan",
    helper: "Tanda edema, perut membesar, atau retensi cairan.",
    codes: ["G01", "G03", "G12"],
    icon: Droplets,
  },
  {
    title: "Pertumbuhan & Komposisi Tubuh",
    helper: "Perubahan berat, tinggi, otot, tulang, dan kekenduran kulit.",
    codes: ["G04", "G06", "G07", "G13", "G14"],
    icon: Activity,
  },
  {
    title: "Kulit & Rambut",
    helper: "Perubahan pada kulit dan rambut yang mudah diamati.",
    codes: ["G08", "G09", "G10"],
    icon: Leaf,
  },
  {
    title: "Mental, Energi & Tampilan Wajah",
    helper: "Perubahan perilaku, kelelahan, mata, dan wajah.",
    codes: ["G05", "G11", "G15", "G16", "G17"],
    icon: Eye,
  },
  {
    title: "Pencernaan",
    helper: "Gejala saluran cerna yang mendukung diagnosis.",
    codes: ["G02"],
    icon: Stethoscope,
  },
];

const CATEGORIZED_CODES = new Set(SYMPTOM_CATEGORIES.flatMap((category) => category.codes));

function describeError(value: unknown): string {
  if (typeof value === "object" && value !== null && "detail" in value) {
    const detail = (value as { detail: unknown }).detail;
    if (typeof detail === "string") {
      return detail;
    }
  }

  return "Permintaan gagal diproses. Periksa koneksi backend lalu coba lagi.";
}

function getWeightLabel(weight: number): string {
  if (weight >= 5) {
    return "CBR tinggi";
  }

  if (weight >= 3) {
    return "CBR sedang";
  }

  return "CBR pendukung";
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
  const resultSectionRef = useRef<HTMLElement | null>(null);

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

  useEffect(() => {
    if (!diagnosis) {
      return;
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    resultSectionRef.current?.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start",
    });
  }, [diagnosis]);

  function setSymptomSelected(code: string, checked: boolean) {
    setSelectedSymptoms((current) => {
      if (checked) {
        return current.includes(code) ? current : [...current, code];
      }

      return current.filter((selectedCode) => selectedCode !== code);
    });
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
  const symptomByCode = new Map(symptoms.map((symptom) => [symptom.code, symptom]));
  const selectedDetails = symptoms.filter((symptom) => selectedSet.has(symptom.code));
  const clinicalCategories = SYMPTOM_CATEGORIES.map((category) => ({
    ...category,
    symptoms: category.codes
      .map((code) => symptomByCode.get(code))
      .filter((symptom): symptom is Symptom => Boolean(symptom)),
  }));
  const uncategorizedSymptoms = symptoms.filter((symptom) => !CATEGORIZED_CODES.has(symptom.code));

  return (
    <section id="diagnosis-panel" className="scroll-mt-28 space-y-6 pb-12">
      <form onSubmit={handleDiagnose}>
        <Card className="border-border/80 bg-card/92 shadow-xl shadow-cyan-950/6">
          <CardHeader className="gap-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <Badge variant="outline" className="mb-3 rounded-full bg-secondary/80 text-secondary-foreground">
                  Checklist gejala klinis
                </Badge>
                <CardTitle className="text-2xl font-black sm:text-3xl">Pilih Gejala</CardTitle>
                <CardDescription className="mt-2 max-w-2xl text-base leading-7">
                  Daftar gejala dikelompokkan berdasarkan kategori klinis agar lebih mudah diperiksa.
                  Bobot tetap ditampilkan sebagai konteks perhitungan CBR, bukan dasar pengelompokan.
                </CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-full bg-card px-4"
                onClick={resetDiagnosis}
                disabled={isDiagnosing || selectedSymptoms.length === 0}
              >
                <RotateCcw className="size-4" aria-hidden="true" />
                Reset Pilihan
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            {isLoadingSymptoms ? <SymptomSkeleton /> : null}

            {!isLoadingSymptoms && symptoms.length === 0 ? (
              <Alert className="border-amber-300/50 bg-amber-50 text-amber-950" role="status">
                <AlertCircle className="size-4" aria-hidden="true" />
                <AlertTitle>Gejala belum tersedia</AlertTitle>
                <AlertDescription className="text-amber-900">
                  Pastikan backend berjalan dan endpoint <span translate="no">/symptoms</span> dapat diakses.
                </AlertDescription>
              </Alert>
            ) : null}

            <div className="space-y-5">
              {clinicalCategories.map((category) => {
                if (category.symptoms.length === 0) {
                  return null;
                }

                const Icon = category.icon;

                return (
                  <fieldset key={category.title} className="rounded-3xl border border-border/80 bg-background/55 p-4 sm:p-5">
                    <legend className="px-2">
                      <div className="flex items-center gap-3">
                        <span className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                          <Icon className="size-5" aria-hidden="true" />
                        </span>
                        <span>
                          <span className="block text-base font-black text-foreground">{category.title}</span>
                          <span className="block max-w-2xl text-sm leading-6 text-muted-foreground">
                            {category.helper}
                          </span>
                        </span>
                      </div>
                    </legend>
                    <div className="mt-4 space-y-3">
                      {category.symptoms.map((symptom) => (
                        <SymptomOption
                          key={symptom.code}
                          symptom={symptom}
                          checked={selectedSet.has(symptom.code)}
                          onCheckedChange={(checked) => setSymptomSelected(symptom.code, checked)}
                        />
                      ))}
                    </div>
                  </fieldset>
                );
              })}

              {uncategorizedSymptoms.length > 0 ? (
                <fieldset className="rounded-3xl border border-border/80 bg-background/55 p-4 sm:p-5">
                  <legend className="px-2 text-base font-black text-foreground">Gejala Lainnya</legend>
                  <div className="mt-4 space-y-3">
                    {uncategorizedSymptoms.map((symptom) => (
                      <SymptomOption
                        key={symptom.code}
                        symptom={symptom}
                        checked={selectedSet.has(symptom.code)}
                        onCheckedChange={(checked) => setSymptomSelected(symptom.code, checked)}
                      />
                    ))}
                  </div>
                </fieldset>
              ) : null}
            </div>

            <Separator className="my-6" />

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-medium text-muted-foreground" aria-live="polite">
                {selectedSymptoms.length} gejala dipilih
              </p>
              <Button
                type="submit"
                className="h-12 rounded-full bg-primary px-6 text-base font-black shadow-lg shadow-cyan-900/15 hover:bg-cyan-800"
                disabled={isDiagnosing || isLoadingSymptoms || selectedSymptoms.length === 0}
              >
                {isDiagnosing ? (
                  <>
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                    Mendiagnosa...
                  </>
                ) : (
                  <>
                    <ScanSearch className="size-4" aria-hidden="true" />
                    Jalankan Diagnosa
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      <section ref={resultSectionRef} id="diagnosis-result" className="scroll-mt-28">
        <Card className="border-border/80 bg-card/92 shadow-xl shadow-cyan-950/6">
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <CardTitle className="text-2xl font-black">Ringkasan & Hasil</CardTitle>
                <CardDescription className="mt-1 leading-6">
                  Hasil diagnosis, gejala terpilih, dan mode retain pakar.
                </CardDescription>
              </div>
              <div className="flex min-h-11 items-center gap-2 rounded-full border border-border bg-background px-3 py-2">
                <Switch id="expert-mode" checked={expertMode} onCheckedChange={setExpertMode} aria-label="Aktifkan mode pakar" />
                <label htmlFor="expert-mode" className="text-sm font-semibold text-foreground">
                  Mode Pakar
                </label>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <SelectedSymptomsCard selectedDetails={selectedDetails} />

            {error ? (
              <Alert variant="destructive" className="border-destructive/30 bg-red-50">
                <AlertCircle className="size-4" aria-hidden="true" />
                <AlertTitle>Terjadi kendala</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}

            <DiagnosisResultCard diagnosis={diagnosis} />

            {expertMode && diagnosis?.disease_code ? (
              <ExpertRetainPanel
                diagnosis={diagnosis}
                isSavingCase={isSavingCase}
                saveMessage={saveMessage}
                onSave={handleSaveCase}
              />
            ) : null}
          </CardContent>
        </Card>
      </section>

      {diagnosis?.matched_rule ? <MatchedRuleDetail rule={diagnosis.matched_rule} /> : null}
      {diagnosis?.per_disease?.length ? <CbrDetails details={diagnosis.per_disease} /> : null}
    </section>
  );
}

function SymptomOption({
  symptom,
  checked,
  onCheckedChange,
}: {
  symptom: Symptom;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  const inputId = `symptom-${symptom.code}`;

  return (
    <label
      htmlFor={inputId}
      className={cn(
        "group flex min-h-28 cursor-pointer gap-3 rounded-2xl border bg-card p-4 transition-all hover:border-primary/60 hover:bg-secondary/55",
        checked ? "border-primary bg-secondary shadow-sm shadow-cyan-900/8" : "border-border/80",
      )}
    >
      <Checkbox
        id={inputId}
        name="symptoms"
        value={symptom.code}
        checked={checked}
        onCheckedChange={(value) => onCheckedChange(value === true)}
        className="mt-1 size-5"
      />
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="rounded-full bg-background font-black" translate="no">
            {symptom.code}
          </Badge>
          <Badge variant="secondary" className="rounded-full text-[0.72rem]">
            {getWeightLabel(symptom.weight)}
          </Badge>
        </span>
        <span className="mt-3 block break-words text-sm font-bold leading-6 text-foreground sm:text-base">
          {symptom.name}
        </span>
        <span className="mt-1 block break-words text-sm leading-6 text-muted-foreground">
          {symptom.name_en}
        </span>
      </span>
    </label>
  );
}

function SymptomSkeleton() {
  return (
    <div className="space-y-4" aria-live="polite" aria-label="Memuat daftar gejala">
      {["skeleton-1", "skeleton-2", "skeleton-3"].map((item) => (
        <div key={item} className="rounded-3xl border border-border/80 bg-background/55 p-5">
          <div className="flex items-center gap-3">
            <Skeleton className="size-10 rounded-2xl" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-52" />
              <Skeleton className="h-3 w-72 max-w-full" />
            </div>
          </div>
          <div className="mt-4 space-y-3">
            <Skeleton className="h-28 rounded-2xl" />
            <Skeleton className="h-28 rounded-2xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

function SelectedSymptomsCard({ selectedDetails }: { selectedDetails: Symptom[] }) {
  return (
    <div className="rounded-3xl border border-border/80 bg-background/55 p-4">
      <div className="flex items-center gap-2">
        <ClipboardList className="size-4 text-primary" aria-hidden="true" />
        <h3 className="font-black text-foreground">Gejala Terpilih</h3>
      </div>
      {selectedDetails.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {selectedDetails.map((symptom) => (
            <Badge key={symptom.code} variant="outline" className="h-auto rounded-full bg-card px-3 py-1.5 text-left">
              <span className="font-black text-primary" translate="no">
                {symptom.code}
              </span>
              <span className="max-w-[14rem] truncate">{symptom.name}</span>
            </Badge>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-sm leading-6 text-muted-foreground">Belum ada gejala dipilih.</p>
      )}
    </div>
  );
}

function DiagnosisResultCard({ diagnosis }: { diagnosis: DiagnosisResult | null }) {
  if (!diagnosis) {
    return (
      <div className="rounded-3xl border border-dashed border-border bg-background/55 p-5 text-sm leading-6 text-muted-foreground">
        <div className="mb-3 flex size-10 items-center justify-center rounded-2xl bg-secondary text-primary">
          <Sparkles className="size-5" aria-hidden="true" />
        </div>
        Hasil diagnosa akan tampil di sini setelah gejala dipilih dan diproses.
      </div>
    );
  }

  const isRbr = diagnosis.method === "RBR";
  const tone = diagnosis.requires_review
    ? "border-amber-300 bg-amber-50 text-amber-950"
    : isRbr
      ? "border-primary/40 bg-cyan-50 text-cyan-950"
      : "border-emerald-300 bg-emerald-50 text-emerald-950";

  return (
    <div className={cn("rounded-3xl border p-5", tone)} aria-live="polite">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Badge className="rounded-full bg-card text-foreground shadow-sm" translate="no">
          {diagnosis.method}
        </Badge>
        <span className="flex items-center gap-2 text-sm font-bold">
          {diagnosis.requires_review ? (
            <ShieldAlert className="size-4" aria-hidden="true" />
          ) : (
            <CheckCircle2 className="size-4" aria-hidden="true" />
          )}
          {diagnosis.requires_review ? "Memerlukan Review Pakar" : "Rekomendasi Siap"}
        </span>
      </div>
      <h3 className="mt-4 text-2xl font-black">{diagnosis.disease_name ?? "Tidak ada diagnosa"}</h3>
      {diagnosis.disease_code ? (
        <p className="mt-1 text-sm font-semibold opacity-80" translate="no">
          {diagnosis.disease_code}
        </p>
      ) : null}
      <div className="mt-5 grid gap-3">
        <Metric
          icon={Layers3}
          label="Metode"
          value={isRbr ? "RBR" : "CBR"}
          helper={isRbr ? "Aturan cocok penuh" : "Similarity kasus terdekat"}
        />
        <Metric
          icon={Gauge}
          label="Similarity"
          value={diagnosis.similarity === null ? "-" : percentFormatter.format(diagnosis.similarity)}
          helper={diagnosis.similarity === null ? "CBR tidak dijalankan" : "Nearest neighbor berbobot"}
        />
      </div>
      {diagnosis.message ? <p className="mt-4 text-sm leading-6 opacity-90">{diagnosis.message}</p> : null}
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  helper,
}: {
  icon: typeof Gauge;
  label: string;
  value: string;
  helper: string;
}) {
  return (
    <div className="rounded-2xl bg-card/70 p-4 shadow-sm shadow-cyan-900/5">
      <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] opacity-75">
        <Icon className="size-3.5" aria-hidden="true" />
        {label}
      </p>
      <p className="mt-2 text-2xl font-black tabular-nums">{value}</p>
      <p className="mt-1 text-xs leading-5 opacity-75">{helper}</p>
    </div>
  );
}

function ExpertRetainPanel({
  diagnosis,
  isSavingCase,
  saveMessage,
  onSave,
}: {
  diagnosis: DiagnosisResult;
  isSavingCase: boolean;
  saveMessage: string | null;
  onSave: () => void;
}) {
  return (
    <div className="rounded-3xl border border-amber-300/60 bg-amber-50 p-4 text-amber-950">
      <div className="flex items-center gap-2">
        <BadgeCheck className="size-4" aria-hidden="true" />
        <h3 className="font-black">Panel Retain Pakar</h3>
      </div>
      <p className="mt-2 text-sm leading-6 text-amber-900">
        Simpan kombinasi gejala ini ke basis kasus jika pakar menyetujui hasil diagnosa.
      </p>
      <dl className="mt-4 grid gap-3 text-sm">
        <div>
          <dt className="text-amber-800">Kode Penyakit</dt>
          <dd className="font-black" translate="no">
            {diagnosis.disease_code}
          </dd>
        </div>
        <div>
          <dt className="text-amber-800">Nama Penyakit</dt>
          <dd className="font-black">{diagnosis.disease_name}</dd>
        </div>
      </dl>
      <Button
        type="button"
        className="mt-4 h-11 w-full rounded-full bg-amber-700 text-white hover:bg-amber-800"
        onClick={onSave}
        disabled={isSavingCase}
      >
        {isSavingCase ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : <Save className="size-4" aria-hidden="true" />}
        {isSavingCase ? "Menyimpan..." : "Simpan ke Basis Kasus"}
      </Button>
      {saveMessage ? (
        <p className="mt-3 text-sm leading-6 text-amber-950" aria-live="polite">
          {saveMessage}
        </p>
      ) : null}
    </div>
  );
}

function MatchedRuleDetail({ rule }: { rule: MatchedRule }) {
  return (
    <Card className="border-primary/30 bg-cyan-50 shadow-sm shadow-cyan-950/5">
      <CardHeader>
        <CardTitle className="text-xl font-black text-cyan-950">Detail Aturan RBR</CardTitle>
        <CardDescription className="text-cyan-800">
          Aturan terpenuhi 100%, sehingga CBR tidak dijalankan.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-3xl bg-card p-4">
          <p className="text-sm text-muted-foreground">Aturan Cocok</p>
          <p className="mt-1 text-lg font-black text-foreground" translate="no">
            {rule.rule_code}
          </p>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {rule.matched_symptoms.map((symptomCode) => (
            <Badge key={symptomCode} className="rounded-full bg-primary text-primary-foreground" translate="no">
              {symptomCode}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function CbrDetails({ details }: { details: PerDiseaseDetail[] }) {
  const defaultValue = details.find((disease) => disease.is_winner)?.code;

  return (
    <Card className="border-border/80 bg-card/92 shadow-xl shadow-cyan-950/6">
      <CardHeader>
        <CardTitle className="text-xl font-black">Detail Similarity CBR</CardTitle>
        <CardDescription className="leading-6">
          Perhitungan Nearest Neighbor Retrieval per diagnosis kandidat.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible defaultValue={defaultValue} className="space-y-3">
          {details.map((disease) => {
            const progressValue = Math.round(disease.similarity * 100);

            return (
              <AccordionItem
                key={disease.code}
                value={disease.code}
                className={cn(
                  "rounded-3xl border px-4",
                  disease.is_winner ? "border-primary/50 bg-secondary/70" : "border-border bg-background/55",
                )}
              >
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex min-w-0 flex-1 items-center justify-between gap-4 pr-3">
                    <div className="min-w-0 text-left">
                      <p className="truncate font-black text-foreground">
                        <span translate="no">{disease.code}</span> - {disease.name}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {disease.is_winner ? "Kasus terdekat" : "Kandidat pembanding"}
                      </p>
                    </div>
                    <Badge className="rounded-full bg-card text-primary tabular-nums">
                      {percentFormatter.format(disease.similarity)}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <Progress value={progressValue} className="h-2 bg-card" aria-label={`Similarity ${disease.name}`} />
                  <div className="mt-4 grid gap-4 text-sm">
                    <SymptomCodeList title="Matched Symptoms" codes={disease.matched} tone="success" />
                    <SymptomCodeList title="Unmatched Symptoms" codes={disease.unmatched} tone="muted" />
                  </div>
                  <div className="mt-4 rounded-2xl bg-card p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">Formula</p>
                    <code className="mt-2 block break-words text-sm text-foreground">{disease.formula}</code>
                    <p className="mt-3 text-sm text-muted-foreground">
                      Matched weight: {disease.matched_weight} / {disease.total_weight}
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </CardContent>
    </Card>
  );
}

function SymptomCodeList({ title, codes, tone }: { title: string; codes: string[]; tone: "success" | "muted" }) {
  return (
    <div>
      <h3 className="font-black text-foreground">{title}</h3>
      {codes.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {codes.map((code) => (
            <Badge
              key={code}
              variant={tone === "success" ? "default" : "outline"}
              className={cn("rounded-full", tone === "success" ? "bg-accent text-accent-foreground" : "bg-card")}
              translate="no"
            >
              {code}
            </Badge>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-sm text-muted-foreground">-</p>
      )}
    </div>
  );
}
