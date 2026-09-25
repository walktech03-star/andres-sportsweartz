"use client";

import { useMemo, useState } from "react";
import { ProductCard } from "@/components/product-card";
import type { Product } from "@/lib/products";

// The filtering happens in the browser so it feels instant on a phone, but the
// product list itself is loaded on the server and passed in here.
export function ShopBrowser({ products, categories }: { products: Product[]; categories: string[] }) {
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () =>
      products.filter((product) => {
        const matchesCategory = category === "All" || product.category === category;
        const haystack = (product.name + " " + product.category + " " + product.description).toLowerCase();
        return matchesCategory && haystack.includes(query.trim().toLowerCase());
      }),
    [products, category, query]
  );

  return (
    <section className="mx-auto max-w-7xl px-5 pb-16 pt-10 lg:px-8">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ff6b2c]">The collection</p>
      <h1 className="display-font mt-2 text-5xl font-black">Shop all gear.</h1>
      <p className="mt-4 max-w-xl text-slate-600">
        Find reliable sportswear for training days, match days and every day in between.
      </p>

      <div className="mt-10 flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-sm sm:flex-row">
        <label className="flex flex-1 items-center gap-3 rounded-xl bg-slate-50 px-4">
          <span aria-hidden="true">Search</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search products..."
            className="w-full bg-transparent py-3 text-sm outline-none"
            aria-label="Search products"
          />
        </label>
        <div className="flex gap-2 overflow-x-auto">
          {categories.map((item) => (
            <button
              key={item}
              onClick={() => setCategory(item)}
              className={`whitespace-nowrap rounded-full px-4 py-3 text-xs font-black ${category === item ? "bg-[#10233f] text-white" : "bg-slate-100 text-slate-600"}`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-8 text-sm font-bold text-slate-500">
        {filtered.length} {filtered.length === 1 ? "product" : "products"}
      </p>

      <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-2xl bg-white p-12 text-center">
          <h2 className="font-black">No products found</h2>
          <p className="mt-2 text-sm text-slate-500">Try another search or category.</p>
        </div>
      )}
    </section>
  );
}