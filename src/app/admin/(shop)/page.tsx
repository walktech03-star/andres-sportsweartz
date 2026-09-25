import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { formatPrice } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  await requireAdmin();

  const supabase = getSupabaseAdmin();

  if (!supabase) {
    return (
      <div className="rounded-2xl bg-white p-8">
        <h1 className="display-font text-3xl font-black">Database not connected</h1>
        <p className="mt-3 max-w-xl leading-7 text-slate-600">
          The staff area needs the Supabase service role key before it can show any data.
          Open the file <b>.env.local</b> in the project folder, paste your key on the line
          that says <b>SUPABASE_SERVICE_ROLE_KEY=</b>, save it, then restart the website.
        </p>
      </div>
    );
  }

  const [ordersResult, newOrdersResult, productsResult, recentResult] = await Promise.all([
    supabase.from("orders").select("id", { count: "exact", head: true }),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("order_status", "new"),
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase
      .from("orders")
      .select("id, order_reference, customer_name_snapshot, total_amount, currency, order_status, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const cards = [
    { label: "New orders", value: newOrdersResult.count ?? 0, href: "/admin/orders?status=new" },
    { label: "All orders", value: ordersResult.count ?? 0, href: "/admin/orders" },
    { label: "Products", value: productsResult.count ?? 0, href: "/admin/products" },
  ];

  return (
    <div>
      <h1 className="display-font text-4xl font-black">Dashboard</h1>
      <p className="mt-2 text-slate-600">A quick look at your shop today.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {cards.map((card) => (
          <Link key={card.label} href={card.href} className="rounded-2xl bg-white p-6 transition hover:-translate-y-0.5">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">{card.label}</p>
            <p className="mt-2 text-4xl font-black">{card.value}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 rounded-2xl bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-black">Recent orders</h2>
          <Link href="/admin/orders" className="text-sm font-bold text-[#1769e0]">See all</Link>
        </div>

        {recentResult.data && recentResult.data.length > 0 ? (
          <div className="mt-4 divide-y divide-slate-100">
            {recentResult.data.map((order) => (
              <Link
                key={order.id}
                href={"/admin/orders/" + order.id}
                className="flex flex-wrap items-center justify-between gap-2 py-3"
              >
                <div>
                  <p className="font-bold">{order.customer_name_snapshot}</p>
                  <p className="text-xs text-slate-500">
                    {order.order_reference} - {new Date(order.created_at).toLocaleString("en-TZ")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-black">{formatPrice(Number(order.total_amount), order.currency)}</p>
                  <p className="text-xs font-bold text-slate-500">{String(order.order_status).replace(/_/g, " ")}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-500">No orders yet. They will appear here as customers order.</p>
        )}
      </div>
    </div>
  );
}