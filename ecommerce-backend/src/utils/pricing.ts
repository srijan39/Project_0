export interface PricingFields {
  actualPrice: number;
  sellingPrice: number;
  discountPercentage: number;
  price: number;
}

type PricingSource = {
  actualPrice?: unknown;
  sellingPrice?: unknown;
  discountPercentage?: unknown;
  price?: unknown;
};

export class PricingValidationError extends Error {
  statusCode = 400;

  constructor(message: string) {
    super(message);
    this.name = "PricingValidationError";
  }
}

const toFiniteNumber = (value: unknown) => {
  if (value === undefined || value === null || value === "") return undefined;

  const numberValue =
    typeof value === "number" ? value : Number(String(value).trim());

  return Number.isFinite(numberValue) ? numberValue : undefined;
};

export const calculateDiscountPercentage = (
  actualPrice: number,
  sellingPrice: number
) => Math.round(((actualPrice - sellingPrice) / actualPrice) * 100);

export const resolveProductPricing = (
  source: PricingSource,
  fallback?: Partial<PricingFields>
): PricingFields => {
  const explicitActualPrice = toFiniteNumber(source.actualPrice);
  const explicitSellingPrice = toFiniteNumber(source.sellingPrice);
  const explicitLegacyPrice = toFiniteNumber(source.price);
  const usesLegacyPrice =
    explicitLegacyPrice !== undefined &&
    explicitActualPrice === undefined &&
    explicitSellingPrice === undefined;

  const actualPrice =
    explicitActualPrice ??
    (usesLegacyPrice ? explicitLegacyPrice : undefined) ??
    fallback?.actualPrice ??
    fallback?.price;

  const sellingPrice =
    explicitSellingPrice ??
    (usesLegacyPrice ? explicitLegacyPrice : undefined) ??
    fallback?.sellingPrice ??
    fallback?.price;

  if (actualPrice === undefined || sellingPrice === undefined) {
    throw new PricingValidationError(
      "Original price and selling price are required"
    );
  }

  if (actualPrice <= 0) {
    throw new PricingValidationError("Original price must be greater than 0");
  }

  if (sellingPrice <= 0) {
    throw new PricingValidationError("Selling price must be greater than 0");
  }

  if (sellingPrice > actualPrice) {
    throw new PricingValidationError(
      "Selling price cannot exceed original price"
    );
  }

  const discountPercentage = calculateDiscountPercentage(
    actualPrice,
    sellingPrice
  );

  return {
    actualPrice,
    sellingPrice,
    discountPercentage,
    price: sellingPrice,
  };
};

export const pricingFromProduct = (product: PricingSource): PricingFields =>
  resolveProductPricing(product);
