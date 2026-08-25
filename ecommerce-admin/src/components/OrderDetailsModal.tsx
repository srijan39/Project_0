import { useEffect, useState } from "react";
import { getApiErrorMessage } from "../api/axios";
import { updateAdminOrderStatus } from "../api/orders";
import OptimizedImage from "./OptimizedImage";
import type { Order, OrderStatus, PaymentStatus } from "../types/order";

interface OrderDetailsModalProps {
  order: Order | null;
  isLoading: boolean;
  errorMessage: string;
  onClose: () => void;
  onOrderUpdated: (order: Order) => void;
}

const orderStatuses: OrderStatus[] = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const dateTimeFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const statusLabels: Record<OrderStatus | PaymentStatus, string> = {
  pending: "Pending",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  paid: "Paid",
  failed: "Failed",
};

const statusClassNames: Record<OrderStatus | PaymentStatus, string> = {
  pending: "border-amber-200 bg-amber-50 text-amber-700",
  processing: "border-blue-200 bg-blue-50 text-blue-700",
  shipped: "border-indigo-200 bg-indigo-50 text-indigo-700",
  delivered: "border-emerald-200 bg-emerald-50 text-emerald-700",
  cancelled: "border-red-200 bg-red-50 text-red-700",
  paid: "border-emerald-200 bg-emerald-50 text-emerald-700",
  failed: "border-red-200 bg-red-50 text-red-700",
};

const getOrderDisplayId = (id: string) => `#${id.slice(-6).toUpperCase()}`;

const getCustomerName = (order: Order) =>
  typeof order.user === "object"
    ? order.user.name
    : order.shippingAddress?.fullName ?? "Customer";

const getCustomerEmail = (order: Order) =>
  typeof order.user === "object" ? order.user.email : "";

const StatusBadge = ({ status }: { status: OrderStatus | PaymentStatus }) => (
  <span
    className={[
      "inline-flex w-fit rounded-full border px-2.5 py-1 text-xs font-semibold",
      statusClassNames[status],
    ].join(" ")}
  >
    {statusLabels[status]}
  </span>
);

