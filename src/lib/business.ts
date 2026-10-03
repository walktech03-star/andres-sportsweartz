// Configurable business details.
//
// These values are PUBLIC information (phone number, address, social links),
// so it is safe for them to be visible in the browser. Secret keys must NEVER
// be added to this file. Secrets belong in server-only environment variables
// such as SUPABASE_SERVICE_ROLE_KEY.
//
// To change these values, edit the .env.local file in the project root.

export const business = {
  name: process.env.NEXT_PUBLIC_BUSINESS_NAME ?? "Andres Sportsweartz",
  shortName: "Andres",
  tagline: "Move with confidence.",
  siteUrl: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://andres-sportsweartz.vercel.app").replace(/\/+$/, ""),
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "255627546360",
  phoneNumber: process.env.NEXT_PUBLIC_PHONE_NUMBER ?? "",
  currency: process.env.NEXT_PUBLIC_CURRENCY ?? "TZS",
  address: process.env.NEXT_PUBLIC_BUSINESS_ADDRESS ?? "",
  hours: process.env.NEXT_PUBLIC_BUSINESS_HOURS ?? "",
  deliveryInformation: process.env.NEXT_PUBLIC_DELIVERY_INFORMATION ?? "Delivery details are confirmed with you after we receive your order.",
  instagramUrl: process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? "",
  facebookUrl: process.env.NEXT_PUBLIC_FACEBOOK_URL ?? "",
  tiktokUrl: process.env.NEXT_PUBLIC_TIKTOK_URL ?? "",
};

// Turns a phone number such as "+255 700 000 000" into the digits-only form
// that WhatsApp click-to-chat links require.
export function whatsappDigits() {
  return business.whatsappNumber.replace(/[^0-9]/g, "");
}

// Builds a WhatsApp link with a ready-to-send message.
export function whatsappLink(message: string) {
  return `https://wa.me/${whatsappDigits()}?text=${encodeURIComponent(message)}`;
}