import { Link } from "react-router-dom";

const Sidebar = () => {
  return (
    <aside className="w-64 bg-slate-900 text-white h-screen">
      <div className="p-6 text-2xl font-bold border-b border-slate-700">
        Admin Panel
      </div>

      <nav className="flex flex-col p-4 gap-3">
        <Link
          to="/dashboard"
          className="hover:bg-slate-800 p-3 rounded"
        >
          Dashboard
        </Link>

        <Link
          to="/products"
          className="hover:bg-slate-800 p-3 rounded"
        >
          Products
        </Link>

        <Link
          to="/users"
          className="hover:bg-slate-800 p-3 rounded"
        >
          Users
        </Link>
      </nav>
    </aside>
  );
};

export default Sidebar;