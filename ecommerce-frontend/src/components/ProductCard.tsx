import { useState } from "react";
import type { Product } from "../data/products";
import { useCart } from "../context/CartContext";
import { ShoppingCart } from "lucide-react";

interface Props {
  product: Product;
}

const ProductCard = ({ product }: Props) => {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAddToCart = (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    const button = e.currentTarget;

    // Create ripple span
    const circle = document.createElement("span");
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;

    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${e.clientX - button.getBoundingClientRect().left - radius}px`;
    circle.style.top = `${e.clientY - button.getBoundingClientRect().top - radius}px`;
    circle.classList.add("ripple");

    const ripple = button.getElementsByClassName("ripple")[0];
    if (ripple) {
      ripple.remove();
    }

    button.appendChild(circle);

    // Cart logic
    addToCart(product);
    setAdded(true);

    setTimeout(() => {
      setAdded(false);
    }, 1200);
  };

  return (
    <div className="group rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition duration-300">
      
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
            className={`
              relative overflow-hidden
              flex-1 flex items-center justify-center gap-2
              text-sm py-2 rounded-md
              transition-all duration-300 ease-in-out
              active:scale-[0.96]
              ${
                added
                  ? "bg-black text-white scale-105"
                  : "bg-black text-white hover:bg-gray-800"
              }
            `}
          >
            {added ? (
              <>
                <ShoppingCart size={16} className="animate-[fadeIn_0.2s_ease]" />
                
              </>
            ) : (
              "Add to Cart"
            )}
          </button>

          <button
            className="flex-1 border border-black text-black text-sm py-2 rounded-md hover:bg-black hover:text-white active:scale-[0.96] transition duration-300"
          >
            Buy Now
          </button>

        </div>
      </div>
    </div>
  );
};

export default ProductCard;