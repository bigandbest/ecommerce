import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Package, Save, X } from 'lucide-react';

const ProductVariantManager = ({ productId, productName }) => {
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingVariant, setEditingVariant] = useState(null);
  const [formData, setFormData] = useState({
    variant_name: '',
    variant_value: '',
    price: '',
    mrp: '',
    stock_quantity: '',
    sku: '',
    weight: '',
    dimensions: ''
  });

  useEffect(() => {
    fetchVariants();
  }, [productId]);

  const fetchVariants = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/variants/product/${productId}`);
      const data = await response.json();
      if (data.success) {
        setVariants(data.data);
      }
    } catch (error) {
      console.error('Error fetching variants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const url = editingVariant 
        ? `${import.meta.env.VITE_API_URL}/variants/update/${editingVariant.id}`
        : `${import.meta.env.VITE_API_URL}/variants/add`;
      
      const method = editingVariant ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          product_id: productId,
          price: parseFloat(formData.price),
          mrp: parseFloat(formData.mrp),
          stock_quantity: parseInt(formData.stock_quantity),
          weight: parseFloat(formData.weight) || 0
        })
      });

      const data = await response.json();
      
      if (data.success) {
        fetchVariants();
        resetForm();
        alert(editingVariant ? 'Variant updated successfully!' : 'Variant added successfully!');
      } else {
        alert('Error: ' + data.message);
      }
    } catch (error) {
      console.error('Error saving variant:', error);
      alert('Error saving variant');
    }
  };

  const handleEdit = (variant) => {
    setEditingVariant(variant);
    setFormData({
      variant_name: variant.variant_name,
      variant_value: variant.variant_value,
      price: variant.price.toString(),
      mrp: variant.mrp.toString(),
      stock_quantity: variant.stock_quantity.toString(),
      sku: variant.sku || '',
      weight: variant.weight?.toString() || '',
      dimensions: variant.dimensions || ''
    });
    setShowAddForm(true);
  };

  const handleDelete = async (variantId) => {
    if (!confirm('Are you sure you want to delete this variant?')) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/variants/delete/${variantId}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      
      if (data.success) {
        fetchVariants();
        alert('Variant deleted successfully!');
      } else {
        alert('Error deleting variant');
      }
    } catch (error) {
      console.error('Error deleting variant:', error);
      alert('Error deleting variant');
    }
  };

  const resetForm = () => {
    setFormData({
      variant_name: '',
      variant_value: '',
      price: '',
      mrp: '',
      stock_quantity: '',
      sku: '',
      weight: '',
      dimensions: ''
    });
    setEditingVariant(null);
    setShowAddForm(false);
  };

  if (loading) {
    return <div className="p-4">Loading variants...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-semibold">Product Variants</h2>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Variant
        </button>
      </div>

      <div className="mb-4 text-sm text-gray-600">
        Product: <span className="font-medium">{productName}</span>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="mb-6 p-4 border rounded-lg bg-gray-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">
              {editingVariant ? 'Edit Variant' : 'Add New Variant'}
            </h3>
            <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Variant Name</label>
              <input
                type="text"
                value={formData.variant_name}
                onChange={(e) => setFormData({...formData, variant_name: e.target.value})}
                placeholder="e.g., Size, Weight, Pack"
                className="w-full p-2 border rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Variant Value</label>
              <input
                type="text"
                value={formData.variant_value}
                onChange={(e) => setFormData({...formData, variant_value: e.target.value})}
                placeholder="e.g., 1kg, Large, 500g"
                className="w-full p-2 border rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Price (₹)</label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">MRP (₹)</label>
              <input
                type="number"
                step="0.01"
                value={formData.mrp}
                onChange={(e) => setFormData({...formData, mrp: e.target.value})}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Stock Quantity</label>
              <input
                type="number"
                value={formData.stock_quantity}
                onChange={(e) => setFormData({...formData, stock_quantity: e.target.value})}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">SKU</label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({...formData, sku: e.target.value})}
                placeholder="Unique product code"
                className="w-full p-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Weight (kg)</label>
              <input
                type="number"
                step="0.01"
                value={formData.weight}
                onChange={(e) => setFormData({...formData, weight: e.target.value})}
                className="w-full p-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Dimensions</label>
              <input
                type="text"
                value={formData.dimensions}
                onChange={(e) => setFormData({...formData, dimensions: e.target.value})}
                placeholder="L x W x H"
                className="w-full p-2 border rounded-md"
              />
            </div>

            <div className="md:col-span-2 flex gap-2">
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {editingVariant ? 'Update' : 'Add'} Variant
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Variants List */}
      <div className="space-y-4">
        {variants.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No variants added yet. Click "Add Variant" to get started.
          </div>
        ) : (
          variants.map((variant) => (
            <div key={variant.id} className="border rounded-lg p-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <h4 className="font-semibold">{variant.variant_value}</h4>
                    <span className="text-sm text-gray-600">{variant.variant_name}</span>
                    {variant.sku && (
                      <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                        SKU: {variant.sku}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-6 text-sm text-gray-600">
                    <div>
                      <span className="font-medium text-green-600">₹{variant.price}</span>
                      {variant.mrp > variant.price && (
                        <span className="ml-2 line-through text-gray-400">₹{variant.mrp}</span>
                      )}
                    </div>
                    <div>Stock: {variant.stock_quantity}</div>
                    {variant.weight && <div>Weight: {variant.weight}kg</div>}
                    {variant.dimensions && <div>Size: {variant.dimensions}</div>}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(variant)}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(variant.id)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProductVariantManager;