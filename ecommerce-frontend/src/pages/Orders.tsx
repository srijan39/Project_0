import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronRight,
  Filter,
  Package,
  RefreshCw,
  Search,
  X,
} from "lucide-react";

import {
  cancelOrder as cancelOrderRequest,
  getOrders,
  type Order,
  type OrderStatus,
} from "../api/order";
import OrderStatusBadge from "../components/account/OrderStatusBadge";
import OptimizedImage from "../components/OptimizedImage";

type StatusFilter = "all" | OrderStatus;

const statusFilters: StatusFilter[] = [
  "all",
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

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const formatDate = (date: string) => dateFormatter.format(new Date(date));

const formatStatusLabel = (status: StatusFilter) =>
  status === "all"
    ? "All"
    : status.charAt(0).toUpperCase() + status.slice(1);

const getItemCountLabel = (order: Order) => {
  const count = order.items.reduce((total, item) => total + item.quantity, 0);
  return `${count} item${count === 1 ? "" : "s"}`;
};

const canCancelOrder = (order: Order) =>
  order.status !== "delivered" && order.status !== "cancelled";

const OrdersSkeleton = () => (
  <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
    {[1, 2, 3, 4, 5, 6].map((item) => (
      <div key={item} className="rounded-lg border border-gray-200 p-5">
        <div className="h-4 w-2/3 rounded skeleton" />
        <div className="mt-3 h-4 w-28 rounded skeleton" />
        <div className="mt-8 h-4 w-20 rounded skeleton" />
        <div className="mt-3 h-7 w-24 rounded skeleton" />
        <div className="mt-8 h-10 rounded-md skeleton" />
      </div>
    ))}
  </div>
);

interface OrderDetailsModalProps {
  order: Order;
  isCancelling: boolean;
  onClose: () => void;
  onCancelOrder: (order: Order) => void;
}

const OrderDetailsModal = ({
  order,
  isCancelling,
  onClose,
  onCancelOrder,
}: OrderDetailsModalProps) => {
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

  return (
    <div
      className="fixed inset-0 z-[70] overflow-y-auto bg-black/40 px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="order-details-title"
    >
      <button
        type="button"
        className="fixed inset-0 cursor-default"
        aria-label="Close order details"
        onClick={onClose}
      />

      <div className="relative mx-auto w-full max-w-4xl rounded-lg bg-white shadow-xl">
        <div className="flex items-start justify-between gap-4 border-b border-gray-200 p-5 sm:p-6">
          <div className="min-w-0">
            <h2
              id="order-details-title"
              className="text-lg font-semibold text-gray-900 sm:text-xl"
            >
              Order Information
            </h2>
            <p className="mt-1 break-all text-sm text-gray-500">
              Order #{order._id}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-gray-200 text-gray-600 transition hover:border-gray-400 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
            aria-label="Close order details"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="space-y-8 p-5 sm:p-6">
          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="text-xs font-medium uppercase text-gray-500">
                Order ID
              </p>
              <p className="mt-2 break-all text-sm font-semibold text-gray-900">
                {order._id}
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="text-xs font-medium uppercase text-gray-500">
                Date
              </p>
              <p className="mt-2 text-sm font-semibold text-gray-900">
                {formatDate(order.createdAt)}
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="text-xs font-medium uppercase text-gray-500">
                Status
              </p>
              <OrderStatusBadge status={order.status} className="mt-2" />
            </div>
            <div className="rounded-lg border border-gray-200 p-4">
              <p className="text-xs font-medium uppercase text-gray-500">
                Payment Status
              </p>
              <OrderStatusBadge status={order.paymentStatus} className="mt-2" />
            </div>
          </section>

          <section>
            <h3 className="text-base font-semibold text-gray-900">
              Items Purchased
            </h3>
            <div className="mt-4 divide-y divide-gray-200 rounded-lg border border-gray-200">
              {order.items.map((item, index) => (
                <div
                  key={`${order._id}-${item.name}-${index}`}
                  className="grid gap-4 p-4 sm:grid-cols-[auto_1fr_auto]"
                >
                  <OptimizedImage
                    src={item.image}
                    alt={item.name}
                    width={120}
                    height={144}
                    sizes="80px"
                    wrapperClassName="h-24 w-20 rounded-md bg-gray-100"
                  />
                  <div className="min-w-0">
                    <p className="break-words text-sm font-semibold text-gray-900">
                      {item.name}
                    </p>
                    <div className="mt-2 grid gap-1 text-sm text-gray-500 sm:grid-cols-2">
                      <p>Selected Size: {item.size || "Not selected"}</p>
                      <p>Selected Color: {item.color || "Not selected"}</p>
                      <p>Quantity: {item.quantity}</p>
                      <p>Price: {currencyFormatter.format(item.price)}</p>
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-xs font-medium uppercase text-gray-500">
                      Item Total
                    </p>
                    <p className="mt-1 text-sm font-semibold text-gray-900">
                      {currencyFormatter.format(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-[1fr_320px]">
            <div className="rounded-lg border border-gray-200 p-4">
              <h3 className="text-base font-semibold text-gray-900">
                Shipping Address
              </h3>
              {order.shippingAddress ? (
                <div className="mt-3 space-y-1 text-sm text-gray-600">
                  <p className="font-medium text-gray-900">
                    {order.shippingAddress.fullName}
                  </p>
                  <p>{order.shippingAddress.phone}</p>
                  <p>{order.shippingAddress.addressLine1}</p>
                  {order.shippingAddress.addressLine2 && (
                    <p>{order.shippingAddress.addressLine2}</p>
                  )}
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                    {order.shippingAddress.postalCode}
                  </p>
                  <p>{order.shippingAddress.country}</p>
                </div>
              ) : (
                <p className="mt-3 text-sm text-gray-500">
                  Shipping address is unavailable for this order.
                </p>
              )}
            </div>

            <div className="rounded-lg border border-gray-200 p-4">
              <h3 className="text-base font-semibold text-gray-900">
                Pricing Summary
              </h3>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium">
                    {currencyFormatter.format(order.subtotal)}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">Shipping Fee</span>
                  <span className="font-medium">
                    {currencyFormatter.format(order.shippingFee)}
                  </span>
                </div>
                <div className="flex justify-between gap-4 border-t border-gray-200 pt-3 text-base font-semibold">
                  <span>Total Amount</span>
                  <span>{currencyFormatter.format(order.totalAmount)}</span>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-gray-200 p-5 sm:flex-row sm:justify-end sm:p-6">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-gray-200 px-5 text-sm font-medium text-gray-900 transition hover:border-gray-400 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
          >
            Close
          </button>
          {canCancelOrder(order) && (
            <button
              type="button"
              disabled={isCancelling}
              onClick={() => onCancelOrder(order)}
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-black px-5 text-sm font-medium text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {isCancelling ? "Cancelling" : "Cancel Order"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getOrders();
      setOrders(response.data);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "We could not load your orders right now."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const sortedOrders = useMemo(
    () =>
      [...orders].sort(
        (first, second) =>
          new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime()
      ),
    [orders]
  );

  const filteredOrders = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return sortedOrders.filter((order) => {
      const matchesSearch =
        !normalizedSearch || order._id.toLowerCase().includes(normalizedSearch);
      const matchesStatus =
        statusFilter === "all" || order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, sortedOrders, statusFilter]);

  const handleCancelOrder = async (order: Order) => {
    const confirmed = window.confirm(
      "Cancel this order? This action will update the order status."
    );

    if (!confirmed) return;

    setCancellingOrderId(order._id);
    setError(null);

    try {
      const response = await cancelOrderRequest(order._id);
      setOrders((currentOrders) =>
        currentOrders.map((currentOrder) =>
          currentOrder._id === order._id ? response.data : currentOrder
        )
      );
      setSelectedOrder((currentOrder) =>
        currentOrder?._id === order._id ? response.data : currentOrder
      );
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "We could not cancel this order. Please try again."
      );
    } finally {
      setCancellingOrderId(null);
    }
  };

  const hasNoOrders = !loading && !error && orders.length === 0;
  const hasNoMatches = !loading && !error && orders.length > 0 && filteredOrders.length === 0;

  return (
    <section className="min-h-screen bg-white px-4 py-8 text-gray-900 sm:px-6 md:px-8 lg:px-12">
      <div className="mx-auto w-full max-w-7xl">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            My Orders
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-500 sm:text-base">
            Track and manage all your purchases.
          </p>
        </header>

        <div className="mb-6 grid gap-3 lg:grid-cols-[1fr_240px_auto]">
          <label className="relative block min-w-0">
            <span className="sr-only">Search by Order ID</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by Order ID"
              className="min-h-11 w-full rounded-md border border-gray-200 bg-white py-2 pl-10 pr-4 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-black/10"
            />
          </label>

          <label className="relative block min-w-0">
            <span className="sr-only">Filter by Status</span>
            <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
              className="min-h-11 w-full appearance-none rounded-md border border-gray-200 bg-white py-2 pl-10 pr-9 text-sm outline-none transition focus:border-black focus:ring-2 focus:ring-black/10"
            >
              {statusFilters.map((status) => (
                <option key={status} value={status}>
                  {formatStatusLabel(status)}
                </option>
              ))}
            </select>
            <ChevronRight className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-gray-400" />
          </label>

          <button
            type="button"
            onClick={fetchOrders}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-gray-200 px-4 text-sm font-medium text-gray-900 transition hover:border-gray-400 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Retry
          </button>
        </div>

        {loading && <OrdersSkeleton />}

        {error && !loading && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center">
            <Package className="mx-auto h-10 w-10 text-gray-400" aria-hidden="true" />
            <h2 className="mt-4 text-lg font-semibold text-gray-900">
              Orders could not be loaded
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">{error}</p>
            <button
              type="button"
              onClick={fetchOrders}
              className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-black px-5 text-sm font-medium text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Retry
            </button>
          </div>
        )}

        {hasNoOrders && (
          <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-lg border border-gray-200 bg-gray-50 px-6 py-12 text-center">
            <Package className="h-12 w-12 text-gray-400" aria-hidden="true" />
            <h2 className="mt-5 text-xl font-semibold text-gray-900">
              No Orders Yet
            </h2>
            <p className="mt-2 max-w-md text-sm text-gray-500">
              You have not placed any orders yet.
            </p>
            <Link
              to="/products"
              className="mt-6 inline-flex min-h-11 items-center justify-center rounded-md bg-black px-6 text-sm font-medium text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
            >
              Start Shopping
            </Link>
          </div>
        )}

        {hasNoMatches && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center">
            <Package className="mx-auto h-10 w-10 text-gray-400" aria-hidden="true" />
            <h2 className="mt-4 text-lg font-semibold text-gray-900">
              No matching orders
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Try another order ID or status filter.
            </p>
          </div>
        )}

        {!loading && !error && filteredOrders.length > 0 && (
          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {filteredOrders.map((order) => (
              <article
                key={order._id}
                className="flex min-w-0 flex-col rounded-lg border border-gray-200 bg-white p-5 transition hover:border-gray-400 hover:shadow-sm"
              >
                <div className="flex min-w-0 items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="break-all text-base font-semibold text-gray-900">
                      Order #{order._id}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <OrderStatusBadge status={order.status} />
                </div>

                <div className="mt-8 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium uppercase text-gray-500">
                      Items
                    </p>
                    <p className="mt-1 text-sm font-semibold text-gray-900">
                      {getItemCountLabel(order)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium uppercase text-gray-500">
                      Total
                    </p>
                    <p className="mt-1 text-lg font-semibold text-gray-900">
                      {currencyFormatter.format(order.totalAmount)}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-3 border-t border-gray-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
                  {canCancelOrder(order) ? (
                    <button
                      type="button"
                      disabled={cancellingOrderId === order._id}
                      onClick={() => handleCancelOrder(order)}
                      className="inline-flex min-h-10 items-center justify-center rounded-md border border-gray-200 px-4 text-sm font-medium text-gray-900 transition hover:border-gray-400 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:cursor-not-allowed disabled:text-gray-400"
                    >
                      {cancellingOrderId === order._id ? "Cancelling" : "Cancel"}
                    </button>
                  ) : (
                    <span className="text-sm text-gray-500">
                      {order.status === "delivered"
                        ? "Delivered orders cannot be cancelled"
                        : "Order cancelled"}
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => setSelectedOrder(order)}
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-black px-4 text-sm font-medium text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                  >
                    View Details
                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          isCancelling={cancellingOrderId === selectedOrder._id}
          onClose={() => setSelectedOrder(null)}
          onCancelOrder={handleCancelOrder}
        />
      )}
    </section>
  );
};

export default Orders;
