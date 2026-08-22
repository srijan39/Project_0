import { useCallback, useEffect, useState } from "react";
import { MapPin, Plus, RefreshCw, X } from "lucide-react";
import {
  addAddress,
  deleteAddress,
  getAddresses,
  setDefaultAddress,
  updateAddress,
} from "../api/address";
import AddressCard from "../components/account/AddressCard";
import AddressForm from "../components/account/AddressForm";
import type { Address, AddressInput } from "../types/address";

type FormState =
  | { mode: "add"; address: null }
  | { mode: "edit"; address: Address };

const getErrorMessage = (error: unknown) =>
  error instanceof Error
    ? error.message
    : "Something went wrong. Please try again.";

const AddressSkeleton = () => (
  <div className="grid gap-4 lg:grid-cols-2">
    {[1, 2].map((item) => (
      <div key={item} className="rounded-lg border border-gray-200 p-5 sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-md skeleton" />
            <div className="space-y-2">
              <div className="h-3 w-20 rounded skeleton" />
              <div className="h-3 w-28 rounded skeleton" />
            </div>
          </div>
          <div className="h-7 w-20 rounded-full skeleton" />
        </div>
        <div className="mt-6 space-y-3">
          <div className="h-4 w-40 rounded skeleton" />
          <div className="h-4 w-32 rounded skeleton" />
          <div className="h-4 w-full rounded skeleton" />
          <div className="h-4 w-2/3 rounded skeleton" />
        </div>
        <div className="mt-6 flex gap-2 border-t border-gray-200 pt-4">
          <div className="h-10 w-28 rounded-md skeleton" />
          <div className="h-10 w-20 rounded-md skeleton" />
        </div>
      </div>
    ))}
  </div>
);

const Addresses = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [busyAddressId, setBusyAddressId] = useState<string | null>(null);
  const [formState, setFormState] = useState<FormState | null>(null);
  const [addressToDelete, setAddressToDelete] = useState<Address | null>(null);

  const fetchAddresses = useCallback(async () => {
    setIsLoading(true);
    setPageError("");

    try {
      setAddresses(await getAddresses());
    } catch (error) {
      setPageError(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchAddresses();
  }, [fetchAddresses]);

  const openAddForm = () => {
    setFormError("");
    setFormState({ mode: "add", address: null });
  };

  const openEditForm = (address: Address) => {
    setFormError("");
    setFormState({ mode: "edit", address });
  };

  const closeForm = () => {
    if (isSaving) return;

    setFormError("");
    setFormState(null);
  };

  const handleSubmitAddress = async (input: AddressInput) => {
    if (!formState) return;

    setIsSaving(true);
    setFormError("");

    try {
      const payload = {
        ...input,
        isDefault: addresses.length === 0 ? true : input.isDefault,
      };

      const nextAddresses =
        formState.mode === "add"
          ? await addAddress(payload)
          : await updateAddress(formState.address._id, payload);

      setAddresses(nextAddresses);
      setFormState(null);
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  const handleSetDefault = async (address: Address) => {
    setBusyAddressId(address._id);
    setPageError("");

    try {
      setAddresses(await setDefaultAddress(address._id));
    } catch (error) {
      setPageError(getErrorMessage(error));
    } finally {
      setBusyAddressId(null);
    }
  };

  const handleDeleteAddress = async () => {
    if (!addressToDelete) return;

    setBusyAddressId(addressToDelete._id);
    setPageError("");

    try {
      setAddresses(await deleteAddress(addressToDelete._id));
      setAddressToDelete(null);
    } catch (error) {
      setPageError(getErrorMessage(error));
    } finally {
      setBusyAddressId(null);
    }
  };

  return (
    <section className="min-h-screen bg-white px-4 py-8 text-gray-900 sm:px-6 md:px-8 lg:px-12">
      <div className="mx-auto w-full max-w-7xl">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Addresses
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-gray-500 sm:text-base">
              Manage your saved delivery addresses.
            </p>
          </div>

          <button
            type="button"
            onClick={openAddForm}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-black px-5 text-sm font-medium text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add New Address
          </button>
        </header>

        {pageError && (
          <div
            role="alert"
            className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p>{pageError}</p>
              <button
                type="button"
                onClick={fetchAddresses}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-red-200 bg-white px-3 text-sm font-medium text-red-700 transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                Retry
              </button>
            </div>
          </div>
        )}

        <section>
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold">Saved Addresses</h2>
              <p className="mt-1 text-sm text-gray-500">
                {addresses.length} saved address{addresses.length === 1 ? "" : "es"}
              </p>
            </div>
          </div>

          {isLoading ? (
            <AddressSkeleton />
          ) : addresses.length > 0 ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {addresses.map((address) => (
                <AddressCard
                  key={address._id}
                  address={address}
                  isBusy={busyAddressId === address._id}
                  onEdit={openEditForm}
                  onDelete={setAddressToDelete}
                  onSetDefault={handleSetDefault}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-6 py-12 text-center">
              <MapPin className="mx-auto h-11 w-11 text-gray-400" aria-hidden="true" />
              <h2 className="mt-4 text-lg font-semibold text-gray-900">
                No saved addresses
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
                Add an address to make checkout faster and easier.
              </p>
              <button
                type="button"
                onClick={openAddForm}
                className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-black px-5 text-sm font-medium text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Add Address
              </button>
            </div>
          )}
        </section>
      </div>

      {formState && (
        <AddressForm
          mode={formState.mode}
          initialAddress={formState.address}
          isSaving={isSaving}
          errorMessage={formError}
          onClose={closeForm}
          onSubmit={handleSubmitAddress}
        />
      )}

      {addressToDelete && (
        <div
          className="fixed inset-0 z-[80] overflow-y-auto bg-black/40 px-4 py-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-address-title"
        >
          <button
            type="button"
            className="fixed inset-0 cursor-default"
            aria-label="Cancel address deletion"
            onClick={() => setAddressToDelete(null)}
          />

          <div className="relative mx-auto mt-24 w-full max-w-md rounded-lg bg-white shadow-xl">
            <div className="flex items-start justify-between gap-4 border-b border-gray-200 p-5">
              <div>
                <h2 id="delete-address-title" className="text-lg font-semibold text-gray-900">
                  Delete Address
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  This saved address will be removed from your account.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAddressToDelete(null)}
                disabled={busyAddressId === addressToDelete._id}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-gray-200 text-gray-600 transition hover:border-gray-400 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Close delete confirmation"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="p-5">
              <p className="text-sm text-gray-600">
                Are you sure you want to delete the address for{" "}
                <span className="font-medium text-gray-900">
                  {addressToDelete.fullName}
                </span>
                ?
              </p>

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setAddressToDelete(null)}
                  disabled={busyAddressId === addressToDelete._id}
                  className="inline-flex min-h-11 items-center justify-center rounded-md border border-gray-200 px-5 text-sm font-medium text-gray-900 transition hover:border-gray-400 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAddress}
                  disabled={busyAddressId === addressToDelete._id}
                  className="inline-flex min-h-11 items-center justify-center rounded-md bg-red-600 px-5 text-sm font-medium text-white transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                  {busyAddressId === addressToDelete._id ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Addresses;
