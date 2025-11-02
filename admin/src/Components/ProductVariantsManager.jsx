import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { Button, TextInput, NumberInput, Select, Switch, Group, Text, Badge, ActionIcon } from '@mantine/core';
import { FaTrash, FaPlus } from 'react-icons/fa';

const ProductVariantsManager = ({ product }) => {
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
    if (product?.id) {
      fetchVariants();
    }
  }, [product?.id]);

  const fetchVariants = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('product_variants')
        .select('*')
        .eq('product_id', product.id)
        .order('variant_price');
      
      if (error) throw error;
      setVariants(data || []);
    } catch (error) {
      console.error('Error fetching variants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddVariant = async (e) => {
    e.preventDefault();
    if (!product?.id) return;

    try {
      const { data, error } = await supabase
        .from('product_variants')
        .insert({
          product_id: product.id,
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
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <img
          src={product.image || '/prod1.png'}
          alt={product.name}
          className="w-16 h-16 object-contain rounded border"
        />
        <div>
          <Text size="lg" weight={600}>{product.name}</Text>
          <Text size="sm" color="dimmed">Manage product variants</Text>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <Text size="md" weight={500}>Product Variants ({variants.length})</Text>
        <Button
          leftIcon={<FaPlus />}
          onClick={() => setShowAddForm(!showAddForm)}
          size="sm"
        >
          Add Variant
        </Button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddVariant} className="p-4 border rounded bg-gray-50">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <TextInput
              label="Variant Name"
              placeholder="e.g., 10 kg Pack"
              value={newVariant.variant_name}
              onChange={(e) => setNewVariant({...newVariant, variant_name: e.target.value})}
              required
            />
            <TextInput
              label="Weight/Size"
              placeholder="e.g., 10 kg"
              value={newVariant.variant_weight}
              onChange={(e) => setNewVariant({...newVariant, variant_weight: e.target.value})}
              required
            />
          </div>
          <div className="grid grid-cols-3 gap-3 mb-3">
            <NumberInput
              label="Price (₹)"
              placeholder="Enter price"
              value={newVariant.variant_price}
              onChange={(value) => setNewVariant({...newVariant, variant_price: value})}
              required
              min={0}
            />
            <NumberInput
              label="Old Price (₹)"
              placeholder="Enter old price"
              value={newVariant.variant_old_price}
              onChange={(value) => setNewVariant({...newVariant, variant_old_price: value})}
              min={0}
            />
            <NumberInput
              label="Stock"
              placeholder="Enter stock"
              value={newVariant.variant_stock}
              onChange={(value) => setNewVariant({...newVariant, variant_stock: value})}
              required
              min={0}
            />
          </div>
          <div className="flex gap-3 items-end">
            <Select
              label="Unit"
              value={newVariant.variant_unit}
              onChange={(value) => setNewVariant({...newVariant, variant_unit: value})}
              data={[
                { value: 'kg', label: 'kg' },
                { value: 'gm', label: 'gm' },
                { value: 'ltr', label: 'ltr' },
                { value: 'ml', label: 'ml' },
                { value: 'piece', label: 'piece' }
              ]}
              style={{ width: 100 }}
            />
            <Switch
              label="Default Variant"
              checked={newVariant.is_default}
              onChange={(e) => setNewVariant({...newVariant, is_default: e.currentTarget.checked})}
            />
            <Group>
              <Button type="submit" color="green" size="sm">Add</Button>
              <Button variant="light" onClick={() => setShowAddForm(false)} size="sm">Cancel</Button>
            </Group>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {loading ? (
          <Text>Loading variants...</Text>
        ) : variants.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded">
            <Text color="dimmed">No variants found for this product</Text>
            <Text size="sm" color="dimmed">Click "Add Variant" to create the first variant</Text>
          </div>
        ) : (
          variants.map(variant => (
            <div key={variant.id} className="flex items-center justify-between p-3 border rounded bg-white">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Text weight={500}>{variant.variant_weight}</Text>
                  {variant.is_default && (
                    <Badge color="blue" size="sm">Default</Badge>
                  )}
                  {variant.variant_old_price && variant.variant_old_price > variant.variant_price && (
                    <Badge color="green" size="sm">
                      {Math.round(((variant.variant_old_price - variant.variant_price) / variant.variant_old_price) * 100)}% OFF
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>₹{variant.variant_price}</span>
                  {variant.variant_old_price && (
                    <span className="line-through">₹{variant.variant_old_price}</span>
                  )}
                  <span>Stock: {variant.variant_stock}</span>
                  <span>Unit: {variant.variant_unit}</span>
                </div>
              </div>
              <ActionIcon
                color="red"
                onClick={() => handleDeleteVariant(variant.id)}
                title="Delete variant"
              >
                <FaTrash size={14} />
              </ActionIcon>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProductVariantsManager;