"use client";

import { useState } from "react";
import { useCart } from "@/components/cart-provider";
import type { Product } from "@/lib/products";

export function ProductActions({ product }: { product: Product }) {
  const [size, setSize] = useState(product.sizes[0] ?? "");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const { add } = useCart();

  // A product may be published before its sizes are added. Rather than breaking
  // the page, we invite the customer to ask us on WhatsApp.
  if (product.sizes.length === 0) {
    return (
      <div className="mt-8 rounded-2xl bg-white p-5">
        <p className="text-sm font-black">Sizes coming soon</p>
        <p className="mt-1 text-sm text-slate-500">
          This product has no sizes listed yet. Message us on WhatsApp and we will confirm what is available.
        </p>
      </div>
    );
  }

  const changeSize = (value: string) => {
    setSize(value);
    setAdded(false);
  };

  const changeQuantity = (value: number) => {
    setQuantity(Math.min(20, Math.max(1, value)));
    setAdded(false);
  };

  const addToBag = () => {
    add(product, size, quantity);
    setAdded(true);
  };

  return (
    <>
      <div className="mt-8">
        <p className="text-sm font-black">Select size</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {product.sizes.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => changeSize(item)}
              aria-pressed={size === item}
              className={`rounded-lg border px-4 py-3 text-sm font-bold ${size === item ? "border-[#1769e0] bg-blue-50 text-[#1769e0]" : "border-slate-200 bg-white"}`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <span className="text-sm font-black">Quantity</span>
        <button
          type="button"
          aria-label="Reduce quantity"
          onClick={() => changeQuantity(quantity - 1)}
          className="h-9 w-9 rounded border border-slate-200 font-bold"
        >
          -
        </button>
        <b>{quantity}</b>
        <button
          type="button"
          aria-label="Increase quantity"
          onClick={() => changeQuantity(quantity + 1)}
          className="h-9 w-9 rounded border border-slate-200 font-bold"
        >
          +
        </button>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={addToBag}
          className="rounded-full bg-[#10233f] px-7 py-4 text-sm font-black text-white"
        >
          Add to bag
        </button>
        {added && <span className="text-sm font-bold text-[#059669]">Added to your bag</span>}
      </div>
    </>
  );
}