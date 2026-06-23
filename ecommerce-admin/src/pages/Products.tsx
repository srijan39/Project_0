import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  updateProduct,
} from "../api/products";
import { uploadImage } from "../api/upload";
import { getApiErrorMessage } from "../api/axios";
import type { Product, ProductCategory, ProductInput } from "../types/product";
import OptimizedImage from "../components/OptimizedImage";
import {
  calculateDiscountPercentage,
  normalizeProductPricing,
} from "../utils/pricing";

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

interface ProductVariantFormItem {
  size: string;
  color: string;
  stock: string;
}

interface ProductFormState {
  name: string;
  category: ProductCategory;
  actualPrice: string;
  sellingPrice: string;
  image: string;
  images: string[];
  description: string;
  features: string;
  variants: ProductVariantFormItem[];
}

type FormMode = "create" | "edit";

const PAGE_SIZE = 12;

const emptyFormState: ProductFormState = {
  name: "",
  category: "men",
  actualPrice: "",
  sellingPrice: "",
  image: "",
  images: [],
  description: "",
  features: "",
  variants: [],
};

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const formatCategory = (category: string) =>
  category ? category.charAt(0).toUpperCase() + category.slice(1) : "Unlisted";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const parseList = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const serializeProduct = (formState: ProductFormState): ProductInput => ({
  name: formState.name.trim(),
  category: formState.category,
  price: Number(formState.sellingPrice),
  actualPrice: Number(formState.actualPrice),
  sellingPrice: Number(formState.sellingPrice),
  image: formState.image.trim(),
  images: formState.images,
  description: formState.description.trim(),
  sizes: [...new Set(formState.variants.map((v) => v.size.trim()).filter(Boolean))],
  colors: [...new Set(formState.variants.map((v) => v.color.trim()).filter(Boolean))],
  features: parseList(formState.features),
  variants: formState.variants.map((v) => ({
    size: v.size.trim(),
    color: v.color.trim(),
    stock: Math.max(0, Math.round(Number(v.stock) || 0)),
  })),
});

const productToFormState = (product: Product): ProductFormState => {
  const pricing = normalizeProductPricing(product);

  return {
    name: product.name,
    category: product.category,
    actualPrice: String(pricing.actualPrice),
    sellingPrice: String(pricing.sellingPrice),
    image: product.image,
    images: product.images ?? [],
    description: product.description,
    features: product.features?.join(", ") ?? "",
    variants: (product.variants ?? []).map((v) => ({
      size: v.size,
      color: v.color,
      stock: String(v.stock),
    })),
  };
};

const validateForm = (formState: ProductFormState) => {
  const actualPrice = Number(formState.actualPrice);
  const sellingPrice = Number(formState.sellingPrice);

  if (!formState.name.trim()) return "Product name is required";
  if (!formState.image.trim()) return "Main image is required";
  if (!formState.description.trim()) return "Description is required";
  if (!Number.isFinite(actualPrice) || actualPrice <= 0) {
    return "Original price must be greater than 0";
  }
  if (!Number.isFinite(sellingPrice) || sellingPrice <= 0) {
    return "Selling price must be greater than 0";
  }
  if (sellingPrice > actualPrice) {
    return "Selling price cannot exceed original price";
  }

  for (const variant of formState.variants) {
    const stock = Number(variant.stock);
    if (!Number.isFinite(stock) || stock < 0) {
      return "All variant stock values must be 0 or greater";
    }
  }

  return "";
};

const getFormPricingPreview = (formState: ProductFormState) => {
  const actualPrice = Number(formState.actualPrice);
  const sellingPrice = Number(formState.sellingPrice);
  const canCalculate =
    Number.isFinite(actualPrice) &&
    Number.isFinite(sellingPrice) &&
    actualPrice > 0 &&
    sellingPrice > 0 &&
    sellingPrice <= actualPrice;

  return {
    actualPrice,
    sellingPrice,
    discountPercentage: canCalculate
      ? calculateDiscountPercentage(actualPrice, sellingPrice)
      : 0,
    canCalculate,
  };
};

const validateImageFile = (file: File) => {
  if (!file.type.startsWith("image/")) {
    return `${file.name} is not a supported image file.`;
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return `${file.name} is larger than 5 MB.`;
  }

  return "";
};

