import Link from "next/link";
import { signOut } from "@/app/admin/actions";
import { BrandLogo } from "@/components/brand-logo";
import { requireAdmin } from "@/lib/admin";
import { business } from "@/lib/business";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/settings", label: "Settings" },
];

// This layout guards every staff page. The login page sits outside this folder
// on purpose, so signing in never causes a redirect loop.
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-[#10233f]">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-4">
          <BrandLogo href="/admin" size="sm" subtitle="ADMIN" />

          <nav className="flex flex-wrap gap-1 text-sm font-bold">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full px-3 py-2 text-slate-600 transition hover:bg-slate-100"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <span className="hidden max-w-[180px] truncate text-xs text-slate-500 sm:inline">
              {admin.email}
            </span>
            <form action={signOut}>
              <button className="rounded-full bg-slate-100 px-3 py-2 text-xs font-bold">Sign out</button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-8">{children}</div>

      <footer className="mx-auto max-w-6xl px-5 pb-10 text-xs text-slate-400">
        {business.name} staff area
      </footer>
    </div>
  );
}