"use client";

import { useMemo, useState } from "react";
import { Calendar, Check, X, CheckCircle2, Ban, MessageSquarePlus, Mail, Phone, StickyNote } from "lucide-react";
import { Badge, Button, EmptyState } from "@/components/ui/primitives";
import { Modal } from "@/components/ui/modal";
import { StarRating } from "@/components/ui/star-rating";
import { Textarea } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { cn, formatCurrency, formatDate, formatDuration, formatTime } from "@/lib/utils";
import { useDictionary, format } from "@/lib/i18n/locale-context";

export type BookingRow = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  notes: string | null;
  totalPrice: string;
  customerId: string;
  providerId: string;
  serviceId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  providerName: string;
  serviceName: string;
  serviceDuration: number;
  hasReview?: boolean;
};

function statusVariant(status: string) {
  switch (status) {
    case "confirmed":
      return "success" as const;
    case "pending":
      return "warning" as const;
    case "completed":
      return "info" as const;
    case "cancelled":
    case "declined":
      return "danger" as const;
    default:
      return "neutral" as const;
  }
}

export function BookingsManager({ role, initialBookings }: { role: "customer" | "provider" | "admin"; initialBookings: BookingRow[] }) {
  const { push } = useToast();
  const dict = useDictionary();
  const TABS = [
    { key: "all", label: dict.bookingsPage.tabAll },
    { key: "pending", label: dict.bookingsPage.tabPending },
    { key: "confirmed", label: dict.bookingsPage.tabConfirmed },
    { key: "completed", label: dict.bookingsPage.tabCompleted },
    { key: "cancelled", label: dict.bookingsPage.tabCancelled },
  ] as const;
  const [bookings, setBookings] = useState(initialBookings);
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("all");
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [reviewTarget, setReviewTarget] = useState<BookingRow | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const filtered = useMemo(() => {
    if (tab === "all") return bookings;
    if (tab === "cancelled") return bookings.filter((b) => b.status === "cancelled" || b.status === "declined");
    return bookings.filter((b) => b.status === tab);
  }, [bookings, tab]);

  async function updateStatus(id: string, status: string) {
    const previous = bookings;
    setPendingAction(id + status);
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? dict.bookingsPage.toastUpdateError);
      }
      push(
        status === "confirmed"
          ? dict.bookingsPage.toastConfirmed
          : status === "declined"
          ? dict.bookingsPage.toastDeclined
          : status === "completed"
          ? dict.bookingsPage.toastCompleted
          : dict.bookingsPage.toastCancelled,
        "success",
      );
    } catch (err: any) {
      setBookings(previous);
      push(err.message, "error");
    } finally {
      setPendingAction(null);
    }
  }

  async function submitReview() {
    if (!reviewTarget) return;
    setSubmittingReview(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: reviewTarget.id, rating, comment: comment || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? dict.bookingsPage.toastReviewError);
      setBookings((prev) => prev.map((b) => (b.id === reviewTarget.id ? { ...b, hasReview: true } : b)));
      push(dict.bookingsPage.toastReviewThanks, "success");
      setReviewTarget(null);
      setRating(5);
      setComment("");
    } catch (err: any) {
      push(err.message, "error");
    } finally {
      setSubmittingReview(false);
    }
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-sm font-medium capitalize transition",
              tab === t.key ? "bg-slate-900 text-white" : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Calendar className="h-6 w-6" />}
          title={dict.bookingsPage.emptyTitle}
          description={role === "customer" ? dict.bookingsPage.emptyDescCustomer : dict.bookingsPage.emptyDescOther}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((b) => {
            const busy = pendingAction?.startsWith(b.id);
            return (
              <div key={b.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-900">{b.serviceName}</p>
                      <Badge variant={statusVariant(b.status)}>{dict.bookingStatus[b.status as keyof typeof dict.bookingStatus]}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      {role === "customer" ? b.providerName : b.customerName} · {formatDate(b.date)} at {formatTime(b.startTime)} ·{" "}
                      {formatDuration(b.serviceDuration)}
                    </p>
                    {role !== "customer" && (
                      <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" /> {b.customerEmail}
                        </span>
                        {b.customerPhone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" /> {b.customerPhone}
                          </span>
                        )}
                      </div>
                    )}
                    {b.notes && (
                      <p className="mt-1.5 flex items-start gap-1 text-xs text-slate-500">
                        <StickyNote className="mt-0.5 h-3 w-3 shrink-0" /> {b.notes}
                      </p>
                    )}
                  </div>
                  <p className="text-lg font-bold text-slate-900">{formatCurrency(b.totalPrice)}</p>
                </div>

                <div className="mt-3 flex flex-wrap gap-2 border-t border-slate-100 pt-3">
                  {role === "provider" && b.status === "pending" && (
                    <>
                      <Button size="sm" loading={busy} onClick={() => updateStatus(b.id, "confirmed")}>
                        <Check className="h-3.5 w-3.5" /> {dict.bookingsPage.accept}
                      </Button>
                      <Button size="sm" variant="outline" loading={busy} onClick={() => updateStatus(b.id, "declined")}>
                        <X className="h-3.5 w-3.5" /> {dict.bookingsPage.decline}
                      </Button>
                    </>
                  )}
                  {role === "provider" && b.status === "confirmed" && (
                    <>
                      <Button size="sm" loading={busy} onClick={() => updateStatus(b.id, "completed")}>
                        <CheckCircle2 className="h-3.5 w-3.5" /> {dict.bookingsPage.markCompleted}
                      </Button>
                      <Button size="sm" variant="outline" loading={busy} onClick={() => updateStatus(b.id, "cancelled")}>
                        <Ban className="h-3.5 w-3.5" /> {dict.bookingsPage.cancelAppt}
                      </Button>
                    </>
                  )}
                  {role === "customer" && (b.status === "pending" || b.status === "confirmed") && (
                    <Button size="sm" variant="outline" loading={busy} onClick={() => updateStatus(b.id, "cancelled")}>
                      <Ban className="h-3.5 w-3.5" /> {dict.bookingsPage.cancelBooking}
                    </Button>
                  )}
                  {role === "customer" && b.status === "completed" && !b.hasReview && (
                    <Button size="sm" variant="outline" onClick={() => setReviewTarget(b)}>
                      <MessageSquarePlus className="h-3.5 w-3.5" /> {dict.bookingsPage.leaveReview}
                    </Button>
                  )}
                  {role === "customer" && b.status === "completed" && b.hasReview && (
                    <Badge variant="success">{dict.bookingsPage.reviewed}</Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={!!reviewTarget} onClose={() => setReviewTarget(null)} title={dict.bookingsPage.reviewModalTitle}>
        <div className="space-y-4">
          <p className="text-sm text-slate-500">{format(dict.bookingsPage.reviewModalDesc, { provider: reviewTarget?.providerName ?? "" })}</p>
          <StarRating value={rating} onChange={setRating} size={28} />
          <Textarea rows={3} value={comment} onChange={(e) => setComment(e.target.value)} placeholder={dict.bookingsPage.reviewPlaceholder} />
          <Button className="w-full" loading={submittingReview} onClick={submitReview}>
            {dict.bookingsPage.submitReview}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
