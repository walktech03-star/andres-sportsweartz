import { updateSettings } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/admin";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

type SettingsRow = {
  business_name: string | null;
  whatsapp_number: string | null;
  phone_number: string | null;
  email: string | null;
  currency: string | null;
  business_address: string | null;
  business_hours: string | null;
  delivery_information: string | null;
  logo_url: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  tiktok_url: string | null;
};

const field = "mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-[#1769e0]";
const label = "block text-sm font-bold";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  await requireAdmin();
  const { saved, error } = await searchParams;
  const supabase = getSupabaseAdmin();

  if (!supabase) {
    return (
      <p className="rounded-2xl bg-white p-8 text-slate-600">
        Database not connected yet. Add the service role key to edit your business settings here.
      </p>
    );
  }

  const { data } = (await supabase
    .from("business_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle()) as { data: SettingsRow | null };

  const settings: SettingsRow = data ?? ({} as SettingsRow);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="display-font text-4xl font-black">Business settings</h1>
      <p className="mt-2 text-slate-600">Your business details, kept in one place.</p>

      {saved && <p className="mt-5 rounded-xl bg-green-50 p-4 text-sm font-bold text-green-700">Settings saved.</p>}
      {error && <p className="mt-5 rounded-xl bg-red-50 p-4 text-sm font-bold text-red-600">Could not save. Please try again.</p>}

      <p className="mt-5 rounded-xl bg-blue-50 p-4 text-sm text-slate-700">
        <b>Good to know:</b> these details are saved to your database. The live website still reads
        its WhatsApp number and contact details from your settings file for now, so change them in
        both places until this page is connected to the public site.
      </p>

      <form action={updateSettings} className="mt-6 space-y-6">
        <div className="rounded-2xl bg-white p-6">
          <h2 className="font-black">Business</h2>

          <label className={label + " mt-4"}>
            Business name
            <input name="business_name" defaultValue={settings.business_name ?? "Andres Sportsweartz"} className={field} />
          </label>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className={label}>
              WhatsApp number
              <input name="whatsapp_number" defaultValue={settings.whatsapp_number ?? ""} className={field} placeholder="255712345678" />
            </label>
            <label className={label}>
              Phone number
              <input name="phone_number" defaultValue={settings.phone_number ?? ""} className={field} placeholder="+255 712 345 678" />
            </label>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className={label}>
              Email
              <input name="email" type="email" defaultValue={settings.email ?? ""} className={field} />
            </label>
            <label className={label}>
              Currency
              <input name="currency" defaultValue={settings.currency ?? "TZS"} className={field} />
            </label>
          </div>

          <label className={label + " mt-4"}>
            Business address
            <input name="business_address" defaultValue={settings.business_address ?? ""} className={field} />
          </label>

          <label className={label + " mt-4"}>
            Business hours
            <input name="business_hours" defaultValue={settings.business_hours ?? ""} className={field} placeholder="Monday to Saturday, 08:00 - 19:00" />
          </label>

          <label className={label + " mt-4"}>
            Delivery information
            <textarea name="delivery_information" rows={3} defaultValue={settings.delivery_information ?? ""} className={field} />
          </label>
        </div>

        <div className="rounded-2xl bg-white p-6">
          <h2 className="font-black">Social media and logo</h2>

          <label className={label + " mt-4"}>
            Logo image address
            <input name="logo_url" defaultValue={settings.logo_url ?? ""} className={field} placeholder="/products/logo.png" />
          </label>

          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <label className={label}>
              Facebook
              <input name="facebook_url" defaultValue={settings.facebook_url ?? ""} className={field} />
            </label>
            <label className={label}>
              Instagram
              <input name="instagram_url" defaultValue={settings.instagram_url ?? ""} className={field} />
            </label>
            <label className={label}>
              TikTok
              <input name="tiktok_url" defaultValue={settings.tiktok_url ?? ""} className={field} />
            </label>
          </div>
        </div>

        <button className="w-full rounded-full bg-[#10233f] px-6 py-4 text-sm font-black text-white">
          Save settings
        </button>
      </form>
    </div>
  );
}