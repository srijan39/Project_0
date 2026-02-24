import { useCart } from "../context/CartContext";

const Cart = () => {
  const { cart, increaseQty, decreaseQty, removeFromCart } = useCart();

  const subtotal = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  if (cart.length === 0) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      
      {/* Icon */}
      <div className="w-24 h-24 flex items-center justify-center rounded-full bg-gray-100 mb-8">
        <svg
          className="w-10 h-10 text-gray-400"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 4h12m-9 0a1 1 0 102 0m6 0a1 1 0 102 0"
          />
        </svg>
      </div>

      {/* Title */}
      <h2 className="text-2xl font-semibold mb-3">
        Your cart is empty
      </h2>

      {/* Subtitle */}
      <p className="text-gray-500 max-w-md mb-8">
        Looks like you haven’t added anything yet.
        Start exploring our collection and find something you love.
      </p>

      {/* CTA */}
      <a
        href="/Products"
        className="bg-black text-white px-8 py-3 text-sm uppercase tracking-wide hover:bg-gray-800 transition"
      >
        Continue Shopping
      </a>
    </div>
  );
}

  return (
    <div className="min-h-screen px-6 md:px-12 py-12">
      <h1 className="text-2xl font-semibold mb-10">
        Shopping Cart
      </h1>

      <div className="grid md:grid-cols-3 gap-12">

        {/* Items */}
        <div className="md:col-span-2 space-y-6">
          {cart.map((item) => (
            <div key={item.id} className="flex gap-6 border-b pb-6">
              <img
                src={item.image}
                alt={item.name}
                className="w-24 h-32 object-cover rounded-md"
              />

              <div className="flex flex-col justify-between flex-1">
                <div>
                  <h3 className="text-sm uppercase tracking-wide">
                    {item.name}
                  </h3>
                  <p className="mt-2 text-sm text-gray-600">
                    ₹{item.price}
                  </p>
                </div>

                <div className="flex items-center gap-3 mt-4">
                  <button
                    onClick={() => decreaseQty(item.id)}
                    className="w-8 h-8 border rounded"
                  >
                    -
                  </button>

                  <span>{item.quantity}</span>

                  <button
                    onClick={() => increaseQty(item.id)}
                    className="w-8 h-8 border rounded"
                  >
                    +
                  </button>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="ml-6 text-sm text-red-500"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="border p-6 rounded-lg h-fit">
          <h2 className="text-sm uppercase tracking-wide mb-6">
            Order Summary
          </h2>

          <div className="flex justify-between mb-4">
            <span>Subtotal</span>
            <span>₹{subtotal}</span>
          </div>

          <div className="border-t pt-4 flex justify-between font-medium">
            <span>Total</span>
            <span>₹{subtotal}</span>
          </div>

          <button className="mt-6 w-full bg-black text-white py-3 rounded-md">
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;