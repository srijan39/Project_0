import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const testimonials = [
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
    quote: "Fast delivery and premium packaging. Truly feels like luxury.",
    name: "Rohan Mehta",
    role: "Loyal Customer",
  },
  {
    quote:
      "The fabric feels premium and the finishing is really impressive.",
    name: "Ishita Verma",
    role: "Verified Buyer",
  },
  {
    quote:
      "Exactly the kind of clean and elegant styling I was looking for.",
    name: "Kabir Singh",
    role: "Regular Shopper",
  },
  {
    quote:
      "Beautiful fit, soft material, and the packaging made it feel special.",
    name: "Ananya Roy",
    role: "Happy Customer",
  },
];

const TestimonialsSection = () => {
  const [current, setCurrent] = useState(0);
  const [cardsPerView, setCardsPerView] = useState(3);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const update = () => {
      if (window.innerWidth < 768) setCardsPerView(1);
      else if (window.innerWidth < 1024) setCardsPerView(2);
      else setCardsPerView(3);
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const totalSlides = useMemo(() => {
    return Math.ceil(testimonials.length / cardsPerView);
  }, [cardsPerView]);

  const next = () => {
    setCurrent((prev) => (prev + 1) % totalSlides);
  };

  const prev = () => {
    setCurrent((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  useEffect(() => {
    if (isHovered || totalSlides <= 1) return;

    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % totalSlides);
    }, 5000);

    return () => clearInterval(timer);
  }, [isHovered, totalSlides]);

  return (
    <section className="bg-white py-24">
      
      <div className="mb-16 px-6 text-center md:px-12">
        <h2 className="mb-4 text-2xl font-semibold uppercase tracking-wide">
          What Our Customers Say
        </h2>

        <p className="mx-auto max-w-xl text-gray-500">
          Real experiences from people who love our products.
        </p>
      </div>

      <div
        className="relative w-full"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{
              transform: `translateX(-${current * 100}%)`,
            }}
          >
            {Array.from({ length: totalSlides }).map((_, slideIndex) => {
              const start = slideIndex * cardsPerView;
              const visible = testimonials.slice(
                start,
                start + cardsPerView
              );

              return (
                <div
                  key={slideIndex}
                  className="min-w-full px-6 md:px-12"
                >
                  <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {visible.map((item, i) => (
                      <div
                        key={i}
                        className="rounded-lg border p-8 text-left transition duration-300 hover:shadow-lg"
                      >
                        <p className="mb-6 leading-relaxed text-gray-600">
                          “{item.quote}”
                        </p>

                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-500">
                            {item.role}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {totalSlides > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 shadow-md backdrop-blur-md transition-all duration-300 hover:scale-105 hover:bg-white active:scale-95"
            >
              <ChevronLeft size={18} className="text-gray-800" />
            </button>

            <button
              onClick={next}
              className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 shadow-md backdrop-blur-md transition-all duration-300 hover:scale-105 hover:bg-white active:scale-95"
            >
              <ChevronRight size={18} className="text-gray-800" />
            </button>
          </>
        )}
      </div>

      {totalSlides > 1 && (
        <div className="mt-10 flex justify-center gap-2">
          {Array.from({ length: totalSlides }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                current === i
                  ? "w-8 bg-black"
                  : "w-2 bg-gray-300 hover:bg-gray-400"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default TestimonialsSection;