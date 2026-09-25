import Link from "next/link";
import { ProductArtwork } from "@/components/product-artwork";
import type { Product } from "@/lib/products";
import { formatPrice } from "@/lib/products";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="group">
      <Link href={`/products/${product.slug}`} className="relative block aspect-[4/3] overflow-hidden rounded-2xl">
        <ProductArtwork
          product={product}
          className="h-full w-full transition duration-500 group-hover:scale-105"
        />
        {product.badge && (
          <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#10233f]">
            {product.badge}
          </span>
        )}
        <span className="absolute bottom-4 right-4 rounded-full bg-white px-4 py-2 text-xs font-black text-[#10233f] opacity-0 shadow-lg transition group-hover:opacity-100">
          View product
        </span>
      </Link>

      <div className="flex items-start justify-between gap-3 pt-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{product.category}</p>
          <h3 className="mt-1 font-black text-[#10233f]">{product.name}</h3>
        </div>
        <p className="whitespace-nowrap font-black text-[#10233f]">{formatPrice(product.price)}</p>
      </div>

      {product.sizes.length > 0 && (
        <p className="mt-1 text-xs text-slate-500">Sizes: {product.sizes.join(", ")}</p>
      )}
    </article>
  );
}