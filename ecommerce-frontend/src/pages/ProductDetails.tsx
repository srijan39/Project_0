import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  ChevronRight as BreadcrumbChevron,
  Minus,
  Plus,
  ShoppingCart,
  Heart,
} from "lucide-react";
import { getProductById, getProducts } from "../api/products";
import { useCart } from "../hooks/useCart";
import { useAuth } from "../hooks/useAuth";
import ProductCard from "../components/ProductCard";
import OptimizedImage from "../components/OptimizedImage";
import type { Product } from "../types/product";
import { normalizeProductPricing } from "../utils/pricing";
import { useWishlist } from "../hooks/useWishlist";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const ProductDetails = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const galleryImages = useMemo(() => {
    if (!product) return [];
    if (Array.isArray(product.images) && product.images.length > 0) {
      return product.images;
    }
    return [product.image];
  }, [product]);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  // Active variant stock (for the currently selected size + color combination)
  const activeVariant = useMemo(() => {
    if (!product || !product.variants || product.variants.length === 0) return null;
    return (
      product.variants.find(
        (v) => v.size === selectedSize && v.color === selectedColor
      ) ?? null
    );
  }, [product, selectedSize, selectedColor]);

  const availableStock = activeVariant?.stock ?? null;
  const isOutOfStock = availableStock !== null && availableStock === 0;
  const isLowStock =
    availableStock !== null && availableStock > 0 && availableStock <= 10;

  // --- Per-size stock helpers ---
  // Returns the total stock across all colors for a given size,
  // or null if variants are not defined (treat as in-stock).
  const getStockForSize = (size: string): number | null => {
    if (!product?.variants || product.variants.length === 0) return null;
    const variantsForSize = product.variants.filter((v) => v.size === size);
    if (variantsForSize.length === 0) return null;
    return variantsForSize.reduce((sum, v) => sum + (v.stock ?? 0), 0);
  };

  // --- Per-color stock helpers (scoped to the currently selected size) ---
  // Returns stock for a specific color + currently selected size combination.
  const getStockForColor = (color: string): number | null => {
    if (!product?.variants || product.variants.length === 0) return null;
    const variant = product.variants.find(
      (v) => v.size === selectedSize && v.color === color
    );
    if (!variant) return null;
    return variant.stock ?? null;
  };

  useEffect(() => {
    let isActive = true;

    Promise.resolve()
      .then(() => {
        if (!id) return null;
        if (isActive) {
          setLoading(true);
          setSelectedImage(0);
        }
        return getProductById(id);
      })
      .then((data) => {
        if (isActive) {
          setProduct(data);
          setRelatedProducts([]);
          setSelectedSize(data?.sizes[0] || "");
          setSelectedColor(data?.colors?.[0] ?? "");
        }
      })
      .catch(() => {
        if (isActive) setProduct(null);
      })
      .finally(() => {
        if (isActive) setLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [id]);

  useEffect(() => {
    setQuantity(1);
  }, [selectedSize, selectedColor]);

  useEffect(() => {
    let isActive = true;
    if (!product) return;

    getProducts({ category: product.category, limit: 5 })
      .then((items) => {
        if (isActive)
          setRelatedProducts(items.filter((item) => item.id !== product.id));
      })
      .catch(() => {
        if (isActive) setRelatedProducts([]);
      });

    return () => {
      isActive = false;
    };
  }, [product]);

  if (loading) {
    return (
      <section className="bg-white py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <div className="grid items-start gap-12 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="aspect-[4/5] rounded-2xl bg-gray-100 skeleton lg:max-w-md" />
            <div className="space-y-4">
              <div className="h-4 w-32 rounded skeleton" />
              <div className="h-10 w-3/4 rounded skeleton" />
              <div className="h-8 w-28 rounded skeleton" />
              <div className="h-24 w-full rounded skeleton" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!product) {
    return (
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <h1 className="text-2xl font-semibold text-gray-900">
            Product not found
          </h1>
          <Link
            to="/products"
            className="mt-4 inline-block text-sm text-gray-600 underline"
          >
            Back to products
          </Link>
        </div>
      </section>
    );
  }

  const pricing = normalizeProductPricing(product);
  const amountSaved = pricing.actualPrice - pricing.sellingPrice;
  const hasDiscount = pricing.discountPercentage > 0 && amountSaved > 0;
  const wishlisted = isWishlisted(product.id);

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate("/login", { state: { from: location } });
      return;
    }

    const button = e.currentTarget;
    const circle = document.createElement("span");
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;

    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${
      e.clientX - button.getBoundingClientRect().left - radius
    }px`;
    circle.style.top = `${
      e.clientY - button.getBoundingClientRect().top - radius
    }px`;
    circle.classList.add("ripple");

    const ripple = button.getElementsByClassName("ripple")[0];
    if (ripple) ripple.remove();
    button.appendChild(circle);

    addToCart(product, {
      size: selectedSize,
      color: selectedColor || undefined,
      quantity,
    });

    const cartIcon = document.getElementById("cart-icon");
    if (cartIcon) {
      cartIcon.classList.remove("cart-in");
      void cartIcon.offsetWidth;
      cartIcon.classList.add("cart-in");
      setTimeout(() => cartIcon.classList.remove("cart-in"), 250);
    }
  };

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: location } });
      return;
    }
    try {
      await toggleWishlist(product);
    } catch (error) {
      console.error(error);
    }
  };

  const handlePrevImage = () => {
    setSelectedImage((prev) =>
      prev === 0 ? galleryImages.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setSelectedImage((prev) =>
      prev === galleryImages.length - 1 ? 0 : prev + 1
    );
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    });
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setTouchEndX(null);
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStartX === null || touchEndX === null) return;
    const distance = touchStartX - touchEndX;
    if (distance > 50) handleNextImage();
    if (distance < -50) handlePrevImage();
  };

  return (
    <section className="bg-white py-12 md:py-16">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        {/* Breadcrumb */}
        <div className="mb-8 flex flex-wrap items-center gap-2 text-sm text-gray-500">
          <Link to="/" className="hover:text-black">
            Home
          </Link>
          <BreadcrumbChevron size={16} />
          <Link
            to={`/${product.category}`}
            className="capitalize hover:text-black"
          >
            {product.category}
          </Link>
          <BreadcrumbChevron size={16} />
          <span className="text-gray-900">{product.name}</span>
        </div>

        <div className="grid items-start gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          {/* ── Image Gallery ── */}
          <div className="space-y-4 lg:max-w-md">
            <div
              className="relative overflow-hidden rounded-2xl bg-gray-100"
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
              onMouseMove={handleMouseMove}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div className="aspect-[4/5] w-full overflow-hidden">
                <OptimizedImage
                  src={galleryImages[selectedImage]}
                  alt={product.name}
                  width={1200}
                  height={1500}
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  priority
                  wrapperClassName="h-full w-full"
                  imageClassName={`transition duration-200 ${
                    isZoomed ? "scale-[1.6]" : "scale-100"
                  }`}
                  style={{
                    transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                  }}
                />
              </div>

              {galleryImages.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-3 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-black shadow-md transition hover:bg-white md:flex"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-3 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-black shadow-md transition hover:bg-white md:flex"
                  >
                    <ChevronRight size={18} />
                  </button>
                  <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2 md:hidden">
                    {galleryImages.map((_, index) => (
                      <span
                        key={index}
                        className={`h-2 rounded-full transition-all ${
                          selectedImage === index
                            ? "w-6 bg-white"
                            : "w-2 bg-white/60"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {galleryImages.length > 1 && (
              <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
                {galleryImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`overflow-hidden rounded-xl border bg-gray-100 transition ${
                      selectedImage === index
                        ? "border-black"
                        : "border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    <div className="aspect-[4/5]">
                      <OptimizedImage
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        width={240}
                        height={300}
                        sizes="96px"
                        wrapperClassName="h-full w-full"
                      />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Product Info ── */}
          <div className="flex flex-col">
            <p className="text-sm uppercase tracking-[0.2em] text-gray-500">
              {product.category}
            </p>

            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-gray-900 md:text-4xl">
              {product.name}
            </h1>

            {/* Pricing */}
            <div className="mt-4 space-y-2">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <p className="text-2xl font-semibold text-black">
                  {currencyFormatter.format(pricing.sellingPrice)}
                </p>
                {hasDiscount && (
                  <p className="text-base font-medium text-gray-400 line-through">
                    {currencyFormatter.format(pricing.actualPrice)}
                  </p>
                )}
              </div>
              {hasDiscount && (
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <span className="font-semibold text-green-700">
                    {pricing.discountPercentage}% OFF
                  </span>
                  <span className="text-gray-600">
                    You Save {currencyFormatter.format(amountSaved)}
                  </span>
                </div>
              )}
            </div>

            <p className="mt-6 leading-7 text-gray-600">{product.description}</p>

            {/* ── Size Selector ── */}
            <div className="mt-8">
              <p className="mb-3 text-sm font-medium text-gray-900">
                Select Size
              </p>

              <div className="flex flex-wrap gap-3">
                {product.sizes.map((size) => {
                  const sizeStock = getStockForSize(size);
                  const isSizeOOS = sizeStock !== null && sizeStock === 0;
                  const isSizeLow =
                    sizeStock !== null && sizeStock > 0 && sizeStock <= 10;
                  const isSelected = selectedSize === size;

                  return (
                    <div key={size} className="relative flex flex-col items-center gap-1">
                      <button
                        onClick={() => !isSizeOOS && setSelectedSize(size)}
                        disabled={isSizeOOS}
                        aria-label={
                          isSizeOOS
                            ? `Size ${size} – out of stock`
                            : isSizeLow
                            ? `Size ${size} – only ${sizeStock} left`
                            : `Size ${size}`
                        }
                        className={[
                          "relative rounded-md border px-4 py-2 text-sm transition",
                          isSelected
                            ? "border-black bg-black text-white"
                            : isSizeOOS
                            ? "cursor-not-allowed border-gray-200 bg-gray-50 text-gray-300"
                            : "border-gray-300 text-gray-800 hover:border-black",
                        ].join(" ")}
                      >
                        {/* Diagonal strikethrough line for OOS */}
                        {isSizeOOS && (
                          <span
                            aria-hidden="true"
                            className="pointer-events-none absolute inset-0 overflow-hidden rounded-md"
                          >
                            <svg
                              className="absolute inset-0 h-full w-full"
                              viewBox="0 0 100 100"
                              preserveAspectRatio="none"
                            >
                              <line
                                x1="0"
                                y1="100"
                                x2="100"
                                y2="0"
                                stroke="#d1d5db"
                                strokeWidth="1.5"
                                vectorEffect="non-scaling-stroke"
                              />
                            </svg>
                          </span>
                        )}
                        {size}
                      </button>

                      {/* Low stock count beneath the button */}
                      {isSizeLow && !isSizeOOS && (
                        <span className="text-[11px] font-medium text-amber-600">
                          {sizeStock} left
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── Color Selector ── */}
            {product.colors.length > 0 && (
              <div className="mt-8">
                <p className="mb-3 text-sm font-medium text-gray-900">
                  Select Color
                </p>

                <div className="flex flex-wrap gap-3">
                  {product.colors.map((color) => {
                    const colorStock = getStockForColor(color);
                    const isColorOOS = colorStock !== null && colorStock === 0;
                    const isColorLow =
                      colorStock !== null &&
                      colorStock > 0 &&
                      colorStock <= 10;
                    const isSelected = selectedColor === color;

                    return (
                      <div key={color} className="relative flex flex-col items-center gap-1">
                        <button
                          onClick={() => !isColorOOS && setSelectedColor(color)}
                          disabled={isColorOOS}
                          aria-label={
                            isColorOOS
                              ? `${color} – out of stock`
                              : isColorLow
                              ? `${color} – only ${colorStock} left`
                              : color
                          }
                          className={[
                            "relative rounded-md border px-4 py-2 text-sm transition",
                            isSelected
                              ? "border-black bg-black text-white"
                              : isColorOOS
                              ? "cursor-not-allowed border-gray-200 bg-gray-50 text-gray-300"
                              : "border-gray-300 text-gray-800 hover:border-black",
                          ].join(" ")}
                        >
                          {/* Diagonal strikethrough line for OOS */}
                          {isColorOOS && (
                            <span
                              aria-hidden="true"
                              className="pointer-events-none absolute inset-0 overflow-hidden rounded-md"
                            >
                              <svg
                                className="absolute inset-0 h-full w-full"
                                viewBox="0 0 100 100"
                                preserveAspectRatio="none"
                              >
                                <line
                                  x1="0"
                                  y1="100"
                                  x2="100"
                                  y2="0"
                                  stroke="#d1d5db"
                                  strokeWidth="1.5"
                                  vectorEffect="non-scaling-stroke"
                                />
                              </svg>
                            </span>
                          )}
                          {color}
                        </button>

                        {/* Low stock count beneath the button */}
                        {isColorLow && !isColorOOS && (
                          <span className="text-[11px] font-medium text-amber-600">
                            {colorStock} left
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Stock status for the active combination ── */}
            {isOutOfStock && (
              <p className="mt-5 text-sm font-medium text-red-600">
                Out of Stock
              </p>
            )}
            {isLowStock && (
              <p className="mt-5 text-sm font-medium text-amber-600">
                Only {availableStock} left in stock — order soon
              </p>
            )}

            {/* ── Quantity ── */}
            <div className="mt-8">
              <p className="mb-3 text-sm font-medium text-gray-900">Quantity</p>

              <div className="flex w-fit items-center overflow-hidden rounded-md border border-gray-300">
                <button
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  disabled={isOutOfStock}
                  className="px-4 py-2 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Minus size={16} />
                </button>

                <span className="min-w-[48px] text-center text-sm">
                  {quantity}
                </span>

                <button
                  onClick={() =>
                    setQuantity((prev) =>
                      availableStock !== null
                        ? Math.min(availableStock, prev + 1)
                        : prev + 1
                    )
                  }
                  disabled={
                    isOutOfStock ||
                    (availableStock !== null && quantity >= availableStock)
                  }
                  className="px-4 py-2 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* ── CTA Buttons ── */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="relative overflow-hidden flex flex-1 items-center justify-center gap-2 rounded-md bg-black px-6 py-3 text-sm text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ShoppingCart size={18} />
                {isOutOfStock ? "Out of Stock" : "Add to Cart"}
              </button>

              <button
                onClick={handleWishlistToggle}
                className={`flex items-center justify-center gap-2 rounded-md border px-6 py-3 text-sm transition ${
                  wishlisted
                    ? "border-red-500 bg-red-500 text-white"
                    : "border-black text-black hover:bg-black hover:text-white"
                }`}
              >
                <Heart size={18} className={wishlisted ? "fill-white" : ""} />
                {wishlisted ? "Wishlisted" : "Add to Wishlist"}
              </button>

              <button className="flex-1 rounded-md border border-black px-6 py-3 text-sm text-black transition hover:bg-black hover:text-white">
                Buy Now
              </button>
            </div>

            {/* ── Product Highlights ── */}
            <div className="mt-10 border-t border-gray-200 pt-8">
              <h2 className="text-lg font-semibold text-gray-900">
                Product Highlights
              </h2>
              <ul className="mt-4 space-y-3 text-sm text-gray-600">
                {product.features.map((feature, index) => (
                  <li key={index}>• {feature}</li>
                ))}
              </ul>
            </div>

            {/* ── Info Cards ── */}
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-gray-50 p-4">
                <h3 className="text-sm font-medium text-gray-900">Delivery</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Estimated delivery in 3–5 business days.
                </p>
              </div>
              <div className="rounded-xl bg-gray-50 p-4">
                <h3 className="text-sm font-medium text-gray-900">Returns</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Easy 7-day return and exchange policy.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Related Products ── */}
        {relatedProducts.length > 0 && (
          <div className="mt-20">
            <h2 className="text-2xl font-semibold tracking-tight text-gray-900">
              You may also like
            </h2>
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
              {relatedProducts.slice(0, 4).map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductDetails;