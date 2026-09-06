import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getProviderByUserId } from "@/lib/data";
import { BusinessProfileForm } from "@/components/dashboard/business-profile-form";
import { AccountForm } from "@/components/dashboard/account-form";
import { CreateBusinessForm } from "@/components/dashboard/create-business-form";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/get-dictionary";

export default async function ProfilePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale: Locale = rawLocale;
  const dict = getDictionary(locale);

  const user = await getCurrentUser();
  if (!user) return null;

  if (user.role === "provider") {
    const provider = await getProviderByUserId(user.id);
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">{dict.profilePage.businessTitle}</h1>
          <p className="text-sm text-slate-500">{dict.profilePage.businessSubtitle}</p>
        </div>
        {provider ? <BusinessProfileForm provider={provider} /> : <CreateBusinessForm />}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">{dict.profilePage.personalTitle}</h1>
        <p className="text-sm text-slate-500">{dict.profilePage.personalSubtitle}</p>
      </div>
      <AccountForm name={user.name} email={user.email} phone={user.phone} />
    </div>
  );
}
