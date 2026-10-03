"use client";

import { BULK_DISCOUNT_TIERS, formatPercent, nextTierInfo } from "@/lib/bulk-discounts";
import { formatPrice } from "@/lib/products";

// A bright strip shown on shop-facing pages so customers immediately see the
// team/bulk offer. Purely presentational - the real discount is computed on
// the server at checkout time.
export function BulkOffersBanner({ compact = false }: { compact?: boolean }) {
  const next = nextTierInfo(0);

  return (
    <section
      className={
        "mx-auto max-w-7xl px-5 lg:px-8 " + (compact ? "pt-6" : "pt-10")
      }
      aria-label="Bulk offers"
    >
      <div className="overflow-hidden rounded-3xl bg-gradient-to-r from-[#10233f] via-[#1769e0] to-[#ff6b2c] p-[1.5px]">
        <div className="rounded-3xl bg-white/95 p-5 backdrop-blur sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#ff6b2c]">
                ANDRES SPORTSWEARTZ bulk offers
              </p>
              <h2 className="display-font mt-1 text-2xl font-black text-[#10233f] sm:text-3xl">
                Buy more, save more.
              </h2>
              <p className="mt-1 max-w-xl text-sm leading-6 text-slate-600">
                Team kits, schools and academies welcome. Discount applies automatically
                to the total quantity in your bag.
                {next && (
                  <>
                    {" "}Add {next.needed} more {next.needed === 1 ? "item" : "items"} to unlock{" "}
                    <b>{formatPercent(next.nextRate)} off</b>.
                  </>
                )}
              </p>
            </div>
            <span className="rounded-full bg-[#10233f] px-4 py-2 text-xs font-black text-white">
              Auto-applied at checkout
            </span>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {BULK_DISCOUNT_TIERS.map((tier) => (
              <div
                key={tier.label}
                className={
                  "rounded-2xl border p-3 text-sm " +
                  (tier.rate > 0
                    ? "border-orange-200 bg-orange-50"
                    : "border-slate-200 bg-slate-50")
                }
              >
                <p className="font-black text-[#10233f]">
                  {tier.rate === 0 ? "1-9" : tier.maxQty ? `${tier.minQty}-${tier.maxQty}` : `${tier.minQty}+`}{" "}
                  <span className={tier.rate > 0 ? "text-[#ff6b2c]" : "text-slate-500"}>
                    {tier.rate === 0 ? "Normal price" : `${formatPercent(tier.rate)} off`}
                  </span>
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {tier.rate === 0
                    ? `e.g. 5 × ${formatPrice(32000)} stays full price`
                    : `Applies to your whole bag automatically`}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

