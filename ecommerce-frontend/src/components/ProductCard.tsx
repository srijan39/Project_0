import type { Product } from "../data/products";


interface Props {
  product: Product;
}

const ProductCard = ({ product }: Props) => {
  return (
    <div className="group rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition">
      {/* Image */}
      <div className="aspect-[3/4] overflow-hidden bg-gray-100">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
        />
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-sm uppercase tracking-wide text-gray-800">
          {product.name}
        </h3>
        <p className="mt-1 text-sm font-medium text-black">
          ₹{product.price}
        </p>
      </div>
    </div>
  );
};

export default ProductCard;
