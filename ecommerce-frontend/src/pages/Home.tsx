import Hero from "../components/Hero";
import { products } from "../data/products";
import ProductCard from "../components/ProductCard";
import { Link } from "react-router-dom";

const Home = () => {
  const featuredProducts = products.slice(0, 4);

  return (
    <div className="w-full">

      {/* ================= HERO ================= */}
      <Hero />

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

      {/* ================= SHOP BY CATEGORY ================= */}
      <section className="py-24 bg-gray-50 px-6 md:px-12">
        <div className="max-w-7xl mx-auto text-center">

          <h2 className="text-2xl font-semibold uppercase tracking-wide mb-16">
            Shop by Category
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { label: "Men", link: "/men" },
              { label: "Women", link: "/women" },
              { label: "Kids", link: "/kids" },
            ].map((category) => (
              <Link
                key={category.label}
                to={category.link}
                className="group relative h-72 bg-gray-200 flex items-center justify-center overflow-hidden"
              >
                <span className="relative z-10 text-xl font-medium uppercase tracking-wide">
                  {category.label}
                </span>

                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition duration-300" />
              </Link>
            ))}
          </div>

        </div>
      </section>

      {/* ================= TESTIMONIALS ================= */}
      <section className="py-24 px-6 md:px-12 bg-white">
        <div className="max-w-6xl mx-auto text-center">

          <h2 className="text-2xl font-semibold uppercase tracking-wide mb-4">
            What Our Customers Say
          </h2>

          <p className="text-gray-500 mb-16 max-w-xl mx-auto">
            Real experiences from people who love our products.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote:
                  "The quality is exceptional. The fit is perfect and the design feels timeless.",
                name: "Aarav Sharma",
                role: "Verified Buyer",
              },
              {
                quote:
                  "Minimal, elegant, and comfortable. My go-to brand for everyday essentials.",
                name: "Meera Kapoor",
                role: "Fashion Enthusiast",
              },
              {
                quote:
                  "Fast delivery and premium packaging. Truly feels like luxury.",
                name: "Rohan Mehta",
                role: "Loyal Customer",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="border p-8 rounded-lg hover:shadow-lg transition duration-300 text-left"
              >
                <p className="text-gray-600 mb-6 leading-relaxed">
                  “{item.quote}”
                </p>

                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-500">{item.role}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

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