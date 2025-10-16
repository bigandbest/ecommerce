import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Brand = () => {
  const navigate = useNavigate();
  const [editingBrand, setEditingBrand] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    imageFile: null,
  });
  const [preview, setPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBrands = async () => {
    try {
      const res = await axios.get(
        "https://ecommerce-8342.onrender.com/api/brand/list"
      );
      setBrands(res.data.brands);
    } catch (err) {
      console.error("Failed to fetch Brands:", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteBrand = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this Brand?"
    );
    if (!confirmDelete) return;

    try {
      await axios.delete(
        `https://ecommerce-8342.onrender.com/api/brand/delete/${id}`
      );
      await fetchBrands();
    } catch (err) {
      alert("Failed to delete Brand");
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData();
    formData.append("name", form.name);
    if (form.imageFile) {
      formData.append("image_url", form.imageFile);
    }

    try {
      if (editingBrand) {
        await axios.put(
          `https://ecommerce-8342.onrender.com/api/brand/update/${editingBrand.id}`,
          formData
        );
      } else {
        await axios.post(
          "https://ecommerce-8342.onrender.com/api/brand/add",
          formData
        );
      }
      await fetchBrands();
      setShowForm(false);
      setForm({ name: "", imageFile: null });
      setPreview(null);
      setEditingBrand(null);
    } catch (err) {
      alert("Failed to save Brand");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (brand) => {
    setEditingBrand(brand);
    setForm({
      name: brand.name,
      imageFile: null,
    });
    setPreview(brand.image_url);
    setShowForm(true);
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  return (
    <div className="p-4 sm:p-6 max-w-screen-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Brands</h1>

      {/* Form for Add/Edit */}
      <div className="mb-6">
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingBrand(null);
            setForm({ name: "", imageFile: null });
            setPreview(null);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {showForm ? "Cancel" : "➕ Add Brand"}
        </button>

        {showForm && (
          <form onSubmit={handleSubmit} className="mt-4 p-4 bg-gray-100 rounded shadow">
            <h2 className="text-lg font-bold mb-4">{editingBrand ? "Edit Brand" : "Add Brand"}</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Brand Name"
                className="w-full border px-3 py-2 rounded text-sm"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  setForm({ ...form, imageFile: file });
                  setPreview(URL.createObjectURL(file));
                }}
                className="w-full border px-3 py-2 rounded text-sm"
              />
              {preview && (
                <img src={preview} alt="Image Preview" className="w-32 h-32 object-cover rounded" />
              )}
            </div>
            <div className="mt-4 flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? "Saving..." : editingBrand ? "Save Changes" : "Add"}
              </button>
            </div>
          </form>
        )}
      </div>

      {loading ? (
        <p className="text-gray-500">Loading Brands...</p>
      ) : brands && brands.length === 0 ? (
        <p className="text-gray-500">No Brands found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded shadow text-sm md:text-base">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="py-2 px-4">ID</th>
                <th className="py-2 px-4">Name</th>
                <th className="py-2 px-4">Image</th>
                <th className="py-2 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {brands.map((brand) => (
                <tr key={brand.id} className="border-t">
                  <td className="py-2 px-4">{brand.id}</td>
                  <td className="py-2 px-4">{brand.name}</td>
                  <td className="py-2 px-4">
                    <img
                      src={brand.image_url}
                      alt={brand.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                  </td>
                  <td className="py-2 px-4 space-x-2">
                    <button
                      className="bg-yellow-500 text-white px-3 py-1 rounded"
                      onClick={() => handleEdit(brand)}
                    >
                      ✏️
                    </button>
                    <button
                      className="bg-red-600 text-white px-3 py-1 rounded"
                      onClick={() => deleteBrand(brand.id)}
                    >
                      🗑️
                    </button>
                    <button
                      className="bg-green-600 text-white px-3 py-1 rounded"
                      onClick={() => navigate(`/brandproducts/${brand.id}`)}
                    >
                      📦 Products
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Brand;
