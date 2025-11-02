import React from "react";
import { useRouter } from "next/navigation";

const CategoryBreadcrumb = ({
  categoryName,
  subcategoryName,
  productCount = 0,
}) => {
  const router = useRouter();

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center text-sm text-gray-600 mb-4">
          <button
            onClick={() => router.push("/pages/categories/main")}
            className="hover:text-[#fd5b00] cursor-pointer font-medium transition-colors"
          >
            Categories
          </button>
          <svg
            className="mx-2 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
          <button
            onClick={() => router.back()}
            className="hover:text-[#fd5b00] cursor-pointer font-medium transition-colors"
          >
            {categoryName}
          </button>
          <svg
            className="mx-2 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
          <span className="text-gray-900 font-semibold">{subcategoryName}</span>
        </nav>

        {/* Page Info */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              {subcategoryName}
            </h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              {productCount > 0
                ? `${productCount} products available`
                : "Discover amazing products"}
            </p>
          </div>

          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors w-full sm:w-auto"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryBreadcrumb;
