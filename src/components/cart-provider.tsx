"use client";

import { createContext, useContext, useMemo, useSyncExternalStore } from "react";
import { summarizeDiscount } from "@/lib/bulk-discounts";
import type { Product } from "@/lib/products";

export type CartItem = { key: string; product: Product; size: string; quantity: number };

type CartContext = {
  items: CartItem[];
  add: (product: Product, size: string, quantity?: number) => void;
  remove: (key: string) => void;
  update: (key: string, quantity: number) => void;
  clear: () => void;
  total: number;
  subtotal: number;
  discount: number;
  discountRate: number;
  count: number;
};

const STORAGE_KEY = "andres-cart";
const EMPTY: CartItem[] = [];

let snapshot: CartItem[] = EMPTY;
let snapshotValid = false;
const listeners = new Set<() => void>();

function readCart(): CartItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY) ?? "[]";
    const parsed = JSON.parse(raw) as CartItem[];
    return Array.isArray(parsed) ? parsed : EMPTY;
  } catch {
    return EMPTY;
  }
}

function getSnapshot(): CartItem[] {
  if (typeof window === "undefined") return EMPTY;
  if (!snapshotValid) {
    snapshot = readCart();
    snapshotValid = true;
  }
  return snapshot;
}

function getServerSnapshot(): CartItem[] {
  return EMPTY;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY || event.key === null) {
      snapshotValid = false;
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function commit(updater: (current: CartItem[]) => CartItem[]) {
  const next = updater(getSnapshot());
  snapshot = next;
  snapshotValid = true;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage may be unavailable in private browsing; the cart still works for this session.
  }
  listeners.forEach((listener) => listener());
}

const Context = createContext<CartContext | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const { rate, discount, total } = summarizeDiscount(subtotal, count);
  const value = useMemo<CartContext>(() => ({
    items,
    add: (product, size, quantity = 1) => commit((current) => {
      const key = `${product.slug}-${size}`;
      const existing = current.find((item) => item.key === key);
      if (existing) {
        return current.map((item) => item.key === key ? { ...item, quantity: Math.min(100, item.quantity + quantity) } : item);
      }
      return [...current, { key, product, size, quantity: Math.min(100, Math.max(1, quantity)) }];
    }),
    remove: (key) => commit((current) => current.filter((item) => item.key !== key)),
    update: (key, quantity) => commit((current) => quantity < 1 ? current.filter((item) => item.key !== key) : current.map((item) => item.key === key ? { ...item, quantity: Math.min(100, quantity) } : item)),
    clear: () => commit(() => []),
    total,
    subtotal,
    discount,
    discountRate: rate,
    count,
  }), [items, total, subtotal, discount, rate, count]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useCart() {
  const value = useContext(Context);
  if (!value) throw new Error("useCart must be used inside CartProvider");
  return value;
}