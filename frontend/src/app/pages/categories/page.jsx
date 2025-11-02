"use client";
import React, { useState, useEffect, useContext } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { FaHeart, FaRegHeart, FaStar } from "react-icons/fa";
import { IoFilter } from "react-icons/io5";
import { MdClose } from "react-icons/md";
import { CartContext } from "@/Context/CartContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ProductCard2 from "../../../components/categories/ProductCard2";

const backend =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://big-best-backend.vercel.app";

export default function page() {
  const router = useRouter();

  // Redirect to the new main categories page
  useEffect(() => {
    router.push("/pages/categories/main");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
}

// Keep the old component as backup
function OldCategoriesPage() {
  const [allProducts, setAllProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [activeTab, setActiveTab] = useState("All");
  const [loadingBuyNow, setLoadingBuyNow] = useState({});
  const [availableCategories, setAvailableCategories] = useState([]);
  const [availableBrands, setAvailableBrands] = useState([]);

  const [showSidebar, setShowSidebar] = useState(false);
  const [sliderValue, setSliderValue] = useState(50000);
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortOption, setSortOption] = useState("none");

  // Filter states
  const [priceRangeFilter, setPriceRangeFilter] = useState({
    min: 1,
    max: 50000,
  });
  const [tempPriceRange, setTempPriceRange] = useState({
    min: 1,
    max: 50000,
  }); // Temporary state for slider before Apply
  const [priceCheckboxFilters, setPriceCheckboxFilters] = useState([]);
  const [categoryFilters, setCategoryFilters] = useState([]);
  const [brandFilters, setBrandFilters] = useState([]);

  const router = useRouter();
  const min = 1;
  const max = 50000;

  // Fetch categories from API
  async function fetchCategories() {
    try {
      const response = await fetch(`${backend}/api/productsroute/categories`);
      if (response.ok) {
        const data = await response.json();

        // Handle both wrapped response {success: true, categories: [...]} and direct array response [...]
        let categoriesArray = [];
        if (Array.isArray(data)) {
          categoriesArray = data;
        } else if (data.success && Array.isArray(data.categories)) {
          categoriesArray = data.categories;
        } else {
          console.error("Invalid categories API response structure:", data);
          return;
        }

        setAvailableCategories(categoriesArray);
        console.log(`Loaded ${categoriesArray.length} categories from API`);
      } else {
        console.error(
          `Categories API responded with status: ${response.status}`
        );
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  }

  // Extract unique brands from products
  function extractBrandsFromProducts(products) {
    const brands = [
      ...new Set(products.map((p) => p.brand_name).filter(Boolean)),
    ];
    setAvailableBrands(brands);
  }

  // Get search query and category from URL
  // useEffect(() => {
  //   const query = searchParams.get('search');
  //   const category = searchParams.get('category');

  //   if (query) {
  //     setSearchQuery(query);
  //   } else {
  //     setSearchQuery("");
  //   }

  //   // If category is provided, set it in the filters
  //   if (category) {
  //     setCategoryFilters([category]);
  //   }
  // }, [searchParams]);

  async function fetchAllProducts() {
    try {
      setLoading(true);
      console.log(
        "Fetching products from:",
        `${backend}/api/productsroute/allproducts`
      );

      const response = await fetch(`${backend}/api/productsroute/allproducts`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("API Response:", data);

      // Handle both wrapped response {success: true, products: [...]} and direct array response [...]
      let productsArray = [];
      if (Array.isArray(data)) {
        // Direct array response
        productsArray = data;
      } else if (data.success && Array.isArray(data.products)) {
        // Wrapped response
        productsArray = data.products;
      } else {
        console.error("Invalid API response structure:", data);
        setAllProducts([]);
        setTotalProducts(0);
        setAvailableBrands([]);
        setLoading(false);
        return;
      }

      if (productsArray.length > 0) {
        const transformedProducts = productsArray.map((product, idx) => ({
          _id: product.id || idx + 1,
          product_name: product.name,
          product_image_main: product.image || "/prod1.png",
          discounted_single_product_price: parseFloat(product.price) || 0,
          non_discounted_price:
            parseFloat(product.old_price) ||
            parseFloat(product.price) * 1.2 ||
            0,
          review_stars: product.rating || 4.0,
          no_of_reviews: product.review_count || 100 + idx,
          category_name: product.category || "General",
          brand_name: product.brand_name || "Brand",
          description: product.uom || product.description || "1 unit",
          discount_percentage: product.discount || 10,
          featured: product.featured || true,
          topRated: product.rating >= 4,
          onSale: product.discount > 0,
          deliveryDate: "May 15, 2023",
          deliveryType: "Free Delivery",
          in_stock: product.in_stock !== false,
          images: product.images || [],
        }));

        setAllProducts(transformedProducts);
        setTotalProducts(transformedProducts.length);
        extractBrandsFromProducts(transformedProducts);
        console.log(
          `Successfully loaded ${transformedProducts.length} products from database`
        );
      } else {
        console.log("Database returned no products");
        setAllProducts([]);
        setTotalProducts(0);
        setAvailableBrands([]);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setAllProducts([]);
      setTotalProducts(0);
      setAvailableBrands([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (typeof window !== "undefined") {
      fetchCategories();
      fetchAllProducts();
    }
  }, []);

  // Fix the order of function declarations and usage

  // Get category, color, and brand counts
  function getCountForCategory(category) {
    return allProducts.filter((p) => p.category_name === category).length;
  }

  function getCountForBrand(brand) {
    return allProducts.filter((p) => p.brand_name === brand).length;
  }

  function getCountForPriceRange(min, max) {
    return allProducts.filter((p) => {
      const price = p.discounted_single_product_price || p.non_discounted_price;
      if (max === Infinity) {
        return price && price >= min;
      }
      return price && price >= min && price <= max;
    }).length;
  }

  const priceRanges = [
    {
      label: "Under ₹500",
      min: 0,
      max: 499,
      count: getCountForPriceRange(0, 499),
    },
    {
      label: "₹500 - ₹999",
      min: 500,
      max: 999,
      count: getCountForPriceRange(500, 999),
    },
    {
      label: "₹1000 - ₹1999",
      min: 1000,
      max: 1999,
      count: getCountForPriceRange(1000, 1999),
    },
    {
      label: "₹2000 - ₹3999",
      min: 2000,
      max: 3999,
      count: getCountForPriceRange(2000, 3999),
    },
    {
      label: "₹4000 - ₹4999",
      min: 4000,
      max: 4999,
      count: getCountForPriceRange(4000, 4999),
    },
    {
      label: "Over ₹5000",
      min: 5000,
      max: Infinity,
      count: getCountForPriceRange(5000, Infinity),
    },
  ];

  const uniqueCategories = [
    ...new Set(allProducts.map((p) => p.category_name)),
  ];
  const uniqueBrands = [...new Set(allProducts.map((p) => p.brand_name))];

  const categories = uniqueCategories.map((category) => ({
    label: category,
    count: getCountForCategory(category),
  }));

  const brands = uniqueBrands.map((brand) => ({
    label: brand,
    count: getCountForBrand(brand),
  }));

  // Update the filtering logic in useEffect
  useEffect(() => {
    if (allProducts.length === 0) {
      setDisplayedProducts([]);
      return;
    }

    let filtered = [...allProducts];

    // Apply search filter if there's a search query
    // if (searchQuery) {
    //   const query = searchQuery.toLowerCase();
    //   filtered = filtered.filter(
    //     (p) =>
    //       (p.product_name && p.product_name.toLowerCase().includes(query)) ||
    //       (p.category_name && p.category_name.toLowerCase().includes(query)) ||
    //       (p.brand_name && p.brand_name.toLowerCase().includes(query))
    //   );
    // }

    // Filter by tab
    if (activeTab === "On Sale") {
      filtered = filtered.filter((p) => p.discount_percentage > 0);
    } else if (activeTab === "Top Rated") {
      filtered = filtered.filter((p) => p.review_stars >= 4);
    } else if (activeTab === "Featured") {
      filtered = filtered.filter((p) => p.featured === true);
    }

    // Price range slider filter
    filtered = filtered.filter((p) => {
      const price = p.discounted_single_product_price || p.non_discounted_price;
      return price >= priceRangeFilter.min && price <= priceRangeFilter.max;
    });

    // Price checkbox filters
    if (priceCheckboxFilters.length > 0) {
      const priceFiltered = [];

      priceCheckboxFilters.forEach((filterLabel) => {
        const range = priceRanges.find((r) => r.label === filterLabel);
        if (range) {
          const matchingProducts = filtered.filter((p) => {
            const price =
              p.discounted_single_product_price || p.non_discounted_price;
            if (!price) return false;

            if (range.max === Infinity) {
              return price >= range.min;
            }
            return price >= range.min && price <= range.max;
          });
          priceFiltered.push(...matchingProducts);
        }
      });

      if (priceFiltered.length > 0) {
        // Remove duplicates
        filtered = Array.from(new Set(priceFiltered.map((p) => p._id))).map(
          (id) => priceFiltered.find((p) => p._id === id)
        );
      } else {
        filtered = [];
      }
    }

    // Filter by category
    if (categoryFilters.length > 0) {
      filtered = filtered.filter((p) =>
        categoryFilters.includes(p.category_name)
      );
    }

    // Filter by brand
    if (brandFilters.length > 0) {
      filtered = filtered.filter((p) => brandFilters.includes(p.brand_name));
    }

    setDisplayedProducts(filtered);
  }, [
    allProducts,
    activeTab,
    priceRangeFilter,
    priceCheckboxFilters,
    categoryFilters,
    brandFilters,
  ]);

  const handleSliderChange = (e) => {
    const value = Number(e.target.value);
    setSliderValue(value);
    // Update temp price range but don't apply it yet
    setTempPriceRange({ min: min, max: value });
  };

  const handleApply = () => {
    // Now apply the temporary price range to the actual filter
    setPriceRangeFilter(tempPriceRange);
    setShowSidebar(false);
  };

  const handlePriceCheckboxChange = (label) => {
    setPriceCheckboxFilters((prev) => {
      if (prev.includes(label)) {
        return prev.filter((item) => item !== label);
      } else {
        return [...prev, label];
      }
    });
  };

  const handleCategoryChange = (category) => {
    setCategoryFilters((prev) => {
      if (prev.includes(category)) {
        return prev.filter((item) => item !== category);
      } else {
        return [...prev, category];
      }
    });
  };

  const handleBrandChange = (brand) => {
    setBrandFilters((prev) => {
      if (prev.includes(brand)) {
        return prev.filter((item) => item !== brand);
      } else {
        return [...prev, brand];
      }
    });
  };

  const clearAllFilters = () => {
    setPriceRangeFilter({ min: min, max: max });
    setTempPriceRange({ min: min, max: max });
    setSliderValue(max);
    setPriceCheckboxFilters([]);
    setCategoryFilters([]);
    setBrandFilters([]);
  };
  const clearPriceRangeFilter = () => {
    setPriceRangeFilter({ min: min, max: max });
    setTempPriceRange({ min: min, max: max });
    setSliderValue(max);
  };

  const clearPriceCheckboxFilters = () => {
    setPriceCheckboxFilters([]);
  };

  const clearCategoryFilters = () => {
    setCategoryFilters([]);
  };

  const clearBrandFilters = () => {
    setBrandFilters([]);
  };

  // Calculate slider percentage for display
  const percentage = ((sliderValue - min) / (max - min)) * 100;

  // Calculate applied range percentage for the applied filter indicator
  const appliedPercentage = ((priceRangeFilter.max - min) / (max - min)) * 100;

  // Update the function to handle product click with the proper ID
  const handleProductClick = (product) => {
    // Navigate to the product detail page with the product ID
    router.push(`/pages/singleproduct/${product._id}`);
    // Store the selected product in localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("selectedProduct", JSON.stringify(product));
    }
  };

  // Add a new function to handle adding to cart
  // const handleAddToCart = (e, product) => {
  //   e.stopPropagation(); // Prevent click from bubbling up to the card
  //   addToCart(product);
  // };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const getSortedProducts = () => {
    if (sortOption === "none") return displayedProducts;
    let sorted = [...displayedProducts];
    switch (sortOption) {
      case "lowest_price":
        sorted.sort(
          (a, b) =>
            (a.discounted_single_product_price || a.non_discounted_price) -
            (b.discounted_single_product_price || b.non_discounted_price)
        );
        break;
      case "highest_price":
        sorted.sort(
          (a, b) =>
            (b.discounted_single_product_price || b.non_discounted_price) -
            (a.discounted_single_product_price || a.non_discounted_price)
        );
        break;
      case "most_reviews":
        sorted.sort((a, b) => (b.no_of_reviews || 0) - (a.no_of_reviews || 0));
        break;
      case "highest_rating":
        sorted.sort((a, b) => (b.review_stars || 0) - (a.review_stars || 0));
        break;
      default:
        break;
    }
    return sorted;
  };

  const [hoveredIdx, setHoveredIdx] = useState(null);

  return (
    <>
      <ToastContainer />
      <div className="relative bg-white font-outfit z-20">
        {/* Mobile Filter Button */}
        <div className="lg:hidden fixed bottom-4 right-4 z-50">
          <button
            className="bg-[#fd5b00] text-white p-3 rounded-full shadow-lg flex items-center justify-center"
            onClick={() => setShowSidebar(true)}
          >
            <IoFilter size={24} />
          </button>
        </div>

        {/* Overlay */}
        {showSidebar && (
          <div
            className="fixed inset-0 bg-transparent bg-opacity-40 z-40"
            onClick={() => setShowSidebar(false)}
          />
        )}

        <div className="w-full px-4 md:px-6 py-6 relative z-40">
          {/* {searchQuery && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <p className="text-[#fd5b00] font-medium">
                  Search results for: <span className="font-bold">"{searchQuery}"</span>
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    router.push("/product");
                  }}
                  className="text-sm bg-white px-3 py-1 rounded-full border border-gray-200 hover:bg-gray-100"
                >
                  Clear Search
                </button>
              </div>
            </div>
          )} */}

          <div className="w-full flex flex-col lg:flex-row gap-6">
            {/* Sidebar Filter */}
            <div
              className={`
              fixed top-0 left-0 z-50 bg-white w-[300px] h-full overflow-y-auto px-2 shadow-lg transition-transform duration-300
              ${showSidebar ? "translate-x-0" : "-translate-x-full"}
              lg:static lg:translate-x-0 lg:w-[340px] lg:max-w-none lg:shadow-none lg:rounded-lg lg:h-auto lg:overflow-visible
            `}
            >
              <div className="flex justify-between items-center lg:hidden mb-4">
                <h2 className="text-lg font-semibold">Filters</h2>
                <button
                  onClick={() => setShowSidebar(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <MdClose size={24} />
                </button>
              </div>

              {/* Price Filter Slider */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Filter by Price</h3>
                <div className="flex items-center space-x-2 mb-4">
                  <div className="h-1 flex-grow bg-gray-200 rounded-full relative">
                    {/* Temp slider range - orange overlay */}
                    <div
                      className="absolute h-1 bg-[#fd5b00] rounded-full"
                      style={{ width: `${percentage}%` }}
                    ></div>
                    <input
                      type="range"
                      min={min}
                      max={max}
                      value={sliderValue}
                      onChange={handleSliderChange}
                      className="absolute w-full h-1 opacity-0 cursor-pointer"
                    />
                    {/* Slider thumb */}
                    <div
                      className="absolute w-4 h-4 bg-[#fd5b00] rounded-full -mt-1.5"
                      style={{
                        left: `${percentage}%`,
                        transform: "translateX(-50%)",
                      }}
                    ></div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium">
                    Price: ₹{min} - ₹{sliderValue}
                    {priceRangeFilter.max !== sliderValue && (
                      <span className="ml-1 text-xs text-[#fd5b00]">
                        {" "}
                        (not applied)
                      </span>
                    )}
                  </p>
                  <div className="flex gap-1 items-center">
                    <button
                      onClick={handleApply}
                      className={`px-4 py-1 text-xs font-medium text-white rounded-full transition shadow-sm ${
                        priceRangeFilter.max !== sliderValue
                          ? "bg-[#f7941d] hover:bg-orange-600"
                          : "bg-[#fd5b00] hover:bg-[#fd5b00]"
                      }`}
                    >
                      Apply
                    </button>
                    <button
                      onClick={clearPriceRangeFilter}
                      className="text-xs  bg-[#fd5b00] text-white rounded-3xl cursor-pointer px-4 py-1 hover:underline"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </div>

              {/* Filter by Price Options */}
              <div className="mb-6">
                <h3 className="bg-[#fd5b00] text-white px-4 py-1.5 text-sm font-medium rounded-full mb-3">
                  Filter by Price
                </h3>
                <ul className="space-y-2">
                  {priceRanges.map((range, index) => (
                    <li
                      key={index}
                      className="flex justify-between items-center"
                    >
                      <label className="flex items-center text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          className="mr-2 h-4 w-4 accent-[#fd5b00]"
                          checked={priceCheckboxFilters.includes(range.label)}
                          onChange={() =>
                            handlePriceCheckboxChange(range.label)
                          }
                        />
                        {range.label}
                      </label>
                      <span className="text-[#fd5b00] bg-gray-100 text-xs font-medium rounded-full px-2 py-0.5">
                        {range.count}
                      </span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={clearPriceCheckboxFilters}
                  className="text-xs mt-4 bg-[#fd5b00] text-white rounded-3xl cursor-pointer px-8 py-2 hover:underline"
                >
                  Clear
                </button>
              </div>

              {/* Filter by Categories */}
              <div className="mb-6">
                <h3 className="bg-[#fd5b00] text-white px-4 py-1.5 text-sm font-medium rounded-full mb-3">
                  Filter by Categories
                </h3>
                <ul className="space-y-2">
                  {categories.map((category, index) => (
                    <li
                      key={index}
                      className="flex justify-between items-center"
                    >
                      <label className="flex items-center text-sm cursor-pointer">
                        <input
                          type="checkbox"
                          className="mr-2 h-4 w-4 accent-[#fd5b00]"
                          checked={categoryFilters.includes(category.label)}
                          onChange={() => handleCategoryChange(category.label)}
                        />
                        {category.label}
                      </label>
                      <span className="text-[#fd5b00] bg-gray-100 text-xs font-medium rounded-full px-2 py-0.5">
                        {category.count}
                      </span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={clearCategoryFilters}
                  className="text-xs mt-4 bg-[#fd5b00] text-white rounded-3xl cursor-pointer px-8 py-2 hover:underline"
                >
                  Clear
                </button>
              </div>

              {/* Filter by Brand */}
              <div className="mb-6">
                <h3 className="bg-[#fd5b00] text-white px-4 py-1.5 text-sm font-medium rounded-full mb-3">
                  Filter by Brand
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {brands.map((brand, index) => (
                    <div
                      key={index}
                      className="flex items-center bg-gray-100 text-xs font-medium px-2 py-1.5 rounded-full"
                    >
                      <input
                        type="checkbox"
                        className="mr-1.5 h-3 w-3 accent-[#fd5b00]"
                        id={`brand-${index}`}
                        checked={brandFilters.includes(brand.label)}
                        onChange={() => handleBrandChange(brand.label)}
                      />
                      <label
                        htmlFor={`brand-${index}`}
                        className="cursor-pointer truncate"
                      >
                        {brand.label}
                      </label>
                    </div>
                  ))}
                </div>
                <button
                  onClick={clearBrandFilters}
                  className="text-xs mt-4 bg-[#fd5b00] text-white rounded-3xl cursor-pointer px-8 py-2 hover:underline"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Product Grid Section */}
            <div className=" w-full">
              <div className="">
                <div className="flex flex-col md:flex-row justify-between gap-6 items-center mb-4">
                  {/* Shown 1-20 Item from 500 total for Protein Shakes' */}
                  <div className="text-base text-gray-600">
                    {/* Example: Shown 1-20 Item from 500 total for Protein Shakes' */}
                    {`Shown ${
                      displayedProducts.length > 0 ? "1" : "0"
                    }-${Math.min(displayedProducts.length, 20)} Item${
                      displayedProducts.length !== 1 ? "s" : ""
                    } from ${displayedProducts.length} `}
                  </div>
                  {/* Sort by: Highest rating ▼ */}
                  <div className="flex items-center text-base text-gray-500">
                    <span className="mr-1">Sort by :</span>
                    <div className="relative">
                      <select
                        className="bg-gray-100 rounded-sm font-semibold pl-4 pr-14 py-2 cursor-pointer text-xs"
                        value={sortOption}
                        onChange={(e) => setSortOption(e.target.value)}
                      >
                        <option value="none">No filters</option>
                        <option value="highest_rating">Highest rating</option>
                        <option value="lowest_price">Lowest price</option>
                        <option value="highest_price">Highest price</option>
                        <option value="most_reviews">Most reviews</option>
                      </select>
                      {/* <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-xs">&#9660;</span> */}
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Count and Active Filters */}
              <div className="mb-4 flex flex-wrap items-center gap-2">
                {[
                  // Add slider price range if it's not at max
                  ...(priceRangeFilter.max < max
                    ? [
                        {
                          type: "slider",
                          value: `₹${min} - ₹${priceRangeFilter.max}`,
                        },
                      ]
                    : []),
                  ...priceCheckboxFilters.map((filter) => ({
                    type: "price",
                    value: filter,
                  })),
                  ...categoryFilters.map((category) => ({
                    type: "category",
                    value: category,
                  })),
                  ...brandFilters.map((brand) => ({
                    type: "brand",
                    value: brand,
                  })),
                ].length > 0 && (
                  <div className="flex flex-wrap gap-2 ml-2">
                    {/* Price Range Slider Tag */}
                    {priceRangeFilter.max < max && (
                      <span className="bg-[#fd5b00] text-[#fff] text-xs rounded-full px-2 py-1 flex items-center">
                        Price: ₹{min} - ₹{priceRangeFilter.max}
                        <button
                          className="ml-1 text-[#000]"
                          onClick={() => {
                            setPriceRangeFilter({ min, max });
                            setTempPriceRange({ min, max });
                            setSliderValue(max);
                          }}
                        >
                          ×
                        </button>
                      </span>
                    )}

                    {priceCheckboxFilters.map((filter) => (
                      <span
                        key={filter}
                        className="bg-gray-100 text-xs rounded-full px-2 py-1 flex items-center"
                      >
                        {filter}
                        <button
                          className="ml-1 text-gray-500 hover:text-gray-700"
                          onClick={() => handlePriceCheckboxChange(filter)}
                        >
                          ×
                        </button>
                      </span>
                    ))}

                    {categoryFilters.map((category) => (
                      <span
                        key={category}
                        className="bg-gray-100 text-xs rounded-full px-2 py-1 flex items-center"
                      >
                        {category}
                        <button
                          className="ml-1 text-gray-500 hover:text-gray-700"
                          onClick={() => handleCategoryChange(category)}
                        >
                          ×
                        </button>
                      </span>
                    ))}

                    {brandFilters.map((brand) => (
                      <span
                        key={brand}
                        className="bg-gray-100 text-xs rounded-full px-2 py-1 flex items-center"
                      >
                        {brand}
                        <button
                          className="ml-1 text-gray-500 hover:text-gray-700"
                          onClick={() => handleBrandChange(brand)}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-2 sm:gap-3 place-items-center">
                {loading ? (
                  <div className="col-span-full flex flex-col justify-center items-center py-40">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#fd5b00] mb-4"></div>
                    <p className="text-gray-600">Loading products...</p>
                  </div>
                ) : getSortedProducts().length > 0 ? (
                  getSortedProducts().map((product, index) => (
                    <ProductCard2
                      key={index}
                      product={product}
                      hovered={hoveredIdx === index}
                      onMouseEnter={() => setHoveredIdx(index)}
                      onMouseLeave={() => setHoveredIdx(null)}
                      onClick={handleProductClick}
                    />
                  ))
                ) : (
                  <div className="col-span-full flex flex-col justify-center items-center py-40">
                    <div className="text-6xl mb-4">🛍️</div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                      No products found
                    </h3>
                    <p className="text-gray-500 text-center max-w-md">
                      {allProducts.length === 0
                        ? "The product database appears to be empty. Please contact support or try again later."
                        : "No products match your current filters. Try adjusting your search criteria."}
                    </p>
                    {allProducts.length === 0 && (
                      <button
                        onClick={() => {
                          fetchAllProducts();
                          fetchCategories();
                        }}
                        className="mt-4 bg-[#fd5b00] text-white px-6 py-2 rounded-lg hover:bg-[#e54f00] transition-colors"
                      >
                        Retry Loading
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
