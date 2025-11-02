import { supabase } from "../config/supabaseClient.js";

async function addTestVideo() {
  try {
    const { data, error } = await supabase.from("video_cards").insert([
      {
        title: "Test Video",
        description: "A test video for the video card section",
        video_url:
          "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        thumbnail_url: "https://i.ytimg.com/vi/YE7VzlLtp-4/maxresdefault.jpg",
        active: true,
        position: 1,
      },
    ]);

    if (error) {
      console.error("Error inserting test video:", error);
    } else {
      console.log("Test video added successfully:", data);
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

addTestVideo();