const OrderDetailsModal = ({
  order,
  isLoading,
  errorMessage,
  onClose,
  onOrderUpdated,
}: OrderDetailsModalProps) => {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>("pending");
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState("");
  const [updateSuccess, setUpdateSuccess] = useState("");

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  useEffect(() => {
    if (order) {
      setSelectedStatus(order.status);
      setUpdateError("");
      setUpdateSuccess("");
    }
  }, [order]);

  const handleStatusUpdate = async () => {
    if (!order || selectedStatus === order.status || isUpdating) return;

    const confirmed = window.confirm(
      `Change order status to ${statusLabels[selectedStatus]}?`
    );

    if (!confirmed) return;

    setIsUpdating(true);
    setUpdateError("");
    setUpdateSuccess("");

    try {
      const response = await updateAdminOrderStatus(order._id, selectedStatus);
      onOrderUpdated(response.data);
      setUpdateSuccess("Order status updated successfully.");
    } catch (error) {
      setUpdateError(getApiErrorMessage(error));
      setSelectedStatus(order.status);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-slate-950/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-order-title"
    >
      <button
        type="button"
        aria-label="Close order details"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
      />

      <div className="absolute inset-y-0 right-0 flex w-full max-w-5xl flex-col bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
          <div className="min-w-0">
            <h2
              id="admin-order-title"
              className="text-lg font-bold text-slate-950"
            >
              {order ? `Order ${getOrderDisplayId(order._id)}` : "Order Details"}
            </h2>
            {order && (
              <p className="mt-1 break-all text-sm text-slate-500">
                {order._id}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            Close
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {isLoading && (
            <div className="space-y-4">
              <div className="h-24 animate-pulse rounded-xl bg-slate-200" />
              <div className="h-48 animate-pulse rounded-xl bg-slate-200" />
              <div className="h-32 animate-pulse rounded-xl bg-slate-200" />
            </div>
          )}

          {!isLoading && errorMessage && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-5 text-sm font-medium text-red-700">
              {errorMessage}
            </div>
          )}

          {!isLoading && order && (
            <div className="space-y-5">
              <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Order Date
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-950">
                    {dateTimeFormatter.format(new Date(order.createdAt))}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Order Status
                  </p>
                  <div className="mt-2">
                    <StatusBadge status={order.status} />
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Payment Status
                  </p>
                  <div className="mt-2">
                    <StatusBadge status={order.paymentStatus} />
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Total
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-950">
                    {currencyFormatter.format(order.totalAmount)}
                  </p>
                </div>
              </section>

              <section className="grid gap-5 xl:grid-cols-[1fr_320px]">
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <h3 className="text-base font-bold text-slate-950">
                    Customer
                  </h3>
                  <div className="mt-3 space-y-1 text-sm text-slate-600">
                    <p className="font-semibold text-slate-950">
                      {getCustomerName(order)}
                    </p>
                    {getCustomerEmail(order) && <p>{getCustomerEmail(order)}</p>}
                    {order.shippingAddress?.phone && (
                      <p>{order.shippingAddress.phone}</p>
                    )}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <h3 className="text-base font-bold text-slate-950">
                    Status Control
                  </h3>
                  <div className="mt-3 space-y-3">
                    <select
                      value={selectedStatus}
                      disabled={order.status === "cancelled" || isUpdating}
                      onChange={(event) =>
                        setSelectedStatus(event.target.value as OrderStatus)
                      }
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
                    >
                      {orderStatuses.map((status) => (
                        <option key={status} value={status}>
                          {statusLabels[status]}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={handleStatusUpdate}
                      disabled={
                        order.status === "cancelled" ||
                        selectedStatus === order.status ||
                        isUpdating
                      }
                      className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isUpdating ? "Updating..." : "Update Status"}
                    </button>
                    {updateSuccess && (
                      <p className="text-sm font-medium text-emerald-700">
                        {updateSuccess}
                      </p>
                    )}
                    {updateError && (
                      <p className="text-sm font-medium text-red-700">
                        {updateError}
                      </p>
                    )}
                  </div>
                </div>
              </section>

              <section className="rounded-xl border border-slate-200 bg-white">
                <div className="border-b border-slate-200 px-4 py-3">
                  <h3 className="text-base font-bold text-slate-950">
                    Ordered Products
                  </h3>
                </div>
                <div className="divide-y divide-slate-200">
                  {order.items.map((item, index) => {
                    const color = item.variantSnapshot?.color ?? item.color;
                    const size = item.variantSnapshot?.size ?? item.size;

                    return (
                      <div
                        key={`${order._id}-${item.name}-${index}`}
                        className="grid gap-4 p-4 sm:grid-cols-[80px_1fr_auto]"
                      >
                        <OptimizedImage
                          src={item.image}
                          alt={item.name}
                          width={160}
                          height={200}
                          sizes="80px"
                          priority={index === 0}
                          wrapperClassName="h-24 w-20 rounded-lg bg-slate-100"
                        />
                        <div className="min-w-0">
                          <p className="break-words text-sm font-semibold text-slate-950">
                            {item.name}
                          </p>
                          <div className="mt-2 grid gap-1 text-sm text-slate-500 sm:grid-cols-2">
                            <p>Color: {color || "Not selected"}</p>
                            <p>Size: {size || "Not selected"}</p>
                            <p>Quantity: {item.quantity}</p>
                            <p>
                              Unit Price: {currencyFormatter.format(item.price)}
                            </p>
                          </div>
                        </div>
                        <div className="text-left sm:text-right">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Item Total
                          </p>
                          <p className="mt-1 text-sm font-semibold text-slate-950">
                            {currencyFormatter.format(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="grid gap-5 xl:grid-cols-[1fr_320px]">
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <h3 className="text-base font-bold text-slate-950">
                    Shipping Address
                  </h3>
                  {order.shippingAddress ? (
                    <div className="mt-3 space-y-1 text-sm text-slate-600">
                      <p className="font-semibold text-slate-950">
                        {order.shippingAddress.fullName}
                      </p>
                      <p>{order.shippingAddress.phone}</p>
                      <p>{order.shippingAddress.addressLine1}</p>
                      {order.shippingAddress.addressLine2 && (
                        <p>{order.shippingAddress.addressLine2}</p>
                      )}
                      <p>
                        {order.shippingAddress.city},{" "}
                        {order.shippingAddress.state}{" "}
                        {order.shippingAddress.postalCode}
                      </p>
                      <p>{order.shippingAddress.country}</p>
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-slate-500">
                      Shipping address is unavailable for this order.
                    </p>
                  )}
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <h3 className="text-base font-bold text-slate-950">
                    Price Summary
                  </h3>
                  <div className="mt-4 space-y-3 text-sm">
                    <div className="flex justify-between gap-4">
                      <span className="text-slate-500">Subtotal</span>
                      <span className="font-semibold text-slate-950">
                        {currencyFormatter.format(order.subtotal)}
                      </span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-slate-500">Shipping</span>
                      <span className="font-semibold text-slate-950">
                        {currencyFormatter.format(order.shippingFee)}
                      </span>
                    </div>
                    <div className="flex justify-between gap-4 border-t border-slate-200 pt-3 text-base font-bold text-slate-950">
                      <span>Total</span>
                      <span>{currencyFormatter.format(order.totalAmount)}</span>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;
