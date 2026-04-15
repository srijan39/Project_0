import { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import SkeletonCard from "../components/SkeletonCard";
import { products } from "../data/products";

const Products = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <div className="mb-10">
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
            All Products
          </h1>
        </div>

        <div
          className="
            grid gap-6
            grid-cols-[repeat(auto-fit,minmax(220px,1fr))]
          "
        >
          {loading
            ? Array.from({ length: 10 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))
            : products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
        </div>
      </div>
    </section>
  );
};

export default Products;