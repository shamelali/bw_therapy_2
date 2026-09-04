"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function StarRating({
  value,
  onChange,
  size = 20,
  readOnly = false,
}: {
  value: number;
  onChange?: (value: number) => void;
  size?: number;
  readOnly?: boolean;
}) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          type="button"
          key={n}
          disabled={readOnly}
          onClick={() => onChange?.(n)}
          className={cn(!readOnly && "cursor-pointer transition hover:scale-110")}
        >
          <Star
            width={size}
            height={size}
            className={n <= Math.round(value) ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200"}
          />
        </button>
      ))}
    </div>
  );
}

export function StaticStars({ value, size = 14 }: { value: number; size?: number }) {
  return <StarRating value={value} readOnly size={size} />;
}
