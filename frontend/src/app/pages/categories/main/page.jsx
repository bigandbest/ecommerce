"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import SubcategoryCard from "@/components/categories/SubcategoryCard";
import { productService } from "@/services/productService";

const backend =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://big-best-backend.vercel.app";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Fetch categories with subcategories from API
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const hierarchyData = await productService.getCategoriesHierarchy();

      // Transform the data to match the expected format
      const transformedCategories = hierarchyData.map((category) => ({
        id: category.id,
        name: category.name,
        image: category.image_url || "/prod1.png",
        subcategories: category.subcategories.map((subcategory) => ({
          id: subcategory.id,
          name: subcategory.name,
          image: subcategory.image_url || "/prod1.png",
          size: getSizeForSubcategory(subcategory), // You can customize this logic
        })),
      }));

      setCategories(transformedCategories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      // Fallback to empty array
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to determine size based on subcategory (you can customize this)
  const getSizeForSubcategory = (subcategory) => {
    // Simple logic: alternate sizes or based on some criteria
    const sizes = ["large", "medium", "small"];
    return sizes[Math.floor(Math.random() * sizes.length)];
  };

  const handleSubcategoryClick = (category, subcategory) => {
    router.push(
      `/pages/categories/subcategory/${category.id}/${
        subcategory.id
      }?categoryName=${encodeURIComponent(
        category.name
      )}&subcategoryName=${encodeURIComponent(subcategory.name)}`
    );
  };

  const createSubcategoryClickHandler = (category) => (subcategory) => {
    handleSubcategoryClick(category, subcategory);
  };

  const getBentoGridClass = (size) => {
    switch (size) {
      case "large":
        return "col-span-2 row-span-2";
      case "medium":
        return "col-span-1 row-span-2";
      case "small":
        return "col-span-1 row-span-1";
      default:
        return "col-span-1 row-span-1";
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
        </div>

        {/* Categories List */}
        {categories.map((category) => (
          <div key={category.id} className="mb-12">
            {/* Category Header */}
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {category.name}
            </h2>

            {/* Horizontal Scrolling Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
              {category.subcategories.map((subcategory) => (
                <div
                  key={subcategory.id}
                  onClick={() => handleSubcategoryClick(category, subcategory)}
                  className="group cursor-pointer"
                >
                  <div className="rounded-2xl p-4 hover:shadow-lg transition-all duration-300 hover:scale-105">
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className="w-16 h-16 relative">
                        <Image
                          src={subcategory.image}
                          alt={subcategory.name}
                          width={64}
                          height={64}
                          className="object-contain w-full h-full"
                          onError={(e) => {
                            e.target.src = "/prod1.png";
                          }}
                        />
                      </div>
                      <h3 className="text-sm font-medium text-gray-800 leading-tight">
                        {subcategory.name}
                      </h3>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Modern Loading State - Consistent design */}
        {loading && (
          <div className="flex flex-col justify-center items-center py-20">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-[#fd5b00]/30 rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-[#fd5b00] rounded-full animate-spin"></div>
            </div>
            <p className="text-gray-600 mt-6 text-lg font-medium">
              Loading categories...
            </p>
            <div className="flex space-x-1 mt-4">
              <div className="w-2 h-2 bg-[#fd5b00] rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-[#f7941d] rounded-full animate-bounce delay-100"></div>
              <div className="w-2 h-2 bg-[#fd5b00] rounded-full animate-bounce delay-200"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
