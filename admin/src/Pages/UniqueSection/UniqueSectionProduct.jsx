import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const API = "http://localhost:8000/api/unique-section-products";

const UniqueSectionProducts = () => {
  const { id } = useParams(); // section_id
  const navigate = useNavigate();

  const [section, setSection] = useState(null);
  const [productsInSection, setProductsInSection] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchSection = async () => {
    const res = await axios.get(`${API}/section/${id}`);
    setSection(res.data);
  };

  const fetchSectionProducts = async () => {
    const res = await axios.get(`${API}/products/${id}`);
    setProductsInSection(res.data);
  };

  const fetchAllProducts = async () => {
    const res = await axios.get(`${API}/all-products`);
    setAllProducts(res.data);
  };

  const handleAddProduct = async () => {
    if (!selectedProductId) return;
    try {
      await axios.post(`${API}/map`, { product_id: selectedProductId, section_id: id });
      setSelectedProductId("");
      await fetchSectionProducts();
    } catch {
      alert("Product already mapped or an error occurred");
    }
  };

  const handleRemoveProduct = async (product_id) => {
    try {
      await axios.delete(`${API}/remove`, { data: { product_id, section_id: id } });
      await fetchSectionProducts();
    } catch {
      alert("Failed to remove product");
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchSection(), fetchSectionProducts(), fetchAllProducts()]);
      setLoading(false);
    };
    load();
  }, [id]);

  if (loading || !section) return <p className="p-4">Loading...</p>;

  const mappedIds = productsInSection.map((p) => p.id);

  return (
    <div className="p-6 max-w-screen-lg mx-auto">
      <button onClick={() => navigate("/unique-sections")} className="text-blue-600 hover:underline mb-4">
        ← Back to Sections
      </button>
      <h2 className="text-xl font-bold mb-2">Manage Products for Section</h2>
      <p className="text-lg mb-6">Section: {section.name}</p>

      {/* Add product */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h3 className="font-semibold mb-2">➕ Add Product</h3>
        <div className="flex gap-2 items-center">
          <select
            className="border rounded px-3 py-2"
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
          >
            <option value="">Select product</option>
            {allProducts.map((p) => (
              <option key={p.id} value={p.id} disabled={mappedIds.includes(p.id)}>
                {p.name}
              </option>
            ))}
          </select>
          <button onClick={handleAddProduct} className="bg-green-600 text-white px-4 py-2 rounded">
            Add
          </button>
        </div>
      </div>

      {/* List products */}
      <div className="bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-4">📦 Products in Section</h3>
        {productsInSection.length === 0 ? (
          <p className="text-gray-500">No products mapped to this Section.</p>
        ) : (
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="py-2 px-4">Name</th>
                <th className="py-2 px-4">Price</th>
                <th className="py-2 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {productsInSection.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="py-2 px-4">{p.name}</td>
                  <td className="py-2 px-4">₹{p.price}</td>
                  <td className="py-2 px-4">
                    <button
                      onClick={() => handleRemoveProduct(p.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded"
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
