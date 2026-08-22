import { useCallback, useEffect, useMemo, useState } from "react";
import { MapPin, Plus, RefreshCw, X } from "lucide-react";
import {
  addAddress,
  getAddresses,
  setDefaultAddress,
} from "../../api/address";
import AddressForm from "../account/AddressForm";
import type { Address, AddressInput } from "../../types/address";

interface CheckoutAddressDialogProps {
  onClose: () => void;
  onContinue: (address: Address) => void;
}

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Something went wrong. Please try again.";

const CheckoutAddressDialog = ({
  onClose,
  onContinue,
}: CheckoutAddressDialogProps) => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [busyAddressId, setBusyAddressId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [formErrorMessage, setFormErrorMessage] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);

  const selectedAddress = useMemo(
    () =>
      addresses.find((address) => address._id === selectedAddressId) ??
      addresses.find((address) => address.isDefault) ??
      addresses[0],
    [addresses, selectedAddressId]
  );

  const loadAddresses = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const savedAddresses = await getAddresses();
      setAddresses(savedAddresses);
      setSelectedAddressId(
        savedAddresses.find((address) => address.isDefault)?._id ??
          savedAddresses[0]?._id ??
          ""
      );
      setIsFormOpen(savedAddresses.length === 0);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAddresses();
  }, [loadAddresses]);

  const handleAddAddress = async (input: AddressInput) => {
    setIsSaving(true);
    setFormErrorMessage("");

    try {
      const nextAddresses = await addAddress({
        ...input,
        isDefault: addresses.length === 0 ? true : input.isDefault,
      });
      const defaultAddress =
        nextAddresses.find((address) => address.isDefault) ??
        nextAddresses[nextAddresses.length - 1];

      setAddresses(nextAddresses);
      setSelectedAddressId(defaultAddress?._id ?? "");
      setIsFormOpen(false);
    } catch (error) {
      setFormErrorMessage(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  const handleSetDefault = async (address: Address) => {
    setBusyAddressId(address._id);
    setErrorMessage("");

    try {
      const nextAddresses = await setDefaultAddress(address._id);
      setAddresses(nextAddresses);
      setSelectedAddressId(address._id);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setBusyAddressId(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] overflow-y-auto bg-black/40 px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-address-title"
    >
      <button
        type="button"
        className="fixed inset-0 cursor-default"
        aria-label="Close address selection"
        onClick={onClose}
      />

      <div className="relative mx-auto w-full max-w-3xl rounded-lg bg-white shadow-xl">
        <div className="flex items-start justify-between gap-4 border-b border-gray-200 p-5 sm:p-6">
          <div>
            <h2 id="checkout-address-title" className="text-lg font-semibold text-gray-900">
              Select Shipping Address
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Choose where your Atelier order should be delivered.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-gray-200 text-gray-600 transition hover:border-gray-400 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
            aria-label="Close address selection"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="p-5 sm:p-6">
          {errorMessage && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p>{errorMessage}</p>
                <button
                  type="button"
                  onClick={loadAddresses}
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-red-200 bg-white px-3 text-sm font-medium text-red-700 transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  <RefreshCw className="h-4 w-4" aria-hidden="true" />
                  Retry
                </button>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2].map((item) => (
                <div key={item} className="h-36 rounded-lg border border-gray-200 skeleton" />
              ))}
            </div>
          ) : addresses.length > 0 ? (
            <div className="space-y-3">
              {addresses.map((address) => {
                const isSelected = selectedAddress?._id === address._id;

                return (
                  <label
                    key={address._id}
                    className={`block cursor-pointer rounded-lg border p-4 transition ${
                      isSelected
                        ? "border-black bg-white"
                        : "border-gray-200 bg-white hover:border-gray-400"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="checkout-address"
                        checked={isSelected}
                        onChange={() => setSelectedAddressId(address._id)}
                        className="mt-1 h-4 w-4 accent-black"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                            {address.addressType}
                          </p>
                          {address.isDefault && (
                            <span className="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs font-medium text-gray-700">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="mt-3 text-sm font-semibold text-gray-900">
                          {address.fullName}
                        </p>
                        <p className="mt-1 text-sm text-gray-500">{address.phone}</p>
                        <p className="mt-3 break-words text-sm text-gray-600">
                          {address.addressLine1}
                          {address.addressLine2 ? `, ${address.addressLine2}` : ""}
                          {address.landmark ? `, ${address.landmark}` : ""}
                        </p>
                        <p className="mt-1 text-sm text-gray-600">
                          {address.city}, {address.state} - {address.pincode}
                        </p>
                        <p className="mt-1 text-sm text-gray-600">{address.country}</p>
                      </div>
                    </div>

                    {!address.isDefault && (
                      <button
                        type="button"
                        disabled={busyAddressId === address._id}
                        onClick={(event) => {
                          event.preventDefault();
                          void handleSetDefault(address);
                        }}
                        className="mt-4 inline-flex min-h-10 items-center justify-center rounded-md border border-gray-200 px-3 text-sm font-medium text-gray-900 transition hover:border-gray-400 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:cursor-not-allowed disabled:text-gray-400"
                      >
                        {busyAddressId === address._id ? "Updating..." : "Set as Default"}
                      </button>
                    )}
                  </label>
                );
              })}
            </div>
          ) : (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center">
              <MapPin className="mx-auto h-10 w-10 text-gray-400" aria-hidden="true" />
              <h3 className="mt-4 text-base font-semibold text-gray-900">
                No saved addresses
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Add a delivery address before continuing to checkout.
              </p>
            </div>
          )}

          <div className="mt-6 flex flex-col-reverse gap-3 border-t border-gray-200 pt-5 sm:flex-row sm:justify-between">
            <button
              type="button"
              onClick={() => setIsFormOpen(true)}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-gray-200 px-5 text-sm font-medium text-gray-900 transition hover:border-gray-400 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add New Address
            </button>
            <button
              type="button"
              disabled={!selectedAddress || isLoading}
              onClick={() => selectedAddress && onContinue(selectedAddress)}
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-black px-5 text-sm font-medium text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              Continue to Checkout
            </button>
          </div>
        </div>
      </div>

      {isFormOpen && (
        <AddressForm
          mode="add"
          isSaving={isSaving}
          errorMessage={formErrorMessage}
          onClose={() => {
            if (!isSaving) setIsFormOpen(false);
          }}
          onSubmit={handleAddAddress}
        />
      )}
    </div>
  );
};

export default CheckoutAddressDialog;
