import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { products } from "../../data/products";
import ProductCard from "../ProductCard";

const FeaturedSection = () => {
  const featuredProducts = products.slice(0, 8);
  const [current, setCurrent] = useState(0);
  const [cardsPerView, setCardsPerView] = useState(4);

  useEffect(() => {
    const updateCardsPerView = () => {
      if (window.innerWidth < 640) {
        setCardsPerView(1);
      } else if (window.innerWidth < 768) {
        setCardsPerView(2);
      } else if (window.innerWidth < 1024) {
        setCardsPerView(3);
      } else {
        setCardsPerView(4);
      }
    };

    updateCardsPerView();
    window.addEventListener("resize", updateCardsPerView);

    return () => window.removeEventListener("resize", updateCardsPerView);
  }, []);

  const totalSlides = Math.ceil(featuredProducts.length / cardsPerView);

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  return (
    <section className="py-24">

      <div className="w-full px-6 md:px-10 xl:px-14">
        <div className="mb-12 flex items-center justify-between gap-4">
          <h2 className="text-2xl font-semibold uppercase tracking-wide">
            Featured Collection
          </h2>
        
          <div className="flex items-center gap-3">
            <button
              onClick={prevSlide}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white transition hover:bg-gray-50"
            >
              <ChevronLeft size={18} />
            </button>

            <button
              onClick={nextSlide}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white transition hover:bg-gray-50"
            >
              <ChevronRight size={18} />
            </button>

            <Link
              to="/products"
              className="ml-2 text-sm uppercase tracking-wide hover:underline"
            >
              View All
            </Link>
          </div>
        </div>

        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{
              transform: `translateX(-${current * 100}%)`,
            }}
          >
            {Array.from({ length: totalSlides }).map((_, slideIndex) => {
              const start = slideIndex * cardsPerView;
              const visibleProducts = featuredProducts.slice(
                start,
                start + cardsPerView
              );

              return (
                <div
                  key={slideIndex}
                  className="min-w-full"
                >
                  <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {visibleProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {totalSlides > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            {Array.from({ length: totalSlides }).map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrent(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  current === index ? "w-8 bg-black" : "w-2 bg-gray-300"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedSection;