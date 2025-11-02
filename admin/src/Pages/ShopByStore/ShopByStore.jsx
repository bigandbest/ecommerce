import { useState, useEffect } from "react";
import api from "../../utils/api";

const ShopByStore = () => {
  const [editingRecommendedStore, setEditingRecommendedStore] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    imageFile: null,
    is_active: false,
  });
  const [preview, setPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [recommendedStores, setRecommendedStores] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRecommendedStores = async () => {
    try {
      const res = await api.get("/recommended-stores/list");
      setRecommendedStores(res.data.recommendedStores);
    } catch (err) {
      console.error("Failed to fetch Recommended Stores:", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteRecommendedStore = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this Recommended Store?"
    );
    if (!confirmDelete) return;

    try {
      await api.delete(`/recommended-stores/delete/${id}`);
      await fetchRecommendedStores();
    } catch (err) {
      alert("Failed to delete Recommended Store");
      console.error(err);
    }
  };

  const toggleActive = async (store) => {
    try {
      const formData = new FormData();
      formData.append("name", store.name);
      formData.append("description", store.description || "");
      formData.append("is_active", !store.is_active);

      await api.put(`/recommended-stores/update/${store.id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      await fetchRecommendedStores();
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || "Failed to update store status";
      alert(errorMessage);
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("description", form.description);
    formData.append("is_active", form.is_active);
    if (form.imageFile) {
      formData.append(
        editingRecommendedStore ? "image" : "image_url",
        form.imageFile
      );
    }

    try {
      if (editingRecommendedStore) {
        await api.put(
          `/recommended-stores/update/${editingRecommendedStore.id}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
      } else {
        await api.post("/recommended-stores/add", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }
      await fetchRecommendedStores();
      setShowForm(false);
      setEditingRecommendedStore(null);
      setForm({ name: "", description: "", imageFile: null, is_active: false });
      setPreview(null);
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || "Failed to save Recommended Store";
      alert(errorMessage);
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (store) => {
    setEditingRecommendedStore(store);
    setForm({
      name: store.name,
      description: store.description || "",
      imageFile: null,
      is_active: store.is_active || false,
    });
    setPreview(store.image_url);
    setShowForm(true);
  };

  useEffect(() => {
    fetchRecommendedStores();
  }, []);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6"> Store Management</h1>

      {/* Form for Add/Edit */}
      <div className="mb-6">
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingRecommendedStore(null);
            setForm({
              name: "",
              description: "",
              imageFile: null,
              is_active: false,
            });
            setPreview(null);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {showForm ? "Cancel" : "➕ Add  Store"}
        </button>

        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="mt-4 p-4 bg-gray-100 rounded shadow"
          >
            <h2 className="text-lg font-bold mb-4">
              {editingRecommendedStore ? "Edit  Store" : "Add  Store"}
            </h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Store Name"
                className="w-full border px-3 py-2 rounded text-sm"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
              <textarea
                placeholder="Store Description (optional)"
                className="w-full border px-3 py-2 rounded text-sm"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                rows="3"
              />
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) =>
                    setForm({ ...form, is_active: e.target.checked })
                  }
                  className="mr-2"
                />
                Active (Only 8 can be active)
              </label>
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
                <img
                  src={preview}
                  alt="Image Preview"
                  className="w-32 h-32 object-cover rounded"
                />
              )}
            </div>
            <div className="mt-4 flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting
                  ? "Saving..."
                  : editingRecommendedStore
                  ? "Save Changes"
                  : "Add"}
              </button>
            </div>
          </form>
        )}
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : recommendedStores && recommendedStores.length === 0 ? (
        <p className="text-gray-500">No Recommended Stores found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded shadow text-sm md:text-base">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="py-2 px-4">ID</th>
                <th className="py-2 px-4">Name</th>
                <th className="py-2 px-4">Description</th>
                <th className="py-2 px-4">Image</th>
                <th className="py-2 px-4">Active</th>
                <th className="py-2 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recommendedStores.map((store) => (
                <tr key={store.id} className="border-t">
                  <td className="py-2 px-4">{store.id}</td>
                  <td className="py-2 px-4">{store.name}</td>
                  <td className="py-2 px-4">
                    <div className="max-w-xs">
                      {store.description ? (
                        <p
                          className="text-sm text-gray-600 truncate"
                          title={store.description}
                        >
                          {store.description}
                        </p>
                      ) : (
                        <span className="text-gray-400 italic">
                          No description
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-2 px-4">
                    <img
                      src={store.image_url}
                      alt={store.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                  </td>
                  <td className="py-2 px-4">
                    <button
                      className={`px-3 py-1 rounded ${
                        store.is_active
                          ? "bg-green-500 text-white"
                          : "bg-gray-300 text-black"
                      }`}
                      onClick={() => toggleActive(store)}
                    >
                      {store.is_active ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="py-2 px-4 space-x-2">
                    <button
                      className="bg-yellow-500 text-white px-3 py-1 rounded"
                      onClick={() => handleEdit(store)}
                    >
                      ✏️
                    </button>
                    <button
                      className="bg-red-600 text-white px-3 py-1 rounded"
                      onClick={() => deleteRecommendedStore(store.id)}
                    >
                      🗑️
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

export default ShopByStore;
