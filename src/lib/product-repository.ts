import "server-only";
import { fallbackProducts, type Product } from "@/lib/products";
import { getSupabaseAdmin, isDatabaseConfigured } from "@/lib/supabase-admin";

// =============================================================================
// PRODUCT REPOSITORY (server only)
// =============================================================================
// This is the single place where the website reads products.
//
// It reads from your Supabase database when it is configured. If the database
// is not ready yet, or a query fails, it falls back to the bundled catalogue so
// the shop never shows a broken page to a customer.
// =============================================================================

type ImageRow = { image_url: string; is_primary: boolean; sort_order: number };
type VariantRow = { variant_name: string; variant_type: string; is_available: boolean };

type ProductRow = {
  slug: string;
  name: string;
  short_description: string | null;
  description: string | null;
  price: number | string;
  accent_color: string | null;
  badge: string | null;
  is_featured: boolean;
  categories: { name: string } | { name: string }[] | null;
  product_images: ImageRow[] | null;
  product_variants: VariantRow[] | null;
};

const DEFAULT_ACCENT = "#1769e0";

// Sizes should always appear in a sensible order, not a random database order.
const SIZE_ORDER = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "3XL"];

function sortSizes(sizes: string[]): string[] {
  return [...sizes].sort((a, b) => {
    const aNumber = Number(a);
    const bNumber = Number(b);

    if (!Number.isNaN(aNumber) && !Number.isNaN(bNumber)) return aNumber - bNumber;

    const aIndex = SIZE_ORDER.indexOf(a.toUpperCase());
    const bIndex = SIZE_ORDER.indexOf(b.toUpperCase());
    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;

    return a.localeCompare(b);
  });
}

function categoryName(value: ProductRow["categories"]): string {
  if (!value) return "Sportswear";
  if (Array.isArray(value)) return value[0]?.name ?? "Sportswear";
  return value.name ?? "Sportswear";
}

function primaryImage(images: ImageRow[] | null): string | null {
  if (!images || images.length === 0) return null;
  const sorted = [...images].sort((a, b) => Number(b.is_primary) - Number(a.is_primary) || a.sort_order - b.sort_order);
  return sorted[0]?.image_url ?? null;
}

function mapRow(row: ProductRow): Product {
  const variants = row.product_variants ?? [];
  const sizes = sortSizes(
    variants.filter((variant) => variant.is_available).map((variant) => variant.variant_name)
  );

  return {
    slug: row.slug,
    name: row.name,
    category: categoryName(row.categories),
    price: Number(row.price),
    description: row.description ?? row.short_description ?? "",
    sizes,
    accentColor: row.accent_color ?? DEFAULT_ACCENT,
    imageUrl: primaryImage(row.product_images),
    badge: row.badge,
    isFeatured: row.is_featured,
  };
}

export async function getPublishedProducts(): Promise<Product[]> {
  if (!isDatabaseConfigured) return fallbackProducts;

  const supabase = getSupabaseAdmin();
  if (!supabase) return fallbackProducts;

  try {
    const { data, error } = await supabase
      .from("products")
      .select(
        "slug, name, short_description, description, price, accent_color, badge, is_featured, categories ( name ), product_images ( image_url, is_primary, sort_order ), product_variants ( variant_name, variant_type, is_available )"
      )
      .eq("is_published", true)
      .order("is_featured", { ascending: false })
      .order("name", { ascending: true });

    if (error) throw error;

    const mapped = ((data ?? []) as unknown as ProductRow[]).map(mapRow);

    // If the database has no products yet, show the starter catalogue so the
    // shop is never empty while the owner is still adding stock.
    if (mapped.length === 0) return fallbackProducts;

    return mapped;
  } catch (error) {
    console.error("Could not read products from Supabase, using the fallback catalogue:", error);
    return fallbackProducts;
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const all = await getPublishedProducts();
  return all.find((product) => product.slug === slug) ?? null;
}

export async function getFeaturedProducts(limit = 3): Promise<Product[]> {
  const all = await getPublishedProducts();
  const featured = all.filter((product) => product.isFeatured);
  return (featured.length > 0 ? featured : all).slice(0, limit);
}