import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

const CategorySection = () => {
  const categories = [
    {
      label: "Men",
      link: "/men",
      desc: "Sharp essentials and modern fits",
      image: "https://images.unsplash.com/photo-1520975954732-35dd22299614",
    },
    {
      label: "Women",
      link: "/women",
      desc: "Elegant pieces for every moment",
      image: "https://images.unsplash.com/photo-1485462537746-965f33f7f6a7",
    },
    {
      label: "Kids",
      link: "/kids",
      desc: "Comfortable styles made playful",
      image: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea",
    },
  ];

  return (
    <section className="bg-white px-6 py-24 md:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 text-center">
          <p className="mb-3 text-sm uppercase tracking-[0.25em] text-gray-500">
            Explore Collections
          </p>

          <h2 className="text-3xl font-semibold tracking-tight text-gray-900 md:text-4xl">
            Shop by Category
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-gray-600 md:text-base">
            Discover curated fashion for every style and every season.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.label}
              to={category.link}
              className="group block"
            >
              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
                
                {/* Image Container */}
                <div className="relative h-72 overflow-hidden">
                  
                  {/* Image */}
                  <img
                    src={category.image}
                    alt={category.label}
                    className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-110"
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent transition duration-300" />

                  {/* Icon */}
                  <div className="absolute right-5 top-5 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-black shadow-sm transition duration-300 group-hover:scale-105">
                    <ArrowUpRight size={18} />
                  </div>

                  {/* Content */}
                  <div className="absolute bottom-0 z-10 p-8 text-white">
                    <p className="mb-2 text-xs uppercase tracking-[0.28em] text-white/70">
                      Collection
                    </p>

                    <h3 className="text-3xl font-semibold tracking-tight">
                      {category.label}
                    </h3>

                    <p className="mt-3 max-w-xs text-sm leading-6 text-white/85">
                      {category.desc}
                    </p>

                    <span className="mt-5 inline-block text-sm font-medium text-white">
                      Explore Now
                    </span>
                  </div>

                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;