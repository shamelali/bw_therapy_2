"use client";

import { useState } from "react";
import { Button, Input, Label, Select, Textarea } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import type { Provider } from "@/db/schema";
import { useDictionary } from "@/lib/i18n/locale-context";

export function BusinessProfileForm({ provider }: { provider: Provider }) {
  const { push } = useToast();
  const dict = useDictionary();
  const [form, setForm] = useState({
    businessName: provider.businessName,
    type: provider.type,
    tagline: provider.tagline ?? "",
    description: provider.description ?? "",
    city: provider.city,
    address: provider.address ?? "",
    phone: provider.phone ?? "",
    email: provider.email ?? "",
    priceFrom: Number(provider.priceFrom),
    isActive: provider.isActive,
  });
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      const res = await fetch(`/api/providers/${provider.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? dict.profilePage.toastProfileError);
      push(dict.profilePage.toastProfileUpdated, "success");
    } catch (err: any) {
      push(err.message, "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
        <div>
          <p className="text-sm font-medium text-slate-800">{dict.profilePage.visibilityTitle}</p>
          <p className="text-xs text-slate-500">{dict.profilePage.visibilityDesc}</p>
        </div>
        <button
          onClick={() => setForm({ ...form, isActive: !form.isActive })}
          className={`relative h-6 w-11 rounded-full transition ${form.isActive ? "bg-teal-600" : "bg-slate-300"}`}
        >
          <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${form.isActive ? "left-5" : "left-0.5"}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label>{dict.profilePage.fieldBusinessName}</Label>
          <Input value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} />
        </div>
        <div>
          <Label>{dict.profilePage.fieldBusinessType}</Label>
          <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as any })}>
            {Object.entries(dict.providerTypes).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div>
        <Label>{dict.profilePage.fieldTagline}</Label>
        <Input value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} placeholder={dict.profilePage.fieldTaglinePlaceholder} />
      </div>

      <div>
        <Label>{dict.profilePage.fieldDescription}</Label>
        <Textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label>{dict.profilePage.fieldCity}</Label>
          <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
        </div>
        <div>
          <Label>{dict.profilePage.fieldAddress}</Label>
          <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        </div>
        <div>
          <Label>{dict.profilePage.fieldPhone}</Label>
          <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </div>
        <div>
          <Label>{dict.profilePage.fieldEmail}</Label>
          <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div>
          <Label>{dict.profilePage.fieldStartingPrice}</Label>
          <Input type="number" min={0} value={form.priceFrom} onChange={(e) => setForm({ ...form, priceFrom: Number(e.target.value) })} />
        </div>
      </div>

      <Button loading={saving} onClick={save}>
        {dict.common.save}
      </Button>
    </div>
  );
}
