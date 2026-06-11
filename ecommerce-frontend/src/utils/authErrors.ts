import { ApiError } from "../api/client";

export const getAuthErrorMessage = (error: unknown) => {
  if (!(error instanceof ApiError)) {
    return "Something went wrong. Please try again.";
  }

  if (error.status === 0) {
    return "Unable to reach the server. Please check your connection and try again.";
  }

  if (error.status === 400) {
    const message = error.message.toLowerCase();

    if (message.includes("already exists")) {
      return "An account with this email already exists.";
    }

    return "Please check your details and try again.";
  }

  if (error.status === 401) {
    return "The email or password you entered is incorrect.";
  }

  if (error.status >= 500) {
    return "The server is having trouble right now. Please try again shortly.";
  }

  return "We could not complete that request. Please try again.";
};
