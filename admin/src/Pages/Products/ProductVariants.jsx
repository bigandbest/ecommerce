import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';

const ProductVariants = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newVariant, setNewVariant] = useState({
    variant_name: '',
    variant_price: '',
    variant_old_price: '',
    variant_weight: '',
    variant_unit: 'kg',
    variant_stock: '',
    is_default: false
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, image')
        .eq('active', true)
        .order('name');
      
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVariants = async (productId) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', productId)
        .order('variant_price');
      
      if (error) throw error;
      setVariants(data || []);
    } catch (error) {
      console.error('Error fetching variants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    fetchVariants(product.id);
    setShowAddForm(false);
  };

  const handleAddVariant = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return;

    try {
      const { data, error } = await supabase
        .from('product_variants')
        .insert({
          product_id: selectedProduct.id,
          ...newVariant,
          variant_price: parseFloat(newVariant.variant_price),
          variant_old_price: newVariant.variant_old_price ? parseFloat(newVariant.variant_old_price) : null,
          variant_stock: parseInt(newVariant.variant_stock)
        })
        .select();

      if (error) throw error;
      
      setVariants([...variants, data[0]]);
      setNewVariant({
        variant_name: '',
        variant_price: '',
        variant_old_price: '',
        variant_weight: '',
        variant_unit: 'kg',
        variant_stock: '',
        is_default: false
      });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding variant:', error);
      alert('Error adding variant');
    }
  };

  const handleDeleteVariant = async (variantId) => {
    if (!confirm('Are you sure you want to delete this variant?')) return;

    try {
      const { error } = await supabase
        .from('product_variants')
        .delete()
        .eq('id', variantId);

      if (error) throw error;
      setVariants(variants.filter(v => v.id !== variantId));
    } catch (error) {
      console.error('Error deleting variant:', error);
      alert('Error deleting variant');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Product Variants Management</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Products List */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-4">Select Product</h2>
          <div className="max-h-96 overflow-y-auto">
            {products.map(product => (
              <div
                key={product.id}
                onClick={() => handleProductSelect(product)}
                className={`flex items-center gap-3 p-3 rounded cursor-pointer transition-colors ${
                  selectedProduct?.id === product.id ? 'bg-blue-100' : 'hover:bg-gray-100'
                }`}
              >
                <img
                  src={product.image || '/prod1.png'}
                  alt={product.name}
                  className="w-12 h-12 object-contain rounded"
                />
                <span className="text-sm">{product.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Variants Management */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">
              {selectedProduct ? `Variants for: ${selectedProduct.name}` : 'Select a product'}
            </h2>
            {selectedProduct && (
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Add Variant
              </button>
            )}
          </div>

          {showAddForm && (
            <form onSubmit={handleAddVariant} className="mb-4 p-4 border rounded">
              <div className="grid grid-cols-2 gap-3 mb-3">
                <input
                  type="text"
                  placeholder="Variant Name"
                  value={newVariant.variant_name}
                  onChange={(e) => setNewVariant({...newVariant, variant_name: e.target.value})}
                  className="border rounded px-3 py-2"
                  required
                />
                <input
                  type="text"
                  placeholder="Weight (e.g., 10 kg)"
                  value={newVariant.variant_weight}
                  onChange={(e) => setNewVariant({...newVariant, variant_weight: e.target.value})}
                  className="border rounded px-3 py-2"
                  required
                />
              </div>
              <div className="grid grid-cols-3 gap-3 mb-3">
                <input
                  type="number"
                  placeholder="Price"
                  value={newVariant.variant_price}
                  onChange={(e) => setNewVariant({...newVariant, variant_price: e.target.value})}
                  className="border rounded px-3 py-2"
                  required
                />
                <input
                  type="number"
                  placeholder="Old Price"
                  value={newVariant.variant_old_price}
                  onChange={(e) => setNewVariant({...newVariant, variant_old_price: e.target.value})}
                  className="border rounded px-3 py-2"
                />
                <input
                  type="number"
                  placeholder="Stock"
                  value={newVariant.variant_stock}
                  onChange={(e) => setNewVariant({...newVariant, variant_stock: e.target.value})}
                  className="border rounded px-3 py-2"
                  required
                />
              </div>
              <div className="flex gap-3 items-center">
                <select
                  value={newVariant.variant_unit}
                  onChange={(e) => setNewVariant({...newVariant, variant_unit: e.target.value})}
                  className="border rounded px-3 py-2"
                >
                  <option value="kg">kg</option>
                  <option value="gm">gm</option>
                  <option value="ltr">ltr</option>
                  <option value="ml">ml</option>
                  <option value="piece">piece</option>
                </select>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newVariant.is_default}
                    onChange={(e) => setNewVariant({...newVariant, is_default: e.target.checked})}
                  />
                  Default Variant
                </label>
                <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                  Add
                </button>
              </div>
            </form>
          )}

          {selectedProduct && (
            <div className="space-y-2">
              {variants.map(variant => (
                <div key={variant.id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <div className="font-medium">{variant.variant_weight}</div>
                    <div className="text-sm text-gray-600">
                      ₹{variant.variant_price} 
                      {variant.variant_old_price && (
                        <span className="line-through ml-2">₹{variant.variant_old_price}</span>
                      )}
                      <span className="ml-2">Stock: {variant.variant_stock}</span>
                      {variant.is_default && <span className="ml-2 text-blue-600">(Default)</span>}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteVariant(variant.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              ))}
              {variants.length === 0 && (
                <p className="text-gray-500 text-center py-4">No variants available</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductVariants;