"use client";

import Link from "next/link";
import { useEffect } from "react";
import { BrandLogo } from "@/components/brand-logo";
import { business, whatsappLink } from "@/lib/business";

// =============================================================================
// GLOBAL ERROR SCREEN (Next.js renders this for any uncaught page error)
// =============================================================================
// Server components pass `error` + `reset`. Nothing technical is shown here:
// details go to the server logs, the customer sees a branded recovery screen.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Visible in Vercel logs for diagnosis; never shown to the visitor.
    console.error("ANDRES SPORTSWEARTZ page error:", error);
  }, [error]);

  const whatsapp = whatsappLink(
    "Hello ANDRES SPORTSWEARTZ, I saw an error on the website and I need help."
  );

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f8fa] px-5 py-12 text-[#10233f]">
      <div className="w-full max-w-md text-center">
        <div className="mb-8 flex justify-center">
          <BrandLogo href="/" />
        </div>

        <div className="rounded-3xl bg-white p-8 shadow-sm sm:p-10">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#ff6b2c]">
            Something went wrong
          </p>
          <h1 className="display-font mt-3 text-4xl font-black">
            We could not load that page.
          </h1>
          <p className="mt-4 leading-7 text-slate-600">
            Please try again. If it keeps happening, message us on WhatsApp and
            we will help you right away.
          </p>

          <div className="mt-8 flex flex-col gap-3">
            <button
              onClick={reset}
              className="w-full rounded-full bg-[#10233f] px-6 py-4 text-sm font-black text-white"
            >
              Try again
            </button>
            <Link
              href="/"
              className="w-full rounded-full bg-slate-100 px-6 py-4 text-center text-sm font-black text-[#10233f]"
            >
              Back home
            </Link>
            <a
              href={whatsapp}
              className="w-full rounded-full bg-[#25D366] px-6 py-4 text-center text-sm font-black text-white"
            >
              Chat on WhatsApp
            </a>
          </div>

          {business.phoneNumber && (
            <p className="mt-6 text-sm text-slate-500">Call us: {business.phoneNumber}</p>
          )}
        </div>

        <p className="mt-6 text-xs text-slate-400">
          {business.name} - built to move.
        </p>
      </div>
    </main>
  );
}

