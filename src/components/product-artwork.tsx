import type { Product } from "@/lib/products";

type ArtworkProduct = Pick<Product, "name" | "accentColor" | "imageUrl">;

// Shows a product photo when one exists, and a clean branded panel when it does
// not. New products therefore look intentional before any photo is uploaded.
//
// A plain img tag is used on purpose: product photos live in your own Supabase
// storage, and next/image would require the storage domain to be configured in
// advance. Lazy loading and async decoding keep mobile pages fast.
export function ProductArtwork({
  product,
  className = "",
  initialsClassName = "text-5xl",
}: {
  product: ArtworkProduct;
  className?: string;
  initialsClassName?: string;
}) {
  if (product.imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={product.imageUrl}
        alt={product.name}
        loading="lazy"
        decoding="async"
        className={`object-cover ${className}`}
      />
    );
  }

  return (
    <div
      className={`flex items-center justify-center ${className}`}
      style={{ backgroundImage: `linear-gradient(135deg, ${product.accentColor || "#1769e0"}, #0b1f3a)` }}
      aria-hidden="true"
    >
      <span className={`${initialsClassName} font-black italic tracking-tighter text-white/90`}>AS</span>
    </div>
  );
}