"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  addEmployment, deleteEmployment,
  addEducation, deleteEducation,
  addCertification, deleteCertification,
  addLanguage, deleteLanguage,
} from "@/app/actions/profile-sections";
import { Plus, Trash2, Briefcase, GraduationCap, Award, Languages } from "lucide-react";

const inputCls = "w-full rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring";

type Employment = { id: string; title: string; company: string; startDate: string; endDate: string | null; isCurrent: boolean; description: string | null };
type Education = { id: string; institution: string; degree: string | null; fieldOfStudy: string | null; startYear: number | null; endYear: number | null };
type Certification = { id: string; name: string; provider: string; issueYear: number | null; credentialUrl: string | null };
type Language = { id: string; name: string; proficiency: string };

const PROF_LABEL: Record<string, string> = {
  BASIC: "Basic", CONVERSATIONAL: "Conversational", FLUENT: "Fluent", NATIVE_OR_BILINGUAL: "Native / Bilingual",
};

export function CredentialsManager({
  employment, education, certifications, languages,
}: {
  employment: Employment[];
  education: Education[];
  certifications: Certification[];
  languages: Language[];
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const refresh = () => startTransition(() => router.refresh());

  return (
    <div className="space-y-8">
      {/* Employment */}
      <SectionCard icon={Briefcase} title="Employment History">
        {employment.map((e) => (
          <Row key={e.id} onDelete={() => deleteEmployment(e.id).then(refresh)}>
            <p className="text-sm font-medium text-foreground">{e.title} · {e.company}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(e.startDate).toLocaleDateString("en-IN", { month: "short", year: "numeric" })} –{" "}
              {e.isCurrent ? "Present" : e.endDate ? new Date(e.endDate).toLocaleDateString("en-IN", { month: "short", year: "numeric" }) : "—"}
            </p>
            {e.description && <p className="text-xs text-muted-foreground mt-1">{e.description}</p>}
          </Row>
        ))}
        <EmploymentForm onAdded={refresh} />
      </SectionCard>

      {/* Education */}
      <SectionCard icon={GraduationCap} title="Education">
        {education.map((e) => (
          <Row key={e.id} onDelete={() => deleteEducation(e.id).then(refresh)}>
            <p className="text-sm font-medium text-foreground">{e.institution}</p>
            <p className="text-xs text-muted-foreground">
              {[e.degree, e.fieldOfStudy].filter(Boolean).join(", ")}
              {e.startYear || e.endYear ? ` · ${e.startYear ?? ""}–${e.endYear ?? ""}` : ""}
            </p>
          </Row>
        ))}
        <EducationForm onAdded={refresh} />
      </SectionCard>

      {/* Certifications */}
      <SectionCard icon={Award} title="Certifications">
        {certifications.map((c) => (
          <Row key={c.id} onDelete={() => deleteCertification(c.id).then(refresh)}>
            <p className="text-sm font-medium text-foreground">{c.name}</p>
            <p className="text-xs text-muted-foreground">
              {c.provider}{c.issueYear ? ` · ${c.issueYear}` : ""}
            </p>
            {c.credentialUrl && <a href={c.credentialUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">View credential</a>}
          </Row>
        ))}
        <CertificationForm onAdded={refresh} />
      </SectionCard>

      {/* Languages */}
      <SectionCard icon={Languages} title="Languages">
        {languages.map((l) => (
          <Row key={l.id} onDelete={() => deleteLanguage(l.id).then(refresh)}>
            <p className="text-sm font-medium text-foreground">
              {l.name} <span className="text-xs text-muted-foreground">— {PROF_LABEL[l.proficiency] ?? l.proficiency}</span>
            </p>
          </Row>
        ))}
        <LanguageForm onAdded={refresh} />
      </SectionCard>
    </div>
  );
}

function SectionCard({ icon: Icon, title, children }: { icon: React.ComponentType<{ className?: string }>; title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-base font-semibold text-foreground font-heading mb-3 flex items-center gap-2">
        <Icon className="w-4 h-4 text-primary" />
        {title}
      </h2>
      <div className="bg-white rounded-xl border border-border p-4 space-y-3">{children}</div>
    </section>
  );
}

function Row({ children, onDelete }: { children: React.ReactNode; onDelete: () => void }) {
  const [isPending, startTransition] = useTransition();
  return (
    <div className="flex items-start justify-between gap-3 pb-3 border-b border-border last:border-0 last:pb-0">
      <div className="min-w-0">{children}</div>
      <button
        onClick={() => startTransition(() => onDelete())}
        disabled={isPending}
        aria-label="Delete"
        className="text-muted-foreground hover:text-destructive transition-colors shrink-0 disabled:opacity-50"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

function AddToggle({ label, children }: { label: string; children: (close: () => void) => React.ReactNode }) {
  const [open, setOpen] = useState(false);
  if (!open) {
    return (
      <Button size="sm" variant="outline" onClick={() => setOpen(true)} className="gap-1">
        <Plus className="w-3.5 h-3.5" />
        {label}
      </Button>
    );
  }
  return <div className="rounded-lg border border-border p-3 space-y-2 bg-muted/20">{children(() => setOpen(false))}</div>;
}

function EmploymentForm({ onAdded }: { onAdded: () => void }) {
  const [title, setTitle] = useState(""); const [company, setCompany] = useState("");
  const [startDate, setStartDate] = useState(""); const [endDate, setEndDate] = useState("");
  const [isCurrent, setIsCurrent] = useState(false); const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  return (
    <AddToggle label="Add employment">
      {(close) => (
        <>
          <div className="grid grid-cols-2 gap-2">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Job title" className="h-9" />
            <Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Company" className="h-9" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div><Label className="text-[11px]">Start</Label><Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-9" /></div>
            <div><Label className="text-[11px]">End</Label><Input type="date" value={endDate} disabled={isCurrent} onChange={(e) => setEndDate(e.target.value)} className="h-9" /></div>
          </div>
          <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={isCurrent} onChange={(e) => setIsCurrent(e.target.checked)} />I currently work here</label>
          <textarea className={inputCls} rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Responsibilities (optional)" />
          {error && <p className="text-xs text-destructive">{error}</p>}
          <div className="flex gap-2">
            <Button size="sm" disabled={isPending} onClick={() => { setError(null); startTransition(async () => { const r = await addEmployment({ title, company, startDate, endDate: endDate || undefined, isCurrent, description: description || undefined }); if (r.error) setError(r.error); else { close(); onAdded(); } }); }}>Save</Button>
            <Button size="sm" variant="ghost" onClick={close}>Cancel</Button>
          </div>
        </>
      )}
    </AddToggle>
  );
}

function EducationForm({ onAdded }: { onAdded: () => void }) {
  const [institution, setInstitution] = useState(""); const [degree, setDegree] = useState("");
  const [fieldOfStudy, setField] = useState(""); const [startYear, setStartYear] = useState(""); const [endYear, setEndYear] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  return (
    <AddToggle label="Add education">
      {(close) => (
        <>
          <Input value={institution} onChange={(e) => setInstitution(e.target.value)} placeholder="Institution" className="h-9" />
          <div className="grid grid-cols-2 gap-2">
            <Input value={degree} onChange={(e) => setDegree(e.target.value)} placeholder="Degree (e.g. B.Tech)" className="h-9" />
            <Input value={fieldOfStudy} onChange={(e) => setField(e.target.value)} placeholder="Field of study" className="h-9" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input type="number" value={startYear} onChange={(e) => setStartYear(e.target.value)} placeholder="Start year" className="h-9" />
            <Input type="number" value={endYear} onChange={(e) => setEndYear(e.target.value)} placeholder="End year" className="h-9" />
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <div className="flex gap-2">
            <Button size="sm" disabled={isPending} onClick={() => { setError(null); startTransition(async () => { const r = await addEducation({ institution, degree: degree || undefined, fieldOfStudy: fieldOfStudy || undefined, startYear: startYear ? Number(startYear) : undefined, endYear: endYear ? Number(endYear) : undefined }); if (r.error) setError(r.error); else { close(); onAdded(); } }); }}>Save</Button>
            <Button size="sm" variant="ghost" onClick={close}>Cancel</Button>
          </div>
        </>
      )}
    </AddToggle>
  );
}

function CertificationForm({ onAdded }: { onAdded: () => void }) {
  const [name, setName] = useState(""); const [provider, setProvider] = useState("");
  const [issueYear, setIssueYear] = useState(""); const [credentialUrl, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  return (
    <AddToggle label="Add certification">
      {(close) => (
        <>
          <div className="grid grid-cols-2 gap-2">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Certification name" className="h-9" />
            <Input value={provider} onChange={(e) => setProvider(e.target.value)} placeholder="Provider" className="h-9" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input type="number" value={issueYear} onChange={(e) => setIssueYear(e.target.value)} placeholder="Year" className="h-9" />
            <Input type="url" value={credentialUrl} onChange={(e) => setUrl(e.target.value)} placeholder="Credential URL" className="h-9" />
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <div className="flex gap-2">
            <Button size="sm" disabled={isPending} onClick={() => { setError(null); startTransition(async () => { const r = await addCertification({ name, provider, issueYear: issueYear ? Number(issueYear) : undefined, credentialUrl: credentialUrl || undefined }); if (r.error) setError(r.error); else { close(); onAdded(); } }); }}>Save</Button>
            <Button size="sm" variant="ghost" onClick={close}>Cancel</Button>
          </div>
        </>
      )}
    </AddToggle>
  );
}

function LanguageForm({ onAdded }: { onAdded: () => void }) {
  const [name, setName] = useState(""); const [proficiency, setProficiency] = useState("CONVERSATIONAL");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  return (
    <AddToggle label="Add language">
      {(close) => (
        <>
          <div className="grid grid-cols-2 gap-2">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Language" className="h-9" />
            <select value={proficiency} onChange={(e) => setProficiency(e.target.value)} className="h-9 rounded-lg border border-border px-2 text-sm">
              <option value="BASIC">Basic</option>
              <option value="CONVERSATIONAL">Conversational</option>
              <option value="FLUENT">Fluent</option>
              <option value="NATIVE_OR_BILINGUAL">Native / Bilingual</option>
            </select>
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <div className="flex gap-2">
            <Button size="sm" disabled={isPending} onClick={() => { setError(null); startTransition(async () => { const r = await addLanguage({ name, proficiency }); if (r.error) setError(r.error); else { close(); onAdded(); } }); }}>Save</Button>
            <Button size="sm" variant="ghost" onClick={close}>Cancel</Button>
          </div>
        </>
      )}
    </AddToggle>
  );
}
