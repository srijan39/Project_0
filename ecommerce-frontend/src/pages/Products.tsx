import { useSearchParams } from "react-router-dom";

import ProductCard from "../components/ProductCard";
import SkeletonCard from "../components/SkeletonCard";

import { useProducts } from "../hooks/useProducts";

const Products = () => {
  const [searchParams] = useSearchParams();

  const search =
    searchParams.get("search")?.trim() || "";

  const { products, loading } = useProducts({
    search,
  });

  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <div className="mb-10">
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
            {search
              ? `Search Results for "${search}"`
              : "All Products"}
          </h1>

          {!loading && (
            <p className="mt-2 text-sm text-gray-500">
              {products.length} product
              {products.length !== 1 ? "s" : ""} found
            </p>
          )}
        </div>

        <div
          className="
            grid gap-4 sm:gap-6
            grid-cols-2
            sm:grid-cols-[repeat(auto-fill,minmax(220px,1fr))]
          "
        >
          {loading
            ? Array.from({ length: 10 }).map(
                (_, i) => (
                  <SkeletonCard key={i} />
                )
              )
            : products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                />
              ))}
        </div>

        {!loading && products.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <h2 className="text-2xl font-medium text-gray-900">
              No products found
            </h2>

            <p className="mt-3 max-w-md text-gray-500">
              {search
                ? `We couldn't find any products matching "${search}".`
                : "We couldn't find any products."}
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Products;
