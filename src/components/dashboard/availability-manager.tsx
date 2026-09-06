"use client";

import { useState } from "react";
import { Plus, Trash2, Clock4 } from "lucide-react";
import { Button, EmptyState, Select } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { formatTime } from "@/lib/utils";
import { useDictionary } from "@/lib/i18n/locale-context";

export type AvailabilityRow = {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
};

const TIME_OPTIONS = Array.from({ length: 29 }, (_, i) => {
  const totalMinutes = i * 30 + 6 * 60;
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
});

export function AvailabilityManager({ initialAvailability }: { initialAvailability: AvailabilityRow[] }) {
  const { push } = useToast();
  const dict = useDictionary();
  const dayNames = Object.values(dict.days);
  const [rows, setRows] = useState(initialAvailability);
  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [adding, setAdding] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function addSlot() {
    if (startTime >= endTime) {
      push(dict.availabilityPage.toastEndAfterStart, "error");
      return;
    }
    setAdding(true);
    try {
      const res = await fetch("/api/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dayOfWeek, startTime, endTime }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? dict.availabilityPage.toastAddError);
      setRows((prev) => [...prev, data.availability].sort((a, b) => a.dayOfWeek - b.dayOfWeek || a.startTime.localeCompare(b.startTime)));
      push(dict.availabilityPage.toastAdded, "success");
    } catch (err: any) {
      push(err.message, "error");
    } finally {
      setAdding(false);
    }
  }

  async function removeSlot(id: string) {
    const previous = rows;
    setBusyId(id);
    setRows((prev) => prev.filter((r) => r.id !== id));
    try {
      const res = await fetch(`/api/availability/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(dict.availabilityPage.toastRemoveError);
      push(dict.availabilityPage.toastRemoved, "success");
    } catch (err: any) {
      setRows(previous);
      push(err.message, "error");
    } finally {
      setBusyId(null);
    }
  }

  const grouped = dayNames.map((name, idx) => ({
    name,
    idx,
    slots: rows.filter((r) => r.dayOfWeek === idx),
  }));

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="font-semibold text-slate-900">{dict.availabilityPage.addWorkingHours}</h2>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">{dict.availabilityPage.day}</label>
            <Select value={dayOfWeek} onChange={(e) => setDayOfWeek(Number(e.target.value))}>
              {dayNames.map((d, idx) => (
                <option key={d} value={idx}>
                  {d}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">{dict.availabilityPage.startTime}</label>
            <Select value={startTime} onChange={(e) => setStartTime(e.target.value)}>
              {TIME_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {formatTime(t)}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">{dict.availabilityPage.endTime}</label>
            <Select value={endTime} onChange={(e) => setEndTime(e.target.value)}>
              {TIME_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {formatTime(t)}
                </option>
              ))}
            </Select>
          </div>
          <Button loading={adding} onClick={addSlot} className="h-[42px]">
            <Plus className="h-4 w-4" /> {dict.availabilityPage.addButton}
          </Button>
        </div>
      </div>

      {rows.length === 0 ? (
        <EmptyState icon={<Clock4 className="h-6 w-6" />} title={dict.availabilityPage.emptyTitle} description={dict.availabilityPage.emptyDesc} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {grouped
            .filter((g) => g.slots.length > 0)
            .map((g) => (
              <div key={g.idx} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="font-semibold text-slate-900">{g.name}</p>
                <div className="mt-2 space-y-2">
                  {g.slots.map((slot) => (
                    <div key={slot.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
                      <span className="text-slate-600">
                        {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
                      </span>
                      <button
                        disabled={busyId === slot.id}
                        onClick={() => removeSlot(slot.id)}
                        className="text-slate-400 hover:text-rose-600 disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
