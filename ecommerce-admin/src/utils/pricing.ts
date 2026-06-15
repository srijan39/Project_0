export interface ProductPricing {
  actualPrice: number;
  sellingPrice: number;
  discountPercentage: number;
  price: number;
}

type PricingSource = {
  actualPrice?: number;
  sellingPrice?: number;
  discountPercentage?: number;
  price?: number;
};

export const calculateDiscountPercentage = (
  actualPrice: number,
  sellingPrice: number
) => Math.round(((actualPrice - sellingPrice) / actualPrice) * 100);

export const normalizeProductPricing = (
  product: PricingSource
): ProductPricing => {
  const actualPrice = product.actualPrice ?? product.price ?? 0;
  const sellingPrice = product.sellingPrice ?? product.price ?? actualPrice;

  return {
    actualPrice,
    sellingPrice,
    discountPercentage:
      actualPrice > 0 && sellingPrice <= actualPrice
        ? calculateDiscountPercentage(actualPrice, sellingPrice)
        : product.discountPercentage ?? 0,
    price: sellingPrice,
  };
};
