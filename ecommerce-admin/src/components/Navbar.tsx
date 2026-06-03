const Navbar = () => {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
      <div className="min-w-0">
        <h1 className="truncate text-lg font-semibold text-slate-950">
          Ecommerce Admin
        </h1>
        <p className="hidden text-sm text-slate-500 sm:block">
          Manage catalog, customers, and store activity
        </p>
      </div>

      <button
        onClick={() => {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          sessionStorage.removeItem("token");
          sessionStorage.removeItem("user");
          window.location.href = "/";
        }}
        className="shrink-0 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-red-400"
      >
        Logout
      </button>
    </header>
  );
};

export default Navbar;
