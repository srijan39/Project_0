import { useCallback, useEffect, useMemo, useState } from "react";
import { deleteProduct, getProducts } from "../api/products";
import { getApiErrorMessage } from "../api/axios";
import type { Product } from "../types/product";
import OptimizedImage from "../components/OptimizedImage";

interface ProductListResponse {
  data?: Product[];
  page?: number;
  limit?: number;
  totalPages?: number;
  totalProducts?: number;
}

const PAGE_SIZE = 12;

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const formatCategory = (category: string) =>
  category ? category.charAt(0).toUpperCase() + category.slice(1) : "Unlisted";

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

interface ProductCardProps {
  product: Product;
  onDelete: (id: string) => void;
}

const ProductCard = ({ product, onDelete }: ProductCardProps) => {
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

        <div className="grid grid-cols-2 gap-2">
          <button className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400">
            Edit
          </button>
          <button
            onClick={() => onDelete(product._id)}
            className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-400"
          >
            Remove
          </button>
        </div>
      </div>
    </article>
  );
};

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  const fetchProducts = useCallback(async () => {
    setErrorMessage("");
    setIsLoading(true);

    try {
      const response = (await getProducts({
        page,
        limit: PAGE_SIZE,
      })) as ProductListResponse;

      setProducts(Array.isArray(response.data) ? response.data : []);
      setTotalPages(Math.max(1, response.totalPages ?? 1));
      setTotalProducts(response.totalProducts ?? 0);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    void fetchProducts();
  }, [fetchProducts]);

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm("Delete this product?");

    if (!confirmDelete) return;

    try {
      await deleteProduct(id);
      await fetchProducts();
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
    }
  };

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) return products;

    return products.filter((product) => {
      const searchableValue = `${product.name} ${product.category}`.toLowerCase();
      return searchableValue.includes(normalizedSearch);
    });
  }, [products, search]);

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

        <button className="inline-flex shrink-0 items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400">
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
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

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
      ) : filteredProducts.length > 0 ? (
        <div className="grid min-w-0 grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onDelete={handleDelete}
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
    </section>
  );
};

export default Products;
