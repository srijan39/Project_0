import { Building2, CheckCircle2, Home, MapPin, MoreHorizontal } from "lucide-react";
import type { Address } from "../../types/address";

interface AddressCardProps {
  address: Address;
  isBusy?: boolean;
  onEdit: (address: Address) => void;
  onDelete: (address: Address) => void;
  onSetDefault: (address: Address) => void;
}

const addressTypeIcon = {
  Home,
  Office: Building2,
  Other: MoreHorizontal,
};

const AddressCard = ({
  address,
  isBusy = false,
  onEdit,
  onDelete,
  onSetDefault,
}: AddressCardProps) => {
  const TypeIcon = addressTypeIcon[address.addressType];

  return (
    <article className="flex min-w-0 flex-col rounded-lg border border-gray-200 bg-white p-5 transition hover:border-gray-300 sm:p-6">
      <div className="flex min-w-0 items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-gray-200 bg-gray-50">
            <TypeIcon className="h-5 w-5 text-gray-600" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
              {address.addressType}
            </p>
            {address.label && (
              <p className="mt-1 truncate text-sm text-gray-500">{address.label}</p>
            )}
          </div>
        </div>

        {address.isDefault && (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-700">
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
            Default
          </span>
        )}
      </div>

      <div className="mt-6 min-w-0 space-y-3 text-sm text-gray-600">
        <div>
          <p className="break-words text-base font-semibold text-gray-900">
            {address.fullName}
          </p>
          <p className="mt-1">{address.phone}</p>
        </div>

        <div className="space-y-1">
          <p className="break-words">{address.addressLine1}</p>
          {address.addressLine2 && <p className="break-words">{address.addressLine2}</p>}
          {address.landmark && (
            <p className="break-words">Landmark: {address.landmark}</p>
          )}
          <p className="break-words">
            {address.city}, {address.state} - {address.pincode}
          </p>
          <p className="break-words">{address.country}</p>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-2 border-t border-gray-200 pt-4 sm:flex-row sm:flex-wrap sm:items-center">
        {!address.isDefault && (
          <button
            type="button"
            disabled={isBusy}
            onClick={() => onSetDefault(address)}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-gray-200 px-4 text-sm font-medium text-gray-900 transition hover:border-gray-400 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:cursor-not-allowed disabled:text-gray-400"
          >
            <MapPin className="h-4 w-4" aria-hidden="true" />
            Set as Default
          </button>
        )}

        <button
          type="button"
          disabled={isBusy}
          onClick={() => onEdit(address)}
          className="inline-flex min-h-10 items-center justify-center rounded-md border border-gray-200 px-4 text-sm font-medium text-gray-900 transition hover:border-gray-400 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:cursor-not-allowed disabled:text-gray-400"
        >
          Edit
        </button>

        <button
          type="button"
          disabled={isBusy}
          onClick={() => onDelete(address)}
          className="inline-flex min-h-10 items-center justify-center rounded-md border border-gray-200 px-4 text-sm font-medium text-red-600 transition hover:border-red-200 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:text-gray-400"
        >
          Delete
        </button>
      </div>
    </article>
  );
};

export default AddressCard;
