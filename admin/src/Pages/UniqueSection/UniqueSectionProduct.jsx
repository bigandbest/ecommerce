// src/pages/UniqueSectionProducts.jsx
import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const UniqueSectionProducts = () => {
  const { id } = useParams(); // unique_section_id from the route
  const navigate = useNavigate();

  const [section, setSection] = useState(null);
  const [productsInSection, setProductsInSection] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [loading, setLoading] = useState(true);

  // Normalize IDs to strings to avoid number/string mismatch issues
  const mappedProductIdSet = useMemo(() => {
    return new Set(productsInSection.map((p) => String(p?.id)));
  }, [productsInSection]);

  // Fetch Section info
  const fetchSection = useCallback(async () => {
    try {
      const res = await axios.get(
        `https://ecommerce-8342.onrender.com/api/unique-sections/${id}`
      );
      // Some APIs return { unique_section: {...} }, others return the row directly.
      const data = res.data?.unique_section ?? res.data;
      setSection(data);
    } catch (err) {
      console.error("Failed to fetch Section details:", err);
    }
  }, [id]);

  // Fetch products mapped to this Section
  const fetchSectionProducts = useCallback(async () => {
    try {
      const res = await axios.get(
        `https://ecommerce-8342.onrender.com/api/unique-sections-products/section/${id}`
      );
      // API returns [{ product_id, products: {...} }]
      const mapped = (res.data || [])
        .map((item) => item.products)
        .filter(Boolean);
      setProductsInSection(mapped);
    } catch (err) {
      console.error("Failed to fetch products for Section:", err);
    }
  }, [id]);

  // Fetch all available products
  const fetchAllProducts = async () => {
    try {
      const res = await axios.get(
        `https://ecommerce-8342.onrender.com/api/productsroute/allproducts`
      );
      setAllProducts(res.data || []);
    } catch (err) {
      console.error("Failed to fetch all products:", err);
    }
  };

  const handleAddProduct = async () => {
    if (!selectedProductId) return;

    try {
      await axios.post(
        `https://ecommerce-8342.onrender.com/api/unique-sections-products/map`,
        {
          product_id: selectedProductId,
          unique_section_id: id,
        }
      );
      setSelectedProductId("");
      await fetchSectionProducts();
    } catch (err) {
      alert("Product already mapped or an error occurred");
      console.error(err);
    }
  };

  const handleRemoveProduct = async (product_id) => {
    try {
      // MUST be DELETE to match your router.delete('/remove', ...)
      await axios.delete(
        `https://ecommerce-8342.onrender.com/api/unique-sections-products/remove`,
        {
          data: {
            product_id,
            unique_section_id: id,
          },
        }
      );
      await fetchSectionProducts();
    } catch (err) {
      alert("Failed to remove product");
      console.error(err);
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([
        fetchSection(),
        fetchSectionProducts(),
        fetchAllProducts(),
      ]);
      setLoading(false);
    };
    load();
  }, [id]);

  if (loading || !section) return <p className="p-4">Loading...</p>;

  return (
    <div className="p-6 max-w-screen-lg mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate("/unique-sections")}
          className="text-blue-600 hover:underline mb-2"
        >
          ← Back to Sections
        </button>
        <h2 className="text-xl font-bold">Manage Products for the Section</h2>
        <p className="text-lg">Section Name: {section?.name}</p>
      </div>

      {/* Add Product */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h3 className="font-semibold mb-2">➕ Add Product</h3>
        <div className="flex gap-2 items-center">
          <select
            className="border rounded px-3 py-2"
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
          >
            <option value="">Select product</option>
            {allProducts.map((product) => {
              const pid = String(product.id);
              const disabled = mappedProductIdSet.has(pid);
              return (
                <option key={pid} value={pid} disabled={disabled}>
                  {product.name}
                </option>
              );
            })}
          </select>
          <button
            onClick={handleAddProduct}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            disabled={!selectedProductId}
          >
            Add
          </button>
        </div>
      </div>

      {/* List Products */}
      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-4">📦 Products in Section</h3>
        {productsInSection.length === 0 ? (
          <p className="text-gray-500">No products mapped to this Section.</p>
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
              {productsInSection.map((product) => (
                <tr key={product.id} className="border-t">
                  <td className="py-2 px-4">{product.name}</td>
                  <td className="py-2 px-4">
                    {product.price !== undefined ? `₹${product.price}` : "-"}
                  </td>
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

export default UniqueSectionProducts;
