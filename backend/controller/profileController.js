import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import { supabase } from "../config/supabaseClient.js";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Please upload only image files"), false);
    }
  },
});

export const uploadProfileImage = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "User not authenticated",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No image file provided",
      });
    }

    // Try to create bucket first, then upload
    const fileName = `profile_${userId}_${Date.now()}.${req.file.originalname.split('.').pop()}`;
    
    // Try to create bucket if it doesn't exist
    try {
      await supabase.storage.createBucket('profile-images', { public: true });
    } catch (bucketError) {
      // Bucket might already exist, continue
    }
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('profile-images')
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: true
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return res.status(500).json({
        success: false,
        error: "Failed to upload image: " + uploadError.message,
      });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('profile-images')
      .getPublicUrl(fileName);

    const imageUrl = urlData.publicUrl;

    // Update user profile with new image URL
    const { data, error } = await supabase
      .from("users")
      .update({
        photo_url: imageUrl,
        avatar: imageUrl,
      })
      .eq("id", userId)
      .select("*")
      .single();

    if (error) {
      console.error("Database update error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to update user profile",
      });
    }

    res.json({
      success: true,
      message: "Profile image uploaded successfully",
      imageUrl: imageUrl,
      user: data,
    });
  } catch (error) {
    console.error("Profile image upload error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to upload profile image",
    });
  }
};

export const deleteProfileImage = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "User not authenticated",
      });
    }

    // Get current user data to find the image URL
    const { data: userData, error: fetchError } = await supabase
      .from("users")
      .select("photo_url")
      .eq("id", userId)
      .single();

    if (fetchError) {
      return res.status(500).json({
        success: false,
        error: "Failed to fetch user data",
      });
    }

    // Delete from Supabase storage if image exists
    if (userData?.photo_url) {
      try {
        const fileName = userData.photo_url.split('/').pop();
        await supabase.storage
          .from('profile-images')
          .remove([fileName]);
      } catch (storageError) {
        console.error("Storage deletion error:", storageError);
      }
    }

    // Update user profile to remove image URL
    const { data, error } = await supabase
      .from("users")
      .update({
        photo_url: null,
        avatar: null,
      })
      .eq("id", userId)
      .select("*")
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        error: "Failed to update user profile",
      });
    }

    res.json({
      success: true,
      message: "Profile image deleted successfully",
      user: data,
    });
  } catch (error) {
    console.error("Profile image deletion error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to delete profile image",
    });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "User not authenticated",
      });
    }

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        error: "Failed to fetch user profile",
      });
    }

    res.json({
      success: true,
      user: data,
    });
  } catch (error) {
    console.error("Get user profile error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch user profile",
    });
  }
};

// Export multer middleware with error handling
export const uploadMiddleware = (req, res, next) => {
  upload.single("profileImage")(req, res, (err) => {
    if (err) {
      console.error("Multer error:", err);
      return res.status(400).json({
        success: false,
        error: err.message || "File upload error",
      });
    }
    next();
  });
};
