import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { business, whatsappLink } from "@/lib/business";

// =============================================================================
// 404 SCREEN (Next.js renders this for unknown pages / missing products)
// =============================================================================
export default function NotFound() {
  const whatsapp = whatsappLink(
    "Hello ANDRES SPORTSWEARTZ, I was looking for a product and I need help."
  );

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f8fa] px-5 py-12 text-[#10233f]">
      <div className="w-full max-w-md text-center">
        <div className="mb-8 flex justify-center">
          <BrandLogo href="/" />
        </div>

        <div className="rounded-3xl bg-white p-8 shadow-sm sm:p-10">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#ff6b2c]">
            Page not found
          </p>
          <h1 className="display-font mt-3 text-5xl font-black">404</h1>
          <p className="mt-4 leading-7 text-slate-600">
            That page is gone or was never here. The shop is still open -
            let us get you back to the gear.
          </p>

          <div className="mt-8 flex flex-col gap-3">
            <Link
              href="/"
              className="w-full rounded-full bg-[#10233f] px-6 py-4 text-center text-sm font-black text-white"
            >
              Back home
            </Link>
            <Link
              href="/shop"
              className="w-full rounded-full bg-[#ff6b2c] px-6 py-4 text-center text-sm font-black text-white"
            >
              Browse the shop
            </Link>
            <a
              href={whatsapp}
              className="w-full rounded-full bg-[#25D366] px-6 py-4 text-center text-sm font-black text-white"
            >
              Chat on WhatsApp
            </a>
          </div>
        </div>

        <p className="mt-6 text-xs text-slate-400">
          {business.name} - built to move.
        </p>
      </div>
    </main>
  );
}

