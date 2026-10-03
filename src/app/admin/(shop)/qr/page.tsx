import Link from "next/link";
import Image from "next/image";
import { createQrCampaign, deleteQrCampaign, toggleQrCampaign } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/admin";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { QrCard } from "@/components/qr-card";
import { BUILT_IN_CAMPAIGNS, QR_SEGMENTS, productQrCode, qrImageUrl, qrLandingUrl } from "@/lib/qr-campaigns";
import { getPublishedProducts } from "@/lib/product-repository";

export const dynamic = "force-dynamic";

type CampaignRow = {
  code: string;
  name: string;
  segment: string;
  target_path: string;
  product_slug: string | null;
  description: string | null;
  is_active: boolean;
  scan_count: number;
  created_at: string;
};

const input = "mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-[#1769e0]";
const label = "block text-sm font-bold";

// Plain helper (not a component) so time is read per request, which is correct
// for this force-dynamic server page that always renders fresh analytics.
function recentIsoBounds() {
  const now = Date.now();
  return {
    since7: new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString(),
    since30: new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString(),
  };
}

export default async function QrCampaignsPage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string; deleted?: string; updated?: string; error?: string }>;
}) {
  await requireAdmin();
  const { created, deleted, updated, error } = await searchParams;
  const supabase = getSupabaseAdmin();
  const products = await getPublishedProducts();

  let campaigns: CampaignRow[] = [];
  const scansLast7: Record<string, number> = {};
  const scansLast30: Record<string, number> = {};
  let totalScans = 0;
  const ordersByCampaign: Record<string, { count: number; revenue: number }> = {};
  let dbReady = true;

  if (supabase) {
    const { data } = await supabase
      .from("qr_campaigns")
      .select("code, name, segment, target_path, product_slug, description, is_active, scan_count, created_at")
      .order("created_at", { ascending: true })
      .limit(200);
    campaigns = (data ?? []) as CampaignRow[];

    const { since7, since30 } = recentIsoBounds();

    const scans7 = await supabase.from("qr_scans").select("campaign_code").gte("created_at", since7).limit(5000);
    if (!scans7.error && scans7.data) {
      for (const row of scans7.data as { campaign_code: string }[]) {
        scansLast7[row.campaign_code] = (scansLast7[row.campaign_code] ?? 0) + 1;
      }
    }

    const scans30 = await supabase.from("qr_scans").select("campaign_code").gte("created_at", since30).limit(10000);
    if (!scans30.error && scans30.data) {
      totalScans = scans30.data.length;
      for (const row of scans30.data as { campaign_code: string }[]) {
        scansLast30[row.campaign_code] = (scansLast30[row.campaign_code] ?? 0) + 1;
      }
    } else {
      const counts = await supabase.from("qr_campaigns").select("scan_count");
      if (!counts.error && counts.data) {
        totalScans = (counts.data as { scan_count: number }[]).reduce((s, r) => s + (r.scan_count ?? 0), 0);
      }
    }

    const ordersRes = await supabase
      .from("orders")
      .select("campaign_code, total_amount")
      .not("campaign_code", "is", null)
      .gte("created_at", since30)
      .limit(2000);
    if (!ordersRes.error && ordersRes.data) {
      for (const row of ordersRes.data as { campaign_code: string | null; total_amount: number | string }[]) {
        if (!row.campaign_code) continue;
        const entry = ordersByCampaign[row.campaign_code] ?? { count: 0, revenue: 0 };
        entry.count += 1;
        entry.revenue += Number(row.total_amount) || 0;
        ordersByCampaign[row.campaign_code] = entry;
      }
    }

    if (campaigns.length === 0) {
      const fallback = await supabase.from("qr_campaigns").select("code").limit(1);
      if (fallback.error && fallback.error.message.includes("does not exist")) dbReady = false;
    }
  } else {
    dbReady = false;
  }

  const known = new Set(campaigns.map((c) => c.code));
  const missingBuiltIns = BUILT_IN_CAMPAIGNS.filter((b) => !known.has(b.code));
  const productCampaigns = campaigns.filter((c) => c.segment === "product");
  const qrOrders = Object.values(ordersByCampaign).reduce((s, e) => s + e.count, 0);

  return (
    <div>
      <h1 className="display-font text-4xl font-black">QR codes and tracking</h1>
      <p className="mt-2 max-w-2xl text-slate-600">
        Every printed QR points to /r/code so scans are counted per campaign. Download a code,
        print it on flyers, jersey tags or school posters, and watch scans and orders here.
      </p>
      {!dbReady && (
        <p className="mt-5 rounded-xl bg-amber-50 p-4 text-sm font-bold text-amber-800">
          QR tables are not installed yet. Run supabase/schema.sql once, then supabase/qr-campaigns.sql, and reload.
        </p>
      )}
      {created && <p className="mt-5 rounded-xl bg-green-50 p-4 text-sm font-bold text-green-700">Campaign created.</p>}
      {updated && <p className="mt-5 rounded-xl bg-green-50 p-4 text-sm font-bold text-green-700">Campaign updated.</p>}
      {deleted && <p className="mt-5 rounded-xl bg-green-50 p-4 text-sm font-bold text-green-700">Campaign deleted.</p>}
      {error && <p className="mt-5 rounded-xl bg-red-50 p-4 text-sm font-bold text-red-600">Could not save. Check code unique.</p>}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl bg-white p-6">
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">Scans (30 days)</p>
          <p className="mt-2 text-4xl font-black">{totalScans.toLocaleString()}</p>
        </div>
        <div className="rounded-2xl bg-white p-6">
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">Active campaigns</p>
          <p className="mt-2 text-4xl font-black">{campaigns.filter((c) => c.is_active).length}</p>
        </div>
        <div className="rounded-2xl bg-white p-6">
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">Product QR codes</p>
          <p className="mt-2 text-4xl font-black">{productCampaigns.length}</p>
        </div>
        <div className="rounded-2xl bg-white p-6">
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">QR orders (30 days)</p>
          <p className="mt-2 text-4xl font-black">{qrOrders}</p>
        </div>
      </div>


      <div className="mt-8 rounded-2xl bg-white p-6">
        <h2 className="font-black">Scans per campaign</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-slate-400">
                <th className="pb-2">Campaign</th>
                <th className="pb-2">7 days</th>
                <th className="pb-2">30 days</th>
                <th className="pb-2">Orders</th>
                <th className="pb-2">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {campaigns.map((c) => (
                <tr key={c.code}>
                  <td className="py-3 font-bold">
                    {c.name} <span className="font-mono text-xs font-normal text-slate-400">/r/{c.code}</span>
                  </td>
                  <td className="py-3">{scansLast7[c.code] ?? 0}</td>
                  <td className="py-3">{scansLast30[c.code] ?? c.scan_count}</td>
                  <td className="py-3">{ordersByCampaign[c.code]?.count ?? 0}</td>
                  <td className="py-3">TZS {(ordersByCampaign[c.code]?.revenue ?? 0).toLocaleString("en-TZ")}</td>
                </tr>
              ))}
              {campaigns.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-4 text-slate-500">
                    No campaigns in the database yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {campaigns.length > 0 && (
        <div className="mt-8">
          <h2 className="font-black">Your QR codes - download and print</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {campaigns.map((c) => (
              <div key={c.code}>
                <QrCard
                  item={{
                    code: c.code,
                    name: c.name,
                    segment: c.segment,
                    description: c.description,
                    scanCount: scansLast30[c.code] ?? c.scan_count,
                    isActive: c.is_active,
                  }}
                />
                <div className="mt-2 flex flex-wrap gap-2">
                  <form action={toggleQrCampaign}>
                    <input type="hidden" name="code" value={c.code} />
                    <input type="hidden" name="is_active" value={c.is_active ? "false" : "true"} />
                    <button className="rounded-full bg-white px-3 py-2 text-xs font-bold text-slate-600 ring-1 ring-slate-200">
                      {c.is_active ? "Pause" : "Activate"}
                    </button>
                  </form>
                  {!BUILT_IN_CAMPAIGNS.some((b) => b.code === c.code) && (
                    <form action={deleteQrCampaign}>
                      <input type="hidden" name="code" value={c.code} />
                      <button className="rounded-full bg-red-50 px-3 py-2 text-xs font-bold text-red-600">
                        Delete
                      </button>
                    </form>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {missingBuiltIns.length > 0 && (
        <div className="mt-8">
          <h2 className="font-black">Built-in previews (work even before the database table exists)</h2>
          <p className="mt-1 text-sm text-slate-500">
            These four codes always redirect. Install the QR tables to track their scans.
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {missingBuiltIns.map((b) => (
              <QrCard
                key={b.code}
                item={{
                  code: b.code,
                  name: b.name,
                  segment: b.segment,
                  description: b.description,
                  scanCount: 0,
                  isActive: true,
                }}
              />
            ))}
          </div>
        </div>
      )}
      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-6">
          <h2 className="font-black">Create a campaign</h2>
          <form action={createQrCampaign} className="mt-4 space-y-4">
            <label className={label}>
              Code (used in /r/code, lowercase, hyphens only)
              <input name="code" required maxLength={60} pattern="[a-z0-9-]+" className={input} placeholder="mtoni-academy" />
            </label>
            <label className={label}>
              Display name
              <input name="name" required maxLength={120} className={input} placeholder="Mtoni Academy flyers" />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className={label}>
                Segment
                <select name="segment" className={input} defaultValue="schools">
                  {QR_SEGMENTS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className={label}>
                Opens
                <select name="target_path" className={input} defaultValue="/shop">
                  <option value="/">Homepage</option>
                  <option value="/shop">Shop</option>
                </select>
              </label>
            </div>
            <label className={label}>
              Note (where will you print it?)
              <input name="description" maxLength={300} className={input} placeholder="A5 flyers for Mtoni school" />
            </label>
            <button className="w-full rounded-full bg-[#10233f] px-6 py-3 text-sm font-black text-white">
              Create QR campaign
            </button>
          </form>
        </div>

        <div className="rounded-2xl bg-white p-6">
          <h2 className="font-black">Product QR codes</h2>
          <p className="mt-1 text-sm text-slate-500">
            Each product gets its own code that opens that product directly.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {products.slice(0, 12).map((p) => {
              const code = productQrCode(p.slug);
              const landing = qrLandingUrl(code);
              return (
                <div key={p.slug} className="rounded-xl bg-slate-50 p-3 text-center">
                  <p className="text-sm font-black">{p.name}</p>
                  <p className="font-mono text-[11px] text-slate-500">/r/{code}</p>
                  <Image
                    src={qrImageUrl(landing, 140)}
                    alt={`QR for ${p.name}`}
                    width={140}
                    height={140}
                    className="mx-auto mt-2 h-[140px] w-[140px] rounded-lg bg-white p-1"
                  />
                  <Link href={`/products/${p.slug}`} className="mt-2 inline-block text-xs font-bold text-[#1769e0]">
                    View product
                  </Link>
                </div>
              );
            })}
          </div>
          {products.length === 0 && <p className="mt-3 text-sm text-slate-500">No products found.</p>}
        </div>
      </div>
    </div>
  );
}
