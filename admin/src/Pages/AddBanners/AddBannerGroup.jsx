import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { notifications } from '@mantine/notifications';
import { supabaseAdmin } from '../../utils/supabase.js';

const API_URL = "http://localhost:8000/api/banner-groups";
const BANNER_API_URL = "http://localhost:8000/api/banner";

// Component to handle adding/editing a Banner Group
const BannerGroupForm = ({ initialData, onSave, onCancel, bannerId }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [image, setImage] = useState(null);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', name);
    if (image) {
      formData.append('image_url', image);
    }
    // Add bannerId to the formData if it exists
    if (bannerId) {
      formData.append('banner_id', bannerId);
    }
      
    try {
      if (initialData) {
        // Update existing banner group
        await axios.put(`${API_URL}/update/${initialData.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        notifications.show({ color: 'green', message: 'Banner Group updated successfully.' });
      } else {
        // Add new banner group
        await axios.post(`${API_URL}/add`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        notifications.show({ color: 'green', message: 'Banner Group added successfully.' });
      }
      onSave(); // Call the callback from the parent to close the form and refresh the list
    } catch (error) {
      console.error('Error saving banner group:', error);
      notifications.show({ color: 'red', message: 'Failed to save banner group.' });
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
      <div className="bg-white p-8 rounded-md shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-4">{initialData ? 'Edit Banner Group' : 'Add Banner Group'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
              Banner Group Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Banner Group Name"
              required
            />
          </div>
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

// Main Banner Groups page component
const AddBannerGroup = () => {
  const [bannerGroups, setBannerGroups] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingBannerGroup, setEditingBannerGroup] = useState(null);
  const [bannerName, setBannerName] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const bannerId = queryParams.get('bannerId');

  const fetchBannerGroups = async () => {
    try {
      if (!bannerId) {
        setBannerGroups([]);
        return;
      }
      const { data, error } = await supabaseAdmin
        .from("add_banner_group")
        .select("*")
        .eq("banner_id", bannerId);
      
      if (error) throw error;
      setBannerGroups(data);
    } catch (error) {
      console.error('Error fetching banner groups:', error);
      notifications.show({ color: 'red', message: 'Failed to load banner groups.' });
    }
  };

  const fetchBannerName = async () => {
    if (bannerId) {
      try {
        const response = await axios.get(`${BANNER_API_URL}/${bannerId}`);
        setBannerName(response.data.banner.name);
      } catch (error) {
        console.error('Error fetching banner name:', error);
        setBannerName('Unknown');
        notifications.show({ color: 'red', message: 'Failed to load banner name.' });
      }
    }
  };

  useEffect(() => {
    fetchBannerGroups();
    fetchBannerName();
  }, [bannerId]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this banner group?')) {
      try {
        await axios.delete(`${API_URL}/delete/${id}`);
        fetchBannerGroups();
        notifications.show({ color: 'green', message: 'Banner Group deleted successfully.' });
      } catch (error) {
        console.error('Error deleting banner group:', error);
        notifications.show({ color: 'red', message: 'Failed to delete banner group.' });
      }
    }
  };

  const handleEditClick = (group) => {
    setEditingBannerGroup(group);
    setIsFormVisible(true);
  };

  const handleAddClick = () => {
    setEditingBannerGroup(null);
    setIsFormVisible(true);
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <button
        className="text-blue-500 hover:underline mb-4"
        onClick={() => navigate('/banners')}
      >
        ← Back to Banners
      </button>

      <h1 className="text-3xl font-bold mb-2">
        Manage Groups for the Banner: {bannerName}
      </h1>
      <p className="text-gray-600 mb-6">ID: {bannerId}</p>

      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-6 flex items-center"
        onClick={handleAddClick}
      >
        <FaPlus className="mr-2" /> Add Banner Group
      </button>

      {isFormVisible && (
        <BannerGroupForm
          initialData={editingBannerGroup}
          onSave={() => {
            setIsFormVisible(false);
            setEditingBannerGroup(null);
            fetchBannerGroups();
          }}
          onCancel={() => setIsFormVisible(false)}
          bannerId={bannerId}
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
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Image
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {bannerGroups.length > 0 ? (
              bannerGroups.map((group) => (
                <tr key={group.id}>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">{group.id}</p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">{group.name}</p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    {group.image_url && (
                      <img src={group.image_url} alt={group.name} className="h-12 w-12 object-cover rounded-full" />
                    )}
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <div className="flex space-x-2">
                      <button
                        className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-3 rounded text-sm"
                        onClick={() => handleEditClick(group)}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-3 rounded text-sm"
                        onClick={() => handleDelete(group.id)}
                      >
                        <FaTrash />
                      </button>
                      <button
                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-3 rounded text-sm"
                        onClick={() => navigate(`/add-banner-group-products/${group.id}`)}
                      >
                        Products
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center py-4">No Banner groups found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default AddBannerGroup;
