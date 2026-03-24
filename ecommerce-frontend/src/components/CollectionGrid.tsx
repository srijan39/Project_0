import { NavLink } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import collsample from "../assets/collsample.jpg";

/* ------------------ Data ------------------ */
const collections = [
  { name: "T-Shirts", image: collsample, link: "/men" },
  { name: "Sweatshirts", image: "/images/sweatshirts.jpg", link: "/men" },
  { name: "Joggers", image: "/images/joggers.jpg", link: "/men" },
  { name: "Premium HD Tees", image: "/images/premium.jpg", link: "/men" },
  { name: "Polos", image: "/images/polos.jpg", link: "/men" },
  { name: "Co-Ord Sets", image: "/images/coord.jpg", link: "/men" },
  { name: "Activewear", image: "/images/activewear.jpg", link: "/men" },
  { name: "Shorts", image: "/images/shorts.jpg", link: "/men" },
  { name: "Hoodies", image: "/images/hoodies.jpg", link: "/men" },
  { name: "Cargo Pants", image: "/images/cargo.jpg", link: "/men" },
  { name: "Travel Essentials", image: "/images/travel.jpg", link: "/men" },
  { name: "Tracksuits", image: "/images/tracksuits.jpg", link: "/men" },
];

const CollectionGrid = () => {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6 md:px-12">

        {/* Title */}
        <div className="mb-14 text-center">
          {/* <p className="mb-3 text-sm uppercase tracking-[0.25em] text-gray-500">
            Curated Edit
          </p> */}

          <h2 className="text-3xl font-semibold tracking-tight text-gray-900 md:text-4xl">
            Shop by Collection
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-gray-600 md:text-base">
            Discover elevated essentials and refined everyday pieces.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4 xl:grid-cols-6">
          {collections.map((item, index) => (
            <NavLink
              to={item.link}
              key={index}
              className="group block"
            >
              <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-lg">

                {/* Image */}
                <div className="relative aspect-[4/5] overflow-hidden bg-gray-100">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />

                  {/* Soft overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-80 transition duration-300 group-hover:from-black/20" />

                  {/* Icon */}
                  <div className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-black shadow-sm opacity-0 transition duration-300 group-hover:opacity-100">
                    <ArrowUpRight size={16} />
                  </div>
                </div>

                {/* Content (fixed height for alignment) */}
                <div className="flex items-center justify-center px-4 py-4 min-h-[56px]">
                  <p className="text-sm font-medium text-gray-900 text-center leading-tight">
                    {item.name}
                  </p>
                </div>

              </div>
            </NavLink>
          ))}
        </div>

      </div>
    </section>
  );
};

export default CollectionGrid;