'use client';
import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaEye, FaEyeSlash, FaUpload, FaSpinner } from 'react-icons/fa';
import { getAllAdminBanners, getBannersByType, addBanner, updateBanner, deleteBanner } from '@/api/bannerApi';
import { toast } from 'react-toastify';

const AdminHeroBannerManager = () => {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingBanner, setEditingBanner] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        banner_type: 'hero',
        image: null
    });

    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = async () => {
        setLoading(true);
        try {
            // First try to get hero banners specifically
            let result = await getBannersByType('hero');

            // If no hero banners, get all admin banners
            if (!result.success || !result.banners || result.banners.length === 0) {
                result = await getAllAdminBanners();
            }

            if (result.success) {
                setBanners(result.banners || []);
            } else {
                toast.error('Failed to fetch banners');
            }
        } catch (error) {
            console.error('Error fetching banners:', error);
            toast.error('Failed to fetch banners');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('name', formData.name);
            formDataToSend.append('banner_type', formData.banner_type);

            if (formData.image) {
                formDataToSend.append('image', formData.image);
            }

            let result;
            if (editingBanner) {
                result = await updateBanner(editingBanner.id, formDataToSend);
            } else {
                result = await addBanner(formDataToSend);
            }

            if (result.success) {
                toast.success(editingBanner ? 'Banner updated successfully' : 'Banner added successfully');
                setShowModal(false);
                setEditingBanner(null);
                resetForm();
                fetchBanners();
            } else {
                toast.error(result.error || 'Failed to save banner');
            }
        } catch (error) {
            console.error('Error saving banner:', error);
            toast.error('Failed to save banner');
        }
    };

    const handleEdit = (banner) => {
        setEditingBanner(banner);
        setFormData({
            name: banner.name || '',
            banner_type: banner.banner_type || 'hero',
            image: null
        });
        setShowModal(true);
    };

    const handleDelete = async (bannerId) => {
        if (window.confirm('Are you sure you want to delete this banner?')) {
            try {
                const result = await deleteBanner(bannerId);
                if (result.success) {
                    toast.success('Banner deleted successfully');
                    fetchBanners();
                } else {
                    toast.error(result.error || 'Failed to delete banner');
                }
            } catch (error) {
                console.error('Error deleting banner:', error);
                toast.error('Failed to delete banner');
            }
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            banner_type: 'hero',
            image: null
        });
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingBanner(null);
        resetForm();
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Hero Banner Management</h2>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                    <FaPlus />
                    Add Hero Banner
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <FaSpinner className="animate-spin text-2xl text-blue-600" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {banners.map((banner) => (
                        <div key={banner.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                            <div className="relative h-48">
                                {banner.image_url ? (
                                    <img
                                        src={banner.image_url}
                                        alt={banner.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                        <span className="text-gray-500">No Image</span>
                                    </div>
                                )}
                                <div className="absolute top-2 right-2">
                                    <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                                        {banner.banner_type || 'hero'}
                                    </span>
                                </div>
                            </div>

                            <div className="p-4">
                                <h3 className="font-semibold text-lg text-gray-800 mb-2">{banner.name}</h3>

                                <div className="flex justify-between items-center">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(banner)}
                                            className="text-blue-600 hover:text-blue-800 p-2"
                                            title="Edit Banner"
                                        >
                                            <FaEdit />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(banner.id)}
                                            className="text-red-600 hover:text-red-800 p-2"
                                            title="Delete Banner"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>

                                    <div className="text-xs text-gray-500">
                                        ID: {banner.id.slice(0, 8)}...
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold">
                                    {editingBanner ? 'Edit Hero Banner' : 'Add New Hero Banner'}
                                </h3>
                                <button
                                    onClick={handleCloseModal}
                                    className="text-gray-500 hover:text-gray-700 text-2xl"
                                >
                                    ×
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Banner Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                        placeholder="Enter banner name"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Banner Type
                                    </label>
                                    <select
                                        value={formData.banner_type}
                                        onChange={(e) => setFormData({ ...formData, banner_type: e.target.value })}
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="hero">Hero Banner</option>
                                        <option value="homepage">Homepage Banner</option>
                                        <option value="promotional">Promotional Banner</option>
                                        <option value="category">Category Banner</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Banner Image *
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required={!editingBanner}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Supported formats: JPG, PNG, GIF. Max size: 5MB
                                    </p>
                                </div>

                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <h4 className="font-semibold text-blue-800 mb-2">Hero Banner Guidelines:</h4>
                                    <ul className="text-sm text-blue-700 space-y-1">
                                        <li>• Recommended size: 1920x600px for best results</li>
                                        <li>• Use high-quality images for better user experience</li>
                                        <li>• Keep text minimal and readable</li>
                                        <li>• Ensure images are optimized for web</li>
                                    </ul>
                                </div>

                                <div className="flex justify-end space-x-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                    >
                                        {editingBanner ? 'Update Banner' : 'Add Banner'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminHeroBannerManager;
