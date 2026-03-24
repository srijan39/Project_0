import Hero from "../components/Hero";
import { products } from "../data/products";
import ProductCard from "../components/ProductCard";
import { Link } from "react-router-dom";
import TestimonialsSection from "../components/home/TestimonialsSection";
import CategorySection from "../components/home/CategorySection";
import CollectionGrid from "../components/CollectionGrid";
const Home = () => {
  const featuredProducts = products.slice(0, 4);

  return (
    <div className="w-full">

      {/* ================= HERO ================= */}
      <Hero />

      {/* ================= COLLECTION GRID ================= */}
      <CollectionGrid/>
      {/* ================= FEATURED PRODUCTS ================= */}
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

      {/* ================= Shop by Category ================= */}
       <CategorySection/>

      {/* ================= TESTIMONIALS ================= */}
      <TestimonialsSection />

      {/* ================= PROMO SECTION ================= */}
      <section className="py-24 bg-black text-white text-center px-6">
        <div className="max-w-3xl mx-auto">

          <h2 className="text-3xl md:text-4xl font-semibold uppercase tracking-wide mb-6">
            New Season Arrivals
          </h2>

          <p className="text-gray-300 mb-8">
            Explore the latest trends curated for modern wardrobes.
            Elevate your everyday essentials.
          </p>

          <Link
            to="/products"
            className="px-8 py-3 bg-white text-black uppercase text-sm hover:bg-gray-200 transition"
          >
            Discover More
          </Link>

        </div>
      </section>

    </div>
  );
};

export default Home;