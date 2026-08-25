import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { getApiErrorMessage } from "../api/axios";
import { getAdminOrderById, getAdminOrders } from "../api/orders";
import OrderDetailsModal from "../components/OrderDetailsModal";
import { preloadOptimizedImage } from "../utils/images";
import type { Order, OrderStatus, PaymentStatus } from "../types/order";

type StatusFilter = "all" | OrderStatus;

const PAGE_SIZE = 20;

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

const statusLabels: Record<OrderStatus | PaymentStatus | "all", string> = {
  all: "All",
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

const getItemCount = (order: Order) =>
  order.items.reduce((total, item) => total + item.quantity, 0);

const preloadOrderImages = (order: Order) => {
  order.items.forEach((item) => {
    preloadOptimizedImage(item.image, 160, "80px");
  });
};

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

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const [searchDraft, setSearchDraft] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isOrderLoading, setIsOrderLoading] = useState(false);
  const [orderErrorMessage, setOrderErrorMessage] = useState("");

  const fetchOrders = useCallback(async () => {
    setErrorMessage("");
    setIsLoading(true);

    try {
      const response = await getAdminOrders({
        page,
        limit: PAGE_SIZE,
        search: search || undefined,
        status: statusFilter === "all" ? undefined : statusFilter,
      });

      setOrders(response.data);
      setTotalPages(Math.max(1, response.totalPages));
      setTotalOrders(response.totalOrders);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
      setOrders([]);
      setTotalPages(1);
      setTotalOrders(0);
    } finally {
      setIsLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    void fetchOrders();
  }, [fetchOrders]);

  const openOrder = async (orderId: string, orderPreview?: Order) => {
    if (orderPreview) {
      preloadOrderImages(orderPreview);
    }

    setSelectedOrderId(orderId);
    setSelectedOrder(null);
    setOrderErrorMessage("");
    setIsOrderLoading(true);

    try {
      const response = await getAdminOrderById(orderId);
      preloadOrderImages(response.data);
      setSelectedOrder(response.data);
    } catch (error) {
      setOrderErrorMessage(getApiErrorMessage(error));
    } finally {
      setIsOrderLoading(false);
    }
  };

  const closeOrder = () => {
    setSelectedOrderId(null);
    setSelectedOrder(null);
    setOrderErrorMessage("");
  };

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSearch(searchDraft.trim());
    setPage(1);
  };

  const handleStatusFilterChange = (status: StatusFilter) => {
    setStatusFilter(status);
    setPage(1);
  };

  const handleOrderUpdated = (updatedOrder: Order) => {
    setOrders((currentOrders) =>
      currentOrders.map((order) =>
        order._id === updatedOrder._id ? updatedOrder : order
      )
    );
    setSelectedOrder(updatedOrder);
    setSuccessMessage("Order status updated successfully");
  };

  const visiblePageNumbers = useMemo(
    () =>
      Array.from({ length: totalPages })
        .map((_, index) => index + 1)
        .filter(
          (pageNumber) =>
            pageNumber === 1 ||
            pageNumber === totalPages ||
            Math.abs(pageNumber - page) <= 1
        ),
    [page, totalPages]
  );

  const canGoPrevious = page > 1 && !isLoading;
  const canGoNext = page < totalPages && !isLoading;
  const hasNoOrders = !isLoading && !errorMessage && orders.length === 0;

  return (
    <section className="min-w-0 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            Orders
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {totalOrders} orders in the store
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
          <form onSubmit={handleSearchSubmit} className="flex min-w-0 gap-2">
            <label htmlFor="order-search" className="sr-only">
              Search orders
            </label>
            <input
              id="order-search"
              type="search"
              placeholder="Search by order ID, customer, email, or phone..."
              value={searchDraft}
              onChange={(event) => setSearchDraft(event.target.value)}
              className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400"
            >
              Search
            </button>
          </form>

          <button
            type="button"
            onClick={fetchOrders}
            disabled={isLoading}
            className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Refresh
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {statusFilters.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => handleStatusFilterChange(status)}
              className={[
                "rounded-lg border px-3 py-2 text-sm font-semibold transition",
                statusFilter === status
                  ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
              ].join(" ")}
            >
              {statusLabels[status]}
            </button>
          ))}
        </div>
      </div>

      {successMessage && (
        <div
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700"
        >
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
        >
          {errorMessage}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="h-14 animate-pulse rounded-lg bg-slate-200" />
            ))}
          </div>
        ) : hasNoOrders ? (
          <div className="px-6 py-12 text-center">
            <h2 className="text-base font-semibold text-slate-950">
              No orders found
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Try a different search or status filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[900px] w-full divide-y divide-slate-200 text-left">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Order ID
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Date
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Items
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Total
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Payment
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {orders.map((order) => (
                  <tr
                    key={order._id}
                    onClick={() => void openOrder(order._id, order)}
                    className="cursor-pointer transition hover:bg-slate-50"
                  >
                    <td className="px-4 py-4 text-sm font-semibold text-slate-950">
                      {getOrderDisplayId(order._id)}
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm font-semibold text-slate-950">
                        {getCustomerName(order)}
                      </p>
                      {getCustomerEmail(order) && (
                        <p className="mt-0.5 text-xs text-slate-500">
                          {getCustomerEmail(order)}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600">
                      {dateFormatter.format(new Date(order.createdAt))}
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-600">
                      {getItemCount(order)} item
                      {getItemCount(order) === 1 ? "" : "s"}
                    </td>
                    <td className="px-4 py-4 text-sm font-semibold text-slate-950">
                      {currencyFormatter.format(order.totalAmount)}
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={order.paymentStatus} />
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={order.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-medium text-slate-600">
          Page <span className="text-slate-950">{page}</span> of{" "}
          <span className="text-slate-950">{totalPages}</span>
        </p>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
            disabled={!canGoPrevious}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          {visiblePageNumbers.map((pageNumber, index) => (
            <span key={pageNumber} className="flex items-center gap-2">
              {index > 0 && pageNumber - visiblePageNumbers[index - 1] > 1 && (
                <span className="px-1 text-sm text-slate-400">...</span>
              )}
              <button
                type="button"
                onClick={() => setPage(pageNumber)}
                className={[
                  "h-10 min-w-10 rounded-lg border px-3 text-sm font-semibold transition",
                  page === pageNumber
                    ? "border-blue-600 bg-blue-600 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                ].join(" ")}
              >
                {pageNumber}
              </button>
            </span>
          ))}
          <button
            type="button"
            onClick={() =>
              setPage((currentPage) => Math.min(totalPages, currentPage + 1))
            }
            disabled={!canGoNext}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {selectedOrderId && (
        <OrderDetailsModal
          order={selectedOrder}
          isLoading={isOrderLoading}
          errorMessage={orderErrorMessage}
          onClose={closeOrder}
          onOrderUpdated={handleOrderUpdated}
        />
      )}
    </section>
  );
};

export default Orders;
