import { useEffect, useState } from "react";
import { getProducts, deleteProduct } from "../api/products";
import { getApiErrorMessage } from "../api/axios";
import type { Product } from "../types/product";

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchProducts = async () => {
    setErrorMessage("");
    setIsLoading(true);

    try {
      const data = await getProducts();
      setProducts(Array.isArray(data.data) ? data.data : []);
    } catch (error) {
      console.error(error);
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm("Delete this product?");

    if (!confirmDelete) return;

    try {
      await deleteProduct(id);
      fetchProducts();
    } catch (error) {
      console.error(error);
      setErrorMessage(getApiErrorMessage(error));
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Products</h1>

        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          Add Product
        </button>
      </div>

      <input
        type="text"
        placeholder="Search products..."
        className="w-full p-3 border rounded mb-6"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {errorMessage && (
        <p role="alert" className="mb-4 text-red-600">
          {errorMessage}
        </p>
      )}

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-100">
              <th className="p-4 text-left">Image</th>
              <th className="p-4 text-left">Name</th>
              <th className="p-4 text-left">Category</th>
              <th className="p-4 text-left">Price</th>
              <th className="p-4 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {isLoading && (
              <tr>
                <td className="p-4" colSpan={5}>
                  Loading products...
                </td>
              </tr>
            )}

            {!isLoading && filteredProducts.length === 0 && (
              <tr>
                <td className="p-4" colSpan={5}>
                  No products found.
                </td>
              </tr>
            )}

            {!isLoading &&
              filteredProducts.map((product) => (
                <tr key={product._id} className="border-t">
                  <td className="p-4">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-14 h-14 object-cover rounded"
                    />
                  </td>

                  <td className="p-4">{product.name}</td>

                  <td className="p-4">{product.category}</td>

                  <td className="p-4">Rs. {product.price}</td>

                  <td className="p-4 flex gap-2">
                    <button className="bg-yellow-500 text-white px-3 py-1 rounded">
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(product._id)}
                      className="bg-red-500 text-white px-3 py-1 rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Products;
