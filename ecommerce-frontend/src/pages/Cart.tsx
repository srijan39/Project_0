import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import { useAuth } from "../hooks/useAuth";
import CheckoutAddressDialog from "../components/checkout/CheckoutAddressDialog";
import OptimizedImage from "../components/OptimizedImage";
import type { Address } from "../types/address";
import type { CheckoutSessionItem } from "../types/checkout";
import { saveCheckoutSession } from "../utils/checkoutSession";
import { validateCheckoutItems } from "../utils/checkoutValidation";

const Cart = () => {
  const { cart, stockWarnings, increaseQty, decreaseQty, removeFromCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [checkoutError, setCheckoutError] = useState("");
  const [isPreparingCheckout, setIsPreparingCheckout] = useState(false);
  const [checkoutItems, setCheckoutItems] = useState<CheckoutSessionItem[]>([]);
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);

  const itemKey = (id: string, size?: string, color?: string) =>
    `${id}|${size ?? ""}|${color ?? ""}`;

  const itemStock = (item: (typeof cart)[number]): number | null => {
    if (!item.variants || item.variants.length === 0) return null;
    const v = item.variants.find(
      (v) => v.size === (item.size ?? "") && v.color === (item.color ?? "")
    );
    return v?.stock ?? null;
  };

  const subtotal = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: location } });
      return;
    }

    const items = cart.map((item) => ({
      productId: item.id,
      quantity: item.quantity,
      size: item.size,
      color: item.color,
    }));

    if (items.length === 0) {
      setCheckoutError("Your cart is empty.");
      return;
    }

    setIsPreparingCheckout(true);
    setCheckoutError("");

    try {
      await validateCheckoutItems(items);
      setCheckoutItems(items);
      setIsAddressDialogOpen(true);
    } catch (error) {
      setCheckoutError(
        error instanceof Error
          ? error.message
          : "We could not prepare checkout. Please review your cart."
      );
    } finally {
      setIsPreparingCheckout(false);
    }
  };

  const handleAddressContinue = (address: Address) => {
    saveCheckoutSession({
      source: "cart",
      items: checkoutItems,
      addressId: address._id,
      createdAt: Date.now(),
    });
    setIsAddressDialogOpen(false);
    navigate("/checkout");
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
          <svg
            className="h-10 w-10 text-gray-400"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 4h12m-9 0a1 1 0 102 0m6 0a1 1 0 102 0"
            />
          </svg>
        </div>

        <h2 className="mb-3 text-2xl font-semibold">
          Your cart is empty
        </h2>

        <p className="mb-8 max-w-md text-gray-500">
          Looks like you haven’t added anything yet. Start exploring our
          collection and find something you love.
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
      <h1 className="mb-10 text-2xl font-semibold">
        Shopping Cart
      </h1>

      <div className="grid gap-12 md:grid-cols-3">
        {/* Items */}
        <div className="space-y-6 md:col-span-2">
          {cart.map((item, index) => (
            <div
              key={`${item.id}-${item.size || "nosize"}-${item.color || "nocolor"}-${index}`}
              className="flex items-start gap-4 border-b pb-6"
            >
              {/* Clickable image */}
              <Link
                to={`/product/${item.id}`}
                className="group block overflow-hidden rounded-md bg-gray-100"
              >
                <OptimizedImage
                  src={item.image}
                  alt={item.name}
                  width={200}
                  height={240}
                  sizes="80px"
                  wrapperClassName="h-24 w-20"
                  imageClassName="transition duration-300 group-hover:scale-105"
                />
              </Link>

              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <Link
                    to={`/product/${item.id}`}
                    className="inline-block text-sm uppercase tracking-wide transition hover:text-gray-600"
                  >
                    {item.name}
                  </Link>

                  <p className="mt-2 text-sm text-gray-600">
                    ₹{item.price}
                  </p>

                  <div className="mt-2 space-y-1 text-xs text-gray-500">
                    {item.size && <p>Size: {item.size}</p>}
                    {item.color && <p>Color: {item.color}</p>}
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() =>
                        decreaseQty(item.id, item.size, item.color)
                      }
                      className="h-8 w-8 rounded border transition hover:bg-gray-50"
                    >
                      -
                    </button>

                    <span>{item.quantity}</span>

                    <button
                      onClick={() =>
                        increaseQty(item.id, item.size, item.color)
                      }
                      disabled={(() => {
                        const stock = itemStock(item);
                        return stock !== null && item.quantity >= stock;
                      })()}
                      className="h-8 w-8 rounded border transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      +
                    </button>

                    <button
                      onClick={() =>
                        removeFromCart(item.id, item.size, item.color)
                      }
                      className="ml-4 text-sm text-red-500 transition hover:text-red-600"
                    >
                      Remove
                    </button>
                  </div>

                  {stockWarnings[itemKey(item.id, item.size, item.color)] && (
                    <p className="text-xs text-amber-600">
                      {stockWarnings[itemKey(item.id, item.size, item.color)]}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="h-fit rounded-lg border p-6">
          <h2 className="mb-6 text-sm uppercase tracking-wide">
            Order Summary
          </h2>

          <div className="mb-6 space-y-4">
            {cart.map((item, index) => (
              <div
                key={`${item.id}-${item.size || "nosize"}-${item.color || "nocolor"}-summary-${index}`}
                className="flex justify-between gap-4 text-sm"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    {item.name}
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    Qty: {item.quantity}
                    {item.size ? ` • Size: ${item.size}` : ""}
                    {item.color ? ` • Color: ${item.color}` : ""}
                  </p>
                </div>

                <p className="whitespace-nowrap font-medium">
                  ₹{item.price * item.quantity}
                </p>
              </div>
            ))}
          </div>

          <div className="mb-3 flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span>₹{subtotal}</span>
          </div>

          <div className="mb-3 flex justify-between text-sm">
            <span className="text-gray-600">Shipping</span>
            <span className="text-green-600">Free</span>
          </div>

          <div className="flex justify-between border-t pt-4 text-base font-semibold">
            <span>Total</span>
            <span>₹{subtotal}</span>
          </div>

          {checkoutError && (
            <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {checkoutError}
            </p>
          )}

          <button
            type="button"
            onClick={handleCheckout}
            disabled={isPreparingCheckout}
            className="mt-6 w-full rounded-md bg-black py-3 text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {isPreparingCheckout ? "Checking Availability..." : "Proceed to Checkout"}
          </button>
        </div>
      </div>

      {isAddressDialogOpen && (
        <CheckoutAddressDialog
          onClose={() => setIsAddressDialogOpen(false)}
          onContinue={handleAddressContinue}
        />
      )}
    </div>
  );
};

export default Cart;
