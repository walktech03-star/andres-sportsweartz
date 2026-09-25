"use client";

import Link from "next/link";
import { useCart } from "@/components/cart-provider";
import { ProductArtwork } from "@/components/product-artwork";
import { formatPrice } from "@/lib/products";

export default function CartPage() {
  const { items, total, update, remove } = useCart();

  return (
    <main className="min-h-screen bg-[#f7f8fa] text-[#10233f]">
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-6">
        <Link href="/" className="text-xl font-black tracking-tighter">
          ANDRES <span className="text-[#ff6b2c]">SPORTSWEARTZ</span>
        </Link>
        <Link href="/shop" className="text-sm font-bold text-[#1769e0]">
          Continue shopping
        </Link>
      </header>

      <section className="mx-auto w-full max-w-4xl px-5 pb-20 pt-8">
        <p className="text-xs font-black uppercase tracking-widest text-[#ff6b2c]">Your selection</p>
        <h1 className="display-font mt-2 text-5xl font-black">Your bag</h1>

        {!items.length ? (
          <div className="mt-10 rounded-2xl bg-white p-10 text-center">
            <p className="font-bold">Your bag is empty.</p>
            <Link href="/shop" className="mt-5 inline-block rounded-full bg-[#10233f] px-6 py-3 text-sm font-black text-white">
              Browse products
            </Link>
          </div>
        ) : (
          <>
            <div className="mt-8 space-y-3">
              {items.map((item) => (
                <div key={item.key} className="flex items-center gap-4 rounded-2xl bg-white p-4">
                  <ProductArtwork
                    product={item.product}
                    className="h-20 w-20 shrink-0 rounded-xl"
                    initialsClassName="text-lg"
                  />
                  <div className="min-w-0 flex-1">
                    <h2 className="font-black">{item.product.name}</h2>
                    <p className="text-sm text-slate-500">
                      Size: {item.size} | {formatPrice(item.product.price)}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <button aria-label="Reduce quantity" onClick={() => update(item.key, item.quantity - 1)} className="h-8 w-8 rounded border border-slate-200 font-bold">
                        -
                      </button>
                      <span className="text-sm font-bold">{item.quantity}</span>
                      <button aria-label="Increase quantity" onClick={() => update(item.key, item.quantity + 1)} className="h-8 w-8 rounded border border-slate-200 font-bold">
                        +
                      </button>
                    </div>
                  </div>
                  <button onClick={() => remove(item.key)} className="text-xs font-bold text-red-500">
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-2xl bg-[#10233f] p-6 text-white">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <b>{formatPrice(total)}</b>
              </div>
              <p className="mt-2 text-xs text-slate-300">Delivery details will be confirmed with you.</p>
              <Link href="/checkout" className="mt-6 block rounded-full bg-[#ff6b2c] px-6 py-4 text-center text-sm font-black">
                Proceed to order
              </Link>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
