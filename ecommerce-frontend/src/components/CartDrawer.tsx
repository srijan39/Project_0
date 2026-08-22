import { useState } from "react";
import { X } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import { useAuth } from "../hooks/useAuth";
import CheckoutAddressDialog from "./checkout/CheckoutAddressDialog";
import OptimizedImage from "./OptimizedImage";
import type { Address } from "../types/address";
import type { CheckoutSessionItem } from "../types/checkout";
import { saveCheckoutSession } from "../utils/checkoutSession";
import { validateCheckoutItems } from "../utils/checkoutValidation";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const CartDrawer = ({ isOpen, onClose }: Props) => {
  const { cart, removeFromCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [checkoutError, setCheckoutError] = useState("");
  const [isPreparingCheckout, setIsPreparingCheckout] = useState(false);
  const [checkoutItems, setCheckoutItems] = useState<CheckoutSessionItem[]>([]);
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);

  const subtotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
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
    onClose();
    navigate("/checkout");
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity z-40 ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-[380px] bg-white shadow-xl z-50 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-medium">Your Cart</h2>
          <button onClick={onClose}>
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {cart.length === 0 ? (
            <p className="text-gray-500 text-sm">Your cart is empty.</p>
          ) : (
            cart.map((item) => (
              <div key={`${item.id}-${item.size || "nosize"}-${item.color || "nocolor"}`} className="flex gap-4">
                <OptimizedImage
                  src={item.image}
                  alt={item.name}
                  width={160}
                  height={200}
                  sizes="64px"
                  wrapperClassName="h-20 w-16 shrink-0 rounded"
                />

                <div className="flex-1">
                  <h4 className="text-sm font-medium">{item.name}</h4>
                  <p className="text-sm text-gray-500">
                    ₹{item.price} × {item.quantity}
                  </p>

                  <button
                    onClick={() => removeFromCart(item.id, item.size, item.color)}
                    className="text-xs text-red-500 mt-1 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="border-t px-6 py-4 space-y-4">
            <div className="flex justify-between text-sm font-medium">
              <span>Subtotal</span>
              <span>₹{subtotal}</span>
            </div>

            {checkoutError && (
              <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {checkoutError}
              </p>
            )}

            <button
              type="button"
              onClick={handleCheckout}
              disabled={isPreparingCheckout}
              className="w-full bg-black text-white py-3 text-sm uppercase tracking-wide hover:bg-gray-800 transition disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {isPreparingCheckout ? "Checking..." : "Checkout"}
            </button>
          </div>
        )}
      </div>

      {isAddressDialogOpen && (
        <CheckoutAddressDialog
          onClose={() => setIsAddressDialogOpen(false)}
          onContinue={handleAddressContinue}
        />
      )}
    </>
  );
};

export default CartDrawer;
