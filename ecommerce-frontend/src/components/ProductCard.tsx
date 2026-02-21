import { useState } from "react";
import type { Product } from "../data/products";
import { useCart } from "../context/CartContext";

interface Props {
  product: Product;
}

const ProductCard = ({ product }: Props) => {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    addToCart(product);
    setAdded(true);

    setTimeout(() => {
      setAdded(false);
    }, 1200);
  };

  const handleBuyNow = () => {
    addToCart(product);
  };

  return (
    <div className="group rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition">
      
      {/* Image */}
      <div className="aspect-[3/4] overflow-hidden bg-gray-100">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
        />
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-sm uppercase tracking-wide text-gray-800">
          {product.name}
        </h3>

        <p className="mt-1 text-sm font-medium text-black">
          ₹{product.price}
        </p>

        {/* Buttons */}
        <div className="mt-4 flex gap-2">
          <button
            onClick={handleAddToCart}
            className={`flex-1 text-sm py-2 rounded-md transition active:scale-[0.98]
              ${
                added
                  ? "bg-green-600 text-white"
                  : "bg-black text-white hover:bg-gray-800"
              }`}
          >
            {added ? "Added ✓" : "Add to Cart"}
          </button>

          <button
            onClick={handleBuyNow}
            className="flex-1 border border-black text-black text-sm py-2 rounded-md hover:bg-black hover:text-white active:scale-[0.98] transition"
          >
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;