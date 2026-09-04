"use client";

import { Suspense, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Sparkles, User, Briefcase } from "lucide-react";
import { Button, Input, Label, Select } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { useDictionary, useLocalizedHref } from "@/lib/i18n/locale-context";

function RegisterForm() {
  const router = useRouter();
  const { push } = useToast();
  const dict = useDictionary();
  const buildHref = useLocalizedHref();
  const searchParams = useSearchParams();
  const [role, setRole] = useState<"customer" | "provider">(
    searchParams.get("role") === "provider" ? "provider" : "customer",
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [providerType, setProviderType] = useState("therapist");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role, businessName, providerType, city }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? dict.auth.genericRegisterError);
      push(dict.auth.accountCreatedToast, "success");
      router.push(buildHref("/dashboard"));
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-teal-50 to-white px-4 py-12">
      <div className="w-full max-w-md">
        <Link href={buildHref("/")} className="mb-8 flex items-center justify-center gap-2 text-lg font-bold text-slate-900">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 text-white">
            <Sparkles className="h-4.5 w-4.5" />
          </span>
          {dict.common.brand}
        </Link>
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">{dict.auth.registerTitle}</h1>
          <p className="mt-1 text-sm text-slate-500">{dict.auth.registerSubtitle}</p>

          <div className="mt-5 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setRole("customer")}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-xl border-2 px-3 py-3 text-sm font-medium transition",
                role === "customer" ? "border-teal-500 bg-teal-50 text-teal-800" : "border-slate-200 text-slate-500 hover:border-slate-300",
              )}
            >
              <User className="h-5 w-5" />
              {dict.auth.iWantBook}
            </button>
            <button
              type="button"
              onClick={() => setRole("provider")}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-xl border-2 px-3 py-3 text-sm font-medium transition",
                role === "provider" ? "border-teal-500 bg-teal-50 text-teal-800" : "border-slate-200 text-slate-500 hover:border-slate-300",
              )}
            >
              <Briefcase className="h-5 w-5" />
              {dict.auth.iOfferServices}
            </button>
          </div>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <Label>{dict.auth.fullName}</Label>
              <Input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" />
            </div>
            <div>
              <Label>{dict.auth.emailLabel}</Label>
              <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            </div>
            <div>
              <Label>{dict.auth.passwordLabel}</Label>
              <Input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={dict.auth.passwordHint} />
            </div>

            {role === "provider" && (
              <div className="space-y-4 rounded-xl border border-teal-100 bg-teal-50/50 p-4">
                <div>
                  <Label>{dict.auth.businessNameLabel}</Label>
                  <Input required value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="Harmony Wellness Spa" />
                </div>
                <div>
                  <Label>{dict.auth.businessTypeLabel}</Label>
                  <Select value={providerType} onChange={(e) => setProviderType(e.target.value)}>
                    {Object.entries(dict.providerTypes).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label>{dict.auth.cityLabel}</Label>
                  <Input required value={city} onChange={(e) => setCity(e.target.value)} placeholder="Austin" />
                </div>
              </div>
            )}

            {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
            <Button type="submit" loading={loading} className="w-full">
              {dict.auth.createAccountButton}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            {dict.auth.alreadyHaveAccount}{" "}
            <Link href={buildHref("/login")} className="font-medium text-teal-700 hover:underline">
              {dict.auth.signInLink}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
