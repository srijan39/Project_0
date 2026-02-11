import { NavLink } from "react-router-dom";
import collsample from "../assets/collsample.jpg";
/* ------------------ Data ------------------ */
const collections = [
  { name: "T-Shirts", image: collsample , link: "/men" },
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
    <section className="bg-gray-100 py-16">
      <div className="max-w-7xl mx-auto px-4">
        {/* Title */}
        <h2 className="text-3xl md:text-4xl font-semibold sm:text-center mb-12">
          Shop by Collection
        </h2>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
          {collections.map((item, index) => (
            <NavLink
              to={item.link}
              key={index}
              className="group text-center"
            >
              <div className="relative overflow-hidden rounded-xl bg-white shadow-sm">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                />

                {/* Plus Icon Overlay */}
                <div className="absolute top-3 right-3 bg-white/80 rounded-full p-1 opacity-0 group-hover:opacity-100 transition">
                  <span className="text-md round font-bold">+</span>
                </div>
              </div>

              <p className="mt-4 text-sm font-medium">
                {item.name}
              </p>
            </NavLink>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CollectionGrid;
