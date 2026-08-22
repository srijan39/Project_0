import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { X } from "lucide-react";
import type { Address, AddressInput } from "../../types/address";

type AddressFormMode = "add" | "edit";

interface AddressFormProps {
  mode: AddressFormMode;
  initialAddress?: Address | null;
  isSaving: boolean;
  errorMessage: string;
  onClose: () => void;
  onSubmit: (address: AddressInput) => Promise<void>;
}

interface AddressFormState {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  landmark: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  addressType: AddressInput["addressType"];
  isDefault: boolean;
}

const getInitialFormState = (address?: Address | null): AddressFormState => ({
  fullName: address?.fullName ?? "",
  phone: address?.phone ?? "",
  addressLine1: address?.addressLine1 ?? "",
  addressLine2: address?.addressLine2 ?? "",
  landmark: address?.landmark ?? "",
  city: address?.city ?? "",
  state: address?.state ?? "",
  country: address?.country ?? "India",
  pincode: address?.pincode ?? "",
  addressType: address?.addressType ?? "Home",
  isDefault: address?.isDefault ?? false,
});

const requiredFields: Array<keyof AddressFormState> = [
  "fullName",
  "phone",
  "addressLine1",
  "city",
  "state",
  "country",
  "pincode",
];

const inputClassName =
  "w-full rounded-md border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-black";

const labelClassName = "mb-2 block text-sm font-medium text-gray-900";

const AddressForm = ({
  mode,
  initialAddress,
  isSaving,
  errorMessage,
  onClose,
  onSubmit,
}: AddressFormProps) => {
  const [formState, setFormState] = useState<AddressFormState>(() =>
    getInitialFormState(initialAddress)
  );
  const [validationError, setValidationError] = useState("");

  const title = mode === "add" ? "Add Address" : "Edit Address";
  const submitLabel = useMemo(() => {
    if (isSaving) return mode === "add" ? "Adding..." : "Saving...";
    return mode === "add" ? "Add Address" : "Save Changes";
  }, [isSaving, mode]);

  const updateField = <Field extends keyof AddressFormState>(
    field: Field,
    value: AddressFormState[Field]
  ) => {
    setFormState((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const validateForm = () => {
    const missingField = requiredFields.find(
      (field) => !String(formState[field]).trim()
    );

    if (missingField) {
      return "Please complete all required fields.";
    }

    if (!formState.addressType) {
      return "Please select an address type.";
    }

    if (formState.phone.trim().length < 8) {
      return "Enter a valid phone number.";
    }

    if (formState.pincode.trim().length < 4) {
      return "Enter a valid pincode.";
    }

    return "";
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formError = validateForm();

    if (formError) {
      setValidationError(formError);
      return;
    }

    setValidationError("");

    await onSubmit({
      fullName: formState.fullName.trim(),
      phone: formState.phone.trim(),
      addressLine1: formState.addressLine1.trim(),
      addressLine2: formState.addressLine2.trim(),
      landmark: formState.landmark.trim(),
      city: formState.city.trim(),
      state: formState.state.trim(),
      country: formState.country.trim(),
      pincode: formState.pincode.trim(),
      addressType: formState.addressType,
      isDefault: formState.isDefault,
    });
  };

  return (
    <div
      className="fixed inset-0 z-[70] overflow-y-auto bg-black/40 px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="address-form-title"
    >
      <button
        type="button"
        className="fixed inset-0 cursor-default"
        aria-label="Close address form"
        onClick={onClose}
      />

      <div className="relative mx-auto w-full max-w-3xl rounded-lg bg-white shadow-xl">
        <div className="flex items-start justify-between gap-4 border-b border-gray-200 p-5 sm:p-6">
          <div>
            <h2 id="address-form-title" className="text-lg font-semibold text-gray-900">
              {title}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Save delivery details for faster checkout.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-gray-200 text-gray-600 transition hover:border-gray-400 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Close address form"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <form className="space-y-5 p-5 sm:p-6" onSubmit={handleSubmit} noValidate>
          {(validationError || errorMessage) && (
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {validationError || errorMessage}
            </div>
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="address-full-name" className={labelClassName}>
                Full Name
              </label>
              <input
                id="address-full-name"
                value={formState.fullName}
                onChange={(event) => updateField("fullName", event.target.value)}
                className={inputClassName}
                autoComplete="name"
                required
              />
            </div>

            <div>
              <label htmlFor="address-phone" className={labelClassName}>
                Phone
              </label>
              <input
                id="address-phone"
                value={formState.phone}
                onChange={(event) => updateField("phone", event.target.value)}
                className={inputClassName}
                autoComplete="tel"
                inputMode="tel"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="address-line-1" className={labelClassName}>
              Address Line 1
            </label>
            <input
              id="address-line-1"
              value={formState.addressLine1}
              onChange={(event) => updateField("addressLine1", event.target.value)}
              className={inputClassName}
              autoComplete="address-line1"
              required
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="address-line-2" className={labelClassName}>
                Address Line 2
              </label>
              <input
                id="address-line-2"
                value={formState.addressLine2}
                onChange={(event) => updateField("addressLine2", event.target.value)}
                className={inputClassName}
                autoComplete="address-line2"
              />
            </div>

            <div>
              <label htmlFor="address-landmark" className={labelClassName}>
                Landmark
              </label>
              <input
                id="address-landmark"
                value={formState.landmark}
                onChange={(event) => updateField("landmark", event.target.value)}
                className={inputClassName}
              />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            <div>
              <label htmlFor="address-city" className={labelClassName}>
                City
              </label>
              <input
                id="address-city"
                value={formState.city}
                onChange={(event) => updateField("city", event.target.value)}
                className={inputClassName}
                autoComplete="address-level2"
                required
              />
            </div>

            <div>
              <label htmlFor="address-state" className={labelClassName}>
                State
              </label>
              <input
                id="address-state"
                value={formState.state}
                onChange={(event) => updateField("state", event.target.value)}
                className={inputClassName}
                autoComplete="address-level1"
                required
              />
            </div>

            <div>
              <label htmlFor="address-pincode" className={labelClassName}>
                Pincode
              </label>
              <input
                id="address-pincode"
                value={formState.pincode}
                onChange={(event) => updateField("pincode", event.target.value)}
                className={inputClassName}
                autoComplete="postal-code"
                inputMode="numeric"
                required
              />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="address-country" className={labelClassName}>
                Country
              </label>
              <input
                id="address-country"
                value={formState.country}
                onChange={(event) => updateField("country", event.target.value)}
                className={inputClassName}
                autoComplete="country-name"
                required
              />
            </div>

            <div>
              <label htmlFor="address-type" className={labelClassName}>
                Address Type
              </label>
              <select
                id="address-type"
                value={formState.addressType}
                onChange={(event) =>
                  updateField(
                    "addressType",
                    event.target.value as AddressInput["addressType"]
                  )
                }
                className={inputClassName}
                required
              >
                <option value="Home">Home</option>
                <option value="Office">Office</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <label className="flex items-center gap-3 text-sm font-medium text-gray-900">
            <input
              type="checkbox"
              checked={formState.isDefault}
              onChange={(event) => updateField("isDefault", event.target.checked)}
              className="h-4 w-4 rounded border-gray-300 accent-black"
            />
            Set as default delivery address
          </label>

          <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-gray-200 px-5 text-sm font-medium text-gray-900 transition hover:border-gray-400 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-black px-5 text-sm font-medium text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddressForm;
