import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
const UniqueSection = () => {
  const [editingSection, setEditingSection] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    // 1. REMOVED banner_type from initial state
    name: "",
    section_type: "", 
    imageFile: null,
  });
  const [preview, setPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
      const navigate = useNavigate();

  const fetchSections = async () => {
    try {
      const res = await axios.get(
        "http://localhost:8000/api/unique-sections/list"
      );
      setSections(res.data.uniqueSections || []);
    } catch (err) {
      console.error("Failed to fetch Sections:", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteSection = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this Section?"
    );
    if (!confirmDelete) return;

    try {
      await axios.delete(
        `http://localhost:8000/api/unique-sections/${id}`
      );
      await fetchSections();
    } catch (err) {
      alert("Failed to delete Section");
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData();
    formData.append("name", form.name);
    // Note: section_type is being sent, which is what the controller expects.
    formData.append("section_type", form.section_type); 
    // 2. REMOVED: formData.append("banner_type", form.banner_type);
    if (form.imageFile) {
      formData.append("image_url", form.imageFile);
    }

    try {
      if (editingSection) {
        await axios.put(
          `http://localhost:8000/api/unique-sections/${editingSection.id}`,
          formData
        );
      } else {
        await axios.post(
          "http://localhost:8000/api/unique-sections/",
          formData
        );
      }
      await fetchSections();
      setShowForm(false);
      setForm({
    // 1. REMOVED banner_type from reset state
        name: "",
        section_type: "",
        imageFile: null,
      });
      setPreview(null);
      setEditingSection(null);
    } catch (err) {
      alert("Failed to save Section");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (section) => {
    setEditingSection(section);
    setForm({
      name: section.name,
      section_type: section.section_type,
    // 1. REMOVED banner_type from edit state initialization
      imageFile: null,
    });
    setPreview(section.image_url);
    setShowForm(true);
  };

  useEffect(() => {
    fetchSections();
  }, []);

  return (
    <div className="p-4 sm:p-6 max-w-screen-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Unique Sections</h1>

      {/* Form for Add/Edit */}
      <div className="mb-6">
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingSection(null);
            setForm({
    // 1. REMOVED banner_type from cancel state
              name: "",
              section_type: "",
              imageFile: null,
            });
            setPreview(null);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {showForm ? "Cancel" : "➕ Add Section"}
        </button>

        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="mt-4 p-4 bg-gray-100 rounded shadow"
          >
            <h2 className="text-lg font-bold mb-4">
              {editingSection ? "Edit Section" : "Add Section"}
            </h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Section Name"
                className="w-full border px-3 py-2 rounded text-sm"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
                {/* 3. Re-purposed the select box to use the section_type field */}
              <select
                placeholder="Section Type"
                className="w-full border px-3 py-2 rounded text-sm"
                value={form.section_type} 
                onChange={(e) =>
                  setForm({ ...form, section_type: e.target.value })
                }
              >
                {/* Ensure the initial value is an empty string if required by DB */}
                <option value="">Select Section Type</option> 
                <option value="Section 1">New Menu</option>
                <option value="Best quality">Best quality</option>
              </select>
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
                  : editingSection
                  ? "Save Changes"
                  : "Add"}
              </button>
            </div>
          </form>
        )}
      </div>

      {loading ? (
        <p className="text-gray-500">Loading Sections...</p>
      ) : sections && sections.length === 0 ? (
        <p className="text-gray-500">No Sections found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded shadow text-sm md:text-base">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="py-2 px-4">ID</th>
                <th className="py-2 px-4">Name</th>
                <th className="py-2 px-4">Section Type</th>
                {/* 3. REMOVED the 'Banner Type' table header */}
                <th className="py-2 px-4">Image</th>
                <th className="py-2 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sections.map((section) => (
                <tr key={section.id} className="border-t">
                  <td className="py-2 px-4">{section.id}</td>
                  <td className="py-2 px-4">{section.name}</td>
                  <td className="py-2 px-4">{section.section_type}</td>
                {/* 3. REMOVED the table cell displaying banner_type */}
                  <td className="py-2 px-4">
                    <img
                      src={section.image_url}
                      alt={section.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                  </td>
                  <td className="py-2 px-4 space-x-2">
                    <button
                      className="bg-yellow-500 text-white px-3 py-1 rounded"
                      onClick={() => handleEdit(section)}
                    >
                      ✏️
                    </button>
                    <button
                      className="bg-red-600 text-white px-3 py-1 rounded"
                      onClick={() => deleteSection(section.id)}
                    >
                      🗑️
                    </button>
                    <button
                      className="bg-green-600 text-white px-3 py-1 rounded"
                      onClick={() => navigate(`/unique-sections/products/${section.id}`)}
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

export default UniqueSection;