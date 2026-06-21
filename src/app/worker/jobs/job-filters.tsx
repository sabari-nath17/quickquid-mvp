"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

const selectCls = "h-9 rounded-lg border border-border bg-white px-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring";

export function JobFilters({
  activeCollar,
  defaults,
}: {
  activeCollar: string;
  defaults: { q: string; exp: string; type: string; sort: string };
}) {
  const router = useRouter();
  const [q, setQ] = useState(defaults.q);
  const [exp, setExp] = useState(defaults.exp);
  const [type, setType] = useState(defaults.type);
  const [sort, setSort] = useState(defaults.sort);

  function apply(next?: Partial<{ exp: string; type: string; sort: string }>) {
    const params = new URLSearchParams();
    if (activeCollar !== "ALL") params.set("collar", activeCollar);
    if (q.trim()) params.set("q", q.trim());
    const e = next?.exp ?? exp; const t = next?.type ?? type; const s = next?.sort ?? sort;
    if (e) params.set("exp", e);
    if (t) params.set("type", t);
    if (s) params.set("sort", s);
    router.push(`/worker/jobs${params.toString() ? `?${params}` : ""}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-2 mb-6">
      <form
        onSubmit={(e) => { e.preventDefault(); apply(); }}
        className="flex items-center gap-2 flex-1 min-w-[220px]"
      >
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search jobs by keyword or skill"
            className="w-full h-9 rounded-lg border border-border bg-white pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <button type="submit" className="h-9 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-medium">Search</button>
      </form>

      <select value={exp} onChange={(e) => { setExp(e.target.value); apply({ exp: e.target.value }); }} className={selectCls}>
        <option value="">Any experience</option>
        <option value="ENTRY">Entry</option>
        <option value="INTERMEDIATE">Intermediate</option>
        <option value="EXPERT">Expert</option>
      </select>
      <select value={type} onChange={(e) => { setType(e.target.value); apply({ type: e.target.value }); }} className={selectCls}>
        <option value="">Any type</option>
        <option value="FIXED">Fixed price</option>
        <option value="HOURLY">Hourly</option>
      </select>
      <select value={sort} onChange={(e) => { setSort(e.target.value); apply({ sort: e.target.value }); }} className={selectCls}>
        <option value="">Newest</option>
        <option value="budget">Highest budget</option>
      </select>
    </div>
  );
}
