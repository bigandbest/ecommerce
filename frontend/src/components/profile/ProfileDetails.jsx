"use client";
import { useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { uploadProfileImage, deleteProfileImage } from "@/api/userApi";
import { toast } from "react-toastify";
import Image from "next/image";

function ProfileDetails() {
  const { currentUser, userProfile, setUserProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Get user initials for avatar
  const getInitials = () => {
    const name = currentUser?.user_metadata?.name || currentUser?.email || "User";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  // Sample user data - replace with actual user data
  const userData = {
    firstName: currentUser?.user_metadata?.name?.split(" ")[0] || "Satyam",
    lastName: currentUser?.user_metadata?.name?.split(" ")[1] || "singh",
    email: currentUser?.email || "yadavsatyamsingh078@gmail.com",
    phone: currentUser?.user_metadata?.phone || "9310433939",
    address: "abesit boy hostel, Gaziabad, 201016"
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setImageUploading(true);
    try {
      const result = await uploadProfileImage(file);
      if (result.success) {
        toast.success("Profile image updated successfully!");
        setUserProfile(result.user);
      } else {
        toast.error(result.error || "Failed to upload image");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    } finally {
      setImageUploading(false);
    }
  };

  const handleDeleteImage = async () => {
    if (!window.confirm("Are you sure you want to delete your profile image?")) {
      return;
    }

    setImageUploading(true);
    try {
      const result = await deleteProfileImage();
      if (result.success) {
        toast.success("Profile image deleted successfully!");
        setUserProfile(result.user);
      } else {
        toast.error(result.error || "Failed to delete image");
      }
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("Failed to delete image");
    } finally {
      setImageUploading(false);
    }
  };

  return (
    <div className="flex-1 bg-gradient-to-br from-gray-50 to-white p-4 lg:p-6 overflow-y-auto">
      <h2 className="text-xl lg:text-2xl font-bold text-[#1E3473] mb-4 lg:mb-6 tracking-wide">Profile Details</h2>
      
      {/* Profile Avatar and Edit Button */}
      <div className="flex flex-col items-center mb-4 lg:mb-6">
        <div className="relative">
          <div className="w-24 h-24 lg:w-32 lg:h-32 bg-gradient-to-br from-[#1E3473] to-[#4A90E2] rounded-full flex items-center justify-center mb-3 shadow-2xl border-4 border-white overflow-hidden">
            {userProfile?.photo_url || currentUser?.user_metadata?.avatar_url ? (
              <Image
                src={userProfile?.photo_url || currentUser?.user_metadata?.avatar_url}
                alt="Profile"
                width={128}
                height={128}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-2xl lg:text-3xl font-bold text-white">
                {getInitials()}
              </span>
            )}
          </div>
          {imageUploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            </div>
          )}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={imageUploading}
            className="absolute bottom-0 right-0 bg-[#FF6B00] hover:bg-[#e65c00] text-white p-2 rounded-full shadow-lg transition-colors"
          >
            📷
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className="bg-gradient-to-r from-[#FF6B00] to-[#F7941D] hover:from-[#e65c00] hover:to-[#e6850d] text-white px-6 lg:px-8 py-2 lg:py-3 rounded-full font-semibold transition-all duration-300 text-sm lg:text-base shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          {isEditing ? 'Cancel' : 'Edit'}
        </button>
        {(userProfile?.photo_url || currentUser?.user_metadata?.avatar_url) && (
          <button
            onClick={handleDeleteImage}
            disabled={imageUploading}
            className="mt-2 text-red-600 hover:text-red-700 text-sm font-medium transition-colors"
          >
            Remove Photo
          </button>
        )}
      </div>

      {/* Profile Information Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 max-w-4xl mx-auto">
        {/* First Name */}
        <div>
          <label className="block text-sm font-bold text-[#1E3473] mb-2">
            First Name
          </label>
          {isEditing ? (
            <input
              type="text"
              defaultValue={userData.firstName}
              className="w-full p-2 lg:p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/20 text-sm lg:text-base bg-white shadow-sm transition-all duration-300"
            />
          ) : (
            <div className="text-gray-800 font-semibold text-sm lg:text-base bg-gray-50 p-2 lg:p-3 rounded-xl border border-gray-200">{userData.firstName}</div>
          )}
        </div>

        {/* Last Name */}
        <div>
          <label className="block text-sm font-bold text-[#1E3473] mb-2">
            Last Name
          </label>
          {isEditing ? (
            <input
              type="text"
              defaultValue={userData.lastName}
              className="w-full p-2 lg:p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/20 text-sm lg:text-base bg-white shadow-sm transition-all duration-300"
            />
          ) : (
            <div className="text-gray-800 font-semibold text-sm lg:text-base bg-gray-50 p-2 lg:p-3 rounded-xl border border-gray-200">{userData.lastName}</div>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-bold text-[#1E3473] mb-2">
            Email
          </label>
          {isEditing ? (
            <input
              type="email"
              defaultValue={userData.email}
              className="w-full p-2 lg:p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/20 text-sm lg:text-base bg-white shadow-sm transition-all duration-300"
            />
          ) : (
            <div className="text-gray-800 font-semibold text-sm lg:text-base bg-gray-50 p-2 lg:p-3 rounded-xl border border-gray-200 break-all">{userData.email}</div>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-bold text-[#1E3473] mb-2">
            Phone
          </label>
          {isEditing ? (
            <input
              type="tel"
              defaultValue={userData.phone}
              className="w-full p-2 lg:p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/20 text-sm lg:text-base bg-white shadow-sm transition-all duration-300"
            />
          ) : (
            <div className="text-gray-800 font-semibold text-sm lg:text-base bg-gray-50 p-2 lg:p-3 rounded-xl border border-gray-200">{userData.phone}</div>
          )}
        </div>

        {/* Addresses */}
        <div className="col-span-1 lg:col-span-2">
          <label className="block text-sm font-bold text-[#1E3473] mb-2">
            Addresses
          </label>
          {isEditing ? (
            <textarea
              defaultValue={userData.address}
              rows={2}
              className="w-full p-2 lg:p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/20 text-sm lg:text-base bg-white shadow-sm transition-all duration-300"
            />
          ) : (
            <div className="text-gray-800 font-semibold text-sm lg:text-base bg-gray-50 p-2 lg:p-3 rounded-xl border border-gray-200">{userData.address}</div>
          )}
        </div>
      </div>

      {/* Save Button - Only show when editing */}
      {isEditing && (
        <div className="mt-4 lg:mt-6 text-center">
          <button className="bg-gradient-to-r from-[#FF6B00] to-[#F7941D] hover:from-[#e65c00] hover:to-[#e6850d] text-white px-8 lg:px-10 py-3 lg:py-4 rounded-full font-bold transition-all duration-300 text-sm lg:text-base shadow-lg hover:shadow-xl transform hover:scale-105">
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
}

export default ProfileDetails;