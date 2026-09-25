import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { formatPrice } from "@/lib/products";

export const dynamic = "force-dynamic";

const STATUSES = ["new", "confirmed", "preparing", "out_for_delivery", "completed", "cancelled"];

function label(status: string) {
  return status.replace(/_/g, " ").replace(/^./, (letter) => letter.toUpperCase());
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireAdmin();
  const { status } = await searchParams;
  const supabase = getSupabaseAdmin();

  if (!supabase) {
    return <p className="rounded-2xl bg-white p-8 text-slate-600">Database not connected yet. Add the service role key to get started.</p>;
  }

  let query = supabase
    .from("orders")
    .select("id, order_reference, customer_name_snapshot, customer_phone_snapshot, total_amount, currency, order_status, payment_status, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  if (status && STATUSES.includes(status)) {
    query = query.eq("order_status", status);
  }

  const { data, error } = await query;
  const orders = data ?? [];

  return (
    <div>
      <h1 className="display-font text-4xl font-black">Orders</h1>
      <p className="mt-2 text-slate-600">Every order customers have placed.</p>

      <div className="mt-5 flex flex-wrap gap-2">
        <Link href="/admin/orders" className={"rounded-full px-3 py-2 text-xs font-bold " + (!status ? "bg-[#10233f] text-white" : "bg-white text-slate-600")}>
          All
        </Link>
        {STATUSES.map((item) => (
          <Link
            key={item}
            href={"/admin/orders?status=" + item}
            className={"rounded-full px-3 py-2 text-xs font-bold " + (status === item ? "bg-[#10233f] text-white" : "bg-white text-slate-600")}
          >
            {label(item)}
          </Link>
        ))}
      </div>

      {error && <p className="mt-5 rounded-xl bg-red-50 p-4 text-sm font-bold text-red-600">Could not load orders.</p>}

      {!error && orders.length === 0 && (
        <p className="mt-8 rounded-2xl bg-white p-8 text-slate-600">No orders found.</p>
      )}

      <div className="mt-6 space-y-3">
        {orders.map((order) => (
          <Link key={order.id} href={"/admin/orders/" + order.id} className="block rounded-2xl bg-white p-5 transition hover:-translate-y-0.5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-black">{order.customer_name_snapshot}</p>
                <p className="text-xs text-slate-500">
                  {order.order_reference} - {new Date(order.created_at).toLocaleString("en-TZ")}
                </p>
                <p className="mt-1 text-sm text-slate-600">{order.customer_phone_snapshot}</p>
              </div>
              <div className="text-right">
                <p className="font-black">{formatPrice(Number(order.total_amount), order.currency)}</p>
                <p className="mt-1 inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-bold">
                  {label(order.order_status)}
                </p>
                <p className="mt-1 text-xs text-slate-400">Payment: {order.payment_status}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}