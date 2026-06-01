const Dashboard = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">
        Admin Dashboard
      </h1>

      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold">
            Products
          </h2>
          <p className="mt-2 text-gray-500">
            Manage store products
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold">
            Users
          </h2>
          <p className="mt-2 text-gray-500">
            Manage customers
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold">
            Settings
          </h2>
          <p className="mt-2 text-gray-500">
            Admin configuration
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;