"use client";
import React, { useState, useEffect, useRef, useContext } from "react";
import { FaInstagram } from "react-icons/fa";
import { SlSocialFacebook } from "react-icons/sl";
import { AiOutlineYoutube } from "react-icons/ai";
import { CiTwitter } from "react-icons/ci";

import Image from "next/image";
import { FaBars, FaTimes } from "react-icons/fa";
import { FiSearch } from "react-icons/fi";

import { RiArrowDropDownLine, RiArrowDropUpLine } from "react-icons/ri";
import { MdLocationOn } from "react-icons/md";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useWallet } from "@/contexts/WalletContext";
import { CartContext } from "@/Context/CartContext";
import NotificationBell from "@/components/NotificationBell";
import TrackOrderModal from "@/components/TrackOrderModal";

function Header() {
  const { currentUser, isAuthenticated, logout, userProfile, loading, error } =
    useAuth();
  const router = useRouter();
  const { wallet } = useWallet();
  const { getTotalItems } = useContext(CartContext);

  const cartItemsCount = getTotalItems();

  // Centralized logout handler to ensure UI updates and redirect
  const handleLogout = async () => {
    try {
      const result = await logout();
      if (result && result.success) {
        // Close overlays and navigate to login
        setIsUserMenuOpen(false);
        setIsMobileMenuOpen(false);
        setIsSidebarOpen(false);
        toast.success("Logged out successfully");
        router.push("/pages/login");
        return true;
      } else {
        toast.error(result?.error || "Logout failed");
        return false;
      }
    } catch (err) {
      console.error("Logout error:", err);
      toast.error("Error logging out");
      return false;
    }
  };

  // Check for stored session if not authenticated (client-side only)
  useEffect(() => {
    if (!isAuthenticated && !loading && typeof window !== "undefined") {
      const storedSession = localStorage.getItem("user_session");
      if (storedSession) {
        try {
          const session = JSON.parse(storedSession);
          const now = Date.now() / 1000;
          if (session.expires_at <= now) {
            localStorage.removeItem("user_session");
          }
        } catch (e) {
          localStorage.removeItem("user_session");
        }
      }
    }
  }, [isAuthenticated, loading]);

  // Helper function to get user profile picture
  const getUserProfilePic = () => {
    if (userProfile?.photo_url) return userProfile.photo_url;
    if (currentUser?.photo_url) return currentUser.photo_url;
    if (currentUser?.user_image) return currentUser.user_image;
    if (currentUser?.avatar) return currentUser.avatar;
    return "/avatar.gif"; // fallback
  };
  const [isBrandOpen, setIsBrandOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isTrackOrderOpen, setIsTrackOrderOpen] = useState(false);
  const [pincode, setPincode] = useState("");
  const [location, setLocation] = useState("Detecting location...");
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const brandRef = useRef(null);
  const sidebarRef = useRef(null);
  const locationRef = useRef(null);
  const mobileLocationRef = useRef(null);
  const mobileLocationTriggerRef = useRef(null);
  const categoriesRef = useRef(null);
  const userMenuRef = useRef(null);

  // Toggle handler for mobile location to keep state updates consistent
  const handleMobileLocationToggle = () => {
    setIsLocationOpen((prev) => !prev);
  };

  const brands = [
    "Nike",
    "Adidas",
    "Puma",
    "Under Armour",
    "Reebok",
    "New Balance",
    "Asics",
    "Skechers",
  ];

  const categories = [
    {
      id: 1,
      name: "Electronics",
      products: ["Mobile", "Laptop", "TV", "Headphones"],
    },
    {
      id: 2,
      name: "Fashion",
      products: ["Shirts", "Jeans", "Shoes", "Watches"],
    },
    {
      id: 3,
      name: "Home & Kitchen",
      products: ["Furniture", "Appliances", "Decor", "Cookware"],
    },
    {
      id: 4,
      name: "Sports",
      products: ["Cricket", "Football", "Gym Equipment", "Cycling"],
    },
    {
      id: 5,
      name: "Books",
      products: ["Fiction", "Non-Fiction", "Educational", "Comics"],
    },
  ];

  // Function to get user's current location
  const getCurrentLocation = () => {
    setIsLoadingLocation(true);

    if (!navigator.geolocation) {
      alert("Geolocation is not supported by this browser.");
      setIsLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        // Simply use coordinates without reverse geocoding to avoid CORS issues
        const formattedLocation = `${latitude.toFixed(4)}, ${longitude.toFixed(
          4
        )}`;
        setLocation(formattedLocation);

        setIsLoadingLocation(false);
      },
      (error) => {
        let errorMessage = "Unable to detect location";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location unavailable";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timeout";
            break;
        }

        setLocation(errorMessage);
        setIsLoadingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  };

  // Get location on component mount
  useEffect(() => {
    getCurrentLocation();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (brandRef.current && !brandRef.current.contains(event.target)) {
        setIsBrandOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Handle sidebar
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        !event.target.closest(".menu-icon")
      ) {
        setIsSidebarOpen(false);
      }

      // Handle location dropdowns (desktop & mobile)
      const clickedOnDesktopLocation = locationRef.current?.contains(
        event.target
      );
      const clickedOnMobileLocation = mobileLocationRef.current?.contains(
        event.target
      );
      const clickedOnMobileTrigger = mobileLocationTriggerRef.current?.contains(
        event.target
      );

      if (
        !clickedOnDesktopLocation &&
        !clickedOnMobileLocation &&
        !clickedOnMobileTrigger
      ) {
        setIsLocationOpen(false);
      }

      // Handle user menu
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isSidebarOpen]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  return (
    <div className="w-full h-auto flex flex-col">
      {/* Main Header */}
      <div className="w-full h-auto flex flex-col px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10 bg-[#F9F4ED] py-2 sm:py-3 md:py-4 lg:py-6 gap-2 sm:gap-3 md:gap-4 lg:gap-6">
        <div className="w-full h-auto flex flex-col lg:flex-row lg:justify-between gap-4 sm:gap-5">
          <div className="w-full lg:w-auto h-auto flex items-center justify-between lg:justify-start px-0">
            {/* Hamburger Menu - Mobile */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Open menu"
              className="menu-icon w-10 h-8 bg-[#FF6B00] rounded-full text-white hover:bg-[#e65c00] transition-colors flex items-center justify-center flex-shrink-0 shadow-md lg:hidden mr-3"
            >
              <FaBars size={14} />
            </button>

            <Link
              href="/"
              className="flex items-center flex-shrink-0 focus:outline-none focus:ring-0"
            >
              <div className="flex flex-col">
                <div className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-[#4A90E2]">
                  BIGBESTMART
                </div>
                <div className="text-[10px] sm:text-xs text-gray-600">
                  Apka Desi DOST
                </div>
              </div>
            </Link>

            {/* Mobile Icons and User Button */}
            <div className="flex items-center gap-1.5 lg:hidden ml-auto">
              <Link
                href="/pages/cart"
                className="p-1.5 bg-[#F8F8FA] rounded-full relative flex items-center justify-center shadow-sm"
              >
                <Image src="/cart.gif" alt="cart" width={16} height={16} />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] rounded-full w-3.5 h-3.5 flex items-center justify-center font-bold">
                    {cartItemsCount}
                  </span>
                )}
              </Link>
              {!loading && isAuthenticated && currentUser?.id && (
                <div className="scale-75 flex items-center">
                  <NotificationBell userId={currentUser.id} />
                </div>
              )}
              {!loading && isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="p-2 bg-[#F8F8FA] rounded-full hover:shadow-md transition-all"
                  >
                    <Image
                      src={getUserProfilePic()}
                      alt="avatar"
                      width={24}
                      height={24}
                      className="rounded-full object-cover"
                      onError={(e) => {
                        e.target.src = "/avatar.gif";
                      }}
                    />
                  </button>
                  {isUserMenuOpen && (
                    <div className="absolute top-full right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border z-50">
                      <div className="py-2">
                        <Link
                          href="/pages/orders"
                          className="flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          📦 Orders
                        </Link>
                        <Link
                          href="/pages/profile"
                          className="flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          👤 Profile
                        </Link>
                        <Link
                          href="/pages/wishlist"
                          className="flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          ❤️ Wishlist
                        </Link>
                        <Link
                          href="/pages/wallet"
                          className="flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          💳 Wallet
                          {wallet && (
                            <span className="ml-auto text-xs font-semibold text-green-600">
                              ₹{wallet.balance?.toFixed(2) || "0.00"}
                            </span>
                          )}
                        </Link>

                        <div className="border-t my-1"></div>
                        <Link
                          href="/pages/enquiries"
                          className="flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          📋 Enquiries
                        </Link>
                        <Link
                          href="/pages/refund"
                          className="flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          💰 Refund
                        </Link>
                        <Link
                          href="/pages/contactus"
                          className="flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          📞 Contact Us
                        </Link>
                        <div className="border-t my-1"></div>
                        <button
                          onClick={async () => {
                            const result = await handleLogout();
                            if (result) setIsUserMenuOpen(false);
                          }}
                          className="flex items-center gap-2 w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-gray-100"
                        >
                          🚪 Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/pages/login"
                    className="bg-[#FF6B00] rounded-full px-4 py-2 hover:bg-[#e65c00] transition-all shadow-sm text-xs font-semibold text-white flex items-center justify-center min-w-[60px]"
                  >
                    Login
                  </Link>
                  <Link
                    href="/pages/signup"
                    className="bg-white border border-[#FF6B00] rounded-full px-4 py-2 hover:bg-[#FF6B00] hover:text-white transition-all shadow-sm text-xs font-semibold text-[#FF6B00] flex items-center justify-center min-w-[65px]"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
              {loading && (
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="w-12 h-6 bg-gray-200 rounded animate-pulse"></div>
                </div>
              )}
            </div>

            {/* Location Dropdown - Hidden on mobile, shown on larger screens */}
            <div
              className="relative hidden lg:block location-dropdown-container ml-8"
              ref={locationRef}
            >
              <div
                onClick={() => setIsLocationOpen(!isLocationOpen)}
                className="flex items-start gap-2 cursor-pointer"
              >
                <MdLocationOn className="text-[#FF6B00] w-5 h-5 sm:w-6 sm:h-6 mt-1" />
                <div>
                  <div className="flex items-center gap-1">
                    <div className="text-sm sm:text-base font-semibold text-[#F7941D]">
                      {isLoadingLocation ? "Detecting..." : location}
                    </div>
                    {isLocationOpen ? (
                      <RiArrowDropUpLine className="text-xs text-blue-900" />
                    ) : (
                      <RiArrowDropDownLine className="text-xs text-blue-900" />
                    )}
                  </div>
                  <span className="text-[12px] leading-0 text-[#1E3473]">
                    {isLoadingLocation
                      ? "Please wait..."
                      : "Delivery in 24 hours"}
                  </span>
                </div>
              </div>

              {isLocationOpen && (
                <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-[60] overflow-hidden">
                  <div className="p-4">
                    <h3 className="font-semibold mb-3">Choose your location</h3>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        placeholder="Enter pincode"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        className="flex-1 p-2 border rounded-lg outline-none focus:border-[#FF6B00] min-w-0"
                      />
                      <button
                        onClick={() => {
                          if (pincode) {
                            setLocation(`Area Code: ${pincode}`);
                            setIsLocationOpen(false);
                            setPincode("");
                          }
                        }}
                        className="px-4 py-2 bg-[#FF6B00] text-white rounded-lg hover:bg-[#e65c00] flex-shrink-0"
                      >
                        Apply
                      </button>
                    </div>
                    <div className="flex gap-2 mb-3">
                      <button
                        onClick={() => {
                          getCurrentLocation();
                          setIsLocationOpen(false);
                        }}
                        disabled={isLoadingLocation}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <MdLocationOn size={16} />
                        {isLoadingLocation
                          ? "Detecting..."
                          : "Use Current Location"}
                      </button>
                    </div>
                    <div className="text-xs text-gray-500">
                      We'll show products available in your area
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Desktop Search */}
          <div className="hidden lg:flex w-full max-w-md xl:max-w-lg h-auto justify-center items-center gap-2 xl:gap-3">
            <div className="w-full bg-white h-10 sm:h-11 p-1 rounded-3xl border border-[#FD5B00] flex justify-between items-center">
              <input
                type="text"
                placeholder="Search by name, category, brand..."
                className="w-full h-full px-3 flex-1 outline-none text-sm"
              />
              <span className="p-2 bg-[#2A2A2A] rounded-full">
                <FiSearch className="text-white" size={18} />
              </span>
            </div>
            <div className="p-2 bg-[#F8F8FA] rounded-full cursor-pointer hover:shadow-md transition-all">
              <Image src="/mic.gif" alt="mic" width={28} height={28} />
            </div>
            <Link
              href="/pages/cart"
              className="p-2 bg-[#F8F8FA] rounded-full cursor-pointer hover:shadow-md transition-all relative"
            >
              <Image src="/cart.gif" alt="cart" width={28} height={28} />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </Link>
            {!loading && isAuthenticated && currentUser?.id && (
              <NotificationBell userId={currentUser.id} />
            )}
          </div>

          {/* Desktop User Actions */}
          <div className="hidden lg:flex w-auto h-auto justify-center items-center gap-2 xl:gap-3">
            {!loading && isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="p-2 bg-[#F8F8FA] rounded-full hover:shadow-md transition-all"
                >
                  <Image
                    src={getUserProfilePic()}
                    alt="avatar"
                    width={36}
                    height={36}
                    className="rounded-full object-cover"
                    onError={(e) => {
                      e.target.src = "/avatar.gif";
                    }}
                  />
                </button>
                {isUserMenuOpen && (
                  <div className="absolute top-full right-0 mt-2 w-52 bg-white rounded-lg shadow-lg border z-50">
                    <div className="py-2">
                      <Link
                        href="/pages/orders"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        📦 Orders
                      </Link>
                      <Link
                        href="/pages/profile"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        👤 Profile
                      </Link>
                      <Link
                        href="/pages/wishlist"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        ❤️ Wishlist
                      </Link>
                      <Link
                        href="/pages/wallet"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        💳 Wallet
                      </Link>

                      <div className="border-t my-1"></div>
                      <Link
                        href="/pages/enquiries"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        📋 Enquiries
                      </Link>
                      <Link
                        href="/pages/refund"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        💰 Refund
                      </Link>
                      <Link
                        href="/pages/contactus"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        📞 Contact Us
                      </Link>
                      <div className="border-t my-1"></div>
                      <button
                        onClick={async () => {
                          const result = await handleLogout();
                          if (result) setIsUserMenuOpen(false);
                        }}
                        className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        🚪 Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href={"/pages/login"}
                  className="font-roboto text-white bg-[#FF6B00] rounded-lg px-3 py-2 font-semibold hover:bg-[#e65c00] transition-all text-sm"
                >
                  Login
                </Link>
                <Link
                  href={"/pages/signup"}
                  className="font-roboto text-[#FF6B00] bg-white border border-[#FF6B00] rounded-lg px-3 py-2 font-semibold hover:bg-[#e65c00] hover:text-white transition-all text-sm"
                >
                  Sign Up
                </Link>
              </>
            )}
            {loading && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="w-16 h-8 bg-gray-200 rounded animate-pulse"></div>
              </div>
            )}
          </div>

          {/* Mobile Search & Actions */}
          <div className="w-full h-auto lg:hidden">
            {/* Location Bar */}
            <div className="flex items-center gap-2 mb-2">
              <div
                ref={mobileLocationTriggerRef}
                className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg flex-1 cursor-pointer"
                onClick={handleMobileLocationToggle}
              >
                <MdLocationOn
                  className="text-[#FF6B00] flex-shrink-0"
                  size={14}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] text-gray-500">Deliver to</div>
                  <div className="text-xs font-medium text-gray-800 truncate">
                    {isLoadingLocation ? "Detecting location..." : location}
                  </div>
                </div>
                <div className="text-[#FF6B00] p-1 flex-shrink-0">
                  {isLocationOpen ? (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 15l7-7 7 7"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  )}
                </div>
              </div>

              {/* Wallet Icon */}
              {isAuthenticated && (
                <Link
                  href="/pages/wallet"
                  className="p-2 bg-gray-50 rounded-lg flex-shrink-0 flex items-center justify-center w-12 h-12"
                >
                  <span className="text-lg">💳</span>
                </Link>
              )}
            </div>

            {/* Search Bar and Track Order */}
            <div className="flex items-center gap-1.5 mb-2">
              {/* Search Bar */}
              <div className="flex-1 max-w-[calc(100%-70px)] bg-white h-10 rounded-full border border-[#FD5B00] flex items-center">
                <div className="p-2 flex-shrink-0">
                  <Image src="/mic.gif" alt="mic" width={16} height={16} />
                </div>
                <input
                  type="text"
                  placeholder="Search..."
                  className="flex-1 h-full px-2 text-sm min-w-0 outline-none focus:outline-none bg-transparent border-none focus:border-none focus:ring-0"
                  style={{ outline: "none", border: "none", boxShadow: "none" }}
                  onFocus={(e) => (e.target.style.outline = "none")}
                />
                <div className="p-1.5 bg-[#2A2A2A] rounded-full flex-shrink-0 mr-1">
                  <FiSearch className="text-white" size={14} />
                </div>
              </div>
              
              {/* Track Order   hello world */}
              <Link
                href="/pages/track-order"
                className="flex items-center gap-1 p-2 bg-gray-50 rounded-lg flex-shrink-0 min-w-[65px] h-10"
              >
                <Image src="/truck.gif" alt="track" width={16} height={16} />
                <span className="text-xs font-medium text-gray-700">Track</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Top Navigation Bar - Hidden on mobile */}
        <div className="w-full h-auto hidden lg:flex items-center justify-between py-3 border-b border-gray-200 mb-4 px-2">
          <div className="flex items-center gap-3 sm:gap-6 lg:gap-8 overflow-x-auto">
            <Link
              href="/"
              className="text-sm font-semibold text-gray-700 py-2 px-4 bg-gray-100 hover:bg-[#FD5B00] hover:text-white rounded-lg transition-all whitespace-nowrap flex items-center gap-2"
            >
              <span className="text-base">🏠</span>
              Home
            </Link>

            <div
              className="relative flex items-center"
              ref={categoriesRef}
              onMouseEnter={() => setIsCategoriesOpen(true)}
              onMouseLeave={() => setIsCategoriesOpen(false)}
            >
              <Link
                href="/pages/categories"
                className="flex items-center gap-1 text-sm font-semibold text-gray-700 py-2 px-4 bg-gray-100 hover:bg-[#FD5B00] hover:text-white rounded-lg transition-all whitespace-nowrap"
              >
                <span className="text-base">📂</span>
                Categories
                <RiArrowDropDownLine size={16} />
              </Link>

              {isCategoriesOpen && (
                <div className="absolute top-full left-0 mt-2 w-72 lg:w-80 bg-white rounded-lg shadow-lg border z-50">
                  <div className="p-3 sm:p-4">
                    <h3 className="font-semibold mb-3 text-gray-800 text-sm sm:text-base">
                      Categories
                    </h3>
                    <div className="grid grid-cols-1 gap-2">
                      {categories.map((category) => (
                        <div key={category.id} className="group">
                          <div className="p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                            <h4 className="font-medium text-gray-700 group-hover:text-[#FF6B00] text-sm">
                              {category.name}
                            </h4>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {category.products.map((product, index) => (
                                <span
                                  key={index}
                                  className="text-xs text-gray-500 hover:text-[#FF6B00] cursor-pointer"
                                >
                                  {product}
                                  {index < category.products.length - 1 && ", "}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 pt-3 border-t">
                      <Link
                        href="/pages/categories"
                        className="text-sm text-[#FF6B00] hover:underline font-medium"
                      >
                        View All Categories →
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <Link
              href="/pages/business-partner"
              className="text-sm font-semibold text-gray-700 py-2 px-4 bg-gray-100 hover:bg-[#FD5B00] hover:text-white rounded-lg transition-all whitespace-nowrap flex items-center gap-2"
            >
              <span className="text-base">🤝</span>
              BBMpartner
            </Link>
            <Link
              href="/pages/contactus"
              className="font-semibold text-sm py-2 px-4 bg-gray-100 hover:bg-[#FD5B00] hover:text-white rounded-lg transition-all whitespace-nowrap flex items-center gap-2"
            >
              <span className="text-base">📞</span>
              ENQUIRY
            </Link>
            <Link
              href="/pages/blogs"
              className="font-semibold text-sm py-2 px-4 bg-gray-100 hover:bg-[#FD5B00] hover:text-white rounded-lg transition-all whitespace-nowrap flex items-center gap-2"
            >
              <span className="text-base">📝</span>
              BBVIBE
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/pages/track-order"
              className="flex items-center gap-2 hover:bg-gray-100 p-2 rounded-lg transition-colors"
            >
              <Image
                src="/truck.gif"
                alt="truck"
                width={24}
                height={24}
                className="w-6 h-6"
              />
              <span className="text-sm font-semibold text-gray-700 hidden sm:block">
                Track Order
              </span>
            </Link>
            {!loading && isAuthenticated && (
              <Link
                href="/pages/wallet"
                className="flex items-center gap-2 hover:bg-gray-100 p-2 rounded-lg transition-colors"
              >
                <span className="text-lg">💳</span>
                <div className="hidden sm:flex flex-col">
                  <span className="text-sm font-semibold text-gray-700">
                    Wallet
                  </span>
                  {wallet && (
                    <span className="text-xs text-green-600 font-medium">
                      ₹{wallet.balance?.toFixed(2) || "0.00"}
                    </span>
                  )}
                </div>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Location Dropdown */}
        {isLocationOpen && (
          <div
            className="w-full bg-white rounded-lg shadow-lg border p-3 mb-2 lg:hidden"
            ref={mobileLocationRef}
          >
            <h3 className="font-semibold mb-2 text-sm">Choose your location</h3>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Enter pincode"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="flex-1 min-w-0 p-2 border rounded-lg outline-none focus:border-[#FF6B00] text-sm"
              />
              <button
                onClick={() => {
                  if (pincode) {
                    setLocation(`Area Code: ${pincode}`);
                    setIsLocationOpen(false);
                    setPincode("");
                  }
                }}
                className="px-3 py-2 bg-[#FF6B00] text-white rounded-lg hover:bg-[#e65c00] text-sm font-medium flex-shrink-0"
              >
                Apply
              </button>
            </div>
            <div className="flex gap-2 mb-2">
              <button
                onClick={() => {
                  getCurrentLocation();
                  setIsLocationOpen(false);
                }}
                disabled={isLoadingLocation}
                className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
              >
                <MdLocationOn size={14} />
                {isLoadingLocation ? "Detecting..." : "Use Current Location"}
              </button>
            </div>
            <div className="text-[10px] text-gray-500">
              We'll show products available in your area
            </div>
          </div>
        )}
      </div>

      {/* Mobile Sidebar */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 z-50 lg:hidden">
          <div
            ref={sidebarRef}
            className="fixed top-0 left-0 h-full w-64 sm:w-72 bg-white z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto"
          >
            <div className="p-4 flex justify-between items-center bg-gradient-to-r from-[#FF6B00] to-[#e65c00]">
              {!loading && isAuthenticated ? (
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-2 flex-1 mr-3">
                  <div className="relative">
                    <Image
                      src={getUserProfilePic()}
                      alt="avatar"
                      width={36}
                      height={36}
                      className="rounded-full object-cover border-2 border-white/30"
                      onError={(e) => {
                        e.target.src = "/avatar.gif";
                      }}
                    />
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-white text-sm truncate">
                      {userProfile?.name || currentUser?.name || "User"}
                    </div>
                    <div className="text-white/80 text-xs truncate">
                      Welcome back!
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-white font-semibold text-lg">Menu</div>
              )}
              <button
                className="text-white p-2 hover:bg-white/20 rounded-full transition-colors"
                onClick={() => setIsSidebarOpen(false)}
              >
                <FaTimes size={20} />
              </button>
            </div>

            <div className="p-4">
              {!loading && !isAuthenticated && (
                <div className="mb-4">
                  <div className="flex gap-2">
                    <Link
                      href={"/pages/login"}
                      className="btn-mobile flex-1 text-center font-roboto text-white bg-[#FF6B00] rounded-lg font-semibold text-sm py-2"
                    >
                      Login
                    </Link>
                    <Link
                      href={"/pages/signup"}
                      className="btn-mobile flex-1 text-center font-roboto text-[#FF6B00] bg-white border border-[#FF6B00] rounded-lg font-semibold text-sm py-2"
                    >
                      Sign Up
                    </Link>
                  </div>
                </div>
              )}

              <nav>
                <div className="space-y-2">
                  <Link
                    href="/"
                    className="flex items-center gap-3 py-3 px-4 text-gray-700 hover:bg-[#FD5B00] hover:text-white rounded-lg font-semibold text-sm sm:text-base transition-all"
                  >
                    <span className="text-base">🏠</span>
                    HOME
                  </Link>
                  <Link
                    href="/pages/categories"
                    className="flex items-center gap-3 py-3 px-4 text-gray-700 hover:bg-[#FD5B00] hover:text-white rounded-lg font-semibold text-sm sm:text-base transition-all"
                  >
                    <span className="text-base">📂</span>
                    CATEGORIES
                  </Link>
                  <Link
                    href="/pages/contactus"
                    className="flex items-center gap-3 py-3 px-4 text-gray-700 hover:bg-[#FD5B00] hover:text-white rounded-lg font-semibold text-sm sm:text-base transition-all"
                  >
                    <span className="text-base">📞</span>
                    ENQUIRY
                  </Link>
                  <Link
                    href="/pages/business-partner"
                    className="flex items-center gap-3 py-3 px-4 text-gray-700 hover:bg-[#FD5B00] hover:text-white rounded-lg font-semibold text-sm sm:text-base transition-all"
                  >
                    <span className="text-base">🤝</span>
                    BBM PARTNER
                  </Link>
                  <Link
                    href="/pages/blogs"
                    className="flex items-center gap-3 py-3 px-4 text-gray-700 hover:bg-[#FD5B00] hover:text-white rounded-lg font-semibold text-sm sm:text-base transition-all"
                  >
                    <span className="text-base">📝</span>
                    BBVIBE
                  </Link>
                  <Link
                    href="/pages/dost-connect"
                    className="flex items-center gap-3 py-3 px-4 text-gray-700 hover:bg-[#FD5B00] hover:text-white rounded-lg font-semibold text-sm sm:text-base transition-all"
                  >
                    <span className="text-base">🤝</span>
                    DOST CONNECT
                  </Link>
                  <Link
                    href="/pages/e-partner"
                    className="flex items-center gap-3 py-3 px-4 text-gray-700 hover:bg-[#FD5B00] hover:text-white rounded-lg font-semibold text-sm sm:text-base transition-all"
                  >
                    <span className="text-base">💼</span>
                    E-PARTNER
                  </Link>
                  {isAuthenticated && (
                    <>
                      <div className="border-t my-4"></div>
                      <Link
                        href="/pages/orders"
                        className="flex items-center gap-3 py-3 px-4 text-gray-700 hover:bg-[#FD5B00] hover:text-white rounded-lg font-semibold text-sm sm:text-base transition-all"
                        onClick={() => setIsSidebarOpen(false)}
                      >
                        <span className="text-base">📦</span>
                        ORDER
                      </Link>
                      <Link
                        href="/pages/profile"
                        className="flex items-center gap-3 py-3 px-4 text-gray-700 hover:bg-[#FD5B00] hover:text-white rounded-lg font-semibold text-sm sm:text-base transition-all"
                        onClick={() => setIsSidebarOpen(false)}
                      >
                        <span className="text-base">👤</span>
                        PROFILE
                      </Link>
                      <Link
                        href="/pages/wishlist"
                        className="flex items-center gap-3 py-3 px-4 text-gray-700 hover:bg-[#FD5B00] hover:text-white rounded-lg font-semibold text-sm sm:text-base transition-all"
                        onClick={() => setIsSidebarOpen(false)}
                      >
                        <span className="text-base">❤️</span>
                        WHICHLIST
                      </Link>
                      <Link
                        href="/pages/wallet"
                        className="flex items-center gap-3 py-3 px-4 text-gray-700 hover:bg-[#FD5B00] hover:text-white rounded-lg font-semibold text-sm sm:text-base transition-all"
                        onClick={() => setIsSidebarOpen(false)}
                      >
                        <span className="text-base">💳</span>
                        Wallet
                      </Link>
                      <Link
                        href="/pages/coupons"
                        className="flex items-center gap-3 py-3 px-4 text-gray-700 hover:bg-[#FD5B00] hover:text-white rounded-lg font-semibold text-sm sm:text-base transition-all"
                        onClick={() => setIsSidebarOpen(false)}
                      >
                        <span className="text-base">🎫</span>
                        COUPONS
                      </Link>

                      <Link
                        href="/pages/career"
                        className="flex items-center gap-3 py-3 px-4 text-gray-700 hover:bg-[#FD5B00] hover:text-white rounded-lg font-semibold text-sm sm:text-base transition-all"
                        onClick={() => setIsSidebarOpen(false)}
                      >
                        <span className="text-base">💼</span>
                        CARRER
                      </Link>
                      <Link
                        href="/pages/faq"
                        className="flex items-center gap-3 py-3 px-4 text-gray-700 hover:bg-[#FD5B00] hover:text-white rounded-lg font-semibold text-sm sm:text-base transition-all"
                        onClick={() => setIsSidebarOpen(false)}
                      >
                        <span className="text-base">❓</span>
                        FAQ
                      </Link>
                      <Link
                        href="/pages/support"
                        className="flex items-center gap-3 py-3 px-4 text-gray-700 hover:bg-[#FD5B00] hover:text-white rounded-lg font-semibold text-sm sm:text-base transition-all"
                        onClick={() => setIsSidebarOpen(false)}
                      >
                        <span className="text-base">🛠️</span>
                        SUPPORT
                      </Link>
                      <Link
                        href="/pages/about"
                        className="flex items-center gap-3 py-3 px-4 text-gray-700 hover:bg-[#FD5B00] hover:text-white rounded-lg font-semibold text-sm sm:text-base transition-all"
                        onClick={() => setIsSidebarOpen(false)}
                      >
                        <span className="text-base">ℹ️</span>
                        ABOUT US
                      </Link>
                      <Link
                        href="/pages/settings"
                        className="flex items-center gap-3 py-3 px-4 text-gray-700 hover:bg-[#FD5B00] hover:text-white rounded-lg font-semibold text-sm sm:text-base transition-all"
                        onClick={() => setIsSidebarOpen(false)}
                      >
                        <span className="text-base">⚙️</span>
                        SETTING
                      </Link>
                      <Link
                        href="/pages/refund"
                        className="flex items-center gap-3 py-3 px-4 text-gray-700 hover:bg-[#FD5B00] hover:text-white rounded-lg font-semibold text-sm sm:text-base transition-all"
                        onClick={() => setIsSidebarOpen(false)}
                      >
                        <span className="text-base">💰</span>
                        REFUND
                      </Link>
                      <button
                        onClick={async () => {
                          const result = await handleLogout();
                          if (result) setIsSidebarOpen(false);
                        }}
                        className="flex items-center gap-3 w-full text-left py-3 px-4 text-red-600 hover:bg-red-50 rounded-lg font-semibold text-sm sm:text-base transition-all"
                      >
                        <span className="text-base">🚪</span>
                        LOGOUT
                      </button>
                    </>
                  )}
                </div>
              </nav>

              {/* WhatsApp Button */}
              <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-green-500 rounded-lg text-white text-center">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-xl sm:text-2xl">💬</span>
                  <span className="font-semibold text-sm sm:text-base">
                    WhatsApp
                  </span>
                </div>
              </div>

              <div className="mt-6 sm:mt-8 pt-4 border-t">
                <div className="flex gap-3 sm:gap-4 justify-center">
                  <FaInstagram className="text-black text-lg sm:text-xl" />
                  <SlSocialFacebook className="text-black text-lg sm:text-xl" />
                  <AiOutlineYoutube className="text-black text-lg sm:text-xl" />
                  <CiTwitter className="text-black text-lg sm:text-xl" />
                </div>
                <p className="text-center mt-3 sm:mt-4 text-xs sm:text-sm">
                  Support@bharatronix.com
                  <br />
                  +91 79827 48787
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[9999] lg:hidden">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
          <div className="fixed top-0 right-0 h-full w-72 bg-white shadow-2xl transform translate-x-0 transition-transform duration-300 ease-in-out overflow-y-auto">
            {/* Header */}
            <div className="p-4 flex justify-between items-center border-b bg-[#FF6B00] text-white">
              <h2 className="text-lg font-bold">Menu</h2>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <FaTimes size={20} />
              </button>
            </div>

            {/* Menu Content */}
            <div className="p-3">
              {/* User Section - Only show if authenticated */}
              {isAuthenticated && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Image
                      src={getUserProfilePic()}
                      alt="avatar"
                      width={32}
                      height={32}
                      className="rounded-full object-cover"
                      onError={(e) => {
                        e.target.src = "/avatar.gif";
                      }}
                    />
                    <div>
                      <div className="font-semibold text-gray-800 text-sm">
                        {currentUser?.user_metadata?.name || "User"}
                      </div>
                      <div className="text-xs text-gray-600">
                        {currentUser?.email}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href="/pages/profile"
                      className="text-center py-1.5 px-2 bg-[#FF6B00] text-white rounded-lg text-xs font-medium"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link
                      href="/pages/orders"
                      className="text-center py-1.5 px-2 border border-[#FF6B00] text-[#FF6B00] rounded-lg text-xs font-medium"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Orders
                    </Link>
                  </div>
                </div>
              )}

              {/* Navigation Links */}
              <nav className="space-y-1">
                <Link
                  href="/"
                  className="flex items-center gap-2 py-2.5 px-3 text-gray-700 hover:bg-[#FF6B00] hover:text-white rounded-lg font-medium transition-all text-sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="text-base">🏠</span>
                  Home
                </Link>
                <Link
                  href="/pages/categories"
                  className="flex items-center gap-2 py-2.5 px-3 text-gray-700 hover:bg-[#FF6B00] hover:text-white rounded-lg font-medium transition-all text-sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="text-base">📂</span>
                  All Categories
                </Link>
                <Link
                  href="/pages/business-partner"
                  className="flex items-center gap-2 py-2.5 px-3 text-gray-700 hover:bg-[#FF6B00] hover:text-white rounded-lg font-medium transition-all text-sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="text-base">🤝</span>
                  Business Partner
                </Link>
                <Link
                  href="/pages/contactus"
                  className="flex items-center gap-2 py-2.5 px-3 text-gray-700 hover:bg-[#FF6B00] hover:text-white rounded-lg font-medium transition-all text-sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="text-base">📞</span>
                  Contact Us
                </Link>
                <Link
                  href="/pages/blogs"
                  className="flex items-center gap-2 py-2.5 px-3 text-gray-700 hover:bg-[#FF6B00] hover:text-white rounded-lg font-medium transition-all text-sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="text-base">📝</span>
                  BBVIBE
                </Link>

                {/* Authenticated User Links */}
                {isAuthenticated && (
                  <>
                    <div className="border-t my-2"></div>
                    <Link
                      href="/pages/wishlist"
                      className="flex items-center gap-2 py-2.5 px-3 text-gray-700 hover:bg-[#FF6B00] hover:text-white rounded-lg font-medium transition-all text-sm"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <span className="text-base">❤️</span>
                      Wishlist
                    </Link>
                    <Link
                      href="/pages/wallet"
                      className="flex items-center gap-2 py-2.5 px-3 text-gray-700 hover:bg-[#FF6B00] hover:text-white rounded-lg font-medium transition-all text-sm"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <span className="text-base">💳</span>
                      <div className="flex-1">
                        <div>Wallet</div>
                        {wallet && (
                          <div className="text-xs text-green-600">
                            ₹{wallet.balance?.toFixed(2) || "0.00"}
                          </div>
                        )}
                      </div>
                    </Link>
                    <Link
                      href="/pages/track-order"
                      className="flex items-center gap-2 py-2.5 px-3 text-gray-700 hover:bg-[#FF6B00] hover:text-white rounded-lg font-medium transition-all text-sm"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <span className="text-base">🚚</span>
                      Track Order
                    </Link>
                  </>
                )}
              </nav>

              {/* Auth Buttons for non-authenticated users */}
              {!isAuthenticated && (
                <div className="mt-4 space-y-2">
                  <div className="border-t pt-3"></div>
                  <Link
                    href="/pages/login"
                    className="block w-full text-center py-2.5 px-3 bg-[#FF6B00] text-white rounded-lg font-semibold text-sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/pages/signup"
                    className="block w-full text-center py-2.5 px-3 border border-[#FF6B00] text-[#FF6B00] rounded-lg font-semibold text-sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}

              {/* Logout for authenticated users */}
              {isAuthenticated && (
                <div className="mt-4 pt-3 border-t">
                  <button
                    onClick={async () => {
                      const result = await handleLogout();
                      if (result) setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-2 w-full py-2.5 px-3 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-all text-sm"
                  >
                    <span className="text-base">🚪</span>
                    Logout
                  </button>
                </div>
              )}

              {/* Contact Info */}
              <div className="mt-4 pt-3 border-t text-center">
                <div className="text-xs text-gray-600 mb-1">Need Help?</div>
                <div className="text-xs font-medium text-gray-800">
                  +91 79827 48787
                </div>
                <div className="text-[10px] text-gray-500">
                  Support@bharatronix.com
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <TrackOrderModal
        isOpen={isTrackOrderOpen}
        onClose={() => setIsTrackOrderOpen(false)}
      />
    </div>
  );
}

export default Header;
