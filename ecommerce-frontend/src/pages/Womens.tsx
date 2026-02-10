import ProductCard from "../components/ProductCard";
import { products } from "../data/products";

const Womens = () => {
  const mensProducts = products.filter(
    (product) => product.category === "women"
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold uppercase tracking-wider mb-8">
        Men
      </h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {mensProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default Womens;
