import { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import SkeletonCard from "../components/SkeletonCard";
import { products } from "../data/products";

const Womens = () => {
  const [loading, setLoading] = useState(true);

  const womensProducts = products.filter(
    (product) => product.category === "women"
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000); // simulate API delay

    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      <h1 className="text-2xl font-semibold uppercase tracking-wider mb-8">
        Women
      </h1>

      <div
        className="grid 
          grid-cols-2 
          sm:grid-cols-3 
          md:grid-cols-4 
          lg:grid-cols-5 
          gap-5 sm:gap-6"
      >
        {loading
          ? Array.from({ length: 10 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))
          : womensProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
      </div>

    </section>
  );
};

export default Womens;