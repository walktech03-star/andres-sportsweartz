import Link from "next/link";
import { CartLink } from "@/components/cart-link";
import { ShopBrowser } from "@/components/shop-browser";
import { getPublishedProducts } from "@/lib/product-repository";

// Products come from the database, so this page must be rendered fresh on each
// visit. That way an edit made in the admin dashboard appears immediately.
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Shop sportswear, sports shoes and training kits | Andres Sportsweartz",
  description:
    "Browse sports shoes, training kits, sportswear and sports accessories from Andres Sportsweartz. Order online or on WhatsApp.",
};

export default async function ShopPage() {
  const products = await getPublishedProducts();

  const categories = ["All", ...Array.from(new Set(products.map((product) => product.category)))];

  return (
    <main className="min-h-screen bg-[#f7f8fa] text-[#10233f]">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-6 lg:px-8">
        <Link href="/" className="leading-none">
          <b className="block text-xl tracking-tighter">ANDRES</b>
          <span className="text-[10px] font-bold tracking-[.25em] text-[#ff6b2c]">SPORTSWEARTZ</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/" className="text-sm font-bold text-[#1769e0]">
            Back home
          </Link>
          <CartLink variant="light" />
        </div>
      </header>

      <ShopBrowser products={products} categories={categories} />
    </main>
  );
}