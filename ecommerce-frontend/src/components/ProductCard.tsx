import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import type { Product } from "../types/product";
import { useCart } from "../hooks/useCart";
import { useAuth } from "../hooks/useAuth";
import { ShoppingCart } from "lucide-react";
import OptimizedImage from "./OptimizedImage";
import { normalizeProductPricing } from "../utils/pricing";

interface Props {
  product: Product;
}

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const ProductCard = ({ product }: Props) => {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [added, setAdded] = useState(false);
  const pricing = normalizeProductPricing(product);
  const hasDiscount = pricing.discountPercentage > 0;

  const handleAddToCart = (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate("/login", { state: { from: location } });
      return;
    }

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
        <OptimizedImage
          src={product.image}
          alt={product.name}
          width={640}
          height={640}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          wrapperClassName="h-full w-full"
          imageClassName="transition duration-300 group-hover:scale-105"
        />
      </div>

      <div className="flex flex-grow flex-col p-3 sm:p-5">
        <h3 className="min-h-[34px] break-words line-clamp-2 text-xs font-medium uppercase leading-snug tracking-normal text-gray-900 sm:min-h-[40px] sm:text-sm sm:tracking-wide">
          {product.name}
        </h3>

        <div className="mt-2 min-h-[40px]">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <p className="whitespace-nowrap text-sm font-semibold text-black sm:text-base">
              {currencyFormatter.format(pricing.sellingPrice)}
            </p>
            {hasDiscount && (
              <p className="whitespace-nowrap text-xs font-medium text-gray-400 line-through">
                {currencyFormatter.format(pricing.actualPrice)}
              </p>
            )}
          </div>
          {hasDiscount && (
            <p className="mt-1 text-xs font-semibold text-green-700">
              {pricing.discountPercentage}% OFF
            </p>
          )}
        </div>

        <div className="mt-auto hidden gap-2 pt-4 sm:flex">
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
