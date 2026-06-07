import ProductCard from "../components/ProductCard";
import SkeletonCard from "../components/SkeletonCard";
import { useProducts } from "../hooks/useProducts";

const Mens = () => {
  const { products: mensProducts, loading } = useProducts({ category: "men" });

  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-12">
        <div className="mb-10">
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
            Men
          </h1>
        </div>

        <div
          className="
            grid gap-4 sm:gap-6
            grid-cols-[repeat(2,minmax(0,1fr))]
            sm:grid-cols-[repeat(auto-fit,minmax(220px,1fr))]
          "
        >
          {loading
            ? Array.from({ length: 10 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))
            : mensProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
        </div>
      </div>
    </section>
  );
};

export default Mens;
