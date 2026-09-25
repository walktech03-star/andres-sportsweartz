import { ProductForm } from "@/components/admin-product-form";
import { requireAdmin } from "@/lib/admin";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  await requireAdmin();
  const supabase = getSupabaseAdmin();

  const { data: categoryRows } = supabase
    ? await supabase.from("categories").select("id, name").eq("is_active", true).order("sort_order")
    : { data: null };

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="display-font text-4xl font-black">Add product</h1>
      <p className="mt-2 text-slate-600">Fill in what you sell. You can change it any time.</p>

      <div className="mt-6">
        <ProductForm
          categories={(categoryRows ?? []) as { id: string; name: string }[]}
          product={{
            name: "",
            slug: "",
            category_id: null,
            short_description: null,
            description: null,
            price: 0,
            stock_quantity: 0,
            accent_color: "#1769e0",
            badge: null,
            is_featured: false,
            is_published: true,
            imageUrl: null,
            sizes: [],
          }}
        />
      </div>
    </div>
  );
}