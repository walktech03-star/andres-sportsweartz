import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CartLink } from "@/components/cart-link";
import { ProductActions } from "@/components/product-actions";
import { ProductArtwork } from "@/components/product-artwork";
import { whatsappLink } from "@/lib/business";
import { getProductBySlug } from "@/lib/product-repository";
import { formatPrice } from "@/lib/products";

// Products are read from the database, so this page is rendered on each visit.
export const dynamic = "force-dynamic";

// Per-product page title, description and social sharing metadata for SEO.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: "Product not found | Andres Sportsweartz" };
  }

  const description = (product.description || product.name).slice(0, 155);

  return {
    title: `${product.name} | Andres Sportsweartz`,
    description,
    openGraph: {
      title: `${product.name} | Andres Sportsweartz`,
      description,
      images: product.imageUrl ? [product.imageUrl] : undefined,
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const whatsapp = whatsappLink(
    "Hello Andres Sportsweartz, I would like to order: " +
      product.name +
      ". Please confirm available size and delivery details."
  );

  return (
    <main className="min-h-screen bg-[#f7f8fa] text-[#10233f]">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-6 lg:px-8">
        <Link href="/" className="leading-none">
          <b className="block text-xl tracking-tighter">ANDRES</b>
          <span className="text-[10px] font-bold tracking-[.25em] text-[#ff6b2c]">SPORTSWEARTZ</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/shop" className="text-sm font-bold text-[#1769e0]">
            Continue shopping
          </Link>
          <CartLink variant="light" />
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-10 px-5 pb-20 pt-8 lg:grid-cols-2 lg:px-8 lg:pt-16">
        <ProductArtwork
          product={product}
          className="aspect-square w-full rounded-3xl"
          initialsClassName="text-[8rem] sm:text-[14rem]"
        />

        <div className="flex flex-col justify-center">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ff6b2c]">{product.category}</p>
          <h1 className="display-font mt-3 text-4xl font-black sm:text-6xl">{product.name}</h1>
          <p className="mt-5 text-2xl font-black">{formatPrice(product.price)}</p>
          <p className="mt-6 max-w-lg leading-7 text-slate-600">{product.description}</p>

          <ProductActions product={product} />

          <div className="mt-4">
            <a
              href={whatsapp}
              className="inline-block rounded-full bg-[#25D366] px-7 py-4 text-center text-sm font-black text-white"
            >
              Order on WhatsApp
            </a>
          </div>

          <p className="mt-5 text-xs text-slate-500">
            Need help choosing a size? Contact us on WhatsApp and we will help.
          </p>
        </div>
      </section>
    </main>
  );
}