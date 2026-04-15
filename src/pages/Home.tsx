import Hero from "../components/Hero";
import { products } from "../data/products";
// import ProductCard from "../components/ProductCard";
import { Link } from "react-router-dom";
import TestimonialsSection from "../components/home/TestimonialsSection";
import CategorySection from "../components/home/CategorySection";
import FeaturedSecion from "../components/home/FeaturedSection";
// import TrustSecion from "../components/home/TrustSection";
import CollectionGrid from "../components/CollectionGrid";
import TrustSection from "../components/home/TrustSection";
import PromoSection from "../components/home/PromoSection";
const Home = () => {
  const featuredProducts = products.slice(0, 4);

  return (
    <div className="w-full">

      {/* ================= HERO ================= */}
      <Hero />

      {/* ================= COLLECTION GRID ================= */}
      <CollectionGrid/>
      {/* ================= TRUST SECTION ================= */}
      <TrustSection/>
      {/* ================= FEATURED PRODUCTS ================= */}
      <FeaturedSecion/>

      {/* ================= Shop by Category ================= */}
       <CategorySection/>

      {/* ================= TESTIMONIALS ================= */}
      <TestimonialsSection />

      {/* ================= PROMO SECTION ================= */}
      <PromoSection/>

    </div>
  );
};

export default Home;