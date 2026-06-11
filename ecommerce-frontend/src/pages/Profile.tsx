import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout, refreshUser, loading } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <section className="min-h-screen bg-white px-6 py-12 md:px-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-10">
          <h1 className="text-2xl font-semibold text-gray-900">Profile</h1>
          <p className="mt-2 text-gray-500">
            Manage your account details and session.
          </p>
        </div>

        <div className="rounded-lg border p-6">
          {loading ? (
            <div className="space-y-4">
              <div className="h-4 w-32 rounded skeleton" />
              <div className="h-4 w-56 rounded skeleton" />
              <div className="h-4 w-44 rounded skeleton" />
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500">
                    Name
                  </p>
                  <p className="mt-1 font-medium text-gray-900">
                    {user?.name}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500">
                    Email
                  </p>
                  <p className="mt-1 font-medium text-gray-900">
                    {user?.email}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500">
                    Role
                  </p>
                  <p className="mt-1 capitalize font-medium text-gray-900">
                    {user?.role}
                  </p>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/orders"
                  className="rounded-md bg-black px-6 py-3 text-center text-sm uppercase tracking-wide text-white transition hover:bg-gray-800"
                >
                  My Orders
                </Link>

                <button
                  type="button"
                  onClick={() => refreshUser()}
                  className="rounded-md border border-black px-6 py-3 text-sm uppercase tracking-wide text-black transition hover:bg-black hover:text-white"
                >
                  Refresh Profile
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-md border border-red-200 px-6 py-3 text-sm uppercase tracking-wide text-red-600 transition hover:bg-red-50"
                >
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
