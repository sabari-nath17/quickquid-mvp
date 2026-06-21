"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X, SlidersHorizontal } from "lucide-react";

const selectCls =
  "h-9 rounded-lg border border-border bg-white px-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring";

const DELIVERY_OPTIONS = [
  { label: "Any delivery", value: "" },
  { label: "≤ 1 day", value: "1" },
  { label: "≤ 3 days", value: "3" },
  { label: "≤ 7 days", value: "7" },
  { label: "≤ 14 days", value: "14" },
];

const LEVEL_OPTIONS = [
  { label: "Any level", value: "" },
  { label: "Basic", value: "BASIC" },
  { label: "Pro", value: "PRO" },
  { label: "Elite", value: "ELITE" },
];

const SORT_OPTIONS = [
  { label: "Newest", value: "" },
  { label: "Highest rated", value: "rating" },
  { label: "Price: low → high", value: "price_asc" },
  { label: "Price: high → low", value: "price_desc" },
  { label: "Fastest delivery", value: "delivery" },
];

export function CatalogFilters({
  categories,
  defaults,
  totalCount,
}: {
  categories: string[];
  defaults: {
    q: string;
    category: string;
    minPrice: string;
    maxPrice: string;
    delivery: string;
    level: string;
    sort: string;
  };
  totalCount: number;
}) {
  const router = useRouter();
  const [q, setQ] = useState(defaults.q);
  const [category, setCategory] = useState(defaults.category);
  const [minPrice, setMinPrice] = useState(defaults.minPrice);
  const [maxPrice, setMaxPrice] = useState(defaults.maxPrice);
  const [delivery, setDelivery] = useState(defaults.delivery);
  const [level, setLevel] = useState(defaults.level);
  const [sort, setSort] = useState(defaults.sort);
  const [showBudget, setShowBudget] = useState(!!(defaults.minPrice || defaults.maxPrice));
  const [, startTransition] = useTransition();

  function navigate(overrides: Partial<typeof defaults> = {}) {
    const vals = { q, category, minPrice, maxPrice, delivery, level, sort, ...overrides };
    const params = new URLSearchParams();
    if (vals.q.trim()) params.set("q", vals.q.trim());
    if (vals.category) params.set("category", vals.category);
    if (vals.minPrice) params.set("minPrice", vals.minPrice);
    if (vals.maxPrice) params.set("maxPrice", vals.maxPrice);
    if (vals.delivery) params.set("delivery", vals.delivery);
    if (vals.level) params.set("level", vals.level);
    if (vals.sort) params.set("sort", vals.sort);
    startTransition(() => router.push(`/client/catalog${params.toString() ? `?${params}` : ""}`));
  }

  const activeFilters: { label: string; clear: () => void }[] = [];
  if (category) activeFilters.push({ label: category, clear: () => { setCategory(""); navigate({ category: "" }); } });
  if (minPrice || maxPrice) activeFilters.push({
    label: `₹${minPrice || "0"} – ${maxPrice ? `₹${maxPrice}` : "∞"}`,
    clear: () => { setMinPrice(""); setMaxPrice(""); navigate({ minPrice: "", maxPrice: "" }); },
  });
  if (delivery) activeFilters.push({ label: DELIVERY_OPTIONS.find(o => o.value === delivery)?.label ?? "", clear: () => { setDelivery(""); navigate({ delivery: "" }); } });
  if (level) activeFilters.push({ label: LEVEL_OPTIONS.find(o => o.value === level)?.label ?? "", clear: () => { setLevel(""); navigate({ level: "" }); } });

  return (
    <div className="mb-8 space-y-3">
      {/* Search + primary filters row */}
      <div className="flex flex-wrap items-center gap-2">
        <form
          onSubmit={(e) => { e.preventDefault(); navigate(); }}
          className="flex items-center gap-2 flex-1 min-w-[240px]"
        >
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search services by keyword or skill…"
              className="w-full h-9 rounded-lg border border-border bg-white pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <button type="submit" className="h-9 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-medium whitespace-nowrap">
            Search
          </button>
        </form>

        <select
          value={category}
          onChange={(e) => { setCategory(e.target.value); navigate({ category: e.target.value }); }}
          className={selectCls}
        >
          <option value="">All categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        <button
          type="button"
          onClick={() => setShowBudget((v) => !v)}
          className={`h-9 px-3 rounded-lg border text-xs flex items-center gap-1.5 transition-colors ${
            showBudget ? "border-primary bg-primary/5 text-primary" : "border-border bg-white text-foreground hover:border-primary/30"
          }`}
        >
          <SlidersHorizontal className="w-3 h-3" />
          Budget
        </button>

        <select
          value={delivery}
          onChange={(e) => { setDelivery(e.target.value); navigate({ delivery: e.target.value }); }}
          className={selectCls}
        >
          {DELIVERY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        <select
          value={level}
          onChange={(e) => { setLevel(e.target.value); navigate({ level: e.target.value }); }}
          className={selectCls}
        >
          {LEVEL_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        <select
          value={sort}
          onChange={(e) => { setSort(e.target.value); navigate({ sort: e.target.value }); }}
          className={selectCls}
        >
          {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* Budget inline panel */}
      {showBudget && (
        <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-border">
          <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">Budget (₹)</span>
          <input
            type="number"
            min={0}
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="Min"
            className="w-28 h-8 rounded-md border border-border px-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <span className="text-muted-foreground text-xs">–</span>
          <input
            type="number"
            min={0}
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="Max"
            className="w-28 h-8 rounded-md border border-border px-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            type="button"
            onClick={() => navigate()}
            className="h-8 px-3 rounded-md bg-primary text-primary-foreground text-xs font-medium"
          >
            Apply
          </button>
          {(minPrice || maxPrice) && (
            <button type="button" onClick={() => { setMinPrice(""); setMaxPrice(""); navigate({ minPrice: "", maxPrice: "" }); }}
              className="text-xs text-muted-foreground hover:text-destructive">
              Clear
            </button>
          )}
        </div>
      )}

      {/* Results count + active filter pills */}
      <div className="flex items-center gap-2 flex-wrap min-h-[22px]">
        <span className="text-xs text-muted-foreground">{totalCount} service{totalCount !== 1 ? "s" : ""}</span>
        {activeFilters.map((f, i) => (
          <button
            key={i}
            type="button"
            onClick={f.clear}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-medium hover:bg-primary/20 transition-colors"
          >
            {f.label}
            <X className="w-2.5 h-2.5" />
          </button>
        ))}
        {activeFilters.length > 1 && (
          <button
            type="button"
            onClick={() => { setCategory(""); setMinPrice(""); setMaxPrice(""); setDelivery(""); setLevel(""); navigate({ category: "", minPrice: "", maxPrice: "", delivery: "", level: "" }); }}
            className="text-[11px] text-muted-foreground hover:text-destructive"
          >
            Clear all
          </button>
        )}
      </div>
    </div>
  );
}
