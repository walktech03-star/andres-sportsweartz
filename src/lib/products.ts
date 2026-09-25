// =============================================================================
// PRODUCTS - THIS IS THE FILE YOU EDIT TO ADD YOUR PRODUCTS
// =============================================================================
// HOW TO ADD A NEW PRODUCT
//   1. Copy an existing line in the list below, including the surrounding { }.
//   2. Paste it as a new line inside the [ ] brackets.
//   3. Change the values to match your new product.
//   4. Save this file. The website updates immediately.
//
//   Example line:
//   { slug: "red-football-boots", name: "Red Football Boots", category: "Sports shoes",
//     price: 95000, description: "Lightweight boots for firm ground.",
//     sizes: ["39", "40", "41"], accentColor: "#dc2626", imageUrl: null,
//     badge: "New", isFeatured: true },
//
// WHAT EACH VALUE MEANS
//   slug        Short web address. Lowercase, hyphens only, must be unique.
//   name        The product name customers see.
//   category    Must match one of: Sports shoes, Training kits, Sportswear, Accessories.
//   price       A number only, no commas and no "TZS". Example: 85000
//   description One or two clear sentences.
//   sizes       Your available sizes, inside [ ] and separated by commas.
//   accentColor Background colour used when there is no photo. Any hex colour.
//   imageUrl    Product photo address, OR null for no photo yet.
//   badge       Small label like "New" or "Best seller", OR null for none.
//   isFeatured  true to show it on the homepage, false to hide it there.
//
// HOW TO ADD A PRODUCT PHOTO
//   Put your photo in the folder:  public/products
//   Then set imageUrl to "/products/your-file-name.jpg"
//   Example:  imageUrl: "/products/red-football-boots.jpg"
//
// ABOUT THE DATABASE
//   The list below is used when no database is connected, which is the current
//   setup. If a Supabase database is connected later, products are read from
//   there instead and this list is only used as a backup.
// =============================================================================

export type Product = {
  slug: string;
  name: string;
  category: string;
  price: number;
  description: string;
  sizes: string[];
  // Used as the background of the product artwork, and as the fallback look
  // when a product has no photo yet.
  accentColor: string;
  // Real product photo. Null means "no photo uploaded yet".
  imageUrl: string | null;
  badge: string | null;
  isFeatured: boolean;
};

export const categories = ["All", "Sports shoes", "Training kits", "Sportswear", "Accessories"];

export const fallbackProducts: Product[] = [
  { slug: "velocity-runner", name: "Velocity Runner", category: "Sports shoes", price: 85000, description: "Lightweight everyday trainers with responsive cushioning for road runs, gym sessions and active days.", sizes: ["39", "40", "41", "42", "43", "44"], accentColor: "#1769e0", imageUrl: null, badge: "Best seller", isFeatured: true },
  { slug: "pro-training-set", name: "Pro Training Set", category: "Training kits", price: 65000, description: "A breathable training kit made for movement, with a comfortable athletic cut and durable finish.", sizes: ["S", "M", "L", "XL", "XXL"], accentColor: "#ea580c", imageUrl: null, badge: "New arrival", isFeatured: true },
  { slug: "core-performance-tee", name: "Core Performance Tee", category: "Sportswear", price: 32000, description: "A versatile performance tee that keeps you comfortable through warm-ups, workouts and weekends.", sizes: ["S", "M", "L", "XL"], accentColor: "#334155", imageUrl: null, badge: "Popular", isFeatured: true },
  { slug: "match-day-shorts", name: "Match Day Shorts", category: "Sportswear", price: 28000, description: "Flexible training shorts with an easy fit for football, running and court sessions.", sizes: ["S", "M", "L", "XL"], accentColor: "#0891b2", imageUrl: null, badge: null, isFeatured: false },
  { slug: "everyday-sports-socks", name: "Everyday Sports Socks", category: "Accessories", price: 12000, description: "Comfortable, supportive sports socks for training and everyday movement.", sizes: ["39-42", "43-46"], accentColor: "#059669", imageUrl: null, badge: null, isFeatured: false },
  { slug: "street-training-hoodie", name: "Street Training Hoodie", category: "Training kits", price: 72000, description: "A warm, clean-layer hoodie for early starts, travel and post-training recovery.", sizes: ["M", "L", "XL", "XXL"], accentColor: "#7c3aed", imageUrl: null, badge: null, isFeatured: false },
];

// Formats a number as Tanzanian Shillings, for example 85000 -> TZS 85,000
export function formatPrice(price: number, currency = "TZS") {
  return `${currency} ${price.toLocaleString("en-TZ")}`;
}

// Used by the fallback catalogue only. The repository has its own lookup.
export function getLocalProduct(slug: string) {
  return fallbackProducts.find((product) => product.slug === slug);
}