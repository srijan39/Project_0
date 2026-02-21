import { Link } from "react-router-dom";

const PromoSection = () => {
  return (
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
  );
};

export default PromoSection;