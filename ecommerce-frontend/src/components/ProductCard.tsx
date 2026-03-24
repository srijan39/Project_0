import { useState } from "react";
import { Link } from "react-router-dom";
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
    e.preventDefault();
    e.stopPropagation();

    const button = e.currentTarget;

    const circle = document.createElement("span");
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;

    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${
      e.clientX - button.getBoundingClientRect().left - radius
    }px`;
    circle.style.top = `${
      e.clientY - button.getBoundingClientRect().top - radius
    }px`;
    circle.classList.add("ripple");

    const ripple = button.getElementsByClassName("ripple")[0];
    if (ripple) ripple.remove();

    button.appendChild(circle);

    addToCart(product);
    setAdded(true);

    setTimeout(() => {
      setAdded(false);
    }, 1200);
  };

  return (
    <Link
      to={`/product/${product.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-lg border border-gray-200 transition duration-300 hover:shadow-lg"
    >
      <div className="aspect-[5/5] overflow-hidden bg-gray-100">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
      </div>

      <div className="flex flex-grow flex-col p-5">
        <h3 className="min-h-[40px] line-clamp-2 text-sm font-medium uppercase tracking-wide text-gray-900">
          {product.name}
        </h3>

        <p className="mt-1 text-sm font-semibold text-black">
          ₹{product.price}
        </p>

        <div className="mt-auto flex gap-2 pt-4">
          <button
            onClick={handleAddToCart}
            className={`relative flex-1 overflow-hidden rounded-md py-2 text-sm transition-all duration-300 ease-in-out active:scale-[0.96] ${
              added
                ? "scale-105 bg-black text-white"
                : "bg-black text-white hover:bg-gray-800"
            }`}
          >
            {added ? (
              <ShoppingCart size={16} className="mx-auto" />
            ) : (
              "Add to Cart"
            )}
          </button>

          <span className="flex-1 rounded-md border border-black py-2 text-center text-sm text-black transition duration-300 group-hover:bg-black group-hover:text-white">
            View
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;