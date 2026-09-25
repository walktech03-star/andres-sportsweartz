import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteProduct } from "@/app/admin/actions";
import { ProductForm } from "@/components/admin-product-form";
import { requireAdmin } from "@/lib/admin";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  category_id: string | null;
  short_description: string | null;
  description: string | null;
  price: number;
  stock_quantity: number;
  accent_color: string | null;
  badge: string | null;
  is_featured: boolean;
  is_published: boolean;
};

export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const { error } = await searchParams;
  const supabase = getSupabaseAdmin();

  if (!supabase) {
    return <p className="rounded-2xl bg-white p-8 text-slate-600">Database not connected yet.</p>;
  }

  const { data: product } = (await supabase
    .from("products")
    .select("id, name, slug, category_id, short_description, description, price, stock_quantity, accent_color, badge, is_featured, is_published")
    .eq("id", id)
    .maybeSingle()) as { data: ProductRow | null };

  if (!product) notFound();

  const [{ data: categoryRows }, { data: variantRows }, { data: imageRows }] = await Promise.all([
    supabase.from("categories").select("id, name").eq("is_active", true).order("sort_order"),
    supabase.from("product_variants").select("variant_name").eq("product_id", id).eq("variant_type", "size"),
    supabase.from("product_images").select("image_url").eq("product_id", id).order("sort_order"),
  ]);

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/admin/products" className="text-sm font-bold text-[#1769e0]">
        Back to products
      </Link>

      <h1 className="display-font mt-3 text-4xl font-black">Edit product</h1>
      <p className="mt-2 text-slate-600">{product.name}</p>

      {error === "image_failed" && (
        <p className="mt-5 rounded-xl bg-red-50 p-4 text-sm font-bold text-red-600">
          The product was saved, but the photo could not be uploaded. Please try a JPG or PNG under 5 MB.
        </p>
      )}

      <div className="mt-6">
        <ProductForm
          categories={(categoryRows ?? []) as { id: string; name: string }[]}
          product={{
            id: product.id,
            name: product.name,
            slug: product.slug,
            category_id: product.category_id,
            short_description: product.short_description,
            description: product.description,
            price: Number(product.price),
            stock_quantity: product.stock_quantity,
            accent_color: product.accent_color,
            badge: product.badge,
            is_featured: product.is_featured,
            is_published: product.is_published,
            imageUrl: imageRows && imageRows.length > 0 ? imageRows[0].image_url : null,
            sizes: (variantRows ?? []).map((variant) => variant.variant_name),
          }}
        />
      </div>

      <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6">
        <h2 className="font-black text-red-700">Delete this product</h2>
        <p className="mt-2 text-sm text-red-700">
          This removes the product from the shop. Past orders keep their own copy of the product
          name and price, so your order history is not affected.
        </p>
        <form action={deleteProduct} className="mt-4">
          <input type="hidden" name="id" value={product.id} />
          <button className="rounded-full bg-red-600 px-5 py-3 text-sm font-black text-white">
            Delete permanently
          </button>
        </form>
      </div>
    </div>
  );
}