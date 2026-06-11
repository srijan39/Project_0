const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

type RequestOptions = RequestInit & {
  retry?: boolean;
  auth?: boolean;
};

export interface StoredUser {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export const getStoredToken = () =>
  localStorage.getItem("token") || sessionStorage.getItem("token");

export const getStoredUser = (): StoredUser | null => {
  const storedUser =
    localStorage.getItem("user") || sessionStorage.getItem("user");

  if (!storedUser) return null;

  try {
    return JSON.parse(storedUser) as StoredUser;
  } catch {
    return null;
  }
};

export const setStoredSession = (
  token: string,
  user: StoredUser,
  persist = true
) => {
  const storage = persist ? localStorage : sessionStorage;
  const inactiveStorage = persist ? sessionStorage : localStorage;

  inactiveStorage.removeItem("token");
  inactiveStorage.removeItem("user");
  storage.setItem("token", token);
  storage.setItem("user", JSON.stringify(user));
};

export const clearStoredSession = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("user");
};

export const notifySessionExpired = () => {
  window.dispatchEvent(new Event("auth:session-expired"));
};

export const apiRequest = async <T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> => {
  const { retry = true, auth = true, headers, ...requestOptions } = options;
  const token = auth ? getStoredToken() : null;
  const requestHeaders = new Headers(headers);

  if (!requestHeaders.has("Content-Type") && requestOptions.body) {
    requestHeaders.set("Content-Type", "application/json");
  }

  if (token) {
    requestHeaders.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...requestOptions,
      headers: requestHeaders,
    });
  } catch {
    throw new ApiError(
      "Unable to reach the server. Please check your connection and try again.",
      0
    );
  }

  if (response.status >= 500 && retry) {
    return apiRequest<T>(path, { ...options, retry: false });
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    if (auth && (response.status === 401 || response.status === 403)) {
      clearStoredSession();
      notifySessionExpired();
    }

    throw new ApiError(
      data?.message || `Request failed with status ${response.status}`,
      response.status
    );
  }

  return data as T;
};
