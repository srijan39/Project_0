import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, ChevronRight, CreditCard, MapPin, Package } from "lucide-react";
import { getAddresses } from "../api/address";
import CheckoutAddressDialog from "../components/checkout/CheckoutAddressDialog";
import OptimizedImage from "../components/OptimizedImage";
import type { Address } from "../types/address";
import type { CheckoutSession, ValidatedCheckoutItem } from "../types/checkout";
import {
  clearCheckoutSession,
  getCheckoutSession,
  saveCheckoutSession,
} from "../utils/checkoutSession";
import { validateCheckoutItems } from "../utils/checkoutValidation";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Checkout could not be prepared.";

const CheckoutSkeleton = () => (
  <section className="min-h-screen bg-white px-4 py-8 text-gray-900 sm:px-6 md:px-8 lg:px-12">
    <div className="mx-auto grid w-full max-w-7xl gap-8 lg:grid-cols-[1fr_360px]">
      <div className="space-y-5">
        <div className="h-8 w-40 rounded skeleton" />
        <div className="h-44 rounded-lg border border-gray-200 skeleton" />
        <div className="h-64 rounded-lg border border-gray-200 skeleton" />
      </div>
      <div className="h-80 rounded-lg border border-gray-200 skeleton" />
    </div>
  </section>
);

const formatAddress = (address: Address) =>
  [
    address.addressLine1,
    address.addressLine2,
    address.landmark,
  ]
    .filter(Boolean)
    .join(", ");

