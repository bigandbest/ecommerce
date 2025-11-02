import React from "react";
import Link from "next/link";

const CategoryNavigation = () => {
  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center space-x-8">
            <Link
              href="/pages/categories/main"
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              All Categories
            </Link>

            <div className="flex items-center space-x-6 text-sm">
              <Link
                href="/pages/categories/subcategory/1/1?categoryName=Grocery&subcategoryName=Fresh vegetables"
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                Fresh Vegetables
              </Link>
              <Link
                href="/pages/categories/subcategory/1/2?categoryName=Grocery&subcategoryName=Fresh fruits"
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                Fresh Fruits
              </Link>
              <Link
                href="/pages/categories/subcategory/1/3?categoryName=Grocery&subcategoryName=Atta, rice & dal"
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                Rice & Dal
              </Link>
              <Link
                href="/pages/categories/subcategory/2/9?categoryName=Snacks & drinks&subcategoryName=Chips & namkeens"
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                Snacks
              </Link>
            </div>
          </div>

          <div className="text-sm text-gray-500">New Category System ✨</div>
        </div>
      </div>
    </div>
  );
};

export default CategoryNavigation;
