import Link from "next/link";
import { notFound } from "next/navigation";
import { updateOrderStatus } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/admin";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { formatPrice } from "@/lib/products";

export const dynamic = "force-dynamic";

const STATUSES = ["new", "confirmed", "preparing", "out_for_delivery", "completed", "cancelled"];

function label(status: string) {
  return status.replace(/_/g, " ").replace(/^./, (letter) => letter.toUpperCase());
}

export default async function AdminOrderDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ updated?: string; error?: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const { updated, error } = await searchParams;
  const supabase = getSupabaseAdmin();

  if (!supabase) {
    return <p className="rounded-2xl bg-white p-8 text-slate-600">Database not connected yet.</p>;
  }

  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!order) notFound();

  const { data: items } = await supabase
    .from("order_items")
    .select("product_name_snapshot, selected_size, quantity, unit_price, line_total")
    .eq("order_id", id)
    .order("id", { ascending: true });

  const customerDigits = String(order.customer_phone_snapshot).replace(/[^0-9]/g, "");
  const customerWhatsApp =
    "https://wa.me/" +
    customerDigits +
    "?text=" +
    encodeURIComponent(
      "Hello " +
        order.customer_name_snapshot +
        ", this is Andres Sportsweartz about your order " +
        order.order_reference +
        "."
    );

  const rows = [
    { label: "Order reference", value: order.order_reference },
    { label: "Date", value: new Date(order.created_at).toLocaleString("en-TZ") },
    { label: "Customer", value: order.customer_name_snapshot },
    { label: "Phone", value: order.customer_phone_snapshot },
    { label: "Delivery location", value: order.delivery_location },
    { label: "Address / details", value: order.delivery_address },
    { label: "Customer notes", value: order.customer_notes || "None" },
    { label: "Payment status", value: label(order.payment_status) },
  ];

  return (
    <div>
      <Link href="/admin/orders" className="text-sm font-bold text-[#1769e0]">
        Back to orders
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="display-font text-3xl font-black sm:text-4xl">Order {order.order_reference}</h1>
        <a
          href={customerWhatsApp}
          className="rounded-full bg-[#25D366] px-4 py-2 text-sm font-black text-white"
        >
          Message customer
        </a>
      </div>

      {updated && <p className="mt-4 rounded-xl bg-green-50 p-4 text-sm font-bold text-green-700">Order status updated.</p>}
      {error && <p className="mt-4 rounded-xl bg-red-50 p-4 text-sm font-bold text-red-600">Could not save that change.</p>}

      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-2xl bg-white p-6">
          <h2 className="font-black">Customer and delivery</h2>
          <dl className="mt-4 space-y-3">
            {rows.map((row) => (
              <div key={row.label}>
                <dt className="text-xs font-bold uppercase tracking-wider text-slate-400">{row.label}</dt>
                <dd className="mt-0.5 text-sm">{row.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl bg-white p-6">
            <h2 className="font-black">Change status</h2>
            <p className="mt-1 text-sm text-slate-500">Current: {label(order.order_status)}</p>
            <form action={updateOrderStatus} className="mt-4 flex flex-wrap gap-2">
              <input type="hidden" name="id" value={order.id} />
              <select name="status" defaultValue={order.order_status} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm">
                {STATUSES.map((item) => (
                  <option key={item} value={item}>
                    {label(item)}
                  </option>
                ))}
              </select>
              <button className="w-full rounded-full bg-[#10233f] px-6 py-3 text-sm font-black text-white">
                Save status
              </button>
            </form>
          </div>

          <div className="rounded-2xl bg-white p-6">
            <h2 className="font-black">Items ordered</h2>
            <div className="mt-4 divide-y divide-slate-100">
              {(items ?? []).map((item, index) => (
                <div key={index} className="flex items-start justify-between gap-3 py-3">
                  <div>
                    <p className="text-sm font-bold">{item.product_name_snapshot}</p>
                    <p className="text-xs text-slate-500">
                      Size {item.selected_size || "n/a"} - Quantity {item.quantity}
                    </p>
                  </div>
                  <p className="whitespace-nowrap text-sm font-black">
                    {formatPrice(Number(item.line_total), order.currency)}
                  </p>
                </div>
              ))}
              {(items ?? []).length === 0 && <p className="text-sm text-slate-500">No items recorded.</p>}
            </div>

            <div className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(Number(order.subtotal), order.currency)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery</span>
                <span>{formatPrice(Number(order.delivery_fee), order.currency)}</span>
              </div>
              <div className="flex justify-between text-base font-black">
                <span>Total</span>
                <span>{formatPrice(Number(order.total_amount), order.currency)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}