import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { notifications } from '@mantine/notifications';
import { supabaseAdmin } from '../../utils/supabase.js';

const API_URL = "https://ecommerce-8342.onrender.com/api/quick-pick-group";
const QUICK_PICK_API_URL = "https://ecommerce-8342.onrender.com/api/quick-pick";

// Component to handle adding/editing a Quick Pick Group
const QuickPickGroupForm = ({ initialData, onSave, onCancel, quickPickId }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [image, setImage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', name);
    if (image) {
      formData.append('image_url', image);
    }
    // Add quickPickId to the formData if it exists
    if (quickPickId) {
      formData.append('quick_pick_id', quickPickId);
    }
    
    try {
      if (initialData) {
        // Update existing quick pick
        await axios.put(`${API_URL}/update/${initialData.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        notifications.show({ color: 'green', message: 'Quick Pick Group updated successfully.' });
      } else {
        // Add new quick pick
        await axios.post(`${API_URL}/add`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        notifications.show({ color: 'green', message: 'Quick Pick Group added successfully.' });
      }
      onSave(); // Call the callback from the parent to close the form and refresh the list
    } catch (error) {
      console.error('Error saving quick pick group:', error);
      notifications.show({ color: 'red', message: 'Failed to save quick pick group.' });
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
      <div className="bg-white p-8 rounded-md shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-4">{initialData ? 'Edit Quick Pick Group' : 'Add Quick Pick Group'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
              Quick Pick Group Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Quick Pick Group Name"
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

// Main Quick Pick Groups page component
const QuickPickGroupPage = () => {
  const [quickPickGroups, setQuickPickGroups] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingQuickPickGroup, setEditingQuickPickGroup] = useState(null);
  const [quickPickName, setQuickPickName] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const quickPickId = queryParams.get('quickPickId');

  const fetchQuickPickGroups = async () => {
    try {
      if (!quickPickId) {
        setQuickPickGroups([]);
        return;
      }
      const { data, error } = await supabaseAdmin
        .from("quick_pick_group")
        .select("*")
        .eq("quick_pick_id", quickPickId);
      
      if (error) throw error;
      setQuickPickGroups(data);
    } catch (error) {
      console.error('Error fetching quick pick groups:', error);
      notifications.show({ color: 'red', message: 'Failed to load quick pick groups.' });
    }
  };

  const fetchQuickPickName = async () => {
    if (quickPickId) {
      try {
        const response = await axios.get(`${QUICK_PICK_API_URL}/${quickPickId}`);
        setQuickPickName(response.data.quickPick.name);
      } catch (error) {
        console.error('Error fetching quick pick name:', error);
        setQuickPickName('Unknown');
        notifications.show({ color: 'red', message: 'Failed to load quick pick name.' });
      }
    }
  };

  useEffect(() => {
    fetchQuickPickGroups();
    fetchQuickPickName();
  }, [quickPickId]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this quick pick group?')) {
      try {
        await axios.delete(`${API_URL}/delete/${id}`);
        fetchQuickPickGroups();
        notifications.show({ color: 'green', message: 'Quick Pick Group deleted successfully.' });
      } catch (error) {
        console.error('Error deleting quick pick group:', error);
        notifications.show({ color: 'red', message: 'Failed to delete quick pick group.' });
      }
    }
  };

  const handleEditClick = (group) => {
    setEditingQuickPickGroup(group);
    setIsFormVisible(true);
  };

  const handleAddClick = () => {
    setEditingQuickPickGroup(null);
    setIsFormVisible(true);
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <button
        className="text-blue-500 hover:underline mb-4"
        onClick={() => navigate('/quick-picks')}
      >
        ← Back to Quick Picks
      </button>

      <h1 className="text-3xl font-bold mb-2">
        Manage Groups for the Quick Pick: {quickPickName}
      </h1>
      <p className="text-gray-600 mb-6">ID: {quickPickId}</p>

      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-6 flex items-center"
        onClick={handleAddClick}
      >
        <FaPlus className="mr-2" /> Add Quick Pick Group
      </button>

      {isFormVisible && (
        <QuickPickGroupForm
          initialData={editingQuickPickGroup}
          onSave={() => {
            setIsFormVisible(false);
            setEditingQuickPickGroup(null);
            fetchQuickPickGroups();
          }}
          onCancel={() => setIsFormVisible(false)}
          quickPickId={quickPickId}
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
            {quickPickGroups.length > 0 ? (
              quickPickGroups.map((group) => (
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
                        onClick={() => navigate(`/quick-pick-group/products/${group.id}`)}
                      >
                        Products
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center py-4">No quick pick groups found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default QuickPickGroupPage;