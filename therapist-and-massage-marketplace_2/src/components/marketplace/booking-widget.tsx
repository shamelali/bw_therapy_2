"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Clock, Loader2 } from "lucide-react";
import type { Service } from "@/db/schema";
import { Button, Label, Select, Textarea } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { cn, formatCurrency, formatDuration, formatTime } from "@/lib/utils";
import { useDictionary, useLocalizedHref } from "@/lib/i18n/locale-context";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function maxDateStr() {
  const d = new Date();
  d.setDate(d.getDate() + 60);
  return d.toISOString().slice(0, 10);
}

export function BookingWidget({
  providerId,
  services,
  currentUserRole,
}: {
  providerId: string;
  services: Service[];
  currentUserRole: string | null;
}) {
  const router = useRouter();
  const { push } = useToast();
  const dict = useDictionary();
  const buildHref = useLocalizedHref();
  const activeServices = useMemo(() => services.filter((s) => s.isActive), [services]);
  const [serviceId, setServiceId] = useState(activeServices[0]?.id ?? "");
  const [date, setDate] = useState(todayStr());
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const selectedService = activeServices.find((s) => s.id === serviceId);

  function handleServiceChange(value: string) {
    setServiceId(value);
    setSelectedSlot(null);
    setLoadingSlots(true);
  }

  function handleDateChange(value: string) {
    setDate(value);
    setSelectedSlot(null);
    setLoadingSlots(true);
  }

  useEffect(() => {
    if (!serviceId || !date) return;
    let cancelled = false;
    fetch(`/api/providers/${providerId}/slots?date=${date}&serviceId=${serviceId}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setSlots(data.slots ?? []);
      })
      .finally(() => {
        if (!cancelled) setLoadingSlots(false);
      });
    return () => {
      cancelled = true;
    };
  }, [serviceId, date, providerId]);

  async function handleBook() {
    if (!selectedSlot || !serviceId) return;

    if (!currentUserRole) {
      router.push(`${buildHref("/login")}?returnTo=/providers/${providerId}`);
      return;
    }
    if (currentUserRole !== "customer") {
      push(dict.providerDetail.onlyCustomersCanBook, "error");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ providerId, serviceId, date, startTime: selectedSlot, notes: notes || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Unable to book appointment");
      push(dict.providerDetail.bookingRequested, "success");
      router.push(buildHref("/dashboard/bookings"));
      router.refresh();
    } catch (err: any) {
      push(err.message === "This time slot was just booked. Please choose another." ? dict.providerDetail.slotTaken : err.message, "error");
      setSlots((prev) => prev.filter((s) => s !== selectedSlot));
      setSelectedSlot(null);
    } finally {
      setSubmitting(false);
    }
  }

  if (activeServices.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
        {dict.providerDetail.noBookableServices}
      </div>
    );
  }

  return (
    <div className="sticky top-20 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-base font-semibold text-slate-900">{dict.providerDetail.bookAppointment}</h3>

      <div className="mt-4 space-y-4">
        <div>
          <Label>{dict.providerDetail.service}</Label>
          <Select value={serviceId} onChange={(e) => handleServiceChange(e.target.value)}>
            {activeServices.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} — {formatCurrency(s.price)} ({formatDuration(s.durationMinutes)})
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Label>{dict.providerDetail.date}</Label>
          <div className="relative">
            <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="date"
              min={todayStr()}
              max={maxDateStr()}
              value={date}
              onChange={(e) => handleDateChange(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
            />
          </div>
        </div>

        <div>
          <Label>{dict.providerDetail.availableTimes}</Label>
          {loadingSlots ? (
            <div className="flex h-16 items-center justify-center text-slate-400">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : slots.length === 0 ? (
            <p className="rounded-lg bg-slate-50 px-3 py-4 text-center text-sm text-slate-400">{dict.providerDetail.noSlots}</p>
          ) : (
            <div className="grid max-h-40 grid-cols-3 gap-2 overflow-y-auto pr-1">
              {slots.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setSelectedSlot(slot)}
                  className={cn(
                    "rounded-lg border px-2 py-1.5 text-xs font-medium transition",
                    selectedSlot === slot
                      ? "border-teal-600 bg-teal-600 text-white"
                      : "border-slate-200 text-slate-600 hover:border-teal-300 hover:bg-teal-50",
                  )}
                >
                  {formatTime(slot)}
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <Label>{dict.providerDetail.notesOptional}</Label>
          <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={dict.providerDetail.notesPlaceholder} />
        </div>

        {selectedService && (
          <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
            <span className="flex items-center gap-1.5 text-slate-500">
              <Clock className="h-3.5 w-3.5" /> {formatDuration(selectedService.durationMinutes)}
            </span>
            <span className="font-semibold text-slate-900">{formatCurrency(selectedService.price)}</span>
          </div>
        )}

        <Button className="w-full" size="lg" disabled={!selectedSlot} loading={submitting} onClick={handleBook}>
          {currentUserRole ? dict.providerDetail.requestBooking : dict.providerDetail.signInToBook}
        </Button>
      </div>
    </div>
  );
}
