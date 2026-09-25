import type { Metadata } from "next";
import Link from "next/link";
import { CartLink } from "@/components/cart-link";
import { ProductArtwork } from "@/components/product-artwork";
import { business, whatsappLink } from "@/lib/business";
import { getPublishedProducts } from "@/lib/product-repository";
import { formatPrice } from "@/lib/products";

// Products come from the database, so the homepage is rendered on each visit.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Andres Sportsweartz | Sports shoes, training kits and sportswear",
  description:
    "Shop sports shoes, training kits, sportswear and training clothes from Andres Sportsweartz. Order online or easily on WhatsApp.",
  openGraph: {
    title: "Andres Sportsweartz | Move with confidence",
    description:
      "Performance sportswear for training days, match days and every day. Shop sports shoes, training kits and sportswear.",
    type: "website",
  },
};

export default async function Home() {
  const products = await getPublishedProducts();
  const featured = products.filter((product) => product.isFeatured).slice(0, 3);
  const shown = featured.length > 0 ? featured : products.slice(0, 3);
  const categoryNames = Array.from(new Set(products.map((product) => product.category))).slice(0, 4);

  const categoryColors = ["bg-[#1769e0]", "bg-[#ff6b2c]", "bg-[#344054]", "bg-[#8b5e3c]"];

  // Search engines read this to understand the business.
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: business.name,
    slogan: business.tagline,
    telephone: business.phoneNumber || undefined,
    address: business.address
      ? { "@type": "PostalAddress", addressLocality: business.address, addressCountry: "TZ" }
      : undefined,
    openingHours: business.hours || undefined,
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#f7f8fa] text-[#10233f]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="bg-[#10233f] px-5 py-2 text-center text-xs font-bold tracking-widest text-white">
        ORDER ONLINE OR ON WHATSAPP - WE DELIVER
      </div>

      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-8">
        <Link href="/" className="leading-none">
          <b className="block text-xl tracking-tighter">ANDRES</b>
          <span className="text-[10px] font-bold tracking-[.25em] text-[#ff6b2c]">SPORTSWEARTZ</span>
        </Link>

        <nav className="hidden gap-8 text-sm font-bold text-slate-600 md:flex">
          <Link href="/shop" className="hover:text-[#ff6b2c]">Shop</Link>
          <Link href="/shop" className="hover:text-[#ff6b2c]">Categories</Link>
          <Link href="#story" className="hover:text-[#ff6b2c]">Our story</Link>
          <Link href="#contact" className="hover:text-[#ff6b2c]">Contact</Link>
        </nav>

        <CartLink />
      </header>

      <section className="hero-grid relative mx-3 overflow-hidden rounded-[2rem] bg-[#10233f] text-white sm:mx-5 lg:mx-8">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-16 sm:px-12 sm:py-24 lg:grid-cols-2 lg:px-16 lg:py-28">
          <div>
            <p className="mb-5 text-xs font-black uppercase tracking-[.25em] text-[#ff8a5c]">Built for your next win</p>
            <h1 className="display-font text-5xl font-black leading-[.92] sm:text-7xl">
              Move with <span className="text-[#ff6b2c]">confidence.</span>
            </h1>
            <p className="mt-6 max-w-md text-lg leading-7 text-slate-300">
              Performance gear that keeps up with your ambition. Find your edge, then go further.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/shop" className="rounded-full bg-[#ff6b2c] px-6 py-3.5 text-sm font-black">
                Shop the collection
              </Link>
              <Link href="#story" className="rounded-full border border-white/30 px-6 py-3.5 text-sm font-bold">
                Explore categories
              </Link>
            </div>
          </div>

          <div className="relative flex min-h-64 items-center justify-center">
            <div className="absolute h-64 w-64 rounded-full bg-[#1769e0]/50 blur-3xl" />
            <div className="relative text-9xl font-black italic tracking-tighter">AS</div>
            <div className="absolute bottom-2 right-2 rounded-xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur">
              <small className="block text-slate-300">NEW SEASON</small>
              <b>Built to perform.</b>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ff6b2c]">Find your fit</p>
        <h2 className="display-font mt-2 text-3xl font-black sm:text-4xl">Shop by category</h2>
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {categoryNames.map((name, index) => (
            <Link
              key={name}
              href="/shop"
              className={`relative flex min-h-40 items-end overflow-hidden rounded-2xl p-4 font-black text-white ${categoryColors[index % categoryColors.length]}`}
            >
              {name}
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-white px-5 py-16 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ff6b2c]">The latest drop</p>
              <h2 className="display-font mt-2 text-3xl font-black sm:text-4xl">Featured essentials</h2>
            </div>
            <Link href="/shop" className="text-sm font-bold text-[#1769e0]">Shop all</Link>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((product) => (
              <article key={product.slug}>
                <Link href={`/products/${product.slug}`} className="block aspect-[4/3] overflow-hidden rounded-2xl">
                  <ProductArtwork product={product} className="h-full w-full" initialsClassName="text-7xl" />
                </Link>
                <div className="flex justify-between pt-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{product.category}</p>
                    <h3 className="mt-1 font-black">{product.name}</h3>
                  </div>
                  <b>{formatPrice(product.price)}</b>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="story" className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="rounded-3xl bg-[#ff6b2c] p-8 text-white sm:p-12">
          <p className="text-xs font-black uppercase tracking-[0.2em]">Why Andres</p>
          <h2 className="display-font mt-4 text-4xl font-black">Gear for the work you put in.</h2>
          <p className="mt-5 max-w-md leading-7 text-orange-50">
            Reliable sportswear for people who show up and keep going.
          </p>
        </div>
      </section>

      <section id="contact" className="bg-[#10233f] px-5 py-12 text-center text-white">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ff8a5c]">Need a hand?</p>
        <h2 className="display-font mt-3 text-3xl font-black">Let us get you game-ready.</h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-300">
          Talk to us on WhatsApp for product advice, sizes and orders.
        </p>
        <a
          href={whatsappLink("Hello Andres Sportsweartz, I would like to know more about your products.")}
          className="mt-6 inline-flex rounded-full bg-[#25D366] px-6 py-3.5 text-sm font-black"
        >
          Chat on WhatsApp
        </a>
        {business.phoneNumber && <p className="mt-4 text-sm text-slate-300">Call us: {business.phoneNumber}</p>}
      </section>

      <footer className="flex flex-col gap-4 px-5 py-8 text-sm text-slate-500 sm:flex-row sm:justify-between">
        <b className="text-[#10233f]">{business.name.toUpperCase()}</b>
        <span>
          (c) {new Date().getFullYear()} {business.name}. Built to move.
        </span>
      </footer>
    </main>
  );
}