import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  updateProduct,
} from "../api/products";
import { getApiErrorMessage } from "../api/axios";
import type { Product, ProductCategory, ProductInput } from "../types/product";
import OptimizedImage from "../components/OptimizedImage";

interface ProductListResponse {
  data?: Product[];
  page?: number;
  limit?: number;
  totalPages?: number;
  totalProducts?: number;
}

interface ProductResponse {
  data?: Product;
}

interface ProductFormState {
  name: string;
  category: ProductCategory;
  price: string;
  image: string;
  images: string;
  description: string;
  sizes: string;
  colors: string;
  features: string;
}

type FormMode = "create" | "edit";

const PAGE_SIZE = 12;

const emptyFormState: ProductFormState = {
  name: "",
  category: "men",
  price: "",
  image: "",
  images: "",
  description: "",
  sizes: "",
  colors: "",
  features: "",
};

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const formatCategory = (category: string) =>
  category ? category.charAt(0).toUpperCase() + category.slice(1) : "Unlisted";

const parseList = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const serializeProduct = (formState: ProductFormState): ProductInput => ({
  name: formState.name.trim(),
  category: formState.category,
  price: Number(formState.price),
  image: formState.image.trim(),
  images: parseList(formState.images),
  description: formState.description.trim(),
  sizes: parseList(formState.sizes),
  colors: parseList(formState.colors),
  features: parseList(formState.features),
});

const productToFormState = (product: Product): ProductFormState => ({
  name: product.name,
  category: product.category,
  price: String(product.price),
  image: product.image,
  images: product.images?.join(", ") ?? "",
  description: product.description,
  sizes: product.sizes?.join(", ") ?? "",
  colors: product.colors?.join(", ") ?? "",
  features: product.features?.join(", ") ?? "",
});

const validateForm = (formState: ProductFormState) => {
  const price = Number(formState.price);

  if (!formState.name.trim()) return "Product name is required";
  if (!formState.image.trim()) return "Main image is required";
  if (!formState.description.trim()) return "Description is required";
  if (!Number.isFinite(price) || price < 0) {
    return "Price must be a positive number";
  }

  return "";
};

const ProductImage = ({ product }: { product: Product }) => (
  <OptimizedImage
    src={product.image}
    alt={product.name}
    width={640}
    height={480}
    sizes="(max-width: 768px) calc(100vw - 112px), (max-width: 1280px) calc((100vw - 20rem) / 2), calc((100vw - 24rem) / 4)"
    wrapperClassName="w-full"
  />
);

const ProductTags = ({ label, values }: { label: string; values: string[] }) => (
  <div className="space-y-2">
    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
      {label}
    </p>
    {values.length > 0 ? (
      <div className="flex flex-wrap gap-1.5">
        {values.map((value) => (
          <span
            key={value}
            className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600"
          >
            {value}
          </span>
        ))}
      </div>
    ) : (
      <p className="text-sm text-slate-400">None</p>
    )}
  </div>
);

interface ProductCardProps {
  product: Product;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
}

const ProductCard = ({ product, onDelete, onEdit }: ProductCardProps) => {
  return (
    <article className="group min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:border-blue-100 hover:shadow-xl hover:shadow-slate-200/70">
      <ProductImage product={product} />

      <div className="space-y-4 p-4">
        <div className="min-w-0 space-y-2">
          <div className="flex items-center justify-between gap-3">
            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
              {formatCategory(product.category)}
            </span>
            <span className="shrink-0 text-sm font-semibold text-slate-950">
              {currencyFormatter.format(product.price)}
            </span>
          </div>

          <h2 className="line-clamp-2 min-h-12 text-base font-semibold leading-6 text-slate-950">
            {product.name}
          </h2>
        </div>

        <div className="grid gap-3">
          <ProductTags label="Sizes" values={product.sizes ?? []} />
          <ProductTags label="Colors" values={product.colors ?? []} />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onEdit(product._id)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(product._id)}
            className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-400"
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
};

interface ProductFormModalProps {
  formState: ProductFormState;
  mode: FormMode;
  isSaving: boolean;
  errorMessage: string;
  onChange: (field: keyof ProductFormState, value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}

const ProductFormModal = ({
  formState,
  mode,
  isSaving,
  errorMessage,
  onChange,
  onClose,
  onSubmit,
}: ProductFormModalProps) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6">
    <div className="max-h-full w-full max-w-3xl overflow-y-auto rounded-xl bg-white shadow-2xl">
      <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
        <div>
          <h2 className="text-lg font-bold text-slate-950">
            {mode === "create" ? "Add Product" : "Edit Product"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Use commas for images, sizes, colors, and features.
          </p>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
        >
          Close
        </button>
      </div>

      <form
        className="space-y-5 px-5 py-5"
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        {errorMessage && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
          >
            {errorMessage}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1.5 text-sm font-medium text-slate-700">
            <span>Name</span>
            <input
              value={formState.name}
              onChange={(event) => onChange("name", event.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
            />
          </label>

          <label className="space-y-1.5 text-sm font-medium text-slate-700">
            <span>Category</span>
            <select
              value={formState.category}
              onChange={(event) => onChange("category", event.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
            >
              <option value="men">Men</option>
              <option value="women">Women</option>
              <option value="kids">Kids</option>
            </select>
          </label>

          <label className="space-y-1.5 text-sm font-medium text-slate-700">
            <span>Price</span>
            <input
              type="number"
              min="0"
              value={formState.price}
              onChange={(event) => onChange("price", event.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
            />
          </label>

          <label className="space-y-1.5 text-sm font-medium text-slate-700">
            <span>Main Image URL</span>
            <input
              value={formState.image}
              onChange={(event) => onChange("image", event.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
            />
          </label>
        </div>

        <label className="block space-y-1.5 text-sm font-medium text-slate-700">
          <span>Gallery Images</span>
          <input
            value={formState.images}
            onChange={(event) => onChange("images", event.target.value)}
            placeholder="https://image-one, https://image-two"
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
          />
        </label>

        <label className="block space-y-1.5 text-sm font-medium text-slate-700">
          <span>Description</span>
          <textarea
            value={formState.description}
            onChange={(event) => onChange("description", event.target.value)}
            rows={4}
            className="w-full resize-y rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
          />
        </label>

        <div className="grid gap-4 md:grid-cols-3">
          <label className="space-y-1.5 text-sm font-medium text-slate-700">
            <span>Sizes</span>
            <input
              value={formState.sizes}
              onChange={(event) => onChange("sizes", event.target.value)}
              placeholder="S, M, L, XL"
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
            />
          </label>

          <label className="space-y-1.5 text-sm font-medium text-slate-700">
            <span>Colors</span>
            <input
              value={formState.colors}
              onChange={(event) => onChange("colors", event.target.value)}
              placeholder="Black, White, Navy Blue"
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
            />
          </label>

          <label className="space-y-1.5 text-sm font-medium text-slate-700">
            <span>Features</span>
            <input
              value={formState.features}
              onChange={(event) => onChange("features", event.target.value)}
              placeholder="Soft, Comfortable"
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
            />
          </label>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving
              ? "Saving..."
              : mode === "create"
                ? "Create Product"
                : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  </div>
);

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [formErrorMessage, setFormErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [formMode, setFormMode] = useState<FormMode>("create");
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [formState, setFormState] = useState<ProductFormState>(emptyFormState);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const fetchProducts = useCallback(async () => {
    setErrorMessage("");
    setIsLoading(true);

    try {
      const response = (await getProducts({
        page,
        limit: PAGE_SIZE,
        search: search.trim() || undefined,
      })) as ProductListResponse;

      setProducts(
        Array.isArray(response.data)
          ? response.data.map((product) => ({
              ...product,
              images: product.images ?? [],
              sizes: product.sizes ?? [],
              colors: product.colors ?? [],
              features: product.features ?? [],
            }))
          : []
      );
      setTotalPages(Math.max(1, response.totalPages ?? 1));
      setTotalProducts(response.totalProducts ?? 0);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    void fetchProducts();
  }, [fetchProducts]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm("Delete this product?");

    if (!confirmDelete) return;

    setErrorMessage("");
    setSuccessMessage("");

    try {
      await deleteProduct(id);
      setSuccessMessage("Product deleted successfully");
      await fetchProducts();
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
    }
  };

  const openCreateForm = () => {
    setFormMode("create");
    setEditingProductId(null);
    setFormState(emptyFormState);
    setFormErrorMessage("");
    setIsFormOpen(true);
  };

  const openEditForm = async (id: string) => {
    setFormMode("edit");
    setEditingProductId(id);
    setFormErrorMessage("");
    setErrorMessage("");
    setIsSaving(true);

    try {
      const response = (await getProductById(id)) as ProductResponse;

      if (!response.data) {
        setErrorMessage("Product not found");
        return;
      }

      setFormState(
        productToFormState({
          ...response.data,
          images: response.data.images ?? [],
          sizes: response.data.sizes ?? [],
          colors: response.data.colors ?? [],
          features: response.data.features ?? [],
        })
      );
      setIsFormOpen(true);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  const closeForm = () => {
    if (isSaving) return;

    setIsFormOpen(false);
    setFormErrorMessage("");
  };

  const updateFormField = (field: keyof ProductFormState, value: string) => {
    setFormState((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    const validationMessage = validateForm(formState);

    if (validationMessage) {
      setFormErrorMessage(validationMessage);
      return;
    }

    setIsSaving(true);
    setFormErrorMessage("");
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const payload = serializeProduct(formState);

      if (formMode === "create") {
        await createProduct(payload);
        setSuccessMessage("Product created successfully");
      } else if (editingProductId) {
        await updateProduct(editingProductId, payload);
        setSuccessMessage("Product updated successfully");
      }

      setIsFormOpen(false);
      await fetchProducts();
    } catch (error) {
      setFormErrorMessage(getApiErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  const visibleProducts = useMemo(() => products, [products]);

  const canGoPrevious = page > 1 && !isLoading;
  const canGoNext = page < totalPages && !isLoading;

  return (
    <section className="min-w-0 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            Products
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {totalProducts} products in the catalog
          </p>
        </div>

        <button
          onClick={openCreateForm}
          className="inline-flex shrink-0 items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400"
        >
          Add Product
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <label htmlFor="product-search" className="sr-only">
          Search products
        </label>
        <input
          id="product-search"
          type="search"
          placeholder="Search products by name or category..."
          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
          value={search}
          onChange={(event) => handleSearchChange(event.target.value)}
        />
      </div>

      {successMessage && (
        <div
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700"
        >
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
        >
          {errorMessage}
        </div>
      )}

      {isLoading ? (
        <div className="grid min-w-0 grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="aspect-[4/3] animate-pulse bg-slate-200" />
              <div className="space-y-3 p-4">
                <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
                <div className="h-5 w-full animate-pulse rounded bg-slate-200" />
                <div className="grid grid-cols-2 gap-2">
                  <div className="h-9 animate-pulse rounded bg-slate-200" />
                  <div className="h-9 animate-pulse rounded bg-slate-200" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : visibleProducts.length > 0 ? (
        <div className="grid min-w-0 grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          {visibleProducts.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onDelete={handleDelete}
              onEdit={openEditForm}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center shadow-sm">
          <h2 className="text-base font-semibold text-slate-950">
            No products found
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Try a different search or move to another page.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-medium text-slate-600">
          Page <span className="text-slate-950">{page}</span> of{" "}
          <span className="text-slate-950">{totalPages}</span>
        </p>

        <div className="grid grid-cols-2 gap-2 sm:flex">
          <button
            onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
            disabled={!canGoPrevious}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() =>
              setPage((currentPage) => Math.min(totalPages, currentPage + 1))
            }
            disabled={!canGoNext}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {isFormOpen && (
        <ProductFormModal
          formState={formState}
          mode={formMode}
          isSaving={isSaving}
          errorMessage={formErrorMessage}
          onChange={updateFormField}
          onClose={closeForm}
          onSubmit={handleSubmit}
        />
      )}
    </section>
  );
};

export default Products;
