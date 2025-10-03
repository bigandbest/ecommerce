import React, { useEffect, useState } from "react";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  getYouMayLikeProducts,
  getAllProducts,
  addToCart,
  getProductsForRecommendedStore,
  getProductsForBrand,
  fetchRecommendedStores,
  fetchProductsForBannerGroup,
  fetchUniqueSectionsByType,
  fetchProductsForUniqueSection,
  getProductEnquiryStatus, // <- already imported
} from "../../utils/supabaseApi";
import { useAuth } from "../../contexts/AuthContext";
import { SlidersHorizontal, ArrowUpDown } from "lucide-react";

const ProductListingPage = () => {
  const { Name } = useParams();
  const [products, setProducts] = useState([]);
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Handle both store and brand data from location.state
  const {
    selectedStore,
    allStores,
    selectedBrand,
    allBrands
  } = location.state || {};

  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const [addingToCart, setAddingToCart] = useState(null);

  // NEW: keep productId -> enquiry boolean map
  const [enquiryStatusMap, setEnquiryStatusMap] = useState({});

  // State for stores/brands (fallback if not in location.state)
  const [storesData, setStoresData] = useState(allStores || []);
  const [brandsData, setBrandsData] = useState(allBrands || []);
  const [currentStore, setCurrentStore] = useState(selectedStore || null);
  const [currentBrand, setCurrentBrand] = useState(selectedBrand || null);

  // Update current store/brand when URL params change
  useEffect(() => {
    if (Name === "shop-by-product" && id && storesData.length > 0) {
      const foundStore = storesData.find(store => store.id === parseInt(id));
      if (foundStore) {
        setCurrentStore(foundStore);
      }
    } else if (Name === "shopbybrand" && id && brandsData.length > 0) {
      const foundBrand = brandsData.find(brand => brand.id === parseInt(id));
      if (foundBrand) {
        setCurrentBrand(foundBrand);
      }
    }
  }, [Name, id, storesData, brandsData]);

  // Update current store/brand when location.state changes (navigation with state)
  useEffect(() => {
    if (selectedStore) {
      setCurrentStore(selectedStore);
    }
    if (selectedBrand) {
      setCurrentBrand(selectedBrand);
    }
    if (allStores) {
      setStoresData(allStores);
    }
    if (allBrands) {
      setBrandsData(allBrands);
    }
  }, [selectedStore, selectedBrand, allStores, allBrands]);

  // Fetch stores/brands if not available in location.state
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (Name === "shop-by-product" && storesData.length === 0) {
          const stores = await fetchRecommendedStores();
          const formattedStores = stores.map(store => ({
            id: store.id,
            label: store.name,
            image: store.image_url,
          }));
          setStoresData(formattedStores);

          // Set current store after fetching if we have an id
          if (id) {
            const foundStore = formattedStores.find(store => store.id === parseInt(id));
            if (foundStore) {
              setCurrentStore(foundStore);
            }
          }
        } else if (Name === "shopbybrand" && brandsData.length === 0) {
          const response = await axios.get("https://ecommerce-8342.onrender.com/api/brand/list");
          const formattedBrands = response.data.brands.map(brand => ({
            id: brand.id,
            label: brand.name,
            img: brand.image_url,
            tag: "Featured",
          }));
          setBrandsData(formattedBrands);

          // Set current brand after fetching if we have an id
          if (id) {
            const foundBrand = formattedBrands.find(brand => brand.id === parseInt(id));
            if (foundBrand) {
              setCurrentBrand(foundBrand);
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    fetchData();
  }, [Name]); // Removed dependencies to prevent infinite loops

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      let result;
      if (Name === "you-may-like") {
        result = await getYouMayLikeProducts();
      } else if (Name === "shop-by-product") {
        result = await getProductsForRecommendedStore(id);
      } else if (Name === "shopbybrand") {
        result = await getProductsForBrand(id);
      } else if (Name === "discount") {
        result = await fetchProductsForBannerGroup(id);
      } else if (Name === "offers") {
        result = await fetchProductsForBannerGroup(id);
      } else if (Name === "deals") {
        result = await fetchProductsForBannerGroup(id);
      } else if (Name === "summer-sale") {
        result = await fetchProductsForBannerGroup(id);
      } else if (Name === "opening-soon") {
        result = await fetchProductsForBannerGroup(id);
      } else if (Name === "sectionOne") {
        result = await fetchProductsForBannerGroup(id);
      } else if (Name === "best-quality") {
        const sections = await fetchUniqueSectionsByType("Best quality");
        const productGroups = await Promise.all(
          sections.map((s) => fetchProductsForUniqueSection(s.id))
        );
        result = productGroups.flat();
      } else if (Name == "new-menu") {
        const sections = await fetchUniqueSectionsByType("New Menu");
        const productGroups = await Promise.all(
          sections.map((s) => fetchProductsForUniqueSection(s.id))
        );
        result = productGroups.flat();
      } else {
        result = await getAllProducts();
      }

      if (result && result.success !== false) {
        setProducts(result.products || result);
      }
      setLoading(false);
    }

    fetchProducts();
  }, [Name, id]);

  // NEW: fetch enquiry status for all currently loaded products
  useEffect(() => {
    let isCancelled = false;

    const loadEnquiryStatuses = async () => {
      try {
        if (!products || products.length === 0) {
          setEnquiryStatusMap({});
          return;
        }

        const entries = await Promise.all(
          products.map(async (p) => {
            try {
              // Expecting getProductEnquiryStatus to return { enquiry: boolean } or boolean
              const res = await getProductEnquiryStatus(p.id);
              const value =
                typeof res === "boolean"
                  ? res
                  : (res?.enquiry ?? false);
              return [p.id, value];
            } catch {
              return [p.id, false]; // fallback if any error
            }
          })
        );

        if (!isCancelled) {
          const map = Object.fromEntries(entries);
          setEnquiryStatusMap(map);
        }
      } catch (e) {
        console.error("Failed to load enquiry statuses", e);
      }
    };

    loadEnquiryStatuses();

    return () => {
      isCancelled = true;
    };
  }, [products]);

  const handleStoreClick = (store) => {
    setCurrentStore(store); // Update state immediately for better UX
    navigate(`/ProductLisingPage/shop-by-product/${store.id}`, {
      state: { selectedStore: store, allStores: storesData },
    });
  };

  const handleBrandClick = (brand) => {
    setCurrentBrand(brand); // Update state immediately for better UX
    navigate(`/ProductLisingPage/shopbybrand/${brand.id}`, {
      state: { selectedBrand: brand, allBrands: brandsData },
    });
  };

  const handleAddToCart = async (e, productId) => {
    e.preventDefault();
    e.stopPropagation();

    if (!currentUser) {
      alert("Please log in to add items to your cart.");
      return;
    }

    setAddingToCart(productId);

    const { success, error } = await addToCart(currentUser.id, productId, 1);

    if (success) {
      window.dispatchEvent(new Event("cartUpdated"));
    } else {
      alert(`Failed to add item to cart: ${error}`);
    }

    setAddingToCart(null);
  };

  // NEW: handle enquiry button click
  const handleEnquiryClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate("/enquiry-history");
  };

  const calculateDiscount = (oldPrice, newPrice) => {
    if (!oldPrice || !newPrice) return 0;
    return Math.round(((oldPrice - newPrice) / oldPrice) * 100);
  };

  // Determine what type of gallery to show
  const isStoreView = Name === "shop-by-product" || Name === "discount";
  const isBrandView = Name === "shopbybrand";

  const galleryData = isStoreView ? storesData : brandsData;
  const currentItem = isStoreView ? currentStore : currentBrand;
  const handleItemClick = isStoreView ? handleStoreClick : handleBrandClick;
  const galleryTitle = isStoreView ? "Shop By Store" : "Shop By Brand";

  if (loading) return <p className="text-center py-10">Loading...</p>;

  return (
    <div className="bg-gray-50 min-h-screen mt-[-40px]">
      <div className="container mx-auto max-w-2xl px-2 py-4">

        {/* Slideable Gallery - Different styling for stores vs brands */}
        {(isStoreView || isBrandView) && galleryData && galleryData.length > 0 && (
          <div className="mb-3">
            <h3 className="text-sm font-semibold text-gray-800 mb-1 px-2">
              {currentItem ? currentItem.label : galleryTitle}
            </h3>
            <div
              className="flex gap-2 overflow-x-auto px-2"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {galleryData.map((item, index) => {
                const isSelected = currentItem && item.id === currentItem.id;
                const imageSource = isStoreView ? item.image : item.img;

                return (
                  <div
                    key={item.id || index}
                    className="flex flex-col items-center flex-shrink-0 cursor-pointer transition-transform hover:scale-105"
                    onClick={() => handleItemClick(item)}
                  >
                    <div
                      className={`w-16 h-16 overflow-hidden border-2 transition-all duration-200 ${isSelected
                        ? "border-red-400 ring-2 ring-red-200 shadow-lg"
                        : "border-gray-200 hover:border-gray-300"
                        } ${isBrandView ? "rounded-full" : "rounded-lg"}`}
                    >
                      <img
                        src={imageSource}
                        alt={item.label}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://placehold.co/64x64?text=Brand";
                        }}
                      />
                    </div>
                    <p
                      className={`text-xs mt-0.5 text-center max-w-[60px] truncate transition-colors ${isSelected
                        ? "text-red-600 font-medium"
                        : "text-gray-700"
                        }`}
                    >
                      {item.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Product List */}
        {products.length === 0 ? (
          <p className="text-center text-gray-500 py-10">No products found.</p>
        ) : (
          <div className="space-y-1">
            {products.map((item) => {
              const discount = calculateDiscount(item.old_price, item.price);
              const isAdding = addingToCart === item.id;
              const isEnquiry = !!enquiryStatusMap[item.id];

              return (
                <Link
                  key={item.id}
                  to={`/product/${item.id}`}
                  className="flex bg-white !ml-0 rounded-lg shadow-sm overflow-hidden transition-shadow hover:shadow-md w-full"
                >
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0">
                    <img
                      src={item.image || "https://via.placeholder.com/150"}
                      alt={item.name}
                      className="w-full h-full object-cover rounded-md"
                    />
                    {discount > 0 && (
                      <div className="absolute top-0 left-0 bg-green-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                        {discount}% OFF
                      </div>
                    )}
                  </div>

                  <div className="px-3 py-2 flex flex-col flex-grow">
                    <div>
                      <p className="text-xs text-gray-400 uppercase font-medium">
                        {item.category || "Brand"}
                      </p>
                      <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 leading-tight">
                        {item.name}
                      </h3>
                    </div>

                    <div className="text-xs text-gray-600 mt-1 border rounded px-2 py-1 w-fit">
                      {item.uom ? <p>{item.uom}</p> : <p>1 Variant</p>}
                    </div>

                    <div className="flex justify-between items-end">
                      <div className="flex items-center">
                        <p className="text-base font-bold text-black">
                          ₹{item.price || "--"}
                        </p>
                        {item.old_price && (
                          <p className="text-xs line-through ml-1 text-gray-400">
                            ₹{item.old_price}
                          </p>
                        )}
                      </div>

                      {/* NEW: Button switches to ENQUIRY if enquiry is true */}
                      {isEnquiry ? (
                        <button
                          onClick={handleEnquiryClick}
                          style={{ minHeight: '20px' }}
                          className="bg-red-400 text-white text-sm font-bold py-2 px-6 rounded-md hover:bg-red-600 transition-colors"
                        >
                          ENQUIRY
                        </button>
                      ) : (
                        <button
                          onClick={(e) => handleAddToCart(e, item.id)}
                          disabled={isAdding}
                          style={{ minHeight: '20px' }}
                          className="bg-red-400 text-white text-sm font-bold py-2 px-6 rounded-md hover:bg-red-600 transition-colors disabled:bg-red-300 disabled:cursor-not-allowed"
                        >
                          {isAdding ? "Adding..." : "Add"}
                        </button>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductListingPage;
