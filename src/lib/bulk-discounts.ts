// =============================================================================
// BULK DISCOUNTS (quantity-based offers) - ANDRES SPORTSWEARTZ
// =============================================================================
// The discount is based on the TOTAL quantity in the bag / order, across all
// products and sizes combined:
//
//   1-9 items    -> normal price (0%)
//   10-19 items  -> 5% off
//   20-49 items  -> 10% off
//   50+ items    -> 15% off
//
// RULE: the browser NEVER decides the discount. The cart shows an estimate,
// but the server (src/lib/order-validation.ts) recomputes everything from the
// trusted catalogue before an order is accepted.
// =============================================================================

export type BulkTier = {
  minQty: number;
  maxQty: number | null;
  rate: number;
  label: string;
  shortLabel: string;
};

export const BULK_DISCOUNT_TIERS: BulkTier[] = [
  { minQty: 1, maxQty: 9, rate: 0, label: "1-9 items: normal price", shortLabel: "Normal price" },
  { minQty: 10, maxQty: 19, rate: 0.05, label: "10-19 items: 5% off", shortLabel: "5% off" },
  { minQty: 20, maxQty: 49, rate: 0.1, label: "20-49 items: 10% off", shortLabel: "10% off" },
  { minQty: 50, maxQty: null, rate: 0.15, label: "50+ items: 15% off", shortLabel: "15% off" },
];

export function getDiscountRate(totalQty: number): number {
  if (totalQty >= 50) return 0.15;
  if (totalQty >= 20) return 0.1;
  if (totalQty >= 10) return 0.05;
  return 0;
}

export function getDiscountTier(totalQty: number): BulkTier {
  if (totalQty >= 50) return BULK_DISCOUNT_TIERS[3];
  if (totalQty >= 20) return BULK_DISCOUNT_TIERS[2];
  if (totalQty >= 10) return BULK_DISCOUNT_TIERS[1];
  return BULK_DISCOUNT_TIERS[0];
}

export function nextTierInfo(totalQty: number): { needed: number; nextRate: number } | null {
  if (totalQty >= 50) return null;
  if (totalQty >= 20) return { needed: 50 - totalQty, nextRate: 0.15 };
  if (totalQty >= 10) return { needed: 20 - totalQty, nextRate: 0.1 };
  return { needed: 10 - totalQty, nextRate: 0.05 };
}

export function summarizeDiscount(subtotal: number, totalQty: number) {
  const rate = getDiscountRate(totalQty);
  const discount = Math.round(subtotal * rate);
  return { rate, discount, total: subtotal - discount };
}

export function formatPercent(rate: number): string {
  return `${Math.round(rate * 100)}%`;
}

