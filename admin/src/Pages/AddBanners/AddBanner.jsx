import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';

// Base URL for your banner backend APIs
const API_URL = 'https://ecommerce-8342.onrender.com/api/banner';

// Define banner types for the dropdown
const BANNER_TYPES = ['Discount', 'Offer', 'Deals'];

// Component to handle adding/editing a Banner
const BannerForm = ({ initialData, onSave, onCancel }) => {
  const [name, setName] = useState(initialData?.name || '');
  // 💡 MODIFIED: New state for banner_type, initialized to the first type or current data
  const [bannerType, setBannerType] = useState(initialData?.banner_type || BANNER_TYPES[0]);
  const [image, setImage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', name);
    // 💡 MODIFIED: Append the new banner_type field
    formData.append('banner_type', bannerType);

    if (image) {
      formData.append('image', image);
    }

    if (initialData) {
      // Update existing banner
      onSave(initialData.id, formData);
    } else {
      // Add new banner
      onSave(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
      <div className="bg-white p-8 rounded-md shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-4">{initialData ? 'Edit Banner' : 'Add Banner'}</h2>
        <form onSubmit={handleSubmit}>

          {/* Banner Name Input */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
              Banner Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Banner Name"
              required
            />
          </div>

          {/* 💡 NEW: Banner Type Dropdown */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="banner_type">
              Banner Type
            </label>
            <select
              id="banner_type"
              value={bannerType}
              onChange={(e) => setBannerType(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            >
              {BANNER_TYPES.map(type => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Image File Input */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="image">
              Choose File
            </label>
            <input
              type="file"
              id="image"
              onChange={(e) => setImage(e.target.files[0])}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
            {initialData && initialData.image_url && !image && (
              <p className="text-sm text-gray-500 mt-2">Current image selected.</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={onCancel}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              {initialData ? 'Update' : 'Add'}
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
  const navigate = useNavigate();

  const fetchBanners = async () => {
    try {
      const response = await axios.get(`${API_URL}/all`);
      setBanners(response.data.banners);
    } catch (error) {
      console.error('Error fetching banners:', error);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleAdd = async (formData) => {
    try {
      await axios.post(`${API_URL}/add`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setIsFormVisible(false);
      fetchBanners(); // Refresh the list
    } catch (error) {
      console.error('Error adding banner:', error);
    }
  };

  const handleUpdate = async (id, formData) => {
    try {
      await axios.put(`${API_URL}/update/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setIsFormVisible(false);
      setEditingBanner(null);
      fetchBanners(); // Refresh the list
    } catch (error) {
      console.error('Error updating banner:', error);
    }
  };

  const handleDelete = async (id) => {
    const isConfirmed = window.confirm('Are you sure you want to delete this banner?');
    if (isConfirmed) {
      try {
        await axios.delete(`${API_URL}/delete/${id}`);
        fetchBanners(); // Refresh the list
      } catch (error) {
        console.error('Error deleting banner:', error);
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

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Banners</h1>
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-6 flex items-center"
        onClick={handleAddClick}
      >
        <FaPlus className="mr-2" /> Add Banner
      </button>

      {isFormVisible && (
        <BannerForm
          initialData={editingBanner}
          onSave={editingBanner ? handleUpdate : handleAdd}
          onCancel={() => setIsFormVisible(false)}
        />
      )}

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                ID
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Name
              </th>
              {/* 💡 NEW: Table Header for Banner Type */}
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Type
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Image
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {banners.length > 0 ? (
              banners.map((banner) => (
                <tr key={banner.id}>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">{banner.id}</p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">{banner.name}</p>
                  </td>
                  {/* 💡 NEW: Table Data for Banner Type */}
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">{banner.banner_type}</p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <img src={banner.image_url} alt={banner.name} className="h-12 w-12 object-cover rounded-full" />
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <div className="flex space-x-2">
                      <button
                        className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-3 rounded text-sm"
                        onClick={() => handleEditClick(banner)}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-3 rounded text-sm"
                        onClick={() => handleDelete(banner.id)}
                      >
                        <FaTrash />
                      </button>
                      <button
                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-3 rounded text-sm"
                        onClick={() => navigate(`/add-banner-group?bannerId=${banner.id}`)}
                      >
                        Groups
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-4">No Banners found.</td>
                {/* 💡 NOTE: Colspan is now 5 */}
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AddBanner;