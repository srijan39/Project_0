import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { getApiErrorMessage } from "../api/axios";
import type { FormEvent, InputHTMLAttributes, ReactNode } from "react";

interface LoginResponse {
  success: boolean;
  token: string;
  user: {
    _id: string;
    name: string;
    email: string;
    role: "user" | "admin";
  };
}

interface FieldErrors {
  email?: string;
  password?: string;
}

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  rightElement?: ReactNode;
}

const isValidEmail = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const FormField = ({
  label,
  error,
  id,
  rightElement,
  className = "",
  ...inputProps
}: FormFieldProps) => {
  const errorId = `${id}-error`;

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium text-slate-700">
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className={[
            "h-12 w-full rounded-xl border bg-white/95 px-4 text-sm text-slate-950 shadow-sm outline-none transition duration-200",
            "placeholder:text-slate-400 focus:-translate-y-0.5 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100",
            "disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500",
            rightElement ? "pr-12" : "",
            error
              ? "border-red-300 focus:border-red-500 focus:ring-red-100"
              : "border-slate-200",
            className,
          ].join(" ")}
          {...inputProps}
        />
        {rightElement}
      </div>

      {error && (
        <p id={errorId} className="text-sm font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
};

const EyeIcon = ({ isVisible }: { isVisible: boolean }) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    className="h-5 w-5"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="1.8"
  >
    {isVisible ? (
      <>
        <path d="M2.8 12s3.4-6.2 9.2-6.2 9.2 6.2 9.2 6.2-3.4 6.2-9.2 6.2S2.8 12 2.8 12Z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ) : (
      <>
        <path d="m3 3 18 18" />
        <path d="M10.6 5.9A8.9 8.9 0 0 1 12 5.8c5.8 0 9.2 6.2 9.2 6.2a17.2 17.2 0 0 1-2.7 3.6" />
        <path d="M6.7 6.8A16.1 16.1 0 0 0 2.8 12s3.4 6.2 9.2 6.2a8.9 8.9 0 0 0 3.7-.8" />
        <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
      </>
    )}
  </svg>
);

const SpinnerIcon = () => (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    className="h-5 w-5 animate-spin"
    fill="none"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-90"
      d="M22 12a10 10 0 0 1-10 10"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth="4"
    />
  </svg>
);

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const nextErrors: FieldErrors = {};

    if (!email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!isValidEmail(email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!password) {
      nextErrors.password = "Password is required.";
    } else if (password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters.";
    }

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await api.post<LoginResponse>("/auth/login", {
        email: email.trim(),
        password,
      });

      if (!response.data.token || !response.data.user) {
        throw new Error("Login response did not include a token");
      }

      if (response.data.user.role !== "admin") {
        throw new Error("Admin access required");
      }

      const storage = rememberMe ? localStorage : sessionStorage;
      const inactiveStorage = rememberMe ? sessionStorage : localStorage;

      inactiveStorage.removeItem("token");
      inactiveStorage.removeItem("user");
      storage.setItem("token", response.data.token);
      storage.setItem("user", JSON.stringify(response.data.user));

      setSuccessMessage("Access verified. Opening dashboard...");
      window.setTimeout(() => navigate("/dashboard"), 350);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
      setIsLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,#dbeafe_0%,transparent_34%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_55%,#f8fafc_100%)] px-4 py-10 text-slate-950 [animation:admin-fade-in_500ms_ease-out] sm:px-6">
      <div className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-blue-400/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-7rem] right-[-4rem] h-80 w-80 rounded-full bg-violet-300/20 blur-3xl" />
      <div className="pointer-events-none absolute left-[-5rem] top-1/3 h-72 w-72 rounded-full bg-emerald-300/15 blur-3xl" />

      <section className="relative z-10 w-full max-w-md [animation:admin-card-in_600ms_ease-out]">
        

        <div className="rounded-3xl border border-white/80 bg-white/85 p-6 shadow-2xl shadow-slate-300/60 backdrop-blur-xl sm:p-8">
          <div className="mb-8 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
              Atelier Admin
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
              Admin Login
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Sign in to manage products, users, and store operations.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleLogin} noValidate>
            {errorMessage && (
              <div
                role="alert"
                className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
              >
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div
                role="status"
                className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700"
              >
                {successMessage}
              </div>
            )}

            <FormField
              id="email"
              label="Email address"
              type="email"
              autoComplete="email"
              inputMode="email"
              placeholder="admin@example.com"
              value={email}
              error={fieldErrors.email}
              disabled={isLoading}
              onChange={(event) => {
                setEmail(event.target.value);
                setFieldErrors((current) => ({ ...current, email: undefined }));
              }}
            />

            <FormField
              id="password"
              label="Password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              error={fieldErrors.password}
              disabled={isLoading}
              onChange={(event) => {
                setPassword(event.target.value);
                setFieldErrors((current) => ({
                  ...current,
                  password: undefined,
                }));
              }}
              rightElement={
                <button
                  type="button"
                  title={showPassword ? "Hide password" : "Show password"}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((current) => !current)}
                  disabled={isLoading}
                  className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <EyeIcon isVisible={showPassword} />
                </button>
              }
            />

            <div className="flex items-center justify-between gap-4">
              <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  disabled={isLoading}
                  onChange={(event) => setRememberMe(event.target.checked)}
                  className="h-4 w-4 rounded border-slate-300  outline-none transition focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                />
                Remember me
              </label>

              <a
                href="/forgot-password"
                className="text-sm font-semibold text-blue-600 transition hover:text-blue-700 focus-visible:rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400"
              >
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white shadow-xl shadow-slate-300/80 transition duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-blue-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:cursor-not-allowed disabled:translate-y-0 disabled:bg-slate-400 disabled:shadow-none"
            >
              {isLoading && <SpinnerIcon />}
              {isLoading ? "Verifying access..." : "Login"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          Protected workspace for authorized store operators.
        </p>
      </section>
    </main>
  );
};

export default Login;
