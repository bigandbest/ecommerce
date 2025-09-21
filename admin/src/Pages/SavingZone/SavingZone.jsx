import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';

// Base URL for your saving zone backend APIs
const API_URL = 'https://ecommerce-8342.onrender.com/api/saving-zone';

// Component to handle adding/editing a Saving Zone
const SavingZoneForm = ({ initialData, onSave, onCancel }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [image, setImage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', name);
    if (image) {
      formData.append('image_url', image);
    }

    if (initialData) {
      // Update existing saving zone
      onSave(initialData.id, formData);
    } else {
      // Add new saving zone
      onSave(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
      <div className="bg-white p-8 rounded-md shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-4">{initialData ? 'Edit Saving Zone' : 'Add Saving Zone'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
              Saving Zone Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Saving Zone Name"
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

// Main Saving Zones page component
const SavingZonesPage = () => {
  const [savingZones, setSavingZones] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingSavingZone, setEditingSavingZone] = useState(null);
  const navigate = useNavigate();

  const fetchSavingZones = async () => {
    try {
      const response = await axios.get(`${API_URL}/list`);
      setSavingZones(response.data.savingZones);
    } catch (error) {
      console.error('Error fetching saving zones:', error);
    }
  };

  useEffect(() => {
    fetchSavingZones();
  }, []);

  const handleAdd = async (formData) => {
    try {
      await axios.post(`${API_URL}/add`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setIsFormVisible(false);
      fetchSavingZones(); // Refresh the list
    } catch (error) {
      console.error('Error adding saving zone:', error);
    }
  };

  const handleUpdate = async (id, formData) => {
    try {
      await axios.put(`${API_URL}/update/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setIsFormVisible(false);
      setEditingSavingZone(null);
      fetchSavingZones(); // Refresh the list
    } catch (error) {
      console.error('Error updating saving zone:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this saving zone?')) {
      try {
        await axios.delete(`${API_URL}/delete/${id}`);
        fetchSavingZones(); // Refresh the list
      } catch (error) {
        console.error('Error deleting saving zone:', error);
      }
    }
  };

  const handleEditClick = (savingZone) => {
    setEditingSavingZone(savingZone);
    setIsFormVisible(true);
  };

  const handleAddClick = () => {
    setEditingSavingZone(null);
    setIsFormVisible(true);
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Saving Zones</h1>
      <button 
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-6 flex items-center"
        onClick={handleAddClick}
      >
        <FaPlus className="mr-2" /> Add Saving Zone
      </button>

      {isFormVisible && (
        <SavingZoneForm
          initialData={editingSavingZone}
          onSave={editingSavingZone ? handleUpdate : handleAdd}
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
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Image
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {savingZones.length > 0 ? (
              savingZones.map((savingZone) => (
                <tr key={savingZone.id}>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">{savingZone.id}</p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">{savingZone.name}</p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <img src={savingZone.image_url} alt={savingZone.name} className="h-12 w-12 object-cover rounded-full" />
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <div className="flex space-x-2">
                      <button 
                        className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-3 rounded text-sm"
                        onClick={() => handleEditClick(savingZone)}
                      >
                        <FaEdit />
                      </button>
                      <button 
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-3 rounded text-sm"
                        onClick={() => handleDelete(savingZone.id)}
                      >
                        <FaTrash />
                      </button>
                      <button 
                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-3 rounded text-sm"
                        onClick={() => navigate(`/saving-zone-groups?savingZoneId=${savingZone.id}`)}
                      >
                        Groups
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center py-4">No saving zones found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SavingZonesPage;