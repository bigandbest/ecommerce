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

    // Upload image to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: "image",
            folder: "profile-images",
            public_id: `user_${userId}_${Date.now()}`,
            transformation: [
              { width: 300, height: 300, crop: "fill", gravity: "face" },
              { quality: "auto", fetch_format: "auto" },
            ],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        )
        .end(req.file.buffer);
    });

    // Update user profile with new image URL
    const { data, error } = await supabase
      .from("users")
      .update({
        photo_url: uploadResult.secure_url,
        avatar: uploadResult.secure_url, // Keep both fields for compatibility
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
      imageUrl: uploadResult.secure_url,
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

    // Extract public_id from Cloudinary URL if it exists
    if (userData?.photo_url) {
      try {
        const urlParts = userData.photo_url.split("/");
        const publicIdWithExt = urlParts[urlParts.length - 1];
        const publicId = `profile-images/${publicIdWithExt.split(".")[0]}`;

        // Delete from Cloudinary
        await cloudinary.uploader.destroy(publicId);
      } catch (cloudinaryError) {
        console.error("Cloudinary deletion error:", cloudinaryError);
        // Continue with database update even if Cloudinary deletion fails
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

// Export multer middleware
export const uploadMiddleware = upload.single("profileImage");
