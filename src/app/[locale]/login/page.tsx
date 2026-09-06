"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { Button, Input, Label } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/toast";
import { useDictionary, useLocalizedHref } from "@/lib/i18n/locale-context";

export default function LoginPage() {
  const router = useRouter();
  const { push } = useToast();
  const dict = useDictionary();
  const buildHref = useLocalizedHref();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? dict.auth.genericLoginError);
      push(dict.auth.welcomeBackToast, "success");
      router.push(buildHref("/dashboard"));
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function fillDemo(role: "customer" | "provider" | "admin") {
    const creds = {
      customer: "amelia@example.com",
      provider: "harmony.wellness@example.com",
      admin: "admin@serenity.app",
    };
    setEmail(creds[role]);
    setPassword("password123");
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
          <h1 className="text-2xl font-bold text-slate-900">{dict.auth.loginTitle}</h1>
          <p className="mt-1 text-sm text-slate-500">{dict.auth.loginSubtitle}</p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <Label>{dict.auth.emailLabel}</Label>
              <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            </div>
            <div>
              <Label>{dict.auth.passwordLabel}</Label>
              <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </div>
            {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
            <Button type="submit" loading={loading} className="w-full">
              {dict.auth.signInButton}
            </Button>
          </form>

          <div className="mt-6 rounded-xl bg-slate-50 p-4 text-xs text-slate-500">
            <p className="mb-2 font-semibold text-slate-600">{dict.auth.demoHint}</p>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => fillDemo("customer")} className="rounded-full border border-slate-200 bg-white px-2.5 py-1 hover:border-teal-300">
                {dict.auth.demoCustomer}
              </button>
              <button onClick={() => fillDemo("provider")} className="rounded-full border border-slate-200 bg-white px-2.5 py-1 hover:border-teal-300">
                {dict.auth.demoProvider}
              </button>
              <button onClick={() => fillDemo("admin")} className="rounded-full border border-slate-200 bg-white px-2.5 py-1 hover:border-teal-300">
                {dict.auth.demoAdmin}
              </button>
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-slate-500">
            {dict.auth.noAccount}{" "}
            <Link href={buildHref("/register")} className="font-medium text-teal-700 hover:underline">
              {dict.auth.signUpLink}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
