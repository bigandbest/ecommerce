import React, { useState, useRef } from 'react';
import { Camera, X, Upload } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const MobileAvatarUpload = ({ currentAvatar, onAvatarUpdate }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const fileInputRef = useRef(null);
  const { currentUser } = useAuth();

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        alert('Only JPEG, PNG, and WebP files are allowed');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target.result);
        setShowModal(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadAvatar = async (file) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await fetch('/api/business/upload-avatar', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        onAvatarUpdate(data.avatarUrl);
        setShowModal(false);
        setPreview(null);
      } else {
        alert('Upload failed: ' + data.error);
      }
    } catch (error) {
      alert('Upload failed: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpload = () => {
    const file = fileInputRef.current.files[0];
    if (file) {
      uploadAvatar(file);
    }
  };

  const removeAvatar = async () => {
    try {
      const response = await fetch('/api/business/remove-avatar', {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        onAvatarUpdate(null);
      }
    } catch (error) {
      alert('Failed to remove avatar');
    }
  };

  return (
    <>
      <div className="relative">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center border-2 border-gray-200 overflow-hidden">
          {currentAvatar ? (
            <img 
              src={currentAvatar} 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          ) : (
            <img 
              src="/user-logo.svg" 
              alt="Default Profile" 
              className="w-10 h-10 text-gray-400"
            />
          )}
        </div>
        
        <button
          onClick={() => fileInputRef.current?.click()}
          className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-lg"
        >
          <Camera className="w-4 h-4 text-white" />
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Upload Photo</h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {preview && (
              <div className="mb-4">
                <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-gray-200">
                  <img 
                    src={preview} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={isUploading}
                className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50 flex items-center justify-center"
              >
                {isUploading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload
                  </>
                )}
              </button>
            </div>

            {currentAvatar && (
              <button
                onClick={removeAvatar}
                className="w-full mt-3 py-2 text-red-600 text-sm font-medium"
              >
                Remove Current Photo
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default MobileAvatarUpload;