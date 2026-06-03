import { NavLink } from "react-router-dom";
import OptimizedImage from "./OptimizedImage";

import heroHome from "../assets/hero-men.jpg";

/* ------------------ Types ------------------ */
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
const HERO_DATA: HeroData = {
  image: heroHome,
  title: "Timeless Fashion",
  subtitle:
    "Discover premium styles for men, women, and kids — crafted for comfort and elegance.",
  primary: { label: "Shop Now", link: "/products" },
  secondary: { label: "Explore Men", link: "/men" },
};

/* ------------------ Component ------------------ */
const Hero = () => {
  return (
    <section className="relative flex min-h-[90vh] items-center justify-center overflow-hidden bg-gray-950">
      <OptimizedImage
        src={HERO_DATA.image}
        alt=""
        width={1920}
        height={1080}
        sizes="100vw"
        priority
        wrapperClassName="absolute inset-0 h-full w-full"
        imageClassName="scale-105"
        aria-hidden="true"
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Content */}
      <div className="relative z-10 max-w-3xl text-center px-4 text-white">
        <h1 className="text-4xl md:text-6xl font-semibold uppercase tracking-widest">
          {HERO_DATA.title}
        </h1>

        <p className="mt-6 text-gray-200">{HERO_DATA.subtitle}</p>

        <div className="mt-10 flex justify-center gap-4 flex-wrap">
          <NavLink
            to={HERO_DATA.primary.link}
            className="px-8 py-3 bg-white text-black uppercase text-sm hover:bg-gray-200 transition"
          >
            {HERO_DATA.primary.label}
          </NavLink>

          {HERO_DATA.secondary && (
            <NavLink
              to={HERO_DATA.secondary.link}
              className="px-8 py-3 border border-white uppercase text-sm hover:bg-white hover:text-black transition"
            >
              {HERO_DATA.secondary.label}
            </NavLink>
          )}
        </div>
      </div>
    </section>
  );
};

export default Hero;
