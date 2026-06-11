import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/dashboard", label: "Dashboard", shortLabel: "D", end: true },
  { to: "/products", label: "Products", shortLabel: "P", end: true },
  { to: "/products/bulk", label: "Bulk Upload", shortLabel: "B", end: true },
  { to: "/users", label: "Users", shortLabel: "U", end: true },
];

const Sidebar = () => {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex h-dvh w-20 shrink-0 flex-col overflow-hidden border-r border-slate-800 bg-slate-950 text-white lg:w-64">
      <div className="flex h-16 shrink-0 items-center border-b border-slate-800 px-3 lg:px-6">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold shadow-lg shadow-blue-950/40">
          AP
        </div>
        <div className="ml-3 hidden min-w-0 lg:block">
          <p className="truncate text-base font-semibold">Admin Panel</p>
          <p className="truncate text-xs text-slate-400">Store operations</p>
        </div>
      </div>

      <nav className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto overflow-x-hidden px-3 py-5">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            title={item.label}
            className={({ isActive }) =>
              [
                "flex h-11 items-center justify-center rounded-lg px-3 text-sm font-medium transition",
                "hover:bg-slate-900 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400",
                "lg:justify-start lg:gap-3",
                isActive
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-950/30"
                  : "text-slate-300",
              ].join(" ")
            }
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white/10 text-xs font-bold">
              {item.shortLabel}
            </span>
            <span className="hidden truncate lg:block">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
