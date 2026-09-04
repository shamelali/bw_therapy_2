"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Search } from "lucide-react";
import { Button, Input, Select } from "@/components/ui/primitives";
import { useDictionary, useLocalizedHref } from "@/lib/i18n/locale-context";

export function SearchFilters({ cities }: { cities: string[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dict = useDictionary();
  const buildHref = useLocalizedHref();
  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const [city, setCity] = useState(searchParams.get("city") ?? "all");
  const [type, setType] = useState(searchParams.get("type") ?? "all");
  const [isPending, startTransition] = useTransition();

  function applyFilters(e?: React.FormEvent) {
    e?.preventDefault();
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (city !== "all") params.set("city", city);
    if (type !== "all") params.set("type", type);
    startTransition(() => {
      router.push(`${buildHref("/")}?${params.toString()}`);
    });
  }

  return (
    <form
      onSubmit={applyFilters}
      className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-[1fr_auto_auto_auto] sm:items-end"
    >
      <div>
        <label className="mb-1.5 block text-xs font-medium text-slate-500">{dict.search.searchLabel}</label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={dict.search.searchPlaceholder}
            className="pl-9"
          />
        </div>
      </div>
      <div className="sm:w-44">
        <label className="mb-1.5 block text-xs font-medium text-slate-500">{dict.search.cityLabel}</label>
        <Select value={city} onChange={(e) => setCity(e.target.value)}>
          <option value="all">{dict.search.allCities}</option>
          {cities.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
      </div>
      <div className="sm:w-48">
        <label className="mb-1.5 block text-xs font-medium text-slate-500">{dict.search.typeLabel}</label>
        <Select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="all">{dict.search.allTypes}</option>
          {Object.entries(dict.providerTypes).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </div>
      <Button type="submit" loading={isPending} className="h-[42px]">
        {dict.search.searchButton}
      </Button>
    </form>
  );
}
