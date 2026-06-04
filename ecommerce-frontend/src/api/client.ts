const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

type RequestOptions = RequestInit & {
  retry?: boolean;
  auth?: boolean;
};

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

const clearStoredSession = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("user");
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

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...requestOptions,
    headers: requestHeaders,
  });

  if (response.status >= 500 && retry) {
    return apiRequest<T>(path, { ...options, retry: false });
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      clearStoredSession();
    }

    throw new ApiError(
      data?.message || `Request failed with status ${response.status}`,
      response.status
    );
  }

  return data as T;
};

