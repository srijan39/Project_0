import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getOrders, type Order } from "../api/order";
import OptimizedImage from "../components/OptimizedImage";

const getStatusStyles = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-700";

    case "processing":
      return "bg-blue-100 text-blue-700";

    case "shipped":
      return "bg-purple-100 text-purple-700";

    case "delivered":
      return "bg-green-100 text-green-700";

    case "cancelled":
      return "bg-red-100 text-red-700";

    default:
      return "bg-gray-100 text-gray-700";
  }
};

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await getOrders();
        setOrders(response.data);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen px-6 py-12 md:px-12">
        <h1 className="mb-8 text-2xl font-semibold">
          My Orders
        </h1>

        <div className="space-y-6">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-48 animate-pulse rounded-lg border bg-gray-50"
            />
          ))}
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
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
              d="M20 7L12 3L4 7V17L12 21L20 17V7Z"
            />
          </svg>
        </div>

        <h2 className="mb-3 text-2xl font-semibold">
          No orders yet
        </h2>

        <p className="mb-8 max-w-md text-gray-500">
          Looks like you haven't placed any orders yet.
          Start shopping and your orders will appear here.
        </p>

        <Link
          to="/products"
          className="bg-black px-8 py-3 text-sm uppercase tracking-wide text-white transition hover:bg-gray-800"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-12 md:px-12">
      <div className="mb-10">
        <h1 className="text-2xl font-semibold">
          My Orders
        </h1>

        <p className="mt-2 text-gray-500">
          Track and manage your purchases.
        </p>
      </div>

      <div className="space-y-6">
        {orders.map((order) => (
          <div
            key={order._id}
            className="rounded-lg border p-6 transition hover:shadow-sm"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-500">
                  Order ID
                </p>

                <p className="mt-1 break-all text-sm font-medium">
                  {order._id}
                </p>

                <p className="mt-3 text-sm text-gray-500">
                  {new Date(
                    order.createdAt
                  ).toLocaleDateString()}
                </p>
              </div>

              <div className="flex flex-col items-start gap-3 md:items-end">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${getStatusStyles(
                    order.status
                  )}`}
                >
                  {order.status}
                </span>

                <div className="text-right">
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    Total
                  </p>

                  <p className="text-lg font-semibold">
                    ₹{order.totalAmount}
                  </p>
                </div>
              </div>
            </div>

            <div className="my-6 border-t" />

            <div className="space-y-4">
              {order.items.slice(0, 3).map((item, index) => (
                <div
                  key={`${item.name}-${index}`}
                  className="flex items-center gap-4"
                >
                  <OptimizedImage
                    src={item.image}
                    alt={item.name}
                    width={80}
                    height={80}
                    sizes="56px"
                    wrapperClassName="h-14 w-14 overflow-hidden rounded-md bg-gray-100"
                  />

                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {item.name}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      Qty: {item.quantity}
                    </p>
                  </div>

                  <p className="text-sm font-medium">
                    ₹{item.price}
                  </p>
                </div>
              ))}
            </div>

            {order.items.length > 3 && (
              <p className="mt-4 text-sm text-gray-500">
                +{order.items.length - 3} more item
                {order.items.length - 3 > 1 ? "s" : ""}
              </p>
            )}

            <div className="mt-6 flex justify-end border-t pt-5">
              <button className="text-sm font-medium transition hover:text-gray-600">
                View Order →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;