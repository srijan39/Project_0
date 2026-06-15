import {
  CheckCircle2,
  Clock3,
  LoaderCircle,
  PackageCheck,
  Truck,
  XCircle,
  type LucideIcon,
} from "lucide-react";

import type { OrderStatus, PaymentStatus } from "../../api/order";

type BadgeStatus = OrderStatus | PaymentStatus;

interface StatusMeta {
  label: string;
  icon: LucideIcon;
}

const statusMeta: Record<BadgeStatus, StatusMeta> = {
  pending: { label: "Pending", icon: Clock3 },
  processing: { label: "Processing", icon: LoaderCircle },
  shipped: { label: "Shipped", icon: Truck },
  delivered: { label: "Delivered", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", icon: XCircle },
  paid: { label: "Paid", icon: PackageCheck },
  failed: { label: "Failed", icon: XCircle },
};

interface OrderStatusBadgeProps {
  status: BadgeStatus;
  className?: string;
}

const OrderStatusBadge = ({ status, className = "" }: OrderStatusBadgeProps) => {
  const meta = statusMeta[status];
  const Icon = meta.icon;

  return (
    <span
      className={[
        "inline-flex w-fit items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-700",
        className,
      ].join(" ")}
    >
      <Icon className="h-3.5 w-3.5 text-gray-500" aria-hidden="true" />
      {meta.label}
    </span>
  );
};

export default OrderStatusBadge;
