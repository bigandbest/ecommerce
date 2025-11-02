import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';

const PromoBannerManager = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    discount: '',
    description: '',
    button_text: 'SHOP NOW',
    bg_color: 'from-indigo-600 via-purple-600 to-pink-600',
    accent_color: 'from-pink-400 to-rose-400',
    icon: '💪',
    category: '',
    link: '',
    display_order: 0
  });

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('promo_banners')
        .select('*')
        .order('display_order');
      
      if (error) throw error;
      setBanners(data || []);
    } catch (error) {
      console.error('Error fetching banners:', error);
      alert('Error fetching banners');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingBanner) {
        // Update existing banner
        const { error } = await supabase
          .from('promo_banners')
          .update(formData)
          .eq('id', editingBanner.id);
        
        if (error) throw error;
        alert('Banner updated successfully!');
      } else {
        // Add new banner
        const { error } = await supabase
          .from('promo_banners')
          .insert(formData);
        
        if (error) throw error;
        alert('Banner added successfully!');
      }
      
      resetForm();
      fetchBanners();
    } catch (error) {
      console.error('Error saving banner:', error);
      alert('Error saving banner');
    }
  };

  const handleEdit = (banner) => {
    setEditingBanner(banner);
    setFormData(banner);
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;
    
    try {
      const { error } = await supabase
        .from('promo_banners')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      alert('Banner deleted successfully!');
      fetchBanners();
    } catch (error) {
      console.error('Error deleting banner:', error);
      alert('Error deleting banner');
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      const { error } = await supabase
        .from('promo_banners')
        .update({ active: !currentStatus })
        .eq('id', id);
      
      if (error) throw error;
      fetchBanners();
    } catch (error) {
      console.error('Error toggling status:', error);
      alert('Error updating status');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      subtitle: '',
      discount: '',
      description: '',
      button_text: 'SHOP NOW',
      bg_color: 'from-indigo-600 via-purple-600 to-pink-600',
      accent_color: 'from-pink-400 to-rose-400',
      icon: '💪',
      category: '',
      link: '',
      display_order: 0
    });
    setEditingBanner(null);
    setShowAddForm(false);
  };

  const bgColorOptions = [
    'from-indigo-600 via-purple-600 to-pink-600',
    'from-emerald-600 via-cyan-600 to-blue-600',
    'from-rose-600 via-pink-600 to-violet-600',
    'from-orange-600 via-red-600 to-pink-600',
    'from-green-600 via-teal-600 to-blue-600'
  ];

  const accentColorOptions = [
    'from-pink-400 to-rose-400',
    'from-yellow-400 to-orange-400',
    'from-cyan-400 to-blue-400',
    'from-green-400 to-emerald-400',
    'from-purple-400 to-pink-400'
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Promo Banner Management</h1>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {showAddForm ? 'Cancel' : 'Add New Banner'}
        </button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">
            {editingBanner ? 'Edit Banner' : 'Add New Banner'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="border rounded px-3 py-2"
                required
              />
              <input
                type="text"
                placeholder="Subtitle"
                value={formData.subtitle}
                onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
                className="border rounded px-3 py-2"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Discount (e.g., 60% OFF)"
                value={formData.discount}
                onChange={(e) => setFormData({...formData, discount: e.target.value})}
                className="border rounded px-3 py-2"
              />
              <input
                type="text"
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="border rounded px-3 py-2"
              />
              <input
                type="text"
                placeholder="Category"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="border rounded px-3 py-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Button Text"
                value={formData.button_text}
                onChange={(e) => setFormData({...formData, button_text: e.target.value})}
                className="border rounded px-3 py-2"
              />
              <input
                type="text"
                placeholder="Icon (emoji)"
                value={formData.icon}
                onChange={(e) => setFormData({...formData, icon: e.target.value})}
                className="border rounded px-3 py-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Background Color</label>
                <select
                  value={formData.bg_color}
                  onChange={(e) => setFormData({...formData, bg_color: e.target.value})}
                  className="border rounded px-3 py-2 w-full"
                >
                  {bgColorOptions.map(color => (
                    <option key={color} value={color}>{color}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Accent Color</label>
                <select
                  value={formData.accent_color}
                  onChange={(e) => setFormData({...formData, accent_color: e.target.value})}
                  className="border rounded px-3 py-2 w-full"
                >
                  {accentColorOptions.map(color => (
                    <option key={color} value={color}>{color}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <input
                type="url"
                placeholder="Link URL (optional)"
                value={formData.link}
                onChange={(e) => setFormData({...formData, link: e.target.value})}
                className="border rounded px-3 py-2"
              />
              <input
                type="number"
                placeholder="Display Order"
                value={formData.display_order}
                onChange={(e) => setFormData({...formData, display_order: parseInt(e.target.value)})}
                className="border rounded px-3 py-2"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
              >
                {editingBanner ? 'Update Banner' : 'Add Banner'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Banners List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Existing Banners ({banners.length})</h2>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">Loading banners...</div>
        ) : banners.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No banners found</div>
        ) : (
          <div className="divide-y">
            {banners.map(banner => (
              <div key={banner.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-2xl">{banner.icon}</div>
                  <div>
                    <h3 className="font-semibold">{banner.title}</h3>
                    <p className="text-sm text-gray-600">
                      {banner.subtitle} • {banner.discount} • {banner.category}
                    </p>
                    <p className="text-xs text-gray-500">Order: {banner.display_order}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleStatus(banner.id, banner.active)}
                    className={`px-3 py-1 rounded text-sm ${
                      banner.active 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {banner.active ? 'Active' : 'Inactive'}
                  </button>
                  
                  <button
                    onClick={() => handleEdit(banner)}
                    className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                  >
                    Edit
                  </button>
                  
                  <button
                    onClick={() => handleDelete(banner.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PromoBannerManager;