import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Printer, RotateCcw, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Assignment Front Page Maker — Cover Page Generator" },
      {
        name: "description",
        content:
          "Build a print-ready assignment front page with your university logo, subject, module, session and submission details. Choose templates, borders and accent colours, then print or save as PDF.",
      },
      { property: "og:title", content: "Assignment Front Page Maker" },
      {
        property: "og:description",
        content:
          "Design a clean A4 assignment cover page with logo, subject and submission details, then save it as PDF.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Form = {
  university: string;
  department: string;
  session: string;
  assignmentLabel: string;
  title: string;
  subject: string;
  toLabel: string;
  toName: string;
  toExtra: string;
  byLabel: string;
  byName: string;
  byClass: string;
  byRoll: string;
  byExtra: string;
  date: string;
  logo: string;
  template: "classic" | "modern" | "elegant";
  border: "double" | "single" | "thick" | "none";
  accent: string;
  uppercaseTitle: boolean;
  showLogo: boolean;
  showSession: boolean;
  showDate: boolean;
  showRule: boolean;
};

const DEFAULTS: Form = {
  university: "Techno India University Tripura",
  department: "School of Engineering & Architecture",
  session: "Session 2026–2027",
  assignmentLabel: "Assignment on",
  title: "Module 1",
  subject: "Subject: Basic Electrical Engineering",
  toLabel: "Submitted to:",
  toName: "Dr. Paulami De",
  toExtra: "",
  byLabel: "Submitted by:",
  byName: "Ranjay Das",
  byClass: "Class: B.Tech CSE(CORE)",
  byRoll: "Roll No: 2611200101021",
  byExtra: "",
  date: "Date of Submission: 21/9/2026",
  logo: "",
  template: "classic",
  border: "double",
  accent: "#1a3fa0",
  uppercaseTitle: true,
  showLogo: true,
  showSession: true,
  showDate: true,
  showRule: true,
};

const ACCENTS = ["#1a3fa0", "#0f766e", "#9d174d", "#b45309", "#3f3f46", "#7e22ce"];

const TEMPLATES = [
  { id: "classic", name: "Classic", hint: "Serif, formal" },
  { id: "modern", name: "Modern", hint: "Clean sans" },
  { id: "elegant", name: "Elegant", hint: "Display serif" },
] as const;

const BORDERS = [
  { id: "double", name: "Double" },
  { id: "single", name: "Single" },
  { id: "thick", name: "Bold" },
  { id: "none", name: "None" },
] as const;

const STORAGE_KEY = "front-page-form-v1";

