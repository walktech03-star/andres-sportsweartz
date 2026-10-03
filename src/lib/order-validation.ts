import { business } from "@/lib/business";
import { getDiscountRate } from "@/lib/bulk-discounts";
import type { Product } from "@/lib/products";

// =============================================================================
// SERVER-SIDE ORDER VALIDATION
// =============================================================================
// Everything in this file runs on the server only.
//
// THE MOST IMPORTANT SECURITY RULE IN THIS FILE:
// Prices are NEVER trusted from the browser. A visitor could edit the data sent
// by the website and claim a shoe costs 1 shilling. So we ignore any price the
// browser sends, look the product up in our own trusted catalogue, and calculate
// every amount ourselves.
// =============================================================================

export const MAX_ITEMS_PER_ORDER = 60;
export const MAX_QUANTITY_PER_ITEM = 100;

export type ValidatedItem = {
  slug: string;
  name: string;
  size: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

export type ValidatedOrder = {
  customerName: string;
  phone: string;
  location: string;
  address: string;
  notes: string | null;
  campaignCode: string | null;
  items: ValidatedItem[];
  itemCount: number;
  discountRate: number;
  discountAmount: number;
  subtotal: number;
  deliveryFee: number;
  total: number;
  currency: string;
};

export type ValidationResult =
  | { ok: true; order: ValidatedOrder }
  | { ok: false; errors: string[] };

function asText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function textField(value: unknown, label: string, min: number, max: number, errors: string[]): string {
  const text = asText(value);
  if (text.length < min) {
    errors.push(label + " is required.");
  } else if (text.length > max) {
    errors.push(label + " must be " + max + " characters or fewer.");
  }
  return text.slice(0, max);
}

function phoneField(value: unknown, errors: string[]): string {
  const raw = asText(value);
  const digits = raw.replace(/[^0-9]/g, "");

  if (digits.length < 9) {
    errors.push("Please enter a valid phone number with at least 9 digits.");
  } else if (digits.length > 15) {
    errors.push("Please enter a phone number with 15 digits or fewer.");
  }

  if (raw.length > 0 && !/^[0-9+\-() ]+$/.test(raw)) {
    errors.push("Phone number may only contain digits, spaces and the + - ( ) characters.");
  }

  return raw.slice(0, 20);
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export function validateOrderPayload(payload: unknown, catalogue: Product[]): ValidationResult {
  const errors: string[] = [];

  if (!payload || typeof payload !== "object") {
    return { ok: false, errors: ["The order details were not sent correctly."] };
  }

  const body = payload as Record<string, unknown>;

  const customerName = textField(body.name, "Full name", 2, 80, errors);
  const phone = phoneField(body.phone, errors);
  const location = textField(body.location, "Delivery location", 2, 120, errors);
  const address = textField(body.address, "Address or delivery details", 5, 300, errors);

  const rawNotes = asText(body.notes);
  const notes = rawNotes ? rawNotes.slice(0, 500) : null;
  if (rawNotes.length > 500) {
    errors.push("Additional notes must be 500 characters or fewer.");
  }

  const rawItems = Array.isArray(body.items) ? body.items : [];
  if (rawItems.length === 0) {
    errors.push("Your order must contain at least one product.");
  }
  if (rawItems.length > MAX_ITEMS_PER_ORDER) {
    errors.push("An order can contain at most " + MAX_ITEMS_PER_ORDER + " different products.");
  }

  const items: ValidatedItem[] = [];

  for (const rawItem of rawItems.slice(0, MAX_ITEMS_PER_ORDER)) {
    if (!rawItem || typeof rawItem !== "object") {
      errors.push("One of the products in your order was not valid.");
      continue;
    }

    const item = rawItem as Record<string, unknown>;
    const slug = asText(item.slug);
    const size = asText(item.size);
    const quantityNumber = Number(item.quantity);

    // The product must exist in the trusted catalogue, which comes from the
    // database rather than from the browser.
    const product = catalogue.find((candidate) => candidate.slug === slug);
    if (!product) {
      errors.push("We could not find one of the products in your order. Please refresh the page and try again.");
      continue;
    }

    if (!product.sizes.includes(size)) {
      errors.push(product.name + ": please choose one of the available sizes.");
      continue;
    }

    if (!Number.isInteger(quantityNumber) || quantityNumber < 1 || quantityNumber > MAX_QUANTITY_PER_ITEM) {
      errors.push(product.name + ": quantity must be a whole number between 1 and " + MAX_QUANTITY_PER_ITEM + ".");
      continue;
    }

    // Price comes from OUR catalogue, never from the browser.
    const unitPrice = product.price;

    items.push({
      slug: product.slug,
      name: product.name,
      size,
      quantity: quantityNumber,
      unitPrice,
      lineTotal: roundMoney(unitPrice * quantityNumber),
    });
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  const subtotal = roundMoney(items.reduce((sum, item) => sum + item.lineTotal, 0));
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Quantity-based offer. The rate is derived ONLY from the validated item
  // count, never from a browser-supplied discount value.
  const discountRate = getDiscountRate(itemCount);
  const discountAmount = Math.round(subtotal * discountRate);
  const discountedSubtotal = roundMoney(subtotal - discountAmount);

  const rawCampaign = asText((body as Record<string, unknown>).campaignCode);
  const campaignCode = /^[a-z0-9-]{1,80}$/i.test(rawCampaign) ? rawCampaign : null;

  // Delivery fee. Currently free delivery is assumed.
  // When the owner starts charging for delivery, change this single line.
  const deliveryFee = 0;

  return {
    ok: true,
    order: {
      customerName,
      phone,
      location,
      address,
      notes,
      campaignCode,
      items,
      itemCount,
      discountRate,
      discountAmount,
      subtotal,
      deliveryFee,
      total: roundMoney(discountedSubtotal + deliveryFee),
      currency: business.currency,
    },
  };
}

// Used only when the database is not connected yet, so the customer still
// receives a usable reference to quote on WhatsApp.
// Once Supabase is connected the database generates the authoritative number.
export function createLocalOrderReference(): string {
  const now = new Date();
  const datePart = String(now.getFullYear()) + String(now.getMonth() + 1).padStart(2, "0") + String(now.getDate()).padStart(2, "0");
  const randomPart = String(Math.floor(Math.random() * 9000) + 1000);
  return "ASW-" + datePart + "-" + randomPart;
}