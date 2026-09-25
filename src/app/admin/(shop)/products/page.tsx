import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { formatPrice } from "@/lib/products";

export const dynamic = "force-dynamic";

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  price: number;
  currency: string;
  stock_quantity: number;
  is_published: boolean;
  is_featured: boolean;
  categories: { name: string }[] | null;
  product_images: { image_url: string; is_primary: boolean; sort_order: number }[] | null;
};

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string; updated?: string; deleted?: string; error?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const supabase = getSupabaseAdmin();

  if (!supabase) {
    return (
      <p className="rounded-2xl bg-white p-8 text-slate-600">
        Database not connected yet. Add the service role key to manage products here.
      </p>
    );
  }

  const { data } = await supabase
    .from("products")
    .select("id, name, slug, price, currency, stock_quantity, is_published, is_featured, categories(name), product_images(image_url, is_primary, sort_order)")
    .order("created_at", { ascending: false });

  const products = (data ?? []) as ProductRow[];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="display-font text-4xl font-black">Products</h1>
          <p className="mt-2 text-slate-600">Add, edit and hide what you sell.</p>
        </div>
        <Link href="/admin/products/new" className="rounded-full bg-[#ff6b2c] px-5 py-3 text-sm font-black text-white">
          Add product
        </Link>
      </div>

      {params.created && <p className="mt-5 rounded-xl bg-green-50 p-4 text-sm font-bold text-green-700">Product created.</p>}
      {params.updated && <p className="mt-5 rounded-xl bg-green-50 p-4 text-sm font-bold text-green-700">Product updated.</p>}
      {params.deleted && <p className="mt-5 rounded-xl bg-green-50 p-4 text-sm font-bold text-green-700">Product deleted.</p>}
      {params.error && <p className="mt-5 rounded-xl bg-red-50 p-4 text-sm font-bold text-red-600">Something went wrong. Please check the values and try again.</p>}

      {products.length === 0 && (
        <div className="mt-8 rounded-2xl bg-white p-8">
          <p className="font-black">No products in the database yet.</p>
          <p className="mt-2 text-sm text-slate-600">
            Your shop is currently using the sample product list from the code file. Add your real products here and they will replace it.
          </p>
          <Link href="/admin/products/new" className="mt-5 inline-block rounded-full bg-[#10233f] px-5 py-3 text-sm font-black text-white">
            Add your first product
          </Link>
        </div>
      )}

      <div className="mt-6 space-y-3">
        {products.map((product) => {
          const image =
            product.product_images && product.product_images.length > 0
              ? [...product.product_images].sort((a, b) => Number(b.is_primary) - Number(a.is_primary) || a.sort_order - b.sort_order)[0].image_url
              : null;

          return (
            <div key={product.id} className="flex flex-wrap items-center gap-4 rounded-2xl bg-white p-4">
              {image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={image} alt={product.name} className="h-20 w-20 rounded-xl object-cover" />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-slate-100 text-xs font-black text-slate-400">
                  No photo
                </div>
              )}

              <div className="min-w-0 flex-1">
                <p className="font-black">{product.name}</p>
                <p className="text-xs text-slate-500">
                  {product.categories && product.categories.length > 0 ? product.categories[0].name : "No category"} - Stock {product.stock_quantity}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold">
                    {product.is_published ? "Live" : "Hidden"}
                  </span>
                  {product.is_featured && (
                    <span className="rounded-full bg-orange-100 px-2 py-1 text-[10px] font-bold text-orange-700">Homepage</span>
                  )}
                </div>
              </div>

              <p className="font-black">{formatPrice(Number(product.price), product.currency)}</p>
              <Link href={"/admin/products/" + product.id + "/edit"} className="rounded-full bg-slate-100 px-4 py-2 text-xs font-bold">
                Edit
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}