/* eslint-disable react/prop-types */
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";

// Base URL for your banner backend APIs
const API_URL = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}/banner`
  : "http://localhost:8000/api/banner";

// Define banner types for the dropdown
const BANNER_TYPES = [
  "hero",
  "mega_sale",
  "featured",
  "sidebar",
  "promo",
  "category",
  "Discount",
  "Offer",
  "Deals",
  "Summer Big Sale",
  "Opening Soon",
  "Section 1",
];

// lightweight placeholder SVG for missing images (module scope)
const PLACEHOLDER_IMAGE = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='160' viewBox='0 0 240 160'><rect width='100%' height='100%' fill='%23f3f4f6'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-family='sans-serif' font-size='14'>No image</text></svg>`;

// Component to handle adding/editing a Banner
const BannerForm = ({ initialData, onSave, onCancel }) => {
  const [name, setName] = useState(initialData?.name || "");
  const [bannerType, setBannerType] = useState(
    initialData?.banner_type || BANNER_TYPES[0]
  );
  const [description, setDescription] = useState(
    initialData?.description || ""
  );
  const [link, setLink] = useState(initialData?.link || "");
  const [active, setActive] = useState(
    initialData?.active !== undefined ? initialData.active : true
  );
  const [position, setPosition] = useState(initialData?.position || bannerType);
  const [isMobile, setIsMobile] = useState(initialData?.is_mobile || false);
  const [image, setImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const nameInputRef = useRef(null);

  useEffect(() => {
    // autofocus on open
    nameInputRef.current?.focus();

    const handleKey = (e) => {
      if (e.key === "Escape") onCancel();
    };

    document.addEventListener("keydown", handleKey);
    // lock body scroll while modal is open
    document.body.classList.add("overflow-hidden");

    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.classList.remove("overflow-hidden");
    };
    // run only on mount/unmount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("banner_type", bannerType);
    formData.append("description", description);
    formData.append("link", link);
    formData.append("active", active.toString());
    formData.append("position", position);
    formData.append("is_mobile", isMobile.toString());

    if (image) {
      formData.append("image", image);
    }

    try {
      if (initialData) {
        await onSave(initialData.id, formData);
      } else {
        await onSave(formData);
      }
    } catch (error) {
      console.error("Error saving banner:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="banner-form-title"
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="bg-linear-to-r from-blue-600 to-purple-600 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2
              id="banner-form-title"
              className="text-2xl font-bold text-white"
            >
              {initialData ? "✏️ Edit Banner" : "➕ Add New Banner"}
            </h2>
            <button
              onClick={onCancel}
              className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Banner Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Banner Name *
              </label>
              <input
                ref={nameInputRef}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter banner name"
                required
                aria-label="Banner name"
              />
            </div>

            {/* Banner Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Banner Type *
              </label>
              <select
                value={bannerType}
                onChange={(e) => setBannerType(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                required
              >
                {BANNER_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Position */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Position
              </label>
              <input
                type="text"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="e.g., hero, featured"
              />
            </div>

            {/* Link */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Redirect Link
              </label>
              <input
                type="url"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="https://example.com or /products"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                placeholder="Banner description (optional)"
                rows="3"
              />
            </div>

            {/* Settings */}
            <div className="md:col-span-2">
              <div className="flex flex-wrap gap-6">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                    className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Active Banner
                  </span>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isMobile}
                    onChange={(e) => setIsMobile(e.target.checked)}
                    className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Mobile Only
                  </span>
                </label>
              </div>
            </div>

            {/* Image Upload */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Banner Image
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  onChange={(e) => setImage(e.target.files[0])}
                  className="hidden"
                  id="image-upload"
                  accept="image/*"
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                    📁
                  </div>
                  <span className="text-sm text-gray-600">
                    Click to upload image
                  </span>
                  <span className="text-xs text-gray-400 mt-1">
                    PNG, JPG up to 10MB
                  </span>
                </label>
                {image && (
                  <div className="mt-4">
                    <p className="text-sm text-green-600 font-medium">
                      ✓ {image.name}
                    </p>
                  </div>
                )}
                {initialData && initialData.image_url && !image && (
                  <div className="mt-4">
                    <p className="text-sm text-blue-600">
                      Current image will be kept
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-linear-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <span>
                    {initialData ? "💾 Save Changes" : "🚀 Create Banner"}
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main Banner page component
const AddBanner = () => {
  const [banners, setBanners] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const navigate = useNavigate();

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/all`);
      setBanners(response.data.banners);
    } catch (error) {
      console.error("Error fetching banners:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleAdd = async (formData) => {
    try {
      console.log('🚀 Adding banner to:', `${API_URL}/add`);
      const response = await axios.post(`${API_URL}/add`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log('✅ Banner added successfully:', response.data);
      setIsFormVisible(false);
      fetchBanners(); // Refresh the list
      alert('Banner added successfully!');
    } catch (error) {
      console.error("❌ Error adding banner:", error);
      alert(`Error: ${error.response?.data?.error || error.message}`);
    }
  };

  const handleUpdate = async (id, formData) => {
    try {
      await axios.put(`${API_URL}/update/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setIsFormVisible(false);
      setEditingBanner(null);
      fetchBanners(); // Refresh the list
    } catch (error) {
      console.error("Error updating banner:", error);
    }
  };

  const handleDelete = async (id) => {
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this banner?"
    );
    if (isConfirmed) {
      try {
        await axios.delete(`${API_URL}/delete/${id}`);
        fetchBanners(); // Refresh the list
      } catch (error) {
        console.error("Error deleting banner:", error);
      }
    }
  };

  const handleEditClick = (banner) => {
    setEditingBanner(banner);
    setIsFormVisible(true);
  };

  const handleAddClick = () => {
    setEditingBanner(null);
    setIsFormVisible(true);
  };

  // Filter banners based on search and type
  const filteredBanners = banners.filter((banner) => {
    const matchesSearch = banner.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesType =
      filterType === "all" || banner.banner_type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                🎨 Banner Management
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Create and manage banners for your website sections
              </p>
            </div>
            <button
              className="bg-linear-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all flex items-center space-x-2 shadow-lg"
              onClick={handleAddClick}
            >
              <FaPlus className="w-4 h-4" />
              <span>Add Banner</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Banners
              </label>
              <input
                type="text"
                placeholder="Search by banner name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Type
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="all">All Types</option>
                {BANNER_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <span className="text-2xl">📊</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Banners
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {banners.length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <span className="text-2xl">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-gray-900">
                  {banners.filter((b) => b.active).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <span className="text-2xl">📱</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Mobile Only</p>
                <p className="text-2xl font-bold text-gray-900">
                  {banners.filter((b) => b.is_mobile).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg">
                <span className="text-2xl">🏠</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Hero Banners
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {banners.filter((b) => b.banner_type === "hero").length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Banners Table */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-gray-600">Loading banners...</span>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Banner
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Position
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Mobile
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredBanners.length > 0 ? (
                    filteredBanners.map((banner) => (
                      <tr
                        key={banner.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="shrink-0 h-12 w-12">
                              <img
                                className="h-12 w-12 rounded-lg object-cover border"
                                src={banner.image_url || PLACEHOLDER_IMAGE}
                                alt={banner.name}
                                onError={(e) => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src = PLACEHOLDER_IMAGE;
                                }}
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {banner.name}
                              </div>
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {banner.description || "No description"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {banner.banner_type?.charAt(0).toUpperCase() +
                              banner.banner_type?.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {banner.position || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              banner.active
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {banner.active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              banner.is_mobile
                                ? "bg-purple-100 text-purple-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {banner.is_mobile ? "Mobile" : "All"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              className="text-yellow-600 hover:text-yellow-900 p-1 rounded hover:bg-yellow-50 transition-colors"
                              onClick={() => handleEditClick(banner)}
                              title="Edit Banner"
                            >
                              <FaEdit className="w-4 h-4" />
                            </button>
                            <button
                              className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                              onClick={() => handleDelete(banner.id)}
                              title="Delete Banner"
                            >
                              <FaTrash className="w-4 h-4" />
                            </button>
                            <button
                              className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50 transition-colors"
                              onClick={() =>
                                navigate(
                                  `/add-banner-group?bannerId=${banner.id}`
                                )
                              }
                              title="Manage Groups"
                            >
                              <span className="text-sm">👥</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <span className="text-2xl">📭</span>
                          </div>
                          <h3 className="text-lg font-medium text-gray-900 mb-1">
                            No banners found
                          </h3>
                          <p className="text-gray-500">
                            {searchTerm || filterType !== "all"
                              ? "Try adjusting your search or filter criteria."
                              : "Get started by creating your first banner."}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {isFormVisible && (
        <BannerForm
          initialData={editingBanner}
          onSave={editingBanner ? handleUpdate : handleAdd}
          onCancel={() => setIsFormVisible(false)}
        />
      )}
    </div>
  );
};

export default AddBanner;
