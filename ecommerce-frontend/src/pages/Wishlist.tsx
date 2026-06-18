import { Link } from "react-router-dom";
import { Heart } from "lucide-react";

import { useWishlist } from "../hooks/useWishlist";
import OptimizedImage from "../components/OptimizedImage";

const Wishlist = () => {
  const {
    wishlist,
    loading,
    removeFromWishlist,
  } = useWishlist();

  if (loading) {
    return (
      <div className="min-h-screen px-6 py-12">
        <h1 className="mb-8 text-2xl font-semibold">
          My Wishlist
        </h1>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="rounded-lg border p-4"
            >
              <div className="aspect-[4/5] rounded skeleton" />
              <div className="mt-4 h-4 w-3/4 rounded skeleton" />
              <div className="mt-2 h-4 w-1/3 rounded skeleton" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
          <Heart
            className="h-10 w-10 text-gray-400"
            strokeWidth={1.5}
          />
        </div>

        <h2 className="mb-3 text-2xl font-semibold">
          Your wishlist is empty
        </h2>

        <p className="mb-8 max-w-md text-gray-500">
          Save products you love and come back to them later.
        </p>

        <Link
          to="/products"
          className="bg-black px-8 py-3 text-sm uppercase tracking-wide text-white transition hover:bg-gray-800"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-12 md:px-12">
      <div className="mb-10 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          My Wishlist
        </h1>

        <span className="text-sm text-gray-500">
          {wishlist.length} item
          {wishlist.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {wishlist.map((product) => (
          <article
            key={product.id}
            className="group overflow-hidden rounded-lg border bg-white"
          >
            <Link to={`/product/${product.id}`}>
              <OptimizedImage
                src={product.image}
                alt={product.name}
                width={500}
                height={600}
                sizes="(max-width:768px) 100vw, 25vw"
                wrapperClassName="aspect-[4/5] bg-gray-100"
                imageClassName="transition duration-300 group-hover:scale-105"
              />
            </Link>

            <div className="p-4">
              <Link
                to={`/product/${product.id}`}
                className="block text-sm uppercase tracking-wide hover:text-gray-600"
              >
                {product.name}
              </Link>

              <div className="mt-2 flex items-center gap-2">
                <span className="font-semibold">
                  ₹{product.price}
                </span>

                {product.discountPercentage > 0 && (
                  <>
                    <span className="text-sm text-gray-400 line-through">
                      ₹{product.actualPrice}
                    </span>

                    <span className="text-xs text-green-600">
                      {product.discountPercentage}% OFF
                    </span>
                  </>
                )}
              </div>

              <div className="mt-4 flex gap-3">
                <Link
                  to={`/product/${product.id}`}
                  className="flex-1 rounded-md bg-black py-2 text-center text-sm text-white transition hover:bg-gray-800"
                >
                  View Product
                </Link>

                <button
                  onClick={() =>
                    removeFromWishlist(product.id)
                  }
                  className="rounded-md border px-3 transition hover:bg-gray-50"
                  aria-label="Remove from wishlist"
                >
                  <Heart
                    className="h-5 w-5 fill-current"
                  />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default Wishlist;