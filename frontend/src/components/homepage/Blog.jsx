"use client";
import React from "react";
import Image from "next/image";

const blogPosts = [
  {
    id: 1,
    title: "Top 10 Protein Supplements for Muscle Building",
    excerpt:
      "Discover the best protein supplements that can help you build lean muscle mass effectively and safely.",
    image: "/prod1.png",
    date: "March 15, 2024",
    readTime: "5 min read",
  },
  {
    id: 2,
    title: "Pre-Workout Nutrition: What to Eat Before Exercise",
    excerpt:
      "Learn about the perfect pre-workout meals and supplements to maximize your gym performance.",
    image: "/prod2.png",
    date: "March 12, 2024",
    readTime: "4 min read",
  },
  {
    id: 3,
    title: "Recovery Tips: How to Bounce Back Faster",
    excerpt:
      "Essential recovery strategies and supplements to help your muscles repair and grow stronger.",
    image: "/prod3.png",
    date: "March 10, 2024",
    readTime: "6 min read",
  },
  {
    id: 4,
    title: "Beginner's Guide to Sports Nutrition",
    excerpt:
      "Everything you need to know about sports nutrition as a beginner athlete or fitness enthusiast.",
    image: "/prod4.png",
    date: "March 8, 2024",
    readTime: "7 min read",
  },
];

const Blog = ({ sectionName, sectionDescription }) => {
  const handleViewBlog = (blogId) => {
    console.log(`Viewing blog ${blogId}`);
  };

  return (
    <section className="container-responsive py-12 sm:py-16 md:py-20">
      <div className="mb-8 sm:mb-12 md:mb-16 text-center">
        <h2 className="font-extrabold text-2xl sm:text-3xl md:text-4xl lg:text-6xl text-[#222] mb-4">
          {sectionName || "Latest Blog Posts"}
        </h2>
        <p className="text-[#666] text-lg md:text-xl max-w-2xl mx-auto">
          {sectionDescription ||
            "Stay updated with the latest fitness tips, nutrition advice, and wellness insights"}
        </p>
      </div>

      {/* Mobile: Horizontal Scroll */}
      <div className="lg:hidden overflow-x-auto scrollbar-hide">
        <div className="flex gap-5 pb-4" style={{ width: "max-content" }}>
          {blogPosts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer w-72 flex-shrink-0 border border-gray-100"
            >
              <div className="relative h-48 w-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-contain p-4"
                />
              </div>
              <div className="p-4">
                <div className="flex items-center text-xs text-[#666] mb-3">
                  <span className="bg-gray-100 px-2 py-1 rounded-full">
                    {post.date}
                  </span>
                  <span className="mx-2">•</span>
                  <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded-full">
                    {post.readTime}
                  </span>
                </div>
                <h3 className="font-bold text-base text-[#222] mb-3 line-clamp-2 leading-tight">
                  {post.title}
                </h3>
                <p className="text-[#666] text-sm mb-4 line-clamp-3 leading-relaxed">
                  {post.excerpt}
                </p>
                <button
                  onClick={() => handleViewBlog(post.id)}
                  className="bg-[#FF6B00] text-white text-sm font-bold rounded-full px-4 py-2.5 hover:bg-[#e65c00] transition-all duration-300 w-full hover:scale-105"
                >
                  View Blog
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop: Grid Layout */}
      <div className="hidden lg:grid grid-cols-4 gap-6">
        {blogPosts.map((post) => (
          <div
            key={post.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer"
          >
            <div className="relative h-48 w-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <Image
                src={post.image}
                alt={post.title}
                fill
                sizes="25vw"
                className="object-contain p-4"
              />
            </div>
            <div className="p-4">
              <div className="flex items-center text-sm text-[#666] mb-2">
                <span>{post.date}</span>
                <span className="mx-2">•</span>
                <span>{post.readTime}</span>
              </div>
              <h3 className="font-bold text-lg text-[#222] mb-2 line-clamp-2">
                {post.title}
              </h3>
              <p className="text-[#666] text-sm mb-4 line-clamp-3">
                {post.excerpt}
              </p>
              <button
                onClick={() => handleViewBlog(post.id)}
                className="bg-[#FF6B00] text-white text-sm font-bold rounded-full px-4 py-2 hover:bg-[#e65c00] transition-colors duration-300 w-full"
              >
                View Blog
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Blog;
