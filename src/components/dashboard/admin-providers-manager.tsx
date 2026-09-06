"use client";

import { useState } from "react";
import { Building2, Power, Trash2 } from "lucide-react";
import { Badge, Button, EmptyState } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { formatCurrency } from "@/lib/utils";
import type { Provider } from "@/db/schema";
import { useDictionary, useLocalizedHref, format } from "@/lib/i18n/locale-context";
import Link from "next/link";

export function AdminProvidersManager({ initialProviders }: { initialProviders: Provider[] }) {
  const { push } = useToast();
  const dict = useDictionary();
  const buildHref = useLocalizedHref();
  const [providers, setProviders] = useState(initialProviders);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function toggleActive(provider: Provider) {
    const previous = providers;
    setBusyId(provider.id);
    setProviders((prev) => prev.map((p) => (p.id === provider.id ? { ...p, isActive: !p.isActive } : p)));
    try {
      const res = await fetch(`/api/providers/${provider.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !provider.isActive }),
      });
      if (!res.ok) throw new Error(dict.adminProvidersPage.toastUpdateError);
      push(provider.isActive ? dict.adminProvidersPage.toastHidden : dict.adminProvidersPage.toastListed, "success");
    } catch (err: any) {
      setProviders(previous);
      push(err.message, "error");
    } finally {
      setBusyId(null);
    }
  }

  async function remove(provider: Provider) {
    if (!confirm(format(dict.adminProvidersPage.confirmDelete, { name: provider.businessName }))) return;
    const previous = providers;
    setBusyId(provider.id);
    setProviders((prev) => prev.filter((p) => p.id !== provider.id));
    try {
      const res = await fetch(`/api/providers/${provider.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(dict.adminProvidersPage.toastDeleteError);
      push(dict.adminProvidersPage.toastDeleted, "success");
    } catch (err: any) {
      setProviders(previous);
      push(err.message, "error");
    } finally {
      setBusyId(null);
    }
  }

  if (providers.length === 0) {
    return <EmptyState icon={<Building2 className="h-6 w-6" />} title={dict.adminProvidersPage.emptyTitle} />;
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3">{dict.adminProvidersPage.colBusiness}</th>
            <th className="px-4 py-3">{dict.adminProvidersPage.colType}</th>
            <th className="px-4 py-3">{dict.adminProvidersPage.colCity}</th>
            <th className="px-4 py-3">{dict.adminProvidersPage.colRating}</th>
            <th className="px-4 py-3">{dict.adminProvidersPage.colFrom}</th>
            <th className="px-4 py-3">{dict.adminProvidersPage.colStatus}</th>
            <th className="px-4 py-3 text-right">{dict.adminProvidersPage.colActions}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {providers.map((p) => (
            <tr key={p.id}>
              <td className="px-4 py-3 font-medium text-slate-800">
                <Link href={buildHref(`/providers/${p.id}`)} className="hover:text-teal-700 hover:underline">
                  {p.businessName}
                </Link>
              </td>
              <td className="px-4 py-3 text-slate-500">{dict.providerTypes[p.type]}</td>
              <td className="px-4 py-3 text-slate-500">{p.city}</td>
              <td className="px-4 py-3 text-slate-500">
                {Number(p.rating).toFixed(1)} ({p.reviewCount})
              </td>
              <td className="px-4 py-3 text-slate-500">{formatCurrency(p.priceFrom)}</td>
              <td className="px-4 py-3">
                <Badge variant={p.isActive ? "success" : "neutral"}>{p.isActive ? dict.adminProvidersPage.listed : dict.adminProvidersPage.hidden}</Badge>
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="outline" loading={busyId === p.id} onClick={() => toggleActive(p)}>
                    <Power className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="sm" variant="ghost" className="text-rose-600 hover:bg-rose-50" loading={busyId === p.id} onClick={() => remove(p)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
