import { NavLink } from "react-router-dom";
import collsample from "../assets/collsample.jpg";
import OptimizedImage from "./OptimizedImage";
import { COLLECTION_TAGS } from "../constants/collections";


const collectionImages: Record<string, string> = {
  "t-shirts": collsample,
  sweatshirts: "/images/sweatshirts.jpg",
  joggers: "/images/joggers.jpg",
  "premium-hd-tees": "/images/premium.jpg",
  polos: "/images/polos.jpg",
  "co-ord-sets": "/images/coord.jpg",
  activewear: "/images/activewear.jpg",
  shorts: "/images/shorts.jpg",
  hoodies: "/images/hoodies.jpg",
  "cargo-pants": "/images/cargo.jpg",
  "travel-essentials": "/images/travel.jpg",
  tracksuits: "/images/tracksuits.jpg",
};

const collections = COLLECTION_TAGS.map((tag) => ({
  name: tag.label,
  image: collectionImages[tag.slug],
  link: `/products?collection=${tag.slug}`,
}));

const CollectionGrid = () => {
  return (
    <section className='relative left-[50%] right-[50%] -ml-[50vw] -mr-[50vw] w-screen bg-white py-16 sm:py-24'>
     
      <div className='mb-10 text-center sm:mb-14 px-4'>
        <h2 className='text-2xl font-bold uppercase tracking-wider text-gray-900 sm:text-3xl md:text-4xl'>
          Shop by Collection
        </h2>

        <p className='mx-auto mt-3 max-w-2xl text-xs font-medium uppercase tracking-wide text-gray-500 sm:text-sm'>
          Discover elevated essentials and refined everyday pieces.
        </p>
      </div>


      <div className='w-full px-4 sm:px-6 md:px-8'>
        <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 2xl:grid-cols-6'>
          {collections.map((item, index) => (
            <NavLink
              to={item.link}
              key={index}
              className='group flex h-full flex-col overflow-hidden rounded-lg border border-gray-200 transition duration-300 hover:shadow-lg'
            >
 
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
