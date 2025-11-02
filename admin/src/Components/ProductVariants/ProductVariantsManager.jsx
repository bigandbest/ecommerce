import React, { useState, useEffect } from 'react';
import { Card, Title, Button, Table, Modal, TextInput, NumberInput, Switch, Group, ActionIcon, LoadingOverlay, Select } from '@mantine/core';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { supabaseAdmin } from '../../utils/supabase';

const UNIT_OPTIONS = [
  { value: 'kg', label: 'Kilogram (kg)' },
  { value: 'g', label: 'Gram (g)' },
  { value: 'l', label: 'Litre (l)' },
  { value: 'ml', label: 'Millilitre (ml)' },
  { value: 'packet', label: 'Packet' },
  { value: 'pcs', label: 'Pieces (pcs)' },
  { value: 'pack', label: 'Pack' },
  { value: 'box', label: 'Box' },
  { value: 'bottle', label: 'Bottle' },
  { value: 'can', label: 'Can' },
  { value: 'pouch', label: 'Pouch' }
];

const ProductVariantsManager = ({ productId, productName }) => {
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState(null);
  const [form, setForm] = useState({
    variant_name: '',
    variant_price: 0,
    variant_old_price: 0,
    variant_discount: 0,
    variant_stock: 0,
    variant_weight: '',
    variant_unit: 'kg',
    shipping_amount: 0,
    is_default: false,
  });
  const [weightValue, setWeightValue] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('kg');

  useEffect(() => {
    if (productId) {
      fetchVariants();
    }
  }, [productId]);

  const fetchVariants = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabaseAdmin
        .from('product_variants')
        .select('*')
        .eq('product_id', productId)
        .order('variant_price', { ascending: true });

      if (error) throw error;
      setVariants(data || []);
    } catch (error) {
      console.error('Error fetching variants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingVariant) {
        const { error } = await supabaseAdmin
          .from('product_variants')
          .update(form)
          .eq('id', editingVariant.id);
        if (error) throw error;
      } else {
        const { error } = await supabaseAdmin
          .from('product_variants')
          .insert({ ...form, product_id: productId });
        if (error) throw error;
      }

      await fetchVariants();
      setModalOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving variant:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (variantId) => {
    if (!confirm('Are you sure you want to delete this variant?')) return;

    setLoading(true);
    try {
      const { error } = await supabaseAdmin
        .from('product_variants')
        .delete()
        .eq('id', variantId);

      if (error) throw error;
      await fetchVariants();
    } catch (error) {
      console.error('Error deleting variant:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (variant) => {
    setEditingVariant(variant);
    const weightParts = variant.variant_weight ? variant.variant_weight.split(' ') : ['', 'kg'];
    setWeightValue(weightParts[0] || '');
    setSelectedUnit(weightParts[1] || 'kg');
    setForm({
      variant_name: variant.variant_name,
      variant_price: variant.variant_price,
      variant_old_price: variant.variant_old_price || 0,
      variant_discount: variant.variant_discount || 0,
      variant_stock: variant.variant_stock || 0,
      variant_weight: variant.variant_weight || '',
      variant_unit: variant.variant_unit || 'kg',
      shipping_amount: variant.shipping_amount || 0,
      is_default: variant.is_default || false,
    });
    setModalOpen(true);
  };

  const resetForm = () => {
    setForm({
      variant_name: '',
      variant_price: 0,
      variant_old_price: 0,
      variant_discount: 0,
      variant_stock: 0,
      variant_weight: '',
      variant_unit: 'kg',
      shipping_amount: 0,
      is_default: false,
    });
    setWeightValue('');
    setSelectedUnit('kg');
    setEditingVariant(null);
  };

  const updateVariantWeight = (value, unit) => {
    const weightString = value && unit ? `${value} ${unit}` : '';
    setForm(prev => ({ ...prev, variant_weight: weightString, variant_unit: unit }));
  };

  const handleWeightChange = (value) => {
    setWeightValue(value);
    updateVariantWeight(value, selectedUnit);
  };

  const handleUnitChange = (unit) => {
    setSelectedUnit(unit);
    updateVariantWeight(weightValue, unit);
  };

  const openAddModal = () => {
    resetForm();
    setModalOpen(true);
  };

  return (
    <Card shadow="sm" p="lg" radius="md">
      <LoadingOverlay visible={loading} />
      
      <Group position="apart" mb="md">
        <Title order={3}>Product Variants - {productName}</Title>
        <Button leftIcon={<FaPlus size={16} />} onClick={openAddModal}>
          Add Variant
        </Button>
      </Group>

      <Table striped highlightOnHover>
        <thead>
          <tr>
            <th>Name</th>
            <th>Weight</th>
            <th>Price</th>
            <th>Old Price</th>
            <th>Stock</th>
            <th>Shipping</th>
            <th>Default</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {variants.map((variant) => (
            <tr key={variant.id}>
              <td>{variant.variant_name}</td>
              <td>{variant.variant_weight} {variant.variant_unit}</td>
              <td>₹{variant.variant_price}</td>
              <td>{variant.variant_old_price ? `₹${variant.variant_old_price}` : '-'}</td>
              <td>{variant.variant_stock}</td>
              <td>₹{variant.shipping_amount || 0}</td>
              <td>{variant.is_default ? 'Yes' : 'No'}</td>
              <td>
                <Group spacing="xs">
                  <ActionIcon color="blue" onClick={() => handleEdit(variant)}>
                    <FaEdit size={16} />
                  </ActionIcon>
                  <ActionIcon color="red" onClick={() => handleDelete(variant.id)}>
                    <FaTrash size={16} />
                  </ActionIcon>
                </Group>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {variants.length === 0 && !loading && (
        <div className="text-center py-8 text-gray-500">
          No variants found. Add some variants to get started.
        </div>
      )}

      <Modal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingVariant ? 'Edit Variant' : 'Add New Variant'}
        size="md"
      >
        <form onSubmit={handleSubmit}>
          <TextInput
            label="Variant Name"
            placeholder="e.g., 10 kg Pack"
            required
            value={form.variant_name}
            onChange={(e) => setForm({ ...form, variant_name: e.target.value })}
            mb="md"
          />
          
          <TextInput
            label="Weight/Size"
            placeholder="e.g., 10 kg"
            value={form.variant_weight}
            onChange={(e) => setForm({ ...form, variant_weight: e.target.value })}
            mb="md"
          />

          <NumberInput
            label="Price"
            placeholder="Enter price"
            required
            value={form.variant_price}
            onChange={(value) => setForm({ ...form, variant_price: value })}
            min={0}
            mb="md"
          />

          <NumberInput
            label="Old Price (Optional)"
            placeholder="Enter old price"
            value={form.variant_old_price}
            onChange={(value) => setForm({ ...form, variant_old_price: value })}
            min={0}
            mb="md"
          />

          <NumberInput
            label="Stock Quantity"
            placeholder="Enter stock"
            value={form.variant_stock}
            onChange={(value) => setForm({ ...form, variant_stock: value })}
            min={0}
            mb="md"
          />

          <NumberInput
            label="Shipping Amount (₹)"
            placeholder="Enter shipping charges"
            value={form.shipping_amount}
            onChange={(value) => setForm({ ...form, shipping_amount: value })}
            min={0}
            mb="md"
          />

          <Switch
            label="Set as Default Variant"
            checked={form.is_default}
            onChange={(e) => setForm({ ...form, is_default: e.currentTarget.checked })}
            mb="md"
          />

          <Group position="right">
            <Button variant="default" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" color="blue">
              {editingVariant ? 'Update' : 'Add'} Variant
            </Button>
          </Group>
        </form>
      </Modal>
    </Card>
  );
};

export default ProductVariantsManager;