import { supabase } from "./config/supabaseClient.js";

async function createBuckets() {
  const buckets = [
    {
      name: "profile-images",
      public: true,
      allowedMimeTypes: ["image/png", "image/jpeg", "image/jpg", "image/webp"],
      fileSizeLimit: 5242880, // 5MB
    },
    {
      name: "daily-deals",
      public: true,
      allowedMimeTypes: ["image/png", "image/jpeg", "image/jpg", "image/webp"],
      fileSizeLimit: 5242880, // 5MB
    },
    {
      name: "video_thumbnails",
      public: true,
      allowedMimeTypes: ["image/png", "image/jpeg", "image/jpg", "image/webp"],
      fileSizeLimit: 5242880, // 5MB
    },
  ];

  for (const bucket of buckets) {
    try {
      const { data, error } = await supabase.storage.createBucket(bucket.name, {
        public: bucket.public,
        allowedMimeTypes: bucket.allowedMimeTypes,
        fileSizeLimit: bucket.fileSizeLimit,
      });

      if (error && error.message !== "Bucket already exists") {
        console.error(`Error creating bucket '${bucket.name}':`, error);
      } else {
        console.log(
          `✅ Bucket '${bucket.name}' created successfully or already exists`
        );
      }
    } catch (err) {
      console.error(`Bucket '${bucket.name}' creation failed:`, err);
    }
  }
}

createBuckets();
