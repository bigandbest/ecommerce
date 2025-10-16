import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { FaTrash, FaPlus, FaTimes } from 'react-icons/fa';
import { notifications } from '@mantine/notifications';
import { getAllProducts } from '../../utils/supabaseApi'

const API_URL_PRODUCTS = 'https://ecommerce-8342.onrender.com/api/quick-pick-group-product';
const API_URL_ALL_PRODUCTS = 'https://ecommerce-8342.onrender.com/api/productsroute';
const API_URL_GROUP = 'https://ecommerce-8342.onrender.com/api/quick-pick-group';

const QuickPickGroupProducts = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const fetchGroupData = async () => {
    try {
      // Fetch the details of the specific Quick Pick Group
      const groupRes = await axios.get(`${API_URL_GROUP}/${id}`);
      setGroup(groupRes.data.quickPickGroup);

      // Fetch the products associated with this Quick Pick Group
      const productsRes = await axios.get(`${API_URL_PRODUCTS}/getProductsByGroup/${id}`);
      setProducts(productsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      notifications.show({ color: 'red', message: 'Failed to load group data.' });
    }
  };

 const fetchAllProducts = async () => {
  try {
    const res = await getAllProducts();
    if (res.success) {
      setAllProducts(res.products);
    } else {
      console.error("Error fetching all products:", res.error);
    }
  } catch (error) {
    console.error("Error fetching all products:", error);
  }
};


  useEffect(() => {
    fetchGroupData();
    fetchAllProducts();
  }, [id]);

  const handleRemoveProduct = async (productId) => {
    if (window.confirm('Are you sure you want to remove this product from the group?')) {
      try {
        await axios.delete(`${API_URL_PRODUCTS}/remove`, {
          data: { product_id: productId, quick_pick_group_id: id }
        });
        notifications.show({ color: 'green', message: 'Product removed successfully.' });
        fetchGroupData(); // Refresh the product list
      } catch (error) {
        console.error('Error removing product:', error);
        notifications.show({ color: 'red', message: 'Failed to remove product.' });
      }
    }
  };

  const handleAddProduct = async () => {
    if (!selectedProduct) {
      notifications.show({ color: 'red', message: 'Please select a product.' });
      return;
    }
    try {
      await axios.post(`${API_URL_PRODUCTS}/map`, {
        product_id: selectedProduct,
        quick_pick_group_id: id,
      });
      notifications.show({ color: 'green', message: 'Product added successfully.' });
      setShowAddProductModal(false);
      setSelectedProduct(null);
      fetchGroupData(); // Refresh the product list
    } catch (error) {
      console.error('Error adding product:', error);
      notifications.show({ color: 'red', message: 'Failed to add product.' });
    }
  };

  if (!group) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <button 
        className="text-blue-500 hover:underline mb-4" 
        onClick={() => navigate('/quick-pick-groups')}
      >
        ← Back to the Groups
      </button>

      <h1 className="text-3xl font-bold mb-2">Manage Products for the Quick Pick Group: {group.name}</h1>
      <p className="text-gray-600 mb-6">ID: {group.id}</p>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h3 className="text-xl font-semibold mb-4">Add Product</h3>
        <div className="flex items-center space-x-4">
          <select
            className="flex-1 shadow border rounded py-2 px-3 text-gray-700"
            onChange={(e) => setSelectedProduct(e.target.value)}
            value={selectedProduct || ''}
          >
            <option value="">Select a product</option>
            {allProducts.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <button
            onClick={handleAddProduct}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Add
          </button>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-6 py-4 bg-gray-100 border-b border-gray-200">
          <h3 className="text-xl font-semibold">Products in this Group</h3>
        </div>
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Product Name
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {products.length > 0 ? (
              products.map((p) => (
                <tr key={p.product_id}>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">{p.products.name}</p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <button 
                      className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-3 rounded text-sm"
                      onClick={() => handleRemoveProduct(p.product_id)}
                    >
                      <FaTimes /> Remove
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="2" className="text-center py-4">No products in this group.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default QuickPickGroupProducts;
