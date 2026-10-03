import { NextResponse } from "next/server";
import { business, whatsappLink } from "@/lib/business";
import { getSupabaseAdmin, isDatabaseConfigured } from "@/lib/supabase-admin";

// =============================================================================
// GET /r/:code  (QR + campaign tracker)
// =============================================================================
// Every printed QR points here, never at the page directly. We record the
// scan (when the database is configured) and then redirect:
//
//   /r/website   -> /
//   /r/schools   -> /shop (+ campaign remembered for the order form)
//   /r/football  -> /shop
//   /r/whatsapp  -> WhatsApp chat directly
//   /r/product-<slug> -> /products/<slug>
//   unknown code -> /
//
// The campaign is also stored in a cookie (qr_campaign, 7 days) so a later
// order can be attributed to the flyer that brought the customer.
// =============================================================================

const BUILT_IN_TARGETS: Record<string, string> = {
  website: "/",
  schools: "/shop",
  football: "/shop",
};

function resolveTarget(code: string): string {
  if (code in BUILT_IN_TARGETS) return BUILT_IN_TARGETS[code];

  if (code === "whatsapp") {
    return whatsappLink("Hello ANDRES SPORTSWEARTZ, I scanned your QR code and I would like to know more.");
  }

  if (code.startsWith("product-")) {
    const slug = code.slice("product-".length);
    if (/^[a-z0-9-]+$/.test(slug)) return `/products/${slug}`;
  }

  return "/";
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const clean = (code || "").trim().slice(0, 80) || "unknown";
  const target = resolveTarget(clean);

  const response = NextResponse.redirect(new URL(target, request.url), 302);

  // Remember the campaign for up to 7 days so a later checkout can be
  // attributed to it. HttpOnly is unnecessary here - the value is not secret.
  response.cookies.set("qr_campaign", clean, {
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
    sameSite: "lax",
  });

  // Best-effort scan logging. Tracking must never break the redirect, so
  // every failure is swallowed silently.
  try {
    if (isDatabaseConfigured) {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        const url = new URL(request.url);
        const userAgent = request.headers.get("user-agent")?.slice(0, 300) ?? null;
        const referrer = request.headers.get("referer")?.slice(0, 500) ?? null;
        await supabase.from("qr_scans").insert({
          campaign_code: clean,
          target_path: target.slice(0, 500),
          user_agent: userAgent,
          referrer,
          utm_source: url.searchParams.get("utm_source")?.slice(0, 100) ?? null,
          utm_medium: url.searchParams.get("utm_medium")?.slice(0, 100) ?? null,
          utm_campaign: url.searchParams.get("utm_campaign")?.slice(0, 100) ?? null,
        });
        await supabase.rpc("increment_qr_scan", { p_code: clean }).then(
          () => undefined,
          () => undefined
        );
      }
    }
  } catch {
    // Scan logging is analytics only - never block the customer.
  }

  return response;
}

// Keep a canonical site URL helper next to the tracker.
export function siteBase(): string {
  return business.siteUrl;
}

