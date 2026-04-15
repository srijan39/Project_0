import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  ChevronRight as BreadcrumbChevron,
  Minus,
  Plus,
  ShoppingCart,
} from "lucide-react";
import { products } from "../data/products";
import { useCart } from "../context/CartContext";
import ProductCard from "../components/ProductCard";

const ProductDetails = () => {
  const { id } = useParams();
  const { addToCart } = useCart();

  const product = useMemo(
    () => products.find((item) => item.id === Number(id)),
    [id]
  );

  const galleryImages = useMemo(() => {
    if (!product) return [];
    if (Array.isArray(product.images) && product.images.length > 0) {
      return product.images;
    }
    return [product.image];
  }, [product]);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(product?.sizes?.[0] || "");
  const [selectedColor, setSelectedColor] = useState("Black");
  const [quantity, setQuantity] = useState(1);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  const colors = ["Black", "White", "Beige","Navy Blue"];

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

  const relatedProducts = products.filter(
    (item) => item.category === product.category && item.id !== product.id
  );

  const handleAddToCart = (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    e.stopPropagation();

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
      color: selectedColor,
      quantity,
    });

    const cartIcon = document.getElementById("cart-icon");
    if (cartIcon) {
      cartIcon.classList.remove("cart-in");
      void cartIcon.offsetWidth;
      cartIcon.classList.add("cart-in");

      setTimeout(() => {
        cartIcon.classList.remove("cart-in");
      }, 250);
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
                <img
                  src={galleryImages[selectedImage]}
                  alt={product.name}
                  className={`h-full w-full object-cover transition duration-200 ${
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
                      <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <p className="text-sm uppercase tracking-[0.2em] text-gray-500">
              {product.category}
            </p>

            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-gray-900 md:text-4xl">
              {product.name}
            </h1>

            <p className="mt-4 text-2xl font-semibold text-black">
              ₹{product.price}
            </p>

            <p className="mt-6 leading-7 text-gray-600">
              {product.description}
            </p>

            <div className="mt-8">
              <p className="mb-3 text-sm font-medium text-gray-900">
                Select Size
              </p>

              <div className="flex flex-wrap gap-3">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`rounded-md border px-4 py-2 text-sm transition ${
                      selectedSize === size
                        ? "border-black bg-black text-white"
                        : "border-gray-300 text-gray-800 hover:border-black"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8">
              <p className="mb-3 text-sm font-medium text-gray-900">
                Select Color
              </p>

              <div className="flex flex-wrap gap-3">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`rounded-md border px-4 py-2 text-sm transition ${
                      selectedColor === color
                        ? "border-black bg-black text-white"
                        : "border-gray-300 text-gray-800 hover:border-black"
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8">
              <p className="mb-3 text-sm font-medium text-gray-900">
                Quantity
              </p>

              <div className="flex w-fit items-center overflow-hidden rounded-md border border-gray-300">
                <button
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  className="px-4 py-2 transition hover:bg-gray-100"
                >
                  <Minus size={16} />
                </button>

                <span className="min-w-[48px] text-center text-sm">
                  {quantity}
                </span>

                <button
                  onClick={() => setQuantity((prev) => prev + 1)}
                  className="px-4 py-2 transition hover:bg-gray-100"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={handleAddToCart}
                className="relative overflow-hidden flex flex-1 items-center justify-center gap-2 rounded-md bg-black px-6 py-3 text-sm text-white transition hover:bg-gray-800"
              >
                <ShoppingCart size={18} />
                Add to Cart
              </button>

              <button className="flex-1 rounded-md border border-black px-6 py-3 text-sm text-black transition hover:bg-black hover:text-white">
                Buy Now
              </button>
            </div>

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

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-gray-50 p-4">
                <h3 className="text-sm font-medium text-gray-900">
                  Delivery
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  Estimated delivery in 3–5 business days.
                </p>
              </div>

              <div className="rounded-xl bg-gray-50 p-4">
                <h3 className="text-sm font-medium text-gray-900">
                  Returns
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  Easy 7-day return and exchange policy.
                </p>
              </div>
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="mt-20">
            <h2 className="text-2xl font-semibold tracking-tight text-gray-900">
              You may also like
            </h2>

            <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
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