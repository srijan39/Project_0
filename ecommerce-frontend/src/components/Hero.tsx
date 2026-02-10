import { NavLink } from "react-router-dom";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import heroMen from "../assets/hero-men.jpg";
import heroWomen from "../assets/hero-women.jpg";
import heroKids from "../assets/hero-kids.jpg";
import heroHome from "../assets/hero-home.webp";

/* ------------------ Types ------------------ */
type HeroCategory = "home" | "men" | "women" | "kids";

interface HeroButton {
  label: string;
  link: string;
}

interface HeroData {
  image: string;
  title: string;
  subtitle: string;
  primary: HeroButton;
  secondary?: HeroButton;
}

/* ------------------ Data ------------------ */
const HERO_DATA: Record<HeroCategory, HeroData> = {
  home: {
    image: heroHome,
    title: "Timeless Fashion",
    subtitle:
      "Discover premium styles for men, women, and kids — crafted for comfort and elegance.",
    primary: { label: "Shop Now", link: "/products" },
    secondary: { label: "Explore Men", link: "/men" },
  },
  men: {
    image: heroMen,
    title: "Men's Collection",
    subtitle: "Sharp. Modern. Effortless style for every occasion.",
    primary: { label: "Shop Men", link: "/men" },
  },
  women: {
    image: heroWomen,
    title: "Women's Collection",
    subtitle: "Elegant designs made to stand out effortlessly.",
    primary: { label: "Shop Women", link: "/women" },
  },
  kids: {
    image: heroKids,
    title: "Kids Collection",
    subtitle: "Comfortable, playful, and stylish essentials.",
    primary: { label: "Shop Kids", link: "/kids" },
  },
};

const ORDER: HeroCategory[] = ["home", "men", "women", "kids"];

/* ------------------ Component ------------------ */
const Hero = () => {
  const [index, setIndex] = useState(0);
  const current = ORDER[index];
  const data = HERO_DATA[current];

  const prevSlide = () => {
    setIndex((prev) => (prev === 0 ? ORDER.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setIndex((prev) => (prev === ORDER.length - 1 ? 0 : prev + 1));
  };

  return (
    <section
      className="relative min-h-[90vh] flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(${data.image})` }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Left Arrow */}
      <button
        onClick={prevSlide}
        className="absolute left-4 z-20 p-2 rounded-full bg-white/80 hover:bg-white transition"
      >
        <ChevronLeft className="h-6 w-6 text-black" />
      </button>

      {/* Right Arrow */}
      <button
        onClick={nextSlide}
        className="absolute right-4 z-20 p-2 rounded-full bg-white/80 hover:bg-white transition"
      >
        <ChevronRight className="h-6 w-6 text-black" />
      </button>

      {/* Content */}
      <div className="relative z-10 max-w-3xl text-center px-4 text-white">
        <h1 className="text-4xl md:text-6xl font-semibold uppercase tracking-widest">
          {data.title}
        </h1>

        <p className="mt-6 text-gray-200">{data.subtitle}</p>

        <div className="mt-10 flex justify-center gap-4 flex-wrap">
          <NavLink
            to={data.primary.link}
            className="px-8 py-3 bg-white text-black uppercase text-sm hover:bg-gray-200 transition"
          >
            {data.primary.label}
          </NavLink>

          {data.secondary && (
            <NavLink
              to={data.secondary.link}
              className="px-8 py-3 border border-white uppercase text-sm hover:bg-white hover:text-black transition"
            >
              {data.secondary.label}
            </NavLink>
          )}
        </div>
      </div>

      {/* Dots */}
      <div className="absolute bottom-6 z-20 flex gap-2">
        {ORDER.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`h-2 w-2 rounded-full transition ${
              i === index ? "bg-white" : "bg-white/40"
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default Hero;
