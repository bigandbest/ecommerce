import { useState, useRef, useEffect } from "react";
import { FaCamera, FaTrash, FaSpinner } from "react-icons/fa";
import PropTypes from "prop-types";
import { useAuth } from "../../contexts/AuthContext";
import supabase from "../../utils/supabase.ts";

const ProfileImageUpload = ({
  currentImageUrl,
  onImageUpdate,
  size = "lg",
}) => {
  const { currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentImageUrl);
  const fileInputRef = useRef(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  // Update preview when currentImageUrl changes
  useEffect(() => {
    console.log(
      "ProfileImageUpload: currentImageUrl changed to:",
      currentImageUrl
    );
    setPreviewUrl(currentImageUrl);
  }, [currentImageUrl]);

  const sizes = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
    xl: "w-40 h-40",
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target.result);
      };
      reader.readAsDataURL(file);

      // Upload file
      uploadImage(file);
    }
  };

  const uploadImage = async (file) => {
    if (!currentUser) {
      alert("You must be logged in to upload an image");
      return;
    }

    setIsLoading(true);
    try {
      // Get the current session token
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        alert("Session expired. Please log in again.");
        return;
      }

      const formData = new FormData();
      formData.append("profileImage", file);

      const response = await fetch(
        `${API_BASE_URL}/api/user/profile/upload-image`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
          body: formData,
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        setPreviewUrl(result.imageUrl);
        if (onImageUpdate) {
          onImageUpdate(result.imageUrl, result.user);
        }
        alert("Profile image updated successfully!");
      } else {
        throw new Error(result.error || "Failed to upload image");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert(`Failed to upload image: ${error.message}`);
      // Reset preview on error
      setPreviewUrl(currentImageUrl);
    } finally {
      setIsLoading(false);
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const deleteImage = async () => {
    if (!currentUser) return;

    if (
      !window.confirm("Are you sure you want to delete your profile picture?")
    ) {
      return;
    }

    setIsLoading(true);
    try {
      // Get the current session token
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        alert("Session expired. Please log in again.");
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/api/user/profile/delete-image`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        setPreviewUrl(null);
        if (onImageUpdate) {
          onImageUpdate(null, result.user);
        }
        alert("Profile image deleted successfully!");
      } else {
        throw new Error(result.error || "Failed to delete image");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert(`Failed to delete image: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Profile Image Display */}
      <div className={`relative ${sizes[size]} group`}>
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Profile"
            className={`${sizes[size]} rounded-full object-cover border-4 border-gray-200 shadow-lg`}
          />
        ) : (
          <div
            className={`${sizes[size]} rounded-full bg-gradient-to-br from-blue-500 to-purple-600 border-4 border-gray-200 shadow-lg flex items-center justify-center text-white font-bold text-xl`}
          >
            {getInitials(currentUser?.name || currentUser?.user_metadata?.name)}
          </div>
        )}

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
            <FaSpinner className="animate-spin text-white text-xl" />
          </div>
        )}

        {/* Hover Overlay */}
        {!isLoading && (
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-full transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <FaCamera className="text-white text-xl" />
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-2">
        <button
          onClick={triggerFileInput}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <FaCamera />
          <span>{previewUrl ? "Change" : "Upload"}</span>
        </button>

        {previewUrl && (
          <button
            onClick={deleteImage}
            disabled={isLoading}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <FaTrash />
            <span>Delete</span>
          </button>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        className="hidden"
      />

      {/* File Requirements */}
      <p className="text-xs text-gray-500 text-center max-w-xs">
        Upload a square image, max 5MB. Supported formats: JPG, PNG, WebP
      </p>
    </div>
  );
};

ProfileImageUpload.propTypes = {
  currentImageUrl: PropTypes.string,
  onImageUpdate: PropTypes.func,
  size: PropTypes.oneOf(["sm", "md", "lg", "xl"]),
};

export default ProfileImageUpload;