function Index() {
  const [form, setForm] = useState<Form>(DEFAULTS);
  const [scale, setScale] = useState(1);
  const stageRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setForm({ ...DEFAULTS, ...JSON.parse(raw) });
      } catch {
        /* ignore bad saved data */
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
  }, [form]);

  useEffect(() => {
    const fit = () => {
      const el = stageRef.current;
      if (!el) return;
      const w = el.clientWidth - 32;
      setScale(Math.min(1, Math.max(0.28, w / 794)));
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  const set = <K extends keyof Form>(key: K, value: Form[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const onLogo = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => set("logo", String(reader.result));
    reader.readAsDataURL(file);
  };

  const t = form.template;
  const bodyFont =
    t === "modern" ? "var(--font-grotesk)" : t === "elegant" ? "var(--font-garamond)" : "var(--font-serif)";
  const titleFont =
    t === "modern" ? "var(--font-grotesk)" : t === "elegant" ? "var(--font-display)" : "var(--font-serif)";

  const borderStyle: React.CSSProperties =
    form.border === "none"
      ? {}
      : form.border === "double"
        ? { border: `3px double ${form.accent}`, padding: "10mm" }
        : form.border === "thick"
          ? { border: `6px solid ${form.accent}`, padding: "10mm" }
          : { border: `1px solid ${form.accent}`, padding: "10mm" };

  return (
    <main className="min-h-screen">
      <header className="no-print border-b border-border bg-card/70 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-4">
          <div>
            <h1 className="font-display text-xl font-bold tracking-tight">Front Page Maker</h1>
            <p className="text-xs text-muted-foreground">
              Assignment cover pages, print-ready in A4
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setForm(DEFAULTS)}>
              <RotateCcw className="size-4" /> Reset
            </Button>
            <Button size="sm" onClick={() => window.print()}>
              <Printer className="size-4" /> Print / Save PDF
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-5 py-6 lg:grid-cols-[380px_1fr]">
        {/* Controls */}
        <section className="no-print space-y-6">
          <Panel title="Style">
            <div className="grid grid-cols-3 gap-2">
              {TEMPLATES.map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => set("template", tpl.id)}
                  className={`rounded-lg border px-2 py-2 text-left transition-colors ${
                    form.template === tpl.id
                      ? "border-primary bg-accent"
                      : "border-border hover:bg-secondary"
                  }`}
                >
                  <span className="block text-sm font-semibold">{tpl.name}</span>
                  <span className="block text-[11px] text-muted-foreground">{tpl.hint}</span>
                </button>
              ))}
            </div>
            <div className="mt-4">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Border</Label>
              <div className="mt-2 grid grid-cols-4 gap-2">
                {BORDERS.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => set("border", b.id)}
                    className={`rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors ${
                      form.border === b.id
                        ? "border-primary bg-accent"
                        : "border-border hover:bg-secondary"
                    }`}
                  >
                    {b.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-4">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                Accent colour
              </Label>
              <div className="mt-2 flex items-center gap-2">
                {ACCENTS.map((c) => (
                  <button
                    key={c}
                    aria-label={`Accent ${c}`}
                    onClick={() => set("accent", c)}
                    style={{ background: c }}
                    className={`size-7 rounded-full ring-offset-2 ring-offset-card transition ${
                      form.accent === c ? "ring-2 ring-foreground" : ""
                    }`}
                  />
                ))}
                <input
                  type="color"
                  value={form.accent}
                  onChange={(e) => set("accent", e.target.value)}
                  className="size-7 cursor-pointer rounded-full border border-border bg-transparent"
                  aria-label="Custom accent colour"
                />
              </div>
            </div>
            <div className="mt-4 space-y-3">
              <Toggle
                label="Show logo"
                checked={form.showLogo}
                onChange={(v) => set("showLogo", v)}
              />
              <Toggle
                label="Show session line"
                checked={form.showSession}
                onChange={(v) => set("showSession", v)}
              />
              <Toggle
                label="Show submission date"
                checked={form.showDate}
                onChange={(v) => set("showDate", v)}
              />
              <Toggle
                label="Divider between columns"
                checked={form.showRule}
                onChange={(v) => set("showRule", v)}
              />
              <Toggle
                label="Uppercase main title"
                checked={form.uppercaseTitle}
                onChange={(v) => set("uppercaseTitle", v)}
              />
            </div>
          </Panel>

          <Panel title="Logo">
            <div className="flex items-center gap-3">
              <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-secondary">
                {form.logo ? (
                  <img src={form.logo} alt="University logo preview" className="max-h-full max-w-full" />
                ) : (
                  <span className="text-[10px] text-muted-foreground">None</span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                  <Upload className="size-4" /> Upload logo
                </Button>
                {form.logo && (
                  <Button variant="ghost" size="sm" onClick={() => set("logo", "")}>
                    <X className="size-4" /> Remove
                  </Button>
                )}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => onLogo(e.target.files?.[0])}
              />
            </div>
          </Panel>

          <Panel title="Institution">
            <Field label="University / College" value={form.university} onChange={(v) => set("university", v)} />
            <Field label="Department / School" value={form.department} onChange={(v) => set("department", v)} />
            <Field label="Session" value={form.session} onChange={(v) => set("session", v)} />
          </Panel>

          <Panel title="Assignment">
            <Field label="Label above title" value={form.assignmentLabel} onChange={(v) => set("assignmentLabel", v)} />
            <Field label="Main title" value={form.title} onChange={(v) => set("title", v)} />
            <Field label="Subject line" value={form.subject} onChange={(v) => set("subject", v)} />
          </Panel>

          <Panel title="Submitted to">
            <Field label="Heading" value={form.toLabel} onChange={(v) => set("toLabel", v)} />
            <Field label="Name" value={form.toName} onChange={(v) => set("toName", v)} />
            <Field label="Extra line (optional)" value={form.toExtra} onChange={(v) => set("toExtra", v)} />
          </Panel>

          <Panel title="Submitted by">
            <Field label="Heading" value={form.byLabel} onChange={(v) => set("byLabel", v)} />
            <Field label="Name" value={form.byName} onChange={(v) => set("byName", v)} />
            <Field label="Class" value={form.byClass} onChange={(v) => set("byClass", v)} />
            <Field label="Roll number" value={form.byRoll} onChange={(v) => set("byRoll", v)} />
            <Field label="Extra line (optional)" value={form.byExtra} onChange={(v) => set("byExtra", v)} />
            <Field label="Date line" value={form.date} onChange={(v) => set("date", v)} />
          </Panel>
        </section>

        {/* Preview */}
        <section
          ref={stageRef}
          className="print-stage flex justify-center overflow-hidden rounded-xl bg-secondary/60 p-4"
        >
          <div
            className="print-area shrink-0 bg-paper text-ink shadow-[var(--shadow-paper)]"
            style={{
              width: 794,
              minHeight: 1123,
              transform: `scale(${scale})`,
              transformOrigin: "top center",
              marginBottom: (scale - 1) * 1123,
              padding: form.border === "none" ? "18mm" : "8mm",
              fontFamily: bodyFont,
            }}
          >
            <div
              style={{ ...borderStyle, minHeight: form.border === "none" ? undefined : "273mm" }}
              className="flex h-full flex-col"
            >
              <div className="flex flex-1 flex-col items-center pt-6 text-center">
                {form.showLogo && form.logo && (
                  <img src={form.logo} alt="University logo" className="mb-5 max-h-28 object-contain" />
                )}

                <h2
                  className="px-6 leading-tight"
                  style={{
                    fontFamily: titleFont,
                    fontWeight: 700,
                    fontSize: 36,
                    textTransform: "uppercase",
                  }}
                >
                  {form.university}
                </h2>

                {form.department && (
                  <p className="mt-5 text-[19px] uppercase tracking-wide">{form.department}</p>
                )}

                {form.showSession && form.session && (
                  <p
                    className="mt-12 text-[17px] font-semibold uppercase tracking-[0.12em]"
                    style={{ color: form.accent, fontFamily: "var(--font-grotesk)" }}
                  >
                    {form.session}
                  </p>
                )}

                {form.assignmentLabel && (
                  <p
                    className="mt-6 text-[19px] uppercase tracking-wide"
                    style={{ fontFamily: "var(--font-grotesk)" }}
                  >
                    {form.assignmentLabel}
                  </p>
                )}

                <p
                  className="mt-3 leading-none"
                  style={{
                    fontFamily: titleFont,
                    color: form.accent,
                    fontWeight: 700,
                    fontSize: 58,
                    textTransform: form.uppercaseTitle ? "uppercase" : "none",
                  }}
                >
                  {form.title}
                </p>

                {form.subject && (
                  <p
                    className="mt-8 px-8 text-[23px] uppercase"
                    style={{ fontFamily: "var(--font-grotesk)", fontWeight: 500 }}
                  >
                    {form.subject}
                  </p>
                )}
              </div>

              <div className="mt-auto px-2 pb-2">
                <div className="grid grid-cols-2 gap-8">
                  <Column
                    heading={form.toLabel}
                    accent={form.accent}
                    lines={[form.toName, form.toExtra]}
                    titleFont={titleFont}
                  />
                  <div
                    style={
                      form.showRule ? { borderLeft: `1px solid ${form.accent}`, paddingLeft: 28 } : undefined
                    }
                  >
                    <Column
                      heading={form.byLabel}
                      accent={form.accent}
                      lines={[form.byName, form.byClass, form.byRoll, form.byExtra]}
                      titleFont={titleFont}
                    />
                  </div>
                </div>

                {form.showDate && form.date && (
                  <p className="mt-16 text-center text-[18px]">{form.date}</p>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function Column({
  heading,
  lines,
  accent,
  titleFont,
}: {
  heading: string;
  lines: string[];
  accent: string;
  titleFont: string;
}) {
  return (
    <div className="text-left">
      <p
        className="text-[20px] font-bold uppercase"
        style={{ color: accent, fontFamily: titleFont }}
      >
        {heading}
      </p>
      <div className="mt-1 mb-3 h-px w-4/5" style={{ background: accent }} />
      <div className="space-y-2 text-[19px]">
        {lines.filter(Boolean).map((l) => (
          <p key={l}>{l}</p>
        ))}
      </div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {title}
      </h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
