"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2, ListChecks, Power } from "lucide-react";
import { Badge, Button, EmptyState, Input, Label, Select, Textarea } from "@/components/ui/primitives";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { formatCurrency, formatDuration } from "@/lib/utils";
import { useDictionary, format } from "@/lib/i18n/locale-context";

export type ServiceRow = {
  id: string;
  name: string;
  description: string | null;
  durationMinutes: number;
  price: string;
  category: string;
  isActive: boolean;
};

const CATEGORIES = ["Massage", "Therapy", "Facial", "Body Treatment", "Chiropractic", "Physiotherapy", "Wellness"];

const emptyForm = {
  name: "",
  description: "",
  durationMinutes: 60,
  price: 80,
  category: "Massage",
};

export function ServicesManager({ initialServices }: { initialServices: ServiceRow[] }) {
  const { push } = useToast();
  const dict = useDictionary();
  const [services, setServices] = useState(initialServices);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ServiceRow | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(service: ServiceRow) {
    setEditing(service);
    setForm({
      name: service.name,
      description: service.description ?? "",
      durationMinutes: service.durationMinutes,
      price: Number(service.price),
      category: service.category,
    });
    setModalOpen(true);
  }

  async function handleSubmit() {
    if (!form.name.trim()) {
      push(dict.servicesPage.toastNameRequired, "error");
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        const previous = services;
        setServices((prev) => prev.map((s) => (s.id === editing.id ? { ...s, ...form, price: String(form.price) } : s)));
        const res = await fetch(`/api/services/${editing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!res.ok) {
          setServices(previous);
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? dict.servicesPage.toastUpdateError);
        }
        push(dict.servicesPage.toastUpdated, "success");
      } else {
        const res = await fetch("/api/services", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? dict.servicesPage.toastCreateError);
        setServices((prev) => [...prev, data.service]);
        push(dict.servicesPage.toastCreated, "success");
      }
      setModalOpen(false);
    } catch (err: any) {
      push(err.message, "error");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(service: ServiceRow) {
    const previous = services;
    setBusyId(service.id);
    setServices((prev) => prev.map((s) => (s.id === service.id ? { ...s, isActive: !s.isActive } : s)));
    try {
      const res = await fetch(`/api/services/${service.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !service.isActive }),
      });
      if (!res.ok) throw new Error(dict.servicesPage.toastUpdateError);
    } catch (err: any) {
      setServices(previous);
      push(err.message, "error");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(service: ServiceRow) {
    if (!confirm(format(dict.servicesPage.confirmDelete, { name: service.name }))) return;
    const previous = services;
    setBusyId(service.id);
    setServices((prev) => prev.filter((s) => s.id !== service.id));
    try {
      const res = await fetch(`/api/services/${service.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(dict.servicesPage.toastDeleteError);
      push(dict.servicesPage.toastDeleted, "success");
    } catch (err: any) {
      setServices(previous);
      push(err.message, "error");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <div className="mb-5 flex items-center justify-end">
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> {dict.servicesPage.addService}
        </Button>
      </div>

      {services.length === 0 ? (
        <EmptyState
          icon={<ListChecks className="h-6 w-6" />}
          title={dict.servicesPage.emptyTitle}
          description={dict.servicesPage.emptyDesc}
          action={
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" /> {dict.servicesPage.addService}
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <div key={s.id} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-slate-900">{s.name}</p>
                  <Badge variant="neutral" className="mt-1">
                    {s.category}
                  </Badge>
                </div>
                <Badge variant={s.isActive ? "success" : "neutral"}>{s.isActive ? dict.servicesPage.active : dict.servicesPage.hidden}</Badge>
              </div>
              <p className="mt-2 line-clamp-2 flex-1 text-sm text-slate-500">{s.description || dict.servicesPage.noDescription}</p>
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-slate-500">{formatDuration(s.durationMinutes)}</span>
                <span className="font-semibold text-slate-900">{formatCurrency(s.price)}</span>
              </div>
              <div className="mt-4 flex gap-2 border-t border-slate-100 pt-3">
                <Button size="sm" variant="outline" onClick={() => openEdit(s)}>
                  <Pencil className="h-3.5 w-3.5" /> {dict.common.edit}
                </Button>
                <Button size="sm" variant="outline" loading={busyId === s.id} onClick={() => toggleActive(s)}>
                  <Power className="h-3.5 w-3.5" /> {s.isActive ? dict.servicesPage.hide : dict.servicesPage.show}
                </Button>
                <Button size="sm" variant="ghost" className="ml-auto text-rose-600 hover:bg-rose-50" loading={busyId === s.id} onClick={() => handleDelete(s)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? dict.servicesPage.modalEditTitle : dict.servicesPage.modalCreateTitle}>
        <div className="space-y-4">
          <div>
            <Label>{dict.servicesPage.fieldName}</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={dict.servicesPage.fieldNamePlaceholder} />
          </div>
          <div>
            <Label>{dict.servicesPage.fieldDescription}</Label>
            <Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder={dict.servicesPage.fieldDescriptionPlaceholder} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>{dict.servicesPage.fieldDuration}</Label>
              <Input
                type="number"
                min={5}
                step={5}
                value={form.durationMinutes}
                onChange={(e) => setForm({ ...form, durationMinutes: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label>{dict.servicesPage.fieldPrice}</Label>
              <Input type="number" min={0} value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
            </div>
          </div>
          <div>
            <Label>{dict.servicesPage.fieldCategory}</Label>
            <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </div>
          <Button className="w-full" loading={saving} onClick={handleSubmit}>
            {editing ? dict.servicesPage.saveChanges : dict.servicesPage.createService}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
