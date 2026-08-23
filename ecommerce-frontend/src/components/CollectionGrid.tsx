import { NavLink } from "react-router-dom";
import collsample from "../assets/collsample.jpg";
import OptimizedImage from "./OptimizedImage";

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
    <section className='relative left-[50%] right-[50%] -ml-[50vw] -mr-[50vw] w-screen bg-white py-16 sm:py-24'>
      {/* Title Header */}
      <div className='mb-10 text-center sm:mb-14 px-4'>
        <h2 className='text-2xl font-bold uppercase tracking-wider text-gray-900 sm:text-3xl md:text-4xl'>
          Shop by Collection
        </h2>

        <p className='mx-auto mt-3 max-w-2xl text-xs font-medium uppercase tracking-wide text-gray-500 sm:text-sm'>
          Discover elevated essentials and refined everyday pieces.
        </p>
      </div>

      {/* Multi-row Full-Width Grid */}
      <div className='w-full px-4 sm:px-6 md:px-8'>
        <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 2xl:grid-cols-6'>
          {collections.map((item, index) => (
            <NavLink
              to={item.link}
              key={index}
              className='group flex h-full flex-col overflow-hidden rounded-lg border border-gray-200 transition duration-300 hover:shadow-lg'
            >
              {/* Image Container matching ProductCard aspect ratio */}
              <div className='relative aspect-[5/5] overflow-hidden bg-gray-100'>
                <OptimizedImage
                  src={item.image}
                  alt={item.name}
                  width={480}
                  height={480}
                  sizes='(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw'
                  wrapperClassName='h-full w-full'
                  imageClassName='transition duration-300 group-hover:scale-105'
                />
              </div>

              {/* Title Label */}
              <div className='flex flex-grow items-center justify-center p-3 sm:p-4'>
                <h3 className='text-center text-xs font-semibold uppercase leading-snug tracking-wide text-gray-900 sm:text-sm'>
                  {item.name}
                </h3>
              </div>
            </NavLink>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CollectionGrid;
