import ProductCard from "../components/ProductCard";
import SkeletonCard from "../components/SkeletonCard";
import { useProducts } from "../hooks/useProducts";

const Womens = () => {
  const { products: womensProducts, loading } = useProducts({ category: "women" });

  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-6 md:px-12">

        {/* Heading */}
        <div className="mb-10">
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
            Women
          </h1>
        </div>

        {/* Grid */}
        <div
          className="
            grid gap-4 sm:gap-6
            grid-cols-2
            sm:grid-cols-[repeat(auto-fit,minmax(220px,1fr))]
          "
        >
          {loading
            ? Array.from({ length: 10 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))
            : womensProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
        </div>

      </div>
    </section>
  );
};

export default Womens;
