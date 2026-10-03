"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { BrandLogo } from "@/components/brand-logo";
import { useCart } from "@/components/cart-provider";
import { formatPrice } from "@/lib/products";

type OrderResponse = {
  ok: boolean;
  persisted?: boolean;
  reference?: string;
  subtotal?: number;
  discountRate?: number;
  discountAmount?: number;
  itemCount?: number;
  deliveryFee?: number;
  total?: number;
  currency?: string;
  message?: string;
  errors?: string[];
};

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, subtotal, discount, discountRate, count, clear } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<string[]>([]);
  const [campaignCode, setCampaignCode] = useState<string | null>(null);

  // Attribute the order to the QR flyer that brought the customer, if any.
  useEffect(() => {
    try {
      const match = document.cookie.match(/(?:^|;\s*)qr_campaign=([^;]*)/);
      if (match) setCampaignCode(decodeURIComponent(match[1]).slice(0, 80) || null);
    } catch {
      // Cookies unavailable - order simply has no campaign.
    }
  }, []);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setFieldErrors([]);

    if (!items.length) {
      setError("Your bag is empty. Please add a product before ordering.");
      return;
    }

    const form = event.currentTarget;
    const data = new FormData(form);

    // Only the information the server needs. Notice that NO PRICE and NO
    // DISCOUNT is sent. The server looks up real prices and recomputes the
    // bulk discount itself, so neither can be tampered with.
    const payload = {
      name: data.get("name"),
      phone: data.get("phone"),
      location: data.get("location"),
      address: data.get("address"),
      notes: data.get("notes"),
      website: data.get("website"),
      campaignCode,
      items: items.map((item) => ({
        slug: item.product.slug,
        size: item.size,
        quantity: item.quantity,
      })),
    };

    setSubmitting(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = (await response.json()) as OrderResponse;

      if (!response.ok || !result.ok) {
        setError(result.message ?? "We could not submit your order. Please try again.");
        if (result.errors?.length) setFieldErrors(result.errors);
        setSubmitting(false);
        return;
      }

      // Save the confirmed order so the confirmation page can display it.
      try {
        sessionStorage.setItem(
          "andres-order",
          JSON.stringify({
            reference: result.reference,
            persisted: result.persisted ?? false,
            message: result.message ?? "",
            total: result.total ?? total,
            currency: result.currency ?? "TZS",
            name: data.get("name"),
            phone: data.get("phone"),
            location: data.get("location"),
            address: data.get("address"),
            notes: data.get("notes"),
            items: items.map((item) => ({
              key: item.key,
              name: item.product.name,
              size: item.size,
              quantity: item.quantity,
              unitPrice: item.product.price,
              lineTotal: item.product.price * item.quantity,
              accentColor: item.product.accentColor,
              imageUrl: item.product.imageUrl,
            })),
            subtotal: result.subtotal ?? subtotal,
            discountRate: result.discountRate ?? discountRate,
            discountAmount: result.discountAmount ?? discount,
            itemCount: result.itemCount ?? count,
          })
        );
      } catch {
        // If the browser blocks storage the confirmation page still works,
        // it simply shows less detail.
      }

      clear();
      router.push("/order-confirmation");
    } catch {
      setError("We could not reach the shop. Please check your internet connection and try again.");
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f7f8fa] text-[#10233f]">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-6">
        <BrandLogo href="/" />
        <Link href="/cart" className="text-sm font-bold text-[#1769e0]">
          Back to bag
        </Link>
      </header>

      <section className="mx-auto grid max-w-5xl gap-10 px-5 pb-20 pt-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-[#ff6b2c]">Almost there</p>
          <h1 className="display-font mt-2 text-5xl font-black">Place your order.</h1>
          <p className="mt-4 text-slate-600">
            We only need a few details to prepare and deliver your order.
          </p>

          <form onSubmit={submit} className="mt-8 space-y-4 rounded-2xl bg-white p-6">
            <label className="block text-sm font-bold">
              Full name
              <input required name="name" autoComplete="name" maxLength={80} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-[#1769e0]" placeholder="Your full name" />
            </label>
            <label className="block text-sm font-bold">
              Phone number
              <input required name="phone" type="tel" autoComplete="tel" maxLength={20} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-[#1769e0]" placeholder="+255 700 000 000" />
            </label>
            <label className="block text-sm font-bold">
              Delivery location
              <input required name="location" maxLength={120} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-[#1769e0]" placeholder="Dar es Salaam, Arusha..." />
            </label>
            <label className="block text-sm font-bold">
              Address or delivery details
              <textarea required name="address" rows={3} maxLength={300} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-[#1769e0]" placeholder="Street, area, landmark or pickup instructions" />
            </label>
            <label className="block text-sm font-bold">
              Additional notes <span className="font-normal text-slate-400">(optional)</span>
              <textarea name="notes" rows={2} maxLength={500} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-[#1769e0]" placeholder="Anything else we should know?" />
            </label>

            {/* Hidden spam trap. Real customers never see or fill this field. */}
            <div className="hidden" aria-hidden="true">
              <label>
                Website
                <input name="website" tabIndex={-1} autoComplete="off" />
              </label>
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 p-4">
                <p className="text-sm font-bold text-red-600">{error}</p>
                {fieldErrors.length > 0 && (
                  <ul className="mt-2 list-disc pl-5 text-sm text-red-600">
                    {fieldErrors.map((message) => (
                      <li key={message}>{message}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <button disabled={submitting} className="w-full rounded-full bg-[#ff6b2c] px-6 py-4 text-sm font-black text-white disabled:opacity-60">
              {submitting ? "Submitting your order..." : "Submit order"}
            </button>
          </form>
        </div>

        <aside className="h-fit rounded-2xl bg-[#10233f] p-6 text-white">
          <h2 className="font-black">Order summary</h2>
          {discount > 0 && (
            <p className="mt-2 inline-block rounded-full bg-[#7CFC9A]/20 px-3 py-1 text-xs font-black text-[#7CFC9A]">
              Bulk offer: {Math.round(discountRate * 100)}% off applied
            </p>
          )}
          {items.length === 0 && <p className="mt-4 text-sm text-slate-300">No products selected yet.</p>}
          {items.map((item) => (
            <div key={item.key} className="mt-4 flex justify-between gap-4 text-sm">
              <span>
                {item.product.name} x {item.quantity}
                <span className="block text-slate-400">Size {item.size}</span>
              </span>
              <b className="whitespace-nowrap">{formatPrice(item.product.price * item.quantity)}</b>
            </div>
          ))}
          <div className="mt-6 space-y-2 border-t border-white/20 pt-5 text-sm">
            <div className="flex justify-between">
              <span>Subtotal ({count} {count === 1 ? "item" : "items"})</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-[#7CFC9A]">
                <span>Bulk discount ({Math.round(discountRate * 100)}%)</span>
                <span>-{formatPrice(discount)}</span>
              </div>
            )}
            <div className="flex justify-between pt-1 text-base font-black">
              <span>Total</span>
              <b>{formatPrice(total)}</b>
            </div>
          </div>
          <p className="mt-4 text-xs leading-5 text-slate-300">
            Payment is arranged after we confirm your order. We will contact you using the phone number provided.
          </p>
        </aside>
      </section>
    </main>
  );
}