const normalizeProduct = (product: Product): Product => ({
  ...product,
  ...normalizeProductPricing(product),
  images: product.images ?? [],
  sizes: product.sizes ?? [],
  colors: product.colors ?? [],
  features: product.features ?? [],
  variants: product.variants ?? [],
});

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
  const pricing = normalizeProductPricing(product);
  const hasDiscount = pricing.discountPercentage > 0;

  return (
    <article className="group min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:border-blue-100 hover:shadow-xl hover:shadow-slate-200/70">
      <ProductImage product={product} />

      <div className="space-y-4 p-4">
        <div className="min-w-0 space-y-2">
          <div className="flex items-center justify-between gap-3">
            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
              {formatCategory(product.category)}
            </span>
            <div className="shrink-0 text-right">
              <p className="text-sm font-semibold text-slate-950">
                {currencyFormatter.format(pricing.sellingPrice)}
              </p>
              {hasDiscount && (
                <p className="text-xs font-medium text-slate-400 line-through">
                  {currencyFormatter.format(pricing.actualPrice)}
                </p>
              )}
            </div>
          </div>

          {hasDiscount && (
            <p className="text-xs font-semibold text-emerald-600">
              {pricing.discountPercentage}% OFF
            </p>
          )}

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
  isUploading: boolean;
  uploadMessage: string;
  errorMessage: string;
  onChange: (field: keyof ProductFormState, value: string) => void;
  onVariantsChange: (variants: ProductVariantFormItem[]) => void;
  onUploadMainImage: (file: File | undefined) => void;
  onUploadGalleryImages: (files: FileList | null) => void;
  onRemoveMainImage: () => void;
  onRemoveGalleryImage: (imageUrl: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}

const ProductFormModal = ({
  formState,
  mode,
  isSaving,
  isUploading,
  uploadMessage,
  errorMessage,
  onChange,
  onVariantsChange,
  onUploadMainImage,
  onUploadGalleryImages,
  onRemoveMainImage,
  onRemoveGalleryImage,
  onClose,
  onSubmit,
}: ProductFormModalProps) => {
  const pricingPreview = getFormPricingPreview(formState);
  const priceDifference =
    pricingPreview.canCalculate
      ? pricingPreview.actualPrice - pricingPreview.sellingPrice
      : 0;

  const addVariant = () => {
    onVariantsChange([...formState.variants, { size: "", color: "", stock: "0" }]);
  };

  const removeVariant = (index: number) => {
    onVariantsChange(formState.variants.filter((_, i) => i !== index));
  };

  const updateVariantField = (
    index: number,
    field: keyof ProductVariantFormItem,
    value: string
  ) => {
    onVariantsChange(
      formState.variants.map((v, i) => (i === index ? { ...v, [field]: value } : v))
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6">
    <div className="max-h-full w-full max-w-3xl overflow-y-auto rounded-xl bg-white shadow-2xl">
      <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
        <div>
          <h2 className="text-lg font-bold text-slate-950">
            {mode === "create" ? "Add Product" : "Edit Product"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Use uploads for images and commas for features.
          </p>
        </div>
        <button
          onClick={onClose}
          disabled={isUploading}
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
            <span>Original Price (MRP)</span>
            <input
              type="number"
              min="1"
              value={formState.actualPrice}
              onChange={(event) => onChange("actualPrice", event.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
            />
          </label>

          <label className="space-y-1.5 text-sm font-medium text-slate-700">
            <span>Selling Price</span>
            <input
              type="number"
              min="1"
              value={formState.sellingPrice}
              onChange={(event) => onChange("sellingPrice", event.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
            />
          </label>
        </div>

        <div className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              MRP
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-950">
              {pricingPreview.canCalculate
                ? currencyFormatter.format(pricingPreview.actualPrice)
                : "Enter price"}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Selling Price
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-950">
              {pricingPreview.canCalculate
                ? currencyFormatter.format(pricingPreview.sellingPrice)
                : "Enter price"}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Discount
            </p>
            <p className="mt-1 text-sm font-semibold text-emerald-600">
              {pricingPreview.canCalculate
                ? `${pricingPreview.discountPercentage}% OFF`
                : "0% OFF"}
            </p>
            {priceDifference > 0 && (
              <p className="mt-1 text-xs text-slate-500">
                Save {currencyFormatter.format(priceDifference)}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-3 rounded-lg border border-slate-200 p-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-700">Main Image</p>
              <p className="mt-0.5 text-xs text-slate-400">
                Upload one image under 5 MB.
              </p>
            </div>

            <label className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
              {formState.image ? "Replace Image" : "Choose Image"}
              <input
                type="file"
                accept="image/*"
                disabled={isUploading}
                className="sr-only"
                onChange={(event) => {
                  onUploadMainImage(event.target.files?.[0]);
                  event.currentTarget.value = "";
                }}
              />
            </label>
          </div>

          {formState.image ? (
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
              <OptimizedImage
                src={formState.image}
                alt="Main product preview"
                width={640}
                height={360}
                sizes="(max-width: 768px) calc(100vw - 88px), 640px"
                wrapperClassName="w-full"
              />
              <div className="flex items-center justify-between gap-3 px-3 py-2">
                <p className="truncate text-xs text-slate-500">{formState.image}</p>
                <button
                  type="button"
                  onClick={onRemoveMainImage}
                  disabled={isUploading}
                  className="shrink-0 rounded-md border border-red-100 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-400">
              No main image uploaded
            </div>
          )}
        </div>

        <div className="space-y-3 rounded-lg border border-slate-200 p-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-700">Gallery Images</p>
              <p className="mt-0.5 text-xs text-slate-400">
                Upload multiple images under 5 MB each.
              </p>
            </div>

            <label className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
              Add Images
              <input
                type="file"
                accept="image/*"
                multiple
                disabled={isUploading}
                className="sr-only"
                onChange={(event) => {
                  onUploadGalleryImages(event.target.files);
                  event.currentTarget.value = "";
                }}
              />
            </label>
          </div>

          {formState.images.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {formState.images.map((imageUrl) => (
                <div
                  key={imageUrl}
                  className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50"
                >
                  <OptimizedImage
                    src={imageUrl}
                    alt="Gallery product preview"
                    width={320}
                    height={240}
                    sizes="(max-width: 768px) calc(50vw - 56px), 220px"
                    wrapperClassName="w-full"
                  />
                  <div className="flex items-center justify-between gap-2 px-2 py-2">
                    <p className="truncate text-xs text-slate-500">{imageUrl}</p>
                    <button
                      type="button"
                      onClick={() => onRemoveGalleryImage(imageUrl)}
                      disabled={isUploading}
                      className="shrink-0 rounded-md border border-red-100 bg-red-50 px-2 py-1 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-400">
              No gallery images uploaded
            </div>
          )}
        </div>

        {uploadMessage && (
          <div
            role="status"
            className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700"
          >
            {uploadMessage}
          </div>
        )}

        <label className="block space-y-1.5 text-sm font-medium text-slate-700">
          <span>Description</span>
          <textarea
            value={formState.description}
            onChange={(event) => onChange("description", event.target.value)}
            rows={4}
            className="w-full resize-y rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
          />
        </label>

        <label className="block space-y-1.5 text-sm font-medium text-slate-700">
          <span>Features</span>
          <input
            value={formState.features}
            onChange={(event) => onChange("features", event.target.value)}
            placeholder="Soft, Comfortable, Machine Washable"
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
          />
        </label>

        <div className="space-y-3 rounded-lg border border-slate-200 p-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-700">Variants</p>
              <p className="mt-0.5 text-xs text-slate-400">
                Define size, color, and stock for each variant.
              </p>
            </div>
            <button
              type="button"
              onClick={addVariant}
              className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Add Variant
            </button>
          </div>

          {formState.variants.length > 0 ? (
            <div className="space-y-2">
              <div className="grid grid-cols-[1fr_1fr_80px_auto] gap-2 px-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Size
                </p>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Color
                </p>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Stock
                </p>
                <span />
              </div>

              {formState.variants.map((variant, index) => (
                <div
                  key={index}
                  className="grid grid-cols-[1fr_1fr_80px_auto] items-center gap-2"
                >
                  <input
                    value={variant.size}
                    onChange={(event) =>
                      updateVariantField(index, "size", event.target.value)
                    }
                    placeholder="e.g. M"
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                  />
                  <input
                    value={variant.color}
                    onChange={(event) =>
                      updateVariantField(index, "color", event.target.value)
                    }
                    placeholder="e.g. Black"
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                  />
                  <input
                    type="number"
                    min="0"
                    value={variant.stock}
                    onChange={(event) =>
                      updateVariantField(index, "stock", event.target.value)
                    }
                    placeholder="0"
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                  />
                  <button
                    type="button"
                    onClick={() => removeVariant(index)}
                    className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-400"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-400">
              No variants added
            </div>
          )}
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isUploading}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving || isUploading}
            className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isUploading
              ? "Uploading..."
              : isSaving
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
};

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [formErrorMessage, setFormErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
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
          ? response.data.map(normalizeProduct)
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
    setUploadMessage("");
    setIsFormOpen(true);
  };

  const openEditForm = async (id: string) => {
    setFormMode("edit");
    setEditingProductId(id);
    setFormErrorMessage("");
    setUploadMessage("");
    setErrorMessage("");
    setIsSaving(true);

    try {
      const response = (await getProductById(id)) as ProductResponse;

      if (!response.data) {
        setErrorMessage("Product not found");
        return;
      }

      setFormState(
        productToFormState(normalizeProduct(response.data))
      );
      setIsFormOpen(true);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  const closeForm = () => {
    if (isSaving || isUploading) return;

    setIsFormOpen(false);
    setFormErrorMessage("");
    setUploadMessage("");
  };

  const updateFormField = (field: keyof ProductFormState, value: string) => {
    setFormState((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleVariantsChange = (variants: ProductVariantFormItem[]) => {
    setFormState((current) => ({
      ...current,
      variants,
    }));
  };

  const handleMainImageUpload = async (file: File | undefined) => {
    if (!file || isUploading) return;

    const validationMessage = validateImageFile(file);

    if (validationMessage) {
      setFormErrorMessage(validationMessage);
      return;
    }

    setIsUploading(true);
    setUploadMessage("Uploading image...");
    setFormErrorMessage("");

    try {
      const response = await uploadImage(file);
      updateFormField("image", response.url);
    } catch (error) {
      setFormErrorMessage(getApiErrorMessage(error));
    } finally {
      setIsUploading(false);
      setUploadMessage("");
    }
  };

  const handleGalleryImagesUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || isUploading) return;

    const selectedFiles = Array.from(files);
    const validationMessage = selectedFiles
      .map(validateImageFile)
      .find(Boolean);

    if (validationMessage) {
      setFormErrorMessage(validationMessage);
      return;
    }

    setIsUploading(true);
    setUploadMessage(
      selectedFiles.length === 1
        ? "Uploading image..."
        : `Uploading ${selectedFiles.length} images...`
    );
    setFormErrorMessage("");

    try {
      const uploadedImages = await Promise.all(
        selectedFiles.map((file) => uploadImage(file))
      );

      setFormState((current) => ({
        ...current,
        images: [
          ...current.images,
          ...uploadedImages.map((image) => image.url),
        ],
      }));
    } catch (error) {
      setFormErrorMessage(getApiErrorMessage(error));
    } finally {
      setIsUploading(false);
      setUploadMessage("");
    }
  };

  const removeMainImage = () => {
    updateFormField("image", "");
  };

  const removeGalleryImage = (imageUrl: string) => {
    setFormState((current) => ({
      ...current,
      images: current.images.filter((image) => image !== imageUrl),
    }));
  };

  const handleSubmit = async () => {
    if (isUploading) {
      setFormErrorMessage("Please wait for image uploads to finish.");
      return;
    }

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
          isUploading={isUploading}
          uploadMessage={uploadMessage}
          errorMessage={formErrorMessage}
          onChange={updateFormField}
          onVariantsChange={handleVariantsChange}
          onUploadMainImage={handleMainImageUpload}
          onUploadGalleryImages={handleGalleryImagesUpload}
          onRemoveMainImage={removeMainImage}
          onRemoveGalleryImage={removeGalleryImage}
          onClose={closeForm}
          onSubmit={handleSubmit}
        />
      )}
    </section>
  );
};

export default Products;
