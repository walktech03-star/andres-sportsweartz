// =============================================================================
// QR CAMPAIGNS - ANDRES SPORTSWEARTZ
// =============================================================================
// Every QR code printed on a flyer, jersey tag or school poster points to
//   https://<site>/r/<code>
// instead of pointing at the page directly. The /r route records the scan
// (when the database is connected) and then redirects the visitor.
//
// That is what makes scans measurable per campaign: website vs schools vs
// football vs WhatsApp vs individual products.
//
// The browser NEVER draws QR pixels itself. The QR image comes from a free
// QR image service, so no new npm package is needed.
// =============================================================================

import { business } from "@/lib/business";

export type QrSegment = "general" | "schools" | "football" | "whatsapp" | "product" | "custom";

export const QR_SEGMENTS: { value: QrSegment; label: string }[] = [
  { value: "general", label: "General website" },
  { value: "schools", label: "Schools & academies" },
  { value: "football", label: "Football products" },
  { value: "whatsapp", label: "Direct WhatsApp" },
  { value: "product", label: "Product page" },
  { value: "custom", label: "Custom" },
];

export type BuiltInCampaign = {
  code: string;
  name: string;
  segment: QrSegment;
  targetPath: string;
  description: string;
};

export const BUILT_IN_CAMPAIGNS: BuiltInCampaign[] = [
  {
    code: "website",
    name: "General website",
    segment: "general",
    targetPath: "/",
    description: "Main shop front. Print on bags, receipts and general flyers.",
  },
  {
    code: "schools",
    name: "Schools & academies",
    segment: "schools",
    targetPath: "/shop",
    description: "For school and academy team-kit offers and bulk orders.",
  },
  {
    code: "football",
    name: "Football products",
    segment: "football",
    targetPath: "/shop",
    description: "For jerseys, boots and match-day gear posters.",
  },
  {
    code: "whatsapp",
    name: "Direct WhatsApp",
    segment: "whatsapp",
    targetPath: "/shop",
    description: "Opens a WhatsApp chat with ANDRES SPORTSWEARTZ directly.",
  },
];

export function productQrCode(slug: string): string {
  return `product-${slug}`;
}

/** Public landing URL encoded inside the QR picture, e.g. .../r/schools */
export function qrLandingUrl(code: string): string {
  const base = business.siteUrl.replace(/\/+$/, "");
  return `${base}/r/${encodeURIComponent(code)}`;
}

/** QR picture URL. Rendered as a normal <img>, no library needed. */
export function qrImageUrl(data: string, size = 220): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=8&data=${encodeURIComponent(data)}`;
}

export function segmentLabel(segment: string): string {
  return QR_SEGMENTS.find((item) => item.value === segment)?.label ?? segment;
}

