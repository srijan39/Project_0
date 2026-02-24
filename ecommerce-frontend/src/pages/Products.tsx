import { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import SkeletonCard from "../components/SkeletonCard";
import { products } from "../data/products";

const Products = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      <h1 className="text-2xl md:text-3xl font-semibold mb-8">
        All Products
      </h1>

      <div className="grid 
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
          : products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
      </div>

    </section>
  );
};

export default Products;