import React, { useState, useEffect } from "react";
import {
  Card,
  Title,
  Table,
  ActionIcon,
  Group,
  Button,
  TextInput,
  Switch,
  Modal,
  Select,
  NumberInput,
} from "@mantine/core";
import { FaEdit, FaTrash, FaPlus, FaEye } from "react-icons/fa";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}/promo-banner`
  : "http://localhost:8000/api/promo-banner";

const GRADIENT_OPTIONS = [
  { value: "from-indigo-600 via-purple-600 to-pink-600", label: "Purple Gradient" },
  { value: "from-emerald-600 via-cyan-600 to-blue-600", label: "Blue Gradient" },
  { value: "from-rose-600 via-pink-600 to-violet-600", label: "Pink Gradient" },
  { value: "from-orange-600 via-red-600 to-pink-600", label: "Orange Gradient" },
];

const ACCENT_OPTIONS = [
  { value: "from-pink-400 to-rose-400", label: "Pink Accent" },
  { value: "from-yellow-400 to-orange-400", label: "Orange Accent" },
  { value: "from-cyan-400 to-blue-400", label: "Blue Accent" },
];

const ICON_OPTIONS = [
  { value: "💪", label: "💪 Fitness" },
  { value: "💊", label: "💊 Health" },
  { value: "🏃", label: "🏃 Running" },
  { value: "🎯", label: "🎯 Target" },
  { value: "⚡", label: "⚡ Energy" },
  { value: "🔥", label: "🔥 Hot Deal" },
];

const PromoBannerManagement = () => {
  const [banners, setBanners] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [currentBanner, setCurrentBanner] = useState(null);
  const [newBanner, setNewBanner] = useState({
    title: "",
    subtitle: "",
    discount: "",
    description: "",
    button_text: "SHOP NOW",
    bg_color: "from-indigo-600 via-purple-600 to-pink-600",
    accent_color: "from-pink-400 to-rose-400",
    icon: "💪",
    category: "",
    link: "",
    display_order: 0,
    active: true,
  });

  const fetchBanners = async () => {
    try {
      const response = await axios.get(`${API_URL}/all`);
      setBanners(response.data.banners);
    } catch (error) {
      console.error("Error fetching banners:", error);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const openAddModal = () => {
    setCurrentBanner(null);
    setNewBanner({
      title: "",
      subtitle: "",
      discount: "",
      description: "",
      button_text: "SHOP NOW",
      bg_color: "from-indigo-600 via-purple-600 to-pink-600",
      accent_color: "from-pink-400 to-rose-400",
      icon: "💪",
      category: "",
      link: "",
      display_order: 0,
      active: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (banner) => {
    setCurrentBanner(banner);
    setNewBanner({ ...banner });
    setModalOpen(true);
  };

  const openPreviewModal = (banner) => {
    setCurrentBanner(banner);
    setPreviewModalOpen(true);
  };

  const handleSave = async () => {
    try {
      if (currentBanner) {
        await axios.put(`${API_URL}/update/${currentBanner.id}`, newBanner);
      } else {
        await axios.post(`${API_URL}/add`, newBanner);
      }
      setModalOpen(false);
      fetchBanners();
    } catch (error) {
      console.error("Error saving banner:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this banner?")) {
      try {
        await axios.delete(`${API_URL}/delete/${id}`);
        fetchBanners();
      } catch (error) {
        console.error("Error deleting banner:", error);
      }
    }
  };

  const toggleActive = async (id, currentStatus) => {
    try {
      await axios.put(`${API_URL}/toggle/${id}`, { active: !currentStatus });
      fetchBanners();
    } catch (error) {
      console.error("Error toggling status:", error);
    }
  };

  return (
    <div className="p-6 mantine-bg min-h-screen">
      <Card shadow="sm" p="lg" radius="md">
        <Group position="apart" className="mb-4">
          <Title order={2}>Promo Banner Management</Title>
          <Button icon={<FaPlus />} color="blue" onClick={openAddModal}>
            Add Promo Banner
          </Button>
        </Group>

        <div className="overflow-x-auto">
          <Table striped highlightOnHover>
            <thead>
              <tr>
                <th>Preview</th>
                <th>Title</th>
                <th>Discount</th>
                <th>Category</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {banners.map((banner) => (
                <tr key={banner.id}>
                  <td>
                    <div className={`w-20 h-12 rounded-lg bg-gradient-to-r ${banner.bg_color} flex items-center justify-center text-white text-xs font-bold`}>
                      {banner.icon}
                    </div>
                  </td>
                  <td>
                    <div>
                      <div className="font-semibold">{banner.title}</div>
                      <div className="text-sm text-gray-500">{banner.subtitle}</div>
                    </div>
                  </td>
                  <td className="font-bold text-green-600">{banner.discount}</td>
                  <td>{banner.category}</td>
                  <td>
                    <Switch
                      checked={banner.active}
                      onChange={() => toggleActive(banner.id, banner.active)}
                    />
                  </td>
                  <td>
                    <Group spacing={8}>
                      <ActionIcon color="blue" onClick={() => openEditModal(banner)}>
                        <FaEdit size={16} />
                      </ActionIcon>
                      <ActionIcon color="teal" onClick={() => openPreviewModal(banner)}>
                        <FaEye size={16} />
                      </ActionIcon>
                      <ActionIcon color="red" onClick={() => handleDelete(banner.id)}>
                        <FaTrash size={16} />
                      </ActionIcon>
                    </Group>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        title={currentBanner ? "Edit Promo Banner" : "Add Promo Banner"}
        size="lg"
      >
        <div className="space-y-4">
          <TextInput
            label="Title"
            placeholder="MEGA SALE"
            required
            value={newBanner.title}
            onChange={(e) => setNewBanner({ ...newBanner, title: e.target.value })}
          />
          <TextInput
            label="Subtitle"
            placeholder="FLASH DEAL"
            value={newBanner.subtitle}
            onChange={(e) => setNewBanner({ ...newBanner, subtitle: e.target.value })}
          />
          <TextInput
            label="Discount"
            placeholder="60% OFF"
            value={newBanner.discount}
            onChange={(e) => setNewBanner({ ...newBanner, discount: e.target.value })}
          />
          <TextInput
            label="Description"
            placeholder="FITNESS GEAR"
            value={newBanner.description}
            onChange={(e) => setNewBanner({ ...newBanner, description: e.target.value })}
          />
          <TextInput
            label="Category"
            placeholder="Fitness"
            value={newBanner.category}
            onChange={(e) => setNewBanner({ ...newBanner, category: e.target.value })}
          />
          <TextInput
            label="Link"
            placeholder="/pages/categories/fitness"
            value={newBanner.link}
            onChange={(e) => setNewBanner({ ...newBanner, link: e.target.value })}
          />
          <Select
            label="Background Gradient"
            data={GRADIENT_OPTIONS}
            value={newBanner.bg_color}
            onChange={(value) => setNewBanner({ ...newBanner, bg_color: value })}
          />
          <Select
            label="Icon"
            data={ICON_OPTIONS}
            value={newBanner.icon}
            onChange={(value) => setNewBanner({ ...newBanner, icon: value })}
          />
          <Switch
            label="Active"
            checked={newBanner.active}
            onChange={(e) => setNewBanner({ ...newBanner, active: e.currentTarget.checked })}
          />
        </div>

        <Group position="right" mt="lg">
          <Button variant="default" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button color="blue" onClick={handleSave}>
            {currentBanner ? "Update Banner" : "Add Banner"}
          </Button>
        </Group>
      </Modal>

      {/* Preview Modal */}
      <Modal
        opened={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        title="Banner Preview"
        size="xl"
      >
        {currentBanner && (
          <div className={`w-full h-64 rounded-2xl bg-gradient-to-br ${currentBanner.bg_color} p-6 text-white relative overflow-hidden`}>
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 backdrop-blur-md border border-white/20 rounded-full mb-4">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                <span className="text-xs font-medium">{currentBanner.category} Deal</span>
              </div>
              <h1 className="text-3xl font-black mb-2">{currentBanner.title}</h1>
              <p className="text-lg font-semibold mb-4">{currentBanner.subtitle}</p>
              <div className="mb-4">
                <div className="text-xs font-medium tracking-wider mb-1">SAVE UP TO</div>
                <div className={`text-4xl font-black bg-gradient-to-r ${currentBanner.accent_color} bg-clip-text text-transparent mb-1`}>
                  {currentBanner.discount}
                </div>
                <div className="text-sm font-semibold">on {currentBanner.description}</div>
              </div>
              <button className="px-6 py-3 bg-white text-gray-900 font-bold rounded-xl">
                {currentBanner.button_text} →
              </button>
            </div>
            <div className="absolute right-6 top-1/2 transform -translate-y-1/2 text-6xl">
              {currentBanner.icon}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PromoBannerManagement;