import Link from "next/link";
import { MapPin } from "lucide-react";
import type { Provider } from "@/db/schema";
import { formatCurrency } from "@/lib/utils";
import { StaticStars } from "@/components/ui/star-rating";
import { Badge } from "@/components/ui/primitives";
import type { Dictionary } from "@/lib/i18n/dictionaries/en";
import { localizedPath, type Locale } from "@/lib/i18n/config";

const GRADIENTS = [
  "from-teal-400 to-emerald-600",
  "from-sky-400 to-indigo-600",
  "from-rose-400 to-orange-500",
  "from-violet-400 to-fuchsia-600",
  "from-amber-400 to-orange-600",
];

function gradientFor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return GRADIENTS[hash % GRADIENTS.length];
}

export function ProviderCard({ provider, locale, dict }: { provider: Provider; locale: Locale; dict: Dictionary }) {
  return (
    <Link
      href={localizedPath(locale, `/providers/${provider.id}`)}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
    >
      <div className={`relative flex h-36 items-end bg-gradient-to-br p-4 ${gradientFor(provider.id)}`}>
        <div className="absolute right-3 top-3">
          <Badge className="bg-white/90 text-slate-700 backdrop-blur">{dict.providerTypes[provider.type]}</Badge>
        </div>
        <h3 className="text-xl font-bold text-white drop-shadow-sm">{provider.businessName}</h3>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <p className="line-clamp-2 min-h-[2.5rem] text-sm text-slate-500">
          {provider.tagline || provider.description || "Professional wellness services tailored to you."}
        </p>
        <div className="flex items-center gap-1.5 text-sm text-slate-500">
          <MapPin className="h-3.5 w-3.5" />
          {provider.city}
        </div>
        <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-3">
          <div className="flex items-center gap-1.5">
            <StaticStars value={Number(provider.rating)} />
            <span className="text-xs text-slate-500">({provider.reviewCount})</span>
          </div>
          <span className="text-sm font-semibold text-slate-900">
            {dict.providerCard.from} {formatCurrency(provider.priceFrom)}
          </span>
        </div>
      </div>
    </Link>
  );
}
