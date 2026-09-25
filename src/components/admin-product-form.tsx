import { createProduct, updateProduct } from "@/app/admin/actions";

export type CategoryOption = { id: string; name: string };

export type ProductFormValues = {
  id?: string;
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
  imageUrl: string | null;
  sizes: string[];
};

const field = "mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-[#1769e0]";
const label = "block text-sm font-bold";

// A plain form that works without any extra browser JavaScript, so it stays
// fast and reliable on a phone with a poor connection.
export function ProductForm({
  product,
  categories,
}: {
  product: ProductFormValues;
  categories: CategoryOption[];
}) {
  const isEdit = Boolean(product.id);
  const action = isEdit ? updateProduct : createProduct;

  return (
    <form action={action} className="space-y-6">
      {product.id && <input type="hidden" name="id" value={product.id} />}

      <div className="rounded-2xl bg-white p-6">
        <h2 className="font-black">Basics</h2>

        <label className={label + " mt-4"}>
          Product name
          <input required name="name" defaultValue={product.name} className={field} placeholder="Velocity Runner" />
        </label>

        <label className={label + " mt-4"}>
          Web address (slug)
          <input name="slug" defaultValue={product.slug} className={field} placeholder="velocity-runner" />
          <span className="mt-1 block text-xs font-normal text-slate-500">
            Leave blank to generate it from the name. Lowercase letters, numbers and hyphens only.
          </span>
        </label>

        <label className={label + " mt-4"}>
          Category
          <select name="category_id" defaultValue={product.category_id ?? ""} className={field}>
            <option value="">No category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>

        <label className={label + " mt-4"}>
          Short description
          <input
            name="short_description"
            defaultValue={product.short_description ?? ""}
            maxLength={200}
            className={field}
            placeholder="One short line for product cards"
          />
        </label>

        <label className={label + " mt-4"}>
          Full description
          <textarea name="description" rows={5} defaultValue={product.description ?? ""} className={field} />
        </label>
      </div>

      <div className="rounded-2xl bg-white p-6">
        <h2 className="font-black">Price, sizes and stock</h2>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className={label}>
            Price (TZS)
            <input
              required
              name="price"
              type="number"
              min="0"
              step="1"
              defaultValue={product.price}
              className={field}
              placeholder="85000"
            />
          </label>

          <label className={label}>
            Stock quantity
            <input
              required
              name="stock_quantity"
              type="number"
              min="0"
              step="1"
              defaultValue={product.stock_quantity}
              className={field}
              placeholder="10"
            />
          </label>
        </div>

        <label className={label + " mt-4"}>
          Available sizes
          <input
            name="sizes"
            defaultValue={product.sizes.join(", ")}
            className={field}
            placeholder="39, 40, 41, 42, 43"
          />
          <span className="mt-1 block text-xs font-normal text-slate-500">
            Separate sizes with commas. Replacing these saves the new list.
          </span>
        </label>
      </div>

      <div className="rounded-2xl bg-white p-6">
        <h2 className="font-black">Photo and appearance</h2>

        {product.imageUrl && (
          <div className="mt-4 flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={product.imageUrl} alt="Current product photo" className="h-24 w-24 rounded-xl object-cover" />
            <p className="text-xs text-slate-500">Upload a new photo below to replace this one.</p>
          </div>
        )}

        <label className={label + " mt-4"}>
          Product photo
          <input
            name="image"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="mt-2 w-full text-sm"
          />
          <span className="mt-1 block text-xs font-normal text-slate-500">
            JPG, PNG, WEBP or AVIF. Maximum 5 MB. Square photos around 1200 x 1200 pixels look best.
          </span>
        </label>

        <label className={label + " mt-4"}>
          Background colour (used when there is no photo)
          <input name="accent_color" defaultValue={product.accent_color ?? "#1769e0"} className={field} placeholder="#1769e0" />
        </label>

        <label className={label + " mt-4"}>
          Small label
          <input name="badge" defaultValue={product.badge ?? ""} maxLength={40} className={field} placeholder="New, Best seller..." />
        </label>
      </div>

      <div className="rounded-2xl bg-white p-6">
        <h2 className="font-black">Visibility</h2>

        <label className="mt-4 flex items-center gap-3 text-sm font-bold">
          <input name="is_published" type="checkbox" defaultChecked={product.is_published} className="h-5 w-5" />
          Show this product on the shop
        </label>

        <label className="mt-3 flex items-center gap-3 text-sm font-bold">
          <input name="is_featured" type="checkbox" defaultChecked={product.is_featured} className="h-5 w-5" />
          Show on the homepage
        </label>
      </div>

      <button className="w-full rounded-full bg-[#10233f] px-6 py-4 text-sm font-black text-white">
        {isEdit ? "Save changes" : "Create product"}
      </button>
    </form>
  );
}