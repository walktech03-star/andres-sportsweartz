"use client";

import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";
import { BrandLogo } from "@/components/brand-logo";
import { whatsappLink } from "@/lib/business";
import { ProductArtwork } from "@/components/product-artwork";
import { formatPrice } from "@/lib/products";

type SavedOrder = {
  reference: string;
  persisted: boolean;
  message: string;
  total: number;
  subtotal?: number;
  discountRate?: number;
  discountAmount?: number;
  itemCount?: number;
  currency: string;
  name: string;
  phone: string;
  location: string;
  address: string;
  notes?: string | null;
  items: {
    key: string;
    name: string;
    size: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
    accentColor: string;
    imageUrl: string | null;
  }[];
};

const subscribeToOrder = () => () => {};

function getOrderRaw() {
  try {
    return sessionStorage.getItem("andres-order") ?? "";
  } catch {
    return "";
  }
}

function getOrderRawOnServer() {
  return "";
}

export default function ConfirmationPage() {
  const orderRaw = useSyncExternalStore(subscribeToOrder, getOrderRaw, getOrderRawOnServer);

  const order = useMemo<SavedOrder | null>(() => {
    if (!orderRaw) return null;
    try {
      return JSON.parse(orderRaw) as SavedOrder;
    } catch {
      return null;
    }
  }, [orderRaw]);

  const message = useMemo(() => {
    if (!order) {
      return "Hello Andres Sportsweartz, I would like help with my order.";
    }

    const lines = ["Hello Andres Sportsweartz, I would like to order:", ""];

    order.items.forEach((item) => {
      lines.push(
        "Product: " + item.name,
        "Size: " + item.size,
        "Quantity: " + item.quantity,
        "Price: " + formatPrice(item.lineTotal),
        ""
      );
    });

    if (order.subtotal != null) {
      lines.push("Subtotal (" + (order.itemCount ?? order.items.reduce((s, i) => s + i.quantity, 0)) + " items): " + formatPrice(order.subtotal));
    }
    if (order.discountAmount != null && order.discountAmount > 0) {
      lines.push("Bulk discount (" + Math.round((order.discountRate ?? 0) * 100) + "%): -" + formatPrice(order.discountAmount));
    }

    lines.push(
      "Name: " + order.name,
      "Phone: " + order.phone,
      "Delivery location: " + order.location,
      "Address/details: " + order.address
    );

    if (order.notes) lines.push("Notes: " + order.notes);

    lines.push("", "Order reference: " + order.reference, "Total: " + formatPrice(order.total));

    return lines.join("\n");
  }, [order]);

  return (
    <main className="min-h-screen bg-[#f7f8fa] text-[#10233f]">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-6">
        <BrandLogo href="/" />
        <Link href="/shop" className="text-sm font-bold text-[#1769e0]">
          Continue shopping
        </Link>
      </header>

      <section className="mx-auto max-w-2xl px-5 pb-16 pt-8">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#25D366] text-xs font-black text-white">
            DONE
          </div>
          <p className="mt-8 text-xs font-black uppercase tracking-widest text-[#ff6b2c]">
            {order?.persisted ? "Order received" : "Order ready to confirm"}
          </p>
          <h1 className="display-font mt-2 text-4xl font-black sm:text-5xl">
            Thank you{order?.name ? ", " + order.name.split(" ")[0] : ""}.
          </h1>
          <p className="mt-5 leading-7 text-slate-600">
            {order?.persisted
              ? "Your order has been recorded and our team will contact you shortly to confirm availability, delivery and payment."
              : "Your order details have been prepared. Please send them to us on WhatsApp so we can confirm availability, delivery and payment."}
          </p>
        </div>

        <div className="mt-8 rounded-2xl bg-white p-6">
          <div className="flex justify-between gap-4">
            <span className="text-sm text-slate-500">Order reference</span>
            <b className="text-right">{order?.reference ?? "Pending"}</b>
          </div>
          {order && (
            <>
              <div className="mt-4 flex justify-between gap-4">
                <span className="text-sm text-slate-500">Customer</span>
                <b className="text-right">{order.name}</b>
              </div>
              <div className="mt-4 flex justify-between gap-4">
                <span className="text-sm text-slate-500">Delivery location</span>
                <b className="text-right">{order.location}</b>
              </div>
              {order.subtotal != null && (
                <div className="mt-4 flex justify-between gap-4">
                  <span className="text-sm text-slate-500">
                    Subtotal ({order.itemCount ?? order.items.reduce((s, i) => s + i.quantity, 0)} items)
                  </span>
                  <b className="text-right">{formatPrice(order.subtotal)}</b>
                </div>
              )}
              {order.discountAmount != null && order.discountAmount > 0 && (
                <div className="mt-4 flex justify-between gap-4">
                  <span className="text-sm font-bold text-green-700">
                    Bulk discount ({Math.round((order.discountRate ?? 0) * 100)}% off)
                  </span>
                  <b className="text-right text-green-700">-{formatPrice(order.discountAmount)}</b>
                </div>
              )}
              <div className="mt-4 flex justify-between gap-4">
                <span className="text-sm text-slate-500">Total</span>
                <b className="text-right">{formatPrice(order.total)}</b>
              </div>
            </>
          )}
        </div>

        {order && order.items.length > 0 && (
          <div className="mt-4 rounded-2xl bg-white p-6">
            <h2 className="font-black">Ordered products</h2>
            <div className="mt-4 space-y-3">
              {order.items.map((item) => (
                <div key={item.key} className="flex items-center gap-4">
                  <ProductArtwork
                    product={{ name: item.name, accentColor: item.accentColor, imageUrl: item.imageUrl }}
                    className="h-14 w-14 shrink-0 rounded-xl"
                    initialsClassName="text-xs"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold">{item.name}</p>
                    <p className="text-sm text-slate-500">
                      Size {item.size} x {item.quantity}
                    </p>
                  </div>
                  <b className="whitespace-nowrap text-sm">{formatPrice(item.lineTotal)}</b>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <a
            href={whatsappLink(message)}
            className="rounded-full bg-[#25D366] px-6 py-4 text-center text-sm font-black text-white"
          >
            Send order on WhatsApp
          </a>
          <Link
            href="/shop"
            className="rounded-full bg-[#10233f] px-6 py-4 text-center text-sm font-black text-white"
          >
            Continue shopping
          </Link>
        </div>

        <p className="mt-8 text-center text-xs text-slate-500">
          Keep your order reference safe. You can contact us on WhatsApp at any time and quote this reference.
        </p>
      </section>
    </main>
  );
}
