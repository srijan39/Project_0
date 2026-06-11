import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getAuthErrorMessage } from "../utils/authErrors";

interface LocationState {
  from?: {
    pathname?: string;
    search?: string;
    hash?: string;
  };
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectTo = useMemo(() => {
    const state = location.state as LocationState | null;
    const from = state?.from;

    if (!from?.pathname) return "/profile";

    return `${from.pathname}${from.search || ""}${from.hash || ""}`;
  }, [location.state]);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, loading, navigate, redirectTo]);

  const validateForm = () => {
    if (!email.trim() || !password) {
      return "Email and password are required.";
    }

    if (!emailPattern.test(email.trim())) {
      return "Enter a valid email address.";
    }

    return "";
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await login({
        email: email.trim().toLowerCase(),
        password,
      });

      navigate(redirectTo, { replace: true });
    } catch (requestError) {
      setError(getAuthErrorMessage(requestError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="min-h-screen bg-white px-6 py-16 md:px-12">
      <div className="mx-auto max-w-md">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Login</h1>
          <p className="mt-2 text-sm text-gray-500">
            Sign in to continue to your account.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-gray-900"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-md border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-black"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-gray-900"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-md border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-black"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || loading}
            className="w-full rounded-md bg-black py-3 text-sm uppercase tracking-wide text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
          >
            {isSubmitting ? "Signing in..." : "Login"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          New to Atelier?{" "}
          <Link to="/register" className="font-medium text-black underline">
            Create an account
          </Link>
        </p>
      </div>
    </section>
  );
};

export default Login;
