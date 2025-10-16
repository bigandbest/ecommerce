import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const RecommendedStoreProducts = () => {
  const { id } = useParams(); // recommended_store_id
  const navigate = useNavigate();

  const [recommendedStore, setRecommendedStore] = useState(null);
  const [productsInStore, setProductsInStore] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch Recommended Store info
  const fetchRecommendedStore = async () => {
    try {
      // CORRECT: Use the route you defined in bbmPicksRoute.js
      const res = await axios.get(`https://ecommerce-8342.onrender.com/api/recommended-stores/${id}`);
      // CORRECT: Access the 'bbmPick' property from the response data
      setRecommendedStore(res.data.recommendedStore);
    } catch (err) {
      console.error("Failed to fetch Recommended Store details:", err);
    }
  };

  // Fetch products mapped to this Recommended Store
  const fetchRecommendedStoreProducts = async () => {
    try {
      const res = await axios.get(`https://ecommerce-8342.onrender.com/api/product-recommended-stores/${id}`);
      const mapped = res.data.map((item) => item.products);
      setProductsInStore(mapped);
    } catch (err) {
      console.error("Failed to fetch products for Recommended Store:", err);
    }
  };

  // Fetch all available products
  const fetchAllProducts = async () => {
    try {
      const res = await axios.get(`https://ecommerce-8342.onrender.com/api/productsroute/allproducts`);
      setAllProducts(res.data);
    } catch (err) {
      console.error("Failed to fetch all products:", err);
    }
  };

  const handleAddProduct = async () => {
    if (!selectedProductId) return;

    try {
      await axios.post("https://ecommerce-8342.onrender.com/api/product-recommended-stores/map", {
        product_id: selectedProductId,
        recommended_store_id: id,
      });
      setSelectedProductId("");
      await fetchRecommendedStoreProducts();
    } catch (err) {
      alert("Product already mapped or error occurred");
      console.error(err);
    }
  };

  const handleRemoveProduct = async (product_id) => {
    try {
      await axios.post("https://ecommerce-8342.onrender.com/api/product-recommended-stores/remove", {
        product_id,
        recommended_store_id: id,
      });
      await fetchRecommendedStoreProducts();
    } catch (err) {
      alert("Failed to remove product");
      console.error(err);
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([
        fetchRecommendedStore(),
        fetchRecommendedStoreProducts(),
        fetchAllProducts(),
      ]);
      setLoading(false);
    };
    load();
  }, [id]);

  if (loading || !recommendedStore) return <p className="p-4">Loading...</p>;

  const mappedProductIds = productsInStore.map(p => p.id);

  return (
    <div className="p-6 max-w-screen-lg mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate("/recommended-stores")}
          className="text-blue-600 hover:underline mb-2"
        >
          ← Back to Recommended Stores
        </button>
        <h2 className="text-xl font-bold">Manage Products for the Recommended Store:</h2>
        <p className="text-lg">Recommended Store Name: {recommendedStore.name}</p>
      </div>

      <div className="bg-white p-4 rounded shadow mb-6">
        <h3 className="font-semibold mb-2">➕ Add Product</h3>
        <div className="flex gap-2 items-center">
          <select
            className="border rounded px-3 py-2"
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
          >
            <option value="">Select product</option>
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

      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-4">📦 Products in Recommended Store</h3>
        {productsInStore.length === 0 ? (
          <p className="text-gray-500">No products mapped to this Recommended Store.</p>
        ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="py-2 px-4">Product Name</th>
                <th className="py-2 px-4">Price</th>
                <th className="py-2 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {productsInStore.map((product) => (
                <tr key={product.id} className="border-t">
                  <td className="py-2 px-4">{product.name}</td>
                  <td className="py-2 px-4">₹{product.price}</td>
                  <td className="py-2 px-4">
                    <button
                      onClick={() => handleRemoveProduct(product.id)}
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

export default RecommendedStoreProducts;