const Checkout = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<CheckoutSession | null>(null);
  const [items, setItems] = useState<ValidatedCheckoutItem[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);

  const loadCheckout = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const checkoutSession = getCheckoutSession();

      if (!checkoutSession) {
        setSession(null);
        setItems([]);
        setSelectedAddress(null);
        return;
      }

      const [addresses, validatedItems] = await Promise.all([
        getAddresses(),
        validateCheckoutItems(checkoutSession.items),
      ]);
      const address = addresses.find(
        (savedAddress) => savedAddress._id === checkoutSession.addressId
      );

      if (!address) {
        throw new Error("Please select a valid shipping address.");
      }

      setSession(checkoutSession);
      setItems(validatedItems);
      setSelectedAddress(address);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
      setItems([]);
      setSelectedAddress(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCheckout();
  }, [loadCheckout]);

  const priceSummary = useMemo(() => {
    const actualSubtotal = items.reduce(
      (total, item) => total + item.pricing.actualPrice * item.quantity,
      0
    );
    const subtotal = items.reduce(
      (total, item) => total + item.pricing.sellingPrice * item.quantity,
      0
    );
    const discount = Math.max(0, actualSubtotal - subtotal);
    const shippingFee = 0;

    return {
      actualSubtotal,
      subtotal,
      discount,
      shippingFee,
      total: subtotal + shippingFee,
    };
  }, [items]);

  const handleAddressContinue = (address: Address) => {
    if (!session) return;

    const nextSession = {
      ...session,
      addressId: address._id,
      createdAt: Date.now(),
    };

    saveCheckoutSession(nextSession);
    setSession(nextSession);
    setSelectedAddress(address);
    setIsAddressDialogOpen(false);
  };

  const handleStartOver = () => {
    clearCheckoutSession();
    navigate(session?.source === "buyNow" ? "/products" : "/cart");
  };

  if (isLoading) {
    return <CheckoutSkeleton />;
  }

  if (!session || items.length === 0 || !selectedAddress) {
    return (
      <section className="min-h-screen bg-white px-4 py-12 text-gray-900 sm:px-6 md:px-8 lg:px-12">
        <div className="mx-auto max-w-2xl rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
          <AlertCircle className="mx-auto h-11 w-11 text-gray-400" aria-hidden="true" />
          <h1 className="mt-4 text-2xl font-semibold tracking-tight">
            Checkout unavailable
          </h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
            {errorMessage || "Start checkout from your cart or a product page."}
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              to="/cart"
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-black px-5 text-sm font-medium text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
            >
              Go to Cart
            </Link>
            <Link
              to="/products"
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-gray-200 px-5 text-sm font-medium text-gray-900 transition hover:border-gray-400 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-white px-4 py-8 text-gray-900 sm:px-6 md:px-8 lg:px-12">
      <div className="mx-auto w-full max-w-7xl">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Checkout
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-500 sm:text-base">
            Review your delivery details and order summary before payment.
          </p>
        </header>

        {errorMessage && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <section className="rounded-lg border border-gray-200 bg-white p-5 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-gray-600" aria-hidden="true" />
                    <h2 className="text-base font-semibold">Shipping Address</h2>
                  </div>
                  <div className="mt-5 space-y-1 text-sm text-gray-600">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-gray-900">
                        {selectedAddress.fullName}
                      </p>
                      {selectedAddress.isDefault && (
                        <span className="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs font-medium text-gray-700">
                          Default
                        </span>
                      )}
                    </div>
                    <p>{selectedAddress.phone}</p>
                    <p className="break-words">{formatAddress(selectedAddress)}</p>
                    <p>
                      {selectedAddress.city}, {selectedAddress.state} -{" "}
                      {selectedAddress.pincode}
                    </p>
                    <p>{selectedAddress.country}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddressDialogOpen(true)}
                  className="inline-flex min-h-10 items-center justify-center rounded-md border border-gray-200 px-4 text-sm font-medium text-gray-900 transition hover:border-gray-400 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                >
                  Change Address
                </button>
              </div>
            </section>

            <section className="rounded-lg border border-gray-200 bg-white p-5 sm:p-6">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-gray-600" aria-hidden="true" />
                <h2 className="text-base font-semibold">Order Items</h2>
              </div>

              <div className="mt-5 divide-y divide-gray-200">
                {items.map((item) => (
                  <div
                    key={`${item.product.id}-${item.color ?? ""}-${item.size ?? ""}`}
                    className="grid gap-4 py-5 first:pt-0 last:pb-0 sm:grid-cols-[auto_1fr_auto]"
                  >
                    <OptimizedImage
                      src={item.product.image}
                      alt={item.product.name}
                      width={160}
                      height={200}
                      sizes="80px"
                      wrapperClassName="h-24 w-20 rounded-md bg-gray-100"
                    />
                    <div className="min-w-0">
                      <Link
                        to={`/product/${item.product.id}`}
                        className="break-words text-sm font-semibold text-gray-900 transition hover:text-gray-600"
                      >
                        {item.product.name}
                      </Link>
                      <div className="mt-2 space-y-1 text-sm text-gray-500">
                        <p>Color: {item.color || "Not selected"}</p>
                        <p>Size: {item.size || "Not selected"}</p>
                        <p>Quantity: {item.quantity}</p>
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-sm font-semibold text-gray-900">
                        {currencyFormatter.format(
                          item.pricing.sellingPrice * item.quantity
                        )}
                      </p>
                      {item.pricing.discountPercentage > 0 && (
                        <p className="mt-1 text-xs text-gray-400 line-through">
                          {currencyFormatter.format(
                            item.pricing.actualPrice * item.quantity
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-lg border border-gray-200 bg-white p-5 sm:p-6">
              <h2 className="text-base font-semibold">Delivery</h2>
              <p className="mt-2 text-sm text-gray-500">
                Estimated delivery in 3-5 business days. Delivery is free for this
                checkout.
              </p>
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-lg border border-gray-200 bg-white p-5 sm:p-6">
              <h2 className="text-base font-semibold">Price Details</h2>
              <div className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium">
                    {currencyFormatter.format(priceSummary.actualSubtotal)}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">Discount</span>
                  <span className="font-medium text-green-700">
                    -{currencyFormatter.format(priceSummary.discount)}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">Delivery</span>
                  <span className="font-medium text-green-700">Free</span>
                </div>
                <div className="flex justify-between gap-4 border-t border-gray-200 pt-4 text-base font-semibold">
                  <span>Total</span>
                  <span>{currencyFormatter.format(priceSummary.total)}</span>
                </div>
              </div>
            </section>

            <section className="rounded-lg border border-gray-200 bg-white p-5 sm:p-6">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-gray-600" aria-hidden="true" />
                <h2 className="text-base font-semibold">Payment</h2>
              </div>
              <div className="mt-5 rounded-lg border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm font-medium text-gray-900">
                  Payment gateway is currently unavailable.
                </p>
                <p className="mt-2 text-sm text-gray-500">
                  Online payment integration will be added here. No order will be
                  created and inventory will not be deducted until payment is
                  available.
                </p>
              </div>
              <button
                type="button"
                disabled
                className="mt-5 w-full rounded-md bg-gray-400 py-3 text-sm font-medium text-white disabled:cursor-not-allowed"
              >
                Payment Coming Soon
              </button>
              <button
                type="button"
                onClick={handleStartOver}
                className="mt-3 inline-flex w-full min-h-11 items-center justify-center gap-2 rounded-md border border-gray-200 px-5 text-sm font-medium text-gray-900 transition hover:border-gray-400 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
              >
                Back to {session.source === "buyNow" ? "Shopping" : "Cart"}
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </section>
          </aside>
        </div>
      </div>

      {isAddressDialogOpen && (
        <CheckoutAddressDialog
          onClose={() => setIsAddressDialogOpen(false)}
          onContinue={handleAddressContinue}
        />
      )}
    </section>
  );
};

export default Checkout;
