import { useState, type FormEvent } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../ProductCard";
import SkeletonCard from "../SkeletonCard";
import { useProducts } from "../../hooks/useProducts";
import type {
  ProductDiscountFilter,
  ProductSort,
} from "../../api/products";
import type { ProductCategory } from "../../types/product";
import { getCollectionTagLabel } from "../../constants/collections";

interface ProductListingProps {
  title: string;
  fixedCategory?: ProductCategory;
}

const categoryLabels: Record<ProductCategory, string> = {
  men: "Men",
  women: "Women",
  kids: "Kids",
};

const categories: ProductCategory[] = ["men", "women", "kids"];
const sizeOrder = ["XS", "S", "M", "L", "XL", "XXL"];

const sortOptions: Array<{ value: ProductSort | ""; label: string }> = [
  { value: "", label: "Relevance / Default" },
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "discount_desc", label: "Discount: High to Low" },
];

const discountOptions: Array<{
  value: ProductDiscountFilter;
  label: string;
}> = [
  { value: "on_sale", label: "On Sale" },
  { value: "10", label: "Discount >= 10%" },
  { value: "20", label: "Discount >= 20%" },
  { value: "30", label: "Discount >= 30%" },
  { value: "50", label: "Discount >= 50%" },
];

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const parseList = (value: string | null) =>
  value
    ?.split(",")
    .map((item) => item.trim())
    .filter(Boolean) ?? [];

const parsePrice = (value: string | null) => {
  if (!value) return undefined;

  const parsed = Number(value);

  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
};

const parsePage = (value: string | null) => {
  const parsed = Number(value);

  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
};

const isCategory = (value: string | null): value is ProductCategory =>
  value === "men" || value === "women" || value === "kids";

const isSort = (value: string | null): value is ProductSort =>
  sortOptions.some((option) => option.value === value && option.value !== "");

const isDiscount = (
  value: string | null
): value is ProductDiscountFilter =>
  discountOptions.some((option) => option.value === value);

const normalizeNumberInput = (value: FormDataEntryValue | null) => {
  const parsed = Number(String(value ?? "").trim());

  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
};

const mergeSelectedOptions = (options: string[], selected: string[]) =>
  [...new Set([...selected, ...options].filter(Boolean))];

const sortSizes = (sizes: string[]) =>
  [...sizes].sort((a, b) => {
    const aIndex = sizeOrder.indexOf(a.toUpperCase());
    const bIndex = sizeOrder.indexOf(b.toUpperCase());

    if (aIndex !== -1 || bIndex !== -1) {
      return (
        (aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex) -
        (bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex)
      );
    }

    return a.localeCompare(b);
  });

const ProductListing = ({ title, fixedCategory }: ProductListingProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const search = searchParams.get("search")?.trim() || "";
  const collection = searchParams.get("collection")?.trim() || "";
  const categoryFromUrl = searchParams.get("category");
  const category =
    fixedCategory ?? (isCategory(categoryFromUrl) ? categoryFromUrl : undefined);
  const selectedColors = parseList(searchParams.get("color"));
  const selectedSizes = parseList(searchParams.get("size"));
  const minPrice = parsePrice(searchParams.get("minPrice"));
  const maxPrice = parsePrice(searchParams.get("maxPrice"));
  const inStock = searchParams.get("inStock") === "true";
  const discountFromUrl = searchParams.get("discount");
  const discount = isDiscount(discountFromUrl) ? discountFromUrl : undefined;
  const sortFromUrl = searchParams.get("sort");
  const sort = isSort(sortFromUrl) ? sortFromUrl : undefined;
  const page = parsePage(searchParams.get("page"));
  const limit = 12;

  const {
    products,
    loading,
    error,
    pagination,
    availableFilters,
  } = useProducts({
    category,
    collection,
    color: selectedColors,
    size: selectedSizes,
    minPrice,
    maxPrice,
    inStock,
    discount,
    sort,
    page,
    limit,
    search,
  });

  const colorOptions = mergeSelectedOptions(
    availableFilters.colors,
    selectedColors
  ).sort((a, b) => a.localeCompare(b));

  const sizeOptions = sortSizes(
    mergeSelectedOptions(availableFilters.sizes, selectedSizes)
  );

  const collectionLabel = collection ? getCollectionTagLabel(collection) : "";
  const heading = collectionLabel
    ? category
      ? `${categoryLabels[category]} ${collectionLabel}`
      : collectionLabel
    : !fixedCategory && search
      ? `Search Results for "${search}"`
      : title;

  const commitParams = (
    update: (next: URLSearchParams) => void,
    resetPage = true
  ) => {
    const next = new URLSearchParams(searchParams);

    update(next);

    if (fixedCategory) {
      next.delete("category");
    }

    if (resetPage) {
      next.delete("page");
    }

    setSearchParams(next);
  };

  const setListValue = (key: "color" | "size", value: string) => {
    commitParams((next) => {
      const values = parseList(next.get(key));
      const valueExists = values.some(
        (item) => item.toLowerCase() === value.toLowerCase()
      );
      const nextValues = valueExists
        ? values.filter((item) => item.toLowerCase() !== value.toLowerCase())
        : [...values, value];

      if (nextValues.length) {
        next.set(key, nextValues.join(","));
      } else {
        next.delete(key);
      }
    });
  };

  const removeListValue = (key: "color" | "size", value: string) => {
    commitParams((next) => {
      const nextValues = parseList(next.get(key)).filter(
        (item) => item.toLowerCase() !== value.toLowerCase()
      );

      if (nextValues.length) {
        next.set(key, nextValues.join(","));
      } else {
        next.delete(key);
      }
    });
  };

  const setCategory = (value?: ProductCategory) => {
    commitParams((next) => {
      if (value) {
        next.set("category", value);
      } else {
        next.delete("category");
      }
    });
  };

  const setInStock = () => {
    commitParams((next) => {
      if (next.get("inStock") === "true") {
        next.delete("inStock");
      } else {
        next.set("inStock", "true");
      }
    });
  };

  const setDiscount = (value?: ProductDiscountFilter) => {
    commitParams((next) => {
      if (value) {
        next.set("discount", value);
      } else {
        next.delete("discount");
      }
    });
  };

  const setSort = (value: ProductSort | "") => {
    commitParams((next) => {
      if (value) {
        next.set("sort", value);
      } else {
        next.delete("sort");
      }
    });
  };

  const setPage = (value: number) => {
    commitParams((next) => {
      if (value > 1) {
        next.set("page", String(value));
      } else {
        next.delete("page");
      }
    }, false);
  };

  const applySearchAndPrice = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const nextSearch = String(formData.get("search") ?? "").trim();
    let nextMinPrice = normalizeNumberInput(formData.get("minPrice"));
    let nextMaxPrice = normalizeNumberInput(formData.get("maxPrice"));

    if (
      nextMinPrice !== undefined &&
      nextMaxPrice !== undefined &&
      nextMinPrice > nextMaxPrice
    ) {
      [nextMinPrice, nextMaxPrice] = [nextMaxPrice, nextMinPrice];
    }

    commitParams((next) => {
      if (nextSearch) {
        next.set("search", nextSearch);
      } else {
        next.delete("search");
      }

      if (nextMinPrice !== undefined) {
        next.set("minPrice", String(nextMinPrice));
      } else {
        next.delete("minPrice");
      }

      if (nextMaxPrice !== undefined) {
        next.set("maxPrice", String(nextMaxPrice));
      } else {
        next.delete("maxPrice");
      }
    });
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
    setIsFilterOpen(false);
  };

  const activeFilters = [
    ...(!fixedCategory && category
      ? [
          {
            key: "category",
            label: categoryLabels[category],
            remove: () => setCategory(undefined),
          },
        ]
      : []),
    ...(search
      ? [
          {
            key: "search",
            label: `"${search}"`,
            remove: () =>
              commitParams((next) => {
                next.delete("search");
              }),
          },
        ]
      : []),
    ...(collection
      ? [
          {
            key: "collection",
            label: collectionLabel,
            remove: () =>
              commitParams((next) => {
                next.delete("collection");
              }),
          },
        ]
      : []),
    ...selectedColors.map((color) => ({
      key: `color-${color}`,
      label: color,
      remove: () => removeListValue("color", color),
    })),
    ...selectedSizes.map((size) => ({
      key: `size-${size}`,
      label: size,
      remove: () => removeListValue("size", size),
    })),
    ...(minPrice !== undefined || maxPrice !== undefined
      ? [
          {
            key: "price",
            label: `${minPrice !== undefined ? currencyFormatter.format(minPrice) : "Min"} - ${
              maxPrice !== undefined ? currencyFormatter.format(maxPrice) : "Max"
            }`,
            remove: () =>
              commitParams((next) => {
                next.delete("minPrice");
                next.delete("maxPrice");
              }),
          },
        ]
      : []),
    ...(inStock
      ? [
          {
            key: "stock",
            label: "In Stock",
            remove: () =>
              commitParams((next) => {
                next.delete("inStock");
              }),
          },
        ]
      : []),
    ...(discount
      ? [
          {
            key: "discount",
            label:
              discountOptions.find((option) => option.value === discount)
                ?.label ?? "On Sale",
            remove: () => setDiscount(undefined),
          },
        ]
      : []),
  ];

  const renderFilters = (idPrefix: string) => (
    <div className="space-y-7">
      <form
        key={`${idPrefix}-${search}-${minPrice ?? ""}-${maxPrice ?? ""}`}
        onSubmit={applySearchAndPrice}
        className="space-y-4"
      >
        <div>
          <label
            htmlFor={`${idPrefix}-search`}
            className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500"
          >
            Search
          </label>
          <input
            id={`${idPrefix}-search`}
            name="search"
            defaultValue={search}
            placeholder="Search products"
            className="mt-3 w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-black"
          />
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
            Price
          </p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <input
              name="minPrice"
              inputMode="numeric"
              defaultValue={minPrice ?? ""}
              placeholder="Min"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-black"
            />
            <input
              name="maxPrice"
              inputMode="numeric"
              defaultValue={maxPrice ?? ""}
              placeholder="Max"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-black"
            />
          </div>
          {availableFilters.priceRange.min !== null &&
            availableFilters.priceRange.max !== null && (
              <p className="mt-2 text-xs text-gray-500">
                {currencyFormatter.format(availableFilters.priceRange.min)} to{" "}
                {currencyFormatter.format(availableFilters.priceRange.max)}
              </p>
            )}
        </div>

        <button
          type="submit"
          className="w-full rounded-md bg-black px-4 py-2 text-sm text-white transition hover:bg-gray-800"
        >
          Apply
        </button>
      </form>

      {!fixedCategory && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
            Category
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setCategory(undefined)}
              className={`rounded-md border px-3 py-2 text-sm transition ${
                !category
                  ? "border-black bg-black text-white"
                  : "border-gray-300 text-gray-700 hover:border-black"
              }`}
            >
              All
            </button>
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                className={`rounded-md border px-3 py-2 text-sm transition ${
                  category === item
                    ? "border-black bg-black text-white"
                    : "border-gray-300 text-gray-700 hover:border-black"
                }`}
              >
                {categoryLabels[item]}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
          Color
        </p>
        <div className="mt-3 space-y-2">
          {colorOptions.length > 0 ? (
            colorOptions.map((color) => {
              const checked = selectedColors.some(
                (item) => item.toLowerCase() === color.toLowerCase()
              );

              return (
                <label
                  key={color}
                  htmlFor={`${idPrefix}-color-${color}`}
                  className="flex cursor-pointer items-center gap-3 text-sm text-gray-700"
                >
                  <input
                    id={`${idPrefix}-color-${color}`}
                    type="checkbox"
                    checked={checked}
                    onChange={() => setListValue("color", color)}
                    className="h-4 w-4 rounded border-gray-300 accent-black"
                  />
                  <span>{color}</span>
                </label>
              );
            })
          ) : (
            <p className="text-sm text-gray-500">No color filters yet.</p>
          )}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
          Size
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {sizeOptions.length > 0 ? (
            sizeOptions.map((size) => {
              const checked = selectedSizes.some(
                (item) => item.toLowerCase() === size.toLowerCase()
              );

              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => setListValue("size", size)}
                  className={`min-w-10 rounded-md border px-3 py-2 text-sm transition ${
                    checked
                      ? "border-black bg-black text-white"
                      : "border-gray-300 text-gray-700 hover:border-black"
                  }`}
                >
                  {size}
                </button>
              );
            })
          ) : (
            <p className="text-sm text-gray-500">No size filters yet.</p>
          )}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
          Availability
        </p>
        <label
          htmlFor={`${idPrefix}-stock`}
          className="mt-3 flex cursor-pointer items-center gap-3 text-sm text-gray-700"
        >
          <input
            id={`${idPrefix}-stock`}
            type="checkbox"
            checked={inStock}
            onChange={setInStock}
            className="h-4 w-4 rounded border-gray-300 accent-black"
          />
          <span>In Stock</span>
        </label>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
          Discount
        </p>
        <div className="mt-3 space-y-2">
          <label className="flex cursor-pointer items-center gap-3 text-sm text-gray-700">
            <input
              type="radio"
              checked={!discount}
              onChange={() => setDiscount(undefined)}
              className="h-4 w-4 accent-black"
            />
            <span>All</span>
          </label>
          {discountOptions.map((option) => (
            <label
              key={option.value}
              className="flex cursor-pointer items-center gap-3 text-sm text-gray-700"
            >
              <input
                type="radio"
                checked={discount === option.value}
                onChange={() => setDiscount(option.value)}
                className="h-4 w-4 accent-black"
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {activeFilters.length > 0 && (
        <button
          type="button"
          onClick={clearFilters}
          className="w-full rounded-md border border-black px-4 py-2 text-sm text-black transition hover:bg-black hover:text-white"
        >
          Clear All
        </button>
      )}
    </div>
  );

  return (
    <section className="bg-white py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-12">
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
              {heading}
            </h1>
            {!loading && (
              <p className="mt-2 text-sm text-gray-500">
                {pagination.totalProducts} product
                {pagination.totalProducts !== 1 ? "s" : ""} found
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setIsFilterOpen(true)}
              className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-900 transition hover:border-black lg:hidden"
            >
              <SlidersHorizontal size={16} />
              Filter
            </button>

            <label className="flex items-center gap-2 text-sm text-gray-600">
              <span>Sort By</span>
              <select
                value={sort ?? ""}
                onChange={(event) =>
                  setSort(event.target.value as ProductSort | "")
                }
                className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-black"
              >
                {sortOptions.map((option) => (
                  <option key={option.value || "default"} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {activeFilters.length > 0 && (
          <div className="mb-6 flex flex-wrap items-center gap-2">
            {activeFilters.map((filter) => (
              <button
                key={filter.key}
                type="button"
                onClick={filter.remove}
                className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-3 py-1.5 text-sm text-gray-800 transition hover:border-black"
              >
                <span>{filter.label}</span>
                <X size={14} />
              </button>
            ))}
            <button
              type="button"
              onClick={clearFilters}
              className="text-sm font-medium text-gray-600 underline underline-offset-4 hover:text-black"
            >
              Clear All
            </button>
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="hidden border-r border-gray-200 pr-8 lg:block">
            <div className="sticky top-24">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-900">
                  Filters
                </h2>
              </div>
              {renderFilters("desktop")}
            </div>
          </aside>

          <div>
            {error && (
              <div className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 sm:gap-6 sm:grid-cols-[repeat(auto-fill,minmax(220px,1fr))]">
              {loading
                ? Array.from({ length: 12 }).map((_, index) => (
                    <SkeletonCard key={index} />
                  ))
                : products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
            </div>

            {!loading && products.length === 0 && (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <h2 className="text-2xl font-medium text-gray-900">
                  No products found
                </h2>
                <p className="mt-3 max-w-md text-gray-500">
                  Try removing some filters or adjusting your search.
                </p>
                {activeFilters.length > 0 && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-6 rounded-md bg-black px-5 py-2 text-sm text-white transition hover:bg-gray-800"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            )}

            {!loading && pagination.totalPages > 1 && (
              <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage(Math.max(1, pagination.page - 1))}
                  disabled={pagination.page <= 1}
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-800 transition hover:border-black disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>
                {Array.from({ length: pagination.totalPages })
                  .map((_, index) => index + 1)
                  .filter(
                    (pageNumber) =>
                      pageNumber === 1 ||
                      pageNumber === pagination.totalPages ||
                      Math.abs(pageNumber - pagination.page) <= 1
                  )
                  .map((pageNumber, index, pages) => (
                    <span key={pageNumber} className="flex items-center gap-2">
                      {index > 0 && pageNumber - pages[index - 1] > 1 && (
                        <span className="px-1 text-sm text-gray-400">...</span>
                      )}
                      <button
                        type="button"
                        onClick={() => setPage(pageNumber)}
                        className={`h-10 min-w-10 rounded-md border px-3 text-sm transition ${
                          pagination.page === pageNumber
                            ? "border-black bg-black text-white"
                            : "border-gray-300 text-gray-800 hover:border-black"
                        }`}
                      >
                        {pageNumber}
                      </button>
                    </span>
                  ))}
                <button
                  type="button"
                  onClick={() =>
                    setPage(Math.min(pagination.totalPages, pagination.page + 1))
                  }
                  disabled={pagination.page >= pagination.totalPages}
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-800 transition hover:border-black disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {isFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close filters"
            onClick={() => setIsFilterOpen(false)}
            className="absolute inset-0 bg-black/40"
          />
          <div className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-900">
                Filters
              </h2>
              <button
                type="button"
                onClick={() => setIsFilterOpen(false)}
                className="rounded-full p-2 text-gray-600 transition hover:bg-gray-100 hover:text-black"
                aria-label="Close filters"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-6">
              {renderFilters("mobile")}
            </div>
            <div className="grid grid-cols-2 gap-3 border-t border-gray-200 p-5">
              <button
                type="button"
                onClick={clearFilters}
                className="rounded-md border border-black px-4 py-2 text-sm text-black transition hover:bg-black hover:text-white"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setIsFilterOpen(false)}
                className="rounded-md bg-black px-4 py-2 text-sm text-white transition hover:bg-gray-800"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ProductListing;
