import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

const AdminLayout = () => {
  return (
    <div className="min-h-dvh bg-slate-100 text-slate-950">
      <Sidebar />

      <div className="ml-20 flex h-dvh min-w-0 flex-col overflow-hidden lg:ml-64">
        <Navbar />

        <main
          data-route-scroll-container
          className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden"
        >
          <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
