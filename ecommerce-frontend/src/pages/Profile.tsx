import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ChevronRight,
  Heart,
  Lock,
  LogOut,
  MapPin,
  Package,
  RefreshCw,
  User,
  type LucideIcon,
} from "lucide-react";

import { getOrders, type Order } from "../api/order";
import OrderStatusBadge from "../components/account/OrderStatusBadge";
import { useAuth } from "../hooks/useAuth";
import { useWishlist } from "../hooks/useWishlist";
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

interface StatCardProps {
  label: string;
  count: number;
  icon: LucideIcon;
}

const StatCard = ({ label, count, icon: Icon }: StatCardProps) => (
  <div className="min-w-0 rounded-lg border border-gray-200 bg-white p-4 sm:p-5">
    <div className="flex min-w-0 items-center gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-gray-200 bg-gray-50">
        <Icon className="h-5 w-5 text-gray-600" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-sm text-gray-500">{label}</p>
        <p className="mt-1 text-2xl font-semibold text-gray-900">{count}</p>
      </div>
    </div>
  </div>
);

interface ActionButtonProps {
  children: ReactNode;
  icon: LucideIcon;
  disabled?: boolean;
  onClick?: () => void;
}

const ActionButton = ({
  children,
  icon: Icon,
  disabled = false,
  onClick,
}: ActionButtonProps) => (
  <button
    type="button"
    disabled={disabled}
    onClick={onClick}
    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-900 transition hover:border-gray-400 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:cursor-not-allowed disabled:text-gray-400 disabled:hover:border-gray-200 disabled:hover:bg-white"
  >
    <Icon className="h-4 w-4" aria-hidden="true" />
    {children}
  </button>
);

interface NavigationCardProps {
  label: string;
  icon: LucideIcon;
  to?: string;
  onClick?: () => void;
  disabled?: boolean;
}

const NavigationCard = ({
  label,
  icon: Icon,
  to,
  onClick,
  disabled = false,
}: NavigationCardProps) => {
  const className =
    "flex min-h-14 w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 text-left text-sm font-medium text-gray-900 transition hover:border-gray-400 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:cursor-not-allowed disabled:text-gray-400 disabled:hover:border-gray-200 disabled:hover:bg-white";
  const content = (
    <>
      <span className="flex min-w-0 items-center gap-3">
        <Icon className="h-5 w-5 shrink-0 text-gray-600" aria-hidden="true" />
        <span className="truncate">{label}</span>
      </span>
      <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" aria-hidden="true" />
    </>
  );

  if (to) {
    return (
      <Link to={to} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} disabled={disabled} className={className}>
      {content}
    </button>
  );
};

const ProfileSkeleton = () => (
  <div className="space-y-6">
    <div className="rounded-lg border border-gray-200 p-5 sm:p-6">
      <div className="flex items-center gap-4">
        <div className="h-14 w-14 rounded-full skeleton" />
        <div className="min-w-0 flex-1 space-y-3">
          <div className="h-4 w-40 rounded skeleton" />
          <div className="h-4 w-56 max-w-full rounded skeleton" />
        </div>
      </div>
    </div>
    <div className="grid gap-3 sm:grid-cols-3">
      {[1, 2, 3].map((item) => (
        <div key={item} className="h-24 rounded-lg border border-gray-200 skeleton" />
      ))}
    </div>
  </div>
);

const formatDate = (date: string) => dateFormatter.format(new Date(date));

const getAddressKey = (order: Order) => {
  const address = order.shippingAddress;

  if (!address) return null;

  return [
    address.addressLine1,
    address.addressLine2,
    address.city,
    address.state,
    address.postalCode,
    address.country,
  ]
    .filter(Boolean)
    .join("|")
    .toLowerCase();
};

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout, refreshUser, loading } = useAuth();
  const { wishlist } = useWishlist();
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [refreshingProfile, setRefreshingProfile] = useState(false);

  const fetchOrders = useCallback(async () => {
    setOrdersLoading(true);
    setOrdersError(null);

    try {
      const response = await getOrders();
      setOrders(response.data);
    } catch {
      setOrdersError("We could not load your orders right now.");
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  useEffect(() => {
    let isActive = true;

    const loadOrders = async () => {
      setOrdersLoading(true);
      setOrdersError(null);

      try {
        const response = await getOrders();

        if (isActive) {
          setOrders(response.data);
        }
      } catch {
        if (isActive) {
          setOrdersError("We could not load your orders right now.");
        }
      } finally {
        if (isActive) {
          setOrdersLoading(false);
        }
      }
    };

    loadOrders();

    return () => {
      isActive = false;
    };
  }, []);

  const sortedOrders = useMemo(
    () =>
      [...orders].sort(
        (first, second) =>
          new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime()
      ),
    [orders]
  );

  const recentOrders = sortedOrders.slice(0, 3);
  const addressCount = useMemo(() => {
    const keys = orders
      .map((order) => getAddressKey(order))
      .filter((key): key is string => Boolean(key));

    return new Set(keys).size;
  }, [orders]);

  const avatarInitial = (user?.name?.trim()[0] || "U").toUpperCase();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const handleRefreshProfile = async () => {
    setRefreshingProfile(true);

    try {
      await Promise.all([refreshUser(), fetchOrders()]);
    } finally {
      setRefreshingProfile(false);
    }
  };

  return (
    <section className="min-h-screen bg-white px-4 py-8 text-gray-900 sm:px-6 md:px-8 lg:px-12">
      <div className="mx-auto w-full max-w-7xl">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            My Account
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-500 sm:text-base">
            Manage your profile, orders and preferences.
          </p>
        </header>

        {loading ? (
          <ProfileSkeleton />
        ) : (
          <div className="space-y-6">
            <section className="rounded-lg border border-gray-200 bg-white p-5 sm:p-6">
              <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-4">
                  <div
                    className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-black text-xl font-semibold text-white"
                    aria-hidden="true"
                  >
                    {avatarInitial}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-lg font-semibold text-gray-900">
                      {user?.name || "Account Holder"}
                    </p>
                    <p className="mt-1 break-all text-sm text-gray-500">
                      {user?.email || "No email available"}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex w-fit items-center rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-medium capitalize text-gray-700">
                    {user?.role || "user"} account
                  </span>
                </div>
              </div>
            </section>

            <section
              aria-label="Account statistics"
              className="grid gap-3 sm:grid-cols-3"
            >
              <StatCard label="Orders" count={orders.length} icon={Package} />
              <StatCard label="Addresses" count={addressCount} icon={MapPin} />
              <StatCard
  label="Wishlist"
  count={wishlist.length}
  icon={Heart}
/>
            </section>

            <section className="rounded-lg border border-gray-200 bg-white p-5 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-base font-semibold">Quick Actions</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Common account tasks in one place.
                  </p>
                </div>
                {ordersError && (
                  <button
                    type="button"
                    onClick={fetchOrders}
                    className="inline-flex min-h-10 items-center justify-center rounded-md border border-gray-200 px-3 text-sm font-medium transition hover:border-gray-400 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                  >
                    Retry orders
                  </button>
                )}
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                
                <Link
                  to="/orders"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-black px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                >
                  <Package className="h-4 w-4" aria-hidden="true" />
                  View Orders
                </Link>
                <ActionButton
                  icon={RefreshCw}
                  onClick={handleRefreshProfile}
                  disabled={refreshingProfile}
                >
                  {refreshingProfile ? "Refreshing" : "Refresh Profile"}
                </ActionButton>
                <ActionButton icon={User} disabled>
                  Edit Profile
                </ActionButton>
                <Link
                  to="/addresses"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-900 transition hover:border-gray-400 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                >
                  <MapPin className="h-4 w-4" aria-hidden="true" />
                  Manage Addresses
                </Link>
              </div>
            </section>

            <section aria-label="Account navigation" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <NavigationCard label="Profile" icon={User} to="/profile" />
              <NavigationCard label="Orders" icon={Package} to="/orders" />
              <NavigationCard label="Addresses" icon={MapPin} to="/addresses" />
              <NavigationCard label="Wishlist" icon={Heart}  to="/wishlist" />
              <NavigationCard label="Security" icon={Lock} disabled />
              <NavigationCard label="Logout" icon={LogOut} onClick={handleLogout} />
            </section>

            <section className="rounded-lg border border-gray-200 bg-white p-5 sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-base font-semibold">Recent Orders</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Your latest purchase activity.
                  </p>
                </div>
                <Link
                  to="/orders"
                  className="inline-flex min-h-10 items-center gap-2 text-sm font-medium text-gray-900 transition hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                >
                  View all
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>

              {ordersLoading ? (
                <div className="mt-5 grid gap-3 lg:grid-cols-3">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="h-32 rounded-lg border border-gray-200 skeleton" />
                  ))}
                </div>
              ) : ordersError ? (
                <div className="mt-5 rounded-lg border border-gray-200 bg-gray-50 p-5 text-sm text-gray-600">
                  <p>{ordersError}</p>
                  <button
                    type="button"
                    onClick={fetchOrders}
                    className="mt-4 rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                  >
                    Retry
                  </button>
                </div>
              ) : recentOrders.length > 0 ? (
                <div className="mt-5 grid gap-3 lg:grid-cols-3">
                  {recentOrders.map((order) => (
                    <article
                      key={order._id}
                      className="min-w-0 rounded-lg border border-gray-200 p-4"
                    >
                      <div className="flex min-w-0 items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="break-all text-sm font-semibold text-gray-900">
                            Order #{order._id}
                          </p>
                          <p className="mt-1 text-sm text-gray-500">
                            {formatDate(order.createdAt)}
                          </p>
                        </div>
                        <OrderStatusBadge status={order.status} />
                      </div>
                      <div className="mt-4 flex items-end justify-between gap-4">
                        <p className="text-sm text-gray-500">
                          {order.items.length} item{order.items.length === 1 ? "" : "s"}
                        </p>
                        <p className="text-base font-semibold text-gray-900">
                          {currencyFormatter.format(order.totalAmount)}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="mt-5 rounded-lg border border-gray-200 bg-gray-50 p-6 text-center">
                  <Package className="mx-auto h-9 w-9 text-gray-400" aria-hidden="true" />
                  <h3 className="mt-3 text-base font-semibold">No Orders Yet</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    You have not placed any orders yet.
                  </p>
                  <Link
                    to="/products"
                    className="mt-5 inline-flex min-h-10 items-center justify-center rounded-md bg-black px-5 text-sm font-medium text-white transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                  >
                    Start Shopping
                  </Link>
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </section>
  );
}
