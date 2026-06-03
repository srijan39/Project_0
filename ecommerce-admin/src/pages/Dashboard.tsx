const Dashboard = () => {
  return (
    <section className="min-w-0 space-y-6">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
          Admin Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Store operations at a glance
        </p>
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">
            Products
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Manage store products
          </p>
        </div>

        <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">
            Users
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Manage customers
          </p>
        </div>

        <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">
            Settings
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Admin configuration
          </p>
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
