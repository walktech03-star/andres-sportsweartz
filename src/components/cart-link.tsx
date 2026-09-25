"use client";

import Link from "next/link";
import { useCart } from "@/components/cart-provider";

export function CartLink({ variant = "dark" }: { variant?: "dark" | "light" }) {
  const { count } = useCart();

  if (variant === "light") {
    return (
      <Link href="/cart" className="text-sm font-bold text-[#1769e0]">
        Bag ({count})
      </Link>
    );
  }

  return (
    <Link href="/cart" className="rounded-full bg-[#10233f] px-4 py-2 text-sm font-bold text-white">
      Bag ({count})
    </Link>
  );
}