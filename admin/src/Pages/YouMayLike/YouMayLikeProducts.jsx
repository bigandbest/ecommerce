import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "https://ecommerce-8342.onrender.com/api/you-may-like-products";
const API_URL_ALL_PRODUCTS =
  "https://ecommerce-8342.onrender.com/api/productsroute";

const YouMayLikeProducts = () => {
  const [youMayLikeProducts, setYouMayLikeProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch all products in the 'You May Like' section
  const fetchYouMayLikeProducts = async () => {
    try {
      const res = await axios.get(`${API_URL}/list`);
      setYouMayLikeProducts(res.data);
    } catch (err) {
      console.error("Failed to fetch 'You May Like' products:", err);
    }
  };

  // Fetch all available products to populate the dropdown
  const fetchAllProducts = async () => {
    try {
      const res = await axios.get(`${API_URL_ALL_PRODUCTS}/allproducts`);
      setAllProducts(res.data);
    } catch (err) {
      console.error("Failed to fetch all products:", err);
    }
  };

  const handleAddProduct = async () => {
    if (!selectedProductId) return;

    try {
      await axios.post(`${API_URL}/map`, {
        product_id: selectedProductId,
      });
      setSelectedProductId("");
      await fetchYouMayLikeProducts(); // Refresh the product list
    } catch (err) {
      alert("Product already mapped or an error occurred");
      console.error(err);
    }
  };

  const handleRemoveProduct = async (product_id) => {
    try {
      await axios.delete(`${API_URL}/remove`, {
        data: { product_id },
      });
      await fetchYouMayLikeProducts(); // Refresh the product list
    } catch (err) {
      alert("Failed to remove product");
      console.error(err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchYouMayLikeProducts(), fetchAllProducts()]);
      setLoading(false);
    };
    loadData();
  }, []);

  if (loading) return <p className="p-4">Loading...</p>;

  const mappedProductIds = youMayLikeProducts.map((p) => p.product_id);

  return (
    <div className="p-6 max-w-screen-lg mx-auto">
      <h2 className="text-xl font-bold mb-4">
        Manage &quot;You May Like&quot; Products
      </h2>

      {/* Add Product Section */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h3 className="font-semibold mb-2">➕ Add Product</h3>
        <div className="flex gap-2 items-center">
          <select
            className="border rounded px-3 py-2"
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
          >
            <option value="">Select a product</option>
            {allProducts.map((product) => (
              <option
                key={product.id}
                value={product.id}
                disabled={mappedProductIds.includes(product.id)}
              >
                {product.name}
              </option>
            ))}
          </select>
          <button
            onClick={handleAddProduct}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Add
          </button>
        </div>
      </div>

      {/* Product List Table */}
      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-4">
          📦 Current &quot;You May Like&quot; Products
        </h3>
        {youMayLikeProducts.length === 0 ? (
          <p className="text-gray-500">No products in this section.</p>
        ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="py-2 px-4">Image</th>
                <th className="py-2 px-4">Product Name</th>
                <th className="py-2 px-4">Price</th>
                <th className="py-2 px-4">In Stock</th>
                <th className="py-2 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {youMayLikeProducts.map((item) => (
                <tr key={item.product_id} className="border-t">
                  <td className="py-2 px-4">
                    <img
                      src={item.products.image}
                      alt={item.products.name}
                      className="h-12 w-12 object-contain"
                    />
                  </td>
                  <td className="py-2 px-4">{item.products.name}</td>
                  <td className="py-2 px-4">₹{item.products.price}</td>
                  {/* Assuming 'in_stock' is a boolean or number in your products table */}
                  <td className="py-2 px-4">
                    {item.products.in_stock ? "Yes" : "No"}
                  </td>
                  <td className="py-2 px-4">
                    <button
                      onClick={() => handleRemoveProduct(item.product_id)}
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                    >
                      🗑 Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default YouMayLikeProducts;
