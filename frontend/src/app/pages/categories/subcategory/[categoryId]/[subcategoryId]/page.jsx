"use client";

import React, { useState, useEffect, useContext, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CartContext } from "@/Context/CartContext";
import ProductCard from "@/components/common/ProductCard";
import { productService } from "@/services/productService";

export default function SubcategoryPage({ params }) {
  const { categoryId, subcategoryId } = use(params);
  const searchParams = useSearchParams();
  const categoryName = searchParams.get("categoryName");
  const subcategoryName = searchParams.get("subcategoryName");
  const router = useRouter();
  const { addToCart } = useContext(CartContext);

  const [groups, setGroups] = useState([]);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subcategoryData, setSubcategoryData] = useState(null);

  useEffect(() => {
    fetchSubcategoryData();
  }, [categoryId, subcategoryId]);

  useEffect(() => {
    filterProducts();
  }, [products, selectedGroups]);

  const fetchSubcategoryData = async () => {
    try {
      setLoading(true);

      // Fetch subcategory details with category info
      const subcategoryDetails = await productService.getSubcategoryDetails(
        subcategoryId
      );
      setSubcategoryData(subcategoryDetails);

      // Fetch groups for this subcategory
      const groupsData = await productService.getGroupsBySubcategory(
        subcategoryId
      );

      // Transform groups data to match expected format
      const transformedGroups = groupsData.map((group) => ({
        id: group.id,
        name: group.name,
        icon: group.icon,
        image_url: group.image_url,
        count: 0, // We'll calculate this from products
      }));

      // Fetch products for this subcategory
      const productsData = await productService.getProductsBySubcategory(
        subcategoryId
      );

      // Group products by group_id and count them
      const groupCounts = {};
      productsData.forEach((product) => {
        if (product.group_id) {
          groupCounts[product.group_id] =
            (groupCounts[product.group_id] || 0) + 1;
        }
      });

      // Update groups with actual counts
      const groupsWithCounts = transformedGroups.map((group) => ({
        ...group,
        count: groupCounts[group.id] || 0,
      }));

      setGroups(groupsWithCounts);
      setProducts(productsData);
    } catch (error) {
      console.error("Error fetching subcategory data:", error);
      // Set empty arrays as fallback
      setGroups([]);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = [...products];

    // Filter by selected groups
    if (selectedGroups.length > 0) {
      filtered = filtered.filter((product) =>
        selectedGroups.includes(product.group_id)
      );
    }

    setFilteredProducts(filtered);
  };

  const handleGroupToggle = (groupId) => {
    setSelectedGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId]
    );
  };

  // Helper function to render group icon/image
  const renderGroupIcon = (group, size = "small") => {
    const iconSize =
      size === "large"
        ? "w-16 h-16"
        : size === "tiny"
        ? "w-10 h-10"
        : "w-12 h-12";
    const textSize =
      size === "large" ? "text-2xl" : size === "tiny" ? "text-sm" : "text-lg";
    const innerSize =
      size === "large" ? "w-8 h-8" : size === "tiny" ? "w-5 h-5" : "w-6 h-6";
    const innerInnerSize =
      size === "large" ? "w-5 h-5" : size === "tiny" ? "w-3 h-3" : "w-4 h-4";

    // Priority: image_url > icon > fallback
    if (group.image_url) {
      return (
        <div
          className={`${iconSize} rounded-full overflow-hidden ${
            size === "tiny"
              ? "shadow-sm border border-gray-200"
              : "shadow-md border-2 border-orange-200"
          }`}
        >
          <img
            src={group.image_url}
            alt={group.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback if image fails to load
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "flex";
            }}
          />
          <div
            className={`${iconSize} rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center ${
              size === "tiny" ? "shadow-sm" : "shadow-md"
            }`}
            style={{ display: "none" }}
          >
            <span className={`text-white ${textSize}`}>
              {group.icon || "🍎"}
            </span>
          </div>
        </div>
      );
    }

    if (group.icon) {
      return (
        <div
          className={`${iconSize} rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center ${
            size === "tiny"
              ? "shadow-sm border border-gray-200"
              : "shadow-md border-2 border-orange-200"
          }`}
        >
          <span className={`text-white ${textSize}`}>{group.icon}</span>
        </div>
      );
    }

    // Fallback icon
    return (
      <div
        className={`${iconSize} rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center ${
          size === "tiny"
            ? "shadow-sm border border-gray-200"
            : "shadow-md border-2 border-orange-200"
        }`}
      >
        <div
          className={`${innerSize} bg-white rounded-full flex items-center justify-center`}
        >
          <div
            className={`${innerInnerSize} bg-gradient-to-br from-orange-400 to-red-500 rounded-full`}
          ></div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-2 sm:py-4">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
          <button
            onClick={() => router.push("/pages/categories/main")}
            className="hover:text-orange-500 transition-colors"
          >
            Categories
          </button>
          <span>›</span>
          <span className="text-orange-500 font-medium">
            {subcategoryData?.categories?.name || categoryName}
          </span>
          <span>›</span>
          <span className="text-gray-900 font-medium">
            {subcategoryData?.name || subcategoryName}
          </span>
        </nav>
        {/* Mobile Horizontal Groups */}
        <div className="lg:hidden overflow-x-auto pb-2 mb-4 sticky top-0 bg-white z-10">
          <div className="flex gap-3">
            {/* Dynamic Groups */}
            {groups.map((group) => (
              <div
                key={group.id}
                onClick={() => handleGroupToggle(group.id)}
                className={`flex flex-col items-center cursor-pointer transition-all duration-200 min-w-[70px] ${
                  selectedGroups.includes(group.id)
                    ? "opacity-100"
                    : "opacity-80 hover:opacity-100"
                }`}
              >
                <div className="mb-1">{renderGroupIcon(group, "tiny")}</div>
                <p className="text-[10px] font-medium text-gray-800 text-center leading-tight max-w-[70px] truncate">
                  {group.name}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2 sm:gap-4">
          {/* Left Sidebar - Categories */}
          <div className="lg:w-64 lg:flex-shrink-0 lg:relative hidden lg:block">
            <div className="relative bg-gradient-to-b from-white to-gray-50 border border-gray-200 rounded-lg overflow-hidden shadow-lg min-h-screen lg:min-h-0">
              {/* Dynamic Subcategory Header with Icon */}
              <div className="p-3 sm:p-4 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-yellow-50">
                <div className="flex items-center">
                  <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-orange-100 to-yellow-100 flex items-center justify-center mr-2 sm:mr-3 border-2 border-orange-200 shadow-md">
                    {subcategoryData?.image_url ? (
                      <img
                        src={subcategoryData.image_url}
                        alt={subcategoryData.name}
                        className="w-6 h-6 sm:w-8 sm:h-8 rounded object-cover"
                      />
                    ) : subcategoryData?.icon ? (
                      <span className="text-sm sm:text-lg">
                        {subcategoryData.icon}
                      </span>
                    ) : (
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-red-400 to-orange-500 rounded-lg"></div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-lg font-semibold text-gray-900">
                      {subcategoryData?.name ||
                        subcategoryName ||
                        "Subcategory"}
                    </h3>
                    <p className="text-xs text-gray-600">
                      {subcategoryData?.categories?.name || categoryName}
                    </p>
                  </div>
                </div>
              </div>

              {/* Categories Grid */}
              <div className="p-2 sm:p-3">
                <div className="flex flex-col gap-2 sm:gap-3">
                  {/* Dynamic Groups */}
                  {groups.map((group) => (
                    <div
                      key={group.id}
                      onClick={() => handleGroupToggle(group.id)}
                      className={`flex flex-col items-center p-3 sm:p-4 rounded-xl cursor-pointer transition-all duration-200 border-2 hover:shadow-lg hover:scale-105 ${
                        selectedGroups.includes(group.id)
                          ? "bg-orange-50 border-orange-500 shadow-lg"
                          : "border-transparent hover:bg-gray-50 hover:border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50"
                      }`}
                    >
                      {renderGroupIcon(group, "large")}
                      <p className="text-xs sm:text-sm font-semibold text-gray-900 text-center leading-tight mt-2 sm:mt-3">
                        {group.name}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            <div className="grid gap-2 sm:gap-3 grid-cols-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  showDiscount={true}
                  showBoughtBefore={true}
                />
              ))}
            </div>

            {loading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {[...Array(6)].map((_, index) => (
                  <div
                    key={index}
                    className="bg-white border border-gray-200 rounded-lg overflow-hidden animate-pulse"
                  >
                    <div className="aspect-square bg-gray-200"></div>
                    <div className="p-4 space-y-2">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
