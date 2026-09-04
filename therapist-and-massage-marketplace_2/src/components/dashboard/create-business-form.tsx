"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Label, Select, Textarea } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { useDictionary } from "@/lib/i18n/locale-context";

export function CreateBusinessForm() {
  const router = useRouter();
  const { push } = useToast();
  const dict = useDictionary();
  const [form, setForm] = useState({
    businessName: "",
    type: "therapist",
    city: "",
    tagline: "",
    description: "",
  });
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!form.businessName || !form.city) {
      push(dict.profilePage.toastRequiredFields, "error");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/providers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? dict.profilePage.toastBusinessCreateError);
      push(dict.profilePage.toastBusinessCreated, "success");
      router.refresh();
    } catch (err: any) {
      push(err.message, "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-xl space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <Label>{dict.auth.businessNameLabel}</Label>
        <Input value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} placeholder={dict.profilePage.createBusinessNamePlaceholder} />
      </div>
      <div>
        <Label>{dict.auth.businessTypeLabel}</Label>
        <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
          {Object.entries(dict.providerTypes).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label>{dict.auth.cityLabel}</Label>
        <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder={dict.profilePage.createCityPlaceholder} />
      </div>
      <div>
        <Label>{dict.profilePage.fieldTagline}</Label>
        <Input value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} />
      </div>
      <div>
        <Label>{dict.profilePage.fieldDescription}</Label>
        <Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      </div>
      <Button loading={saving} onClick={save}>
        {dict.profilePage.createBusinessButton}
      </Button>
    </div>
  );
}
