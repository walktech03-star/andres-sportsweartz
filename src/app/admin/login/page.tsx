import Link from "next/link";
import { signIn } from "@/app/admin/actions";
import { BrandLogo } from "@/components/brand-logo";
import { business } from "@/lib/business";

// The admin login page. It is deliberately plain, large-button and easy to use
// on a phone, because the owner will mostly use it from a phone.
export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  const message =
    error === "not_configured"
      ? "The database connection is not finished yet. See the guide below."
      : error === "invalid"
        ? "That email address and password did not match. Please try again."
        : error === "not_allowed"
          ? "This account is signed in, but it is not on the staff allow list. Please ask the owner to add it."
          : null;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f8fa] px-5 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <BrandLogo href="/" />
        </div>

        <div className="rounded-2xl bg-white p-7 shadow-sm">
          <h1 className="display-font text-3xl font-black">Staff sign in</h1>
          <p className="mt-2 text-sm text-slate-500">
            Only approved staff accounts can open this area.
          </p>

          {message && (
            <p className="mt-5 rounded-xl bg-red-50 p-4 text-sm font-bold text-red-600">{message}</p>
          )}

          <form action={signIn} className="mt-6 space-y-4">
            <label className="block text-sm font-bold">
              Email address
              <input
                required
                name="email"
                type="email"
                autoComplete="username"
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-[#1769e0]"
                placeholder="you@example.com"
              />
            </label>

            <label className="block text-sm font-bold">
              Password
              <input
                required
                name="password"
                type="password"
                autoComplete="current-password"
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-[#1769e0]"
                placeholder="Your password"
              />
            </label>

            <button className="w-full rounded-full bg-[#10233f] px-6 py-4 text-sm font-black text-white">
              Sign in
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          {business.name} staff area
        </p>
        <p className="mt-2 text-center text-sm">
          <Link href="/" className="font-bold text-[#1769e0]">
            Back to the shop
          </Link>
        </p>
      </div>
    </main>
  );
}
