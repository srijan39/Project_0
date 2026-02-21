import { Link } from "react-router-dom";
import { products } from "../../data/products";
import ProductCard from "../ProductCard";

const FeaturedSection = () => {
  const featuredProducts = products.slice(0, 4);

  return (
    <section className="py-24 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-2xl font-semibold uppercase tracking-wide">
            Featured Collection
          </h2>

          <Link
            to="/products"
            className="text-sm uppercase tracking-wide hover:underline"
          >
            View All
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedSection;