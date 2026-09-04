"use client";

import { useState } from "react";
import Image from "next/image";
import { Button, Input, Label } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { useDictionary } from "@/lib/i18n/locale-context";

export function AccountForm({
  name,
  email,
  phone,
  avatarUrl,
}: {
  name: string;
  email: string;
  phone: string | null;
  avatarUrl?: string | null;
}) {
  const { push } = useToast();
  const dict = useDictionary();
  const [form, setForm] = useState({ name, phone: phone ?? "", avatarUrl: avatarUrl ?? "" });
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? dict.profilePage.toastAccountError);
      push(dict.profilePage.toastAccountUpdated, "success");
    } catch (err: any) {
      push(err.message, "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-lg space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        {form.avatarUrl ? (
          <span className="relative flex h-12 w-12 overflow-hidden rounded-full bg-slate-200">
            <Image src={form.avatarUrl} alt={form.name} fill sizes="48px" className="object-cover" unoptimized />
          </span>
        ) : (
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
            {form.name.slice(0, 1).toUpperCase()}
          </span>
        )}
        <div className="text-sm text-slate-500">{dict.profilePage.fieldAvatarUrl}</div>
      </div>
      <div>
        <Label>{dict.profilePage.fieldFullName}</Label>
        <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      </div>
      <div>
        <Label>{dict.auth.emailLabel}</Label>
        <Input value={email} disabled className="bg-slate-50 text-slate-400" />
      </div>
      <div>
        <Label>{dict.profilePage.fieldPhoneOptional}</Label>
        <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder={dict.profilePage.phonePlaceholder} />
      </div>
      <div>
        <Label>{dict.profilePage.fieldAvatarUrl}</Label>
        <Input
          type="url"
          value={form.avatarUrl}
          onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })}
          placeholder={dict.profilePage.fieldAvatarPlaceholder}
        />
      </div>
      <Button loading={saving} onClick={save}>
        {dict.common.save}
      </Button>
    </div>
  );
}
