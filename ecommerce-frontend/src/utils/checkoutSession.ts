import type { CheckoutSession } from "../types/checkout";

const checkoutSessionKey = "atelier.checkout.session";

export const saveCheckoutSession = (session: CheckoutSession) => {
  sessionStorage.setItem(checkoutSessionKey, JSON.stringify(session));
};

export const getCheckoutSession = (): CheckoutSession | null => {
  const storedSession = sessionStorage.getItem(checkoutSessionKey);

  if (!storedSession) return null;

  try {
    const parsed = JSON.parse(storedSession) as CheckoutSession;

    if (
      !parsed ||
      !parsed.addressId ||
      !Array.isArray(parsed.items) ||
      parsed.items.length === 0
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
};

export const clearCheckoutSession = () => {
  sessionStorage.removeItem(checkoutSessionKey);
};
