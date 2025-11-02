/* eslint-disable react/prop-types */
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FaEdit, FaTrash, FaPlus, FaPlay } from "react-icons/fa";

// Base URL for video cards backend APIs
const API_URL = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}/video-cards`
  : "http://localhost:8000/api/video-cards";

// Component to handle adding/editing a Video Card
const VideoCardForm = ({ initialData, onSave, onCancel }) => {
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(
    initialData?.description || ""
  );
  const [videoUrl, setVideoUrl] = useState(initialData?.video_url || "");
  const [thumbnailUrl, setThumbnailUrl] = useState(
    initialData?.thumbnail_url || ""
  );
  const [active, setActive] = useState(
    initialData?.active !== undefined ? initialData.active : true
  );
  const [position, setPosition] = useState(initialData?.position || 0);
  // const [thumbnail, setThumbnail] = useState(null); // Temporarily disabled
  const [isSubmitting, setIsSubmitting] = useState(false);
  const titleInputRef = useRef(null);

  useEffect(() => {
    titleInputRef.current?.focus();

    const handleKey = (e) => {
      if (e.key === "Escape") onCancel();
    };

    document.addEventListener("keydown", handleKey);
    document.body.classList.add("overflow-hidden");

    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.classList.remove("overflow-hidden");
    };
  }, [onCancel]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("video_url", videoUrl);
    formData.append("thumbnail_url", thumbnailUrl);
    formData.append("active", active.toString());
    formData.append("position", position.toString());

    // Temporarily disable file upload
    // if (thumbnail) {
    //   formData.append("thumbnail", thumbnail);
    // }

    try {
      if (initialData) {
        await onSave(initialData.id, formData);
      } else {
        await onSave(formData);
      }
    } catch (error) {
      console.error("Error saving video card:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">
            {initialData ? "Edit Video Card" : "Add Video Card"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                ref={titleInputRef}
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Video URL *
              </label>
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Thumbnail URL (optional)
              </label>
              <input
                type="url"
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                placeholder="https://example.com/thumbnail.jpg"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Thumbnail Image (optional) - Temporarily disabled
              </label>
              {/* <input
                type="file"
                accept="image/*"
                onChange={(e) => setThumbnail(e.target.files[0])}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              /> */}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Position
              </label>
              <input
                type="number"
                value={position}
                onChange={(e) => setPosition(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="active"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="mr-2"
              />
              <label
                htmlFor="active"
                className="text-sm font-medium text-gray-700"
              >
                Active
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? "Saving..." : initialData ? "Update" : "Add"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Main Video Cards Management Component
const VideoCards = () => {
  const [videoCards, setVideoCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCard, setEditingCard] = useState(null);

  useEffect(() => {
    fetchVideoCards();
  }, []);

  const fetchVideoCards = async () => {
    try {
      const response = await axios.get(`${API_URL}/all`);
      if (response.data.success) {
        setVideoCards(response.data.videoCards);
      }
    } catch (error) {
      console.error("Error fetching video cards:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (idOrFormData, formData) => {
    try {
      let response;
      let actualId = idOrFormData;
      let actualFormData = formData;

      // Handle the case where only formData is passed (for adding)
      if (idOrFormData instanceof FormData) {
        actualId = null;
        actualFormData = idOrFormData;
      }

      if (actualId) {
        response = await axios.put(
          `${API_URL}/update/${actualId}`,
          actualFormData
        );
      } else {
        response = await axios.post(`${API_URL}/add`, actualFormData);
      }

      if (response.data.success) {
        await fetchVideoCards();
        setShowForm(false);
        setEditingCard(null);
      }
    } catch (error) {
      console.error("Error saving video card:", error);
      alert("Error saving video card. Please try again.");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this video card?")) return;

    try {
      const response = await axios.delete(`${API_URL}/delete/${id}`);
      if (response.data.success) {
        await fetchVideoCards();
      }
    } catch (error) {
      console.error("Error deleting video card:", error);
      alert("Error deleting video card. Please try again.");
    }
  };

  const handleEdit = (card) => {
    setEditingCard(card);
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditingCard(null);
    setShowForm(true);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">Loading video cards...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Video Cards Management</h1>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <FaPlus /> Add Video Card
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {videoCards.map((card) => (
          <div
            key={card.id}
            className="bg-white rounded-lg shadow-md p-4 border border-gray-200"
          >
            <div className="aspect-video bg-gray-100 rounded-md mb-3 overflow-hidden relative group">
              {card.thumbnail_url ? (
                <img
                  src={card.thumbnail_url}
                  alt={card.title}
                  className="w-full h-full object-cover rounded-md transition-transform group-hover:scale-105"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextElementSibling.style.display = "flex";
                  }}
                />
              ) : null}
              <div
                className={`w-full h-full flex items-center justify-center text-gray-400 bg-gray-100 rounded-md ${
                  card.thumbnail_url ? "hidden" : "flex"
                }`}
              >
                <div className="text-center">
                  <FaPlay className="text-3xl mb-2 mx-auto" />
                  <div className="text-xs text-gray-500">No thumbnail</div>
                </div>
              </div>

              {/* Video URL indicator */}
              <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                {card.video_url?.includes("youtube.com") ||
                card.video_url?.includes("youtu.be") ? (
                  <span className="flex items-center gap-1">
                    <span className="text-red-400">▶</span> YouTube
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <FaPlay className="text-xs" /> Video
                  </span>
                )}
              </div>

              {/* Active status indicator */}
              <div
                className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-medium ${
                  card.active
                    ? "bg-green-500 text-white"
                    : "bg-red-500 text-white"
                }`}
              >
                {card.active ? "Active" : "Inactive"}
              </div>
            </div>

            <h3 className="font-semibold text-lg mb-2">{card.title}</h3>
            {card.description && (
              <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                {card.description}
              </p>
            )}

            <div
              className="text-xs text-gray-500 mb-3 truncate"
              title={card.video_url}
            >
              <span className="font-medium">
                {card.video_url?.includes("youtube.com") ||
                card.video_url?.includes("youtu.be")
                  ? "YouTube:"
                  : "Video:"}
              </span>{" "}
              {card.video_url}
            </div>

            <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
              <span>Position: {card.position}</span>
              <span className="text-xs text-gray-400">ID: {card.id}</span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => window.open(card.video_url, "_blank")}
                className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                title="Preview video"
              >
                <FaPlay />
              </button>
              <button
                onClick={() => handleEdit(card)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <FaEdit /> Edit
              </button>
              <button
                onClick={() => handleDelete(card.id)}
                className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                <FaTrash />
              </button>
            </div>
          </div>
        ))}
      </div>

      {videoCards.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No video cards found. Click &quot;Add Video Card&quot; to create your
          first one.
        </div>
      )}

      {showForm && (
        <VideoCardForm
          initialData={editingCard}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false);
            setEditingCard(null);
          }}
        />
      )}
    </div>
  );
};

export default VideoCards;
