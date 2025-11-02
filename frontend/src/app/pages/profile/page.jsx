"use client";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import {
  getUserProfile,
  uploadProfileImage,
  deleteProfileImage,
  getUserOrders,
} from "@/api/userApi";
import {
  FaCamera,
  FaTrash,
  FaEdit,
  FaSave,
  FaTimes,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaShoppingBag,
  FaEye,
  FaArrowLeft,
  FaCheck,
} from "react-icons/fa";
import WalletSection from "@/components/profile/WalletSection";
import Image from "next/image";
import supabase from "@/services/supabase";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://big-best-backend.vercel.app/api";

function ProfilePage() {
  const { currentUser, logout, userProfile, setUserProfile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [orders, setOrders] = useState([]);
  const [returnOrders, setReturnOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderActiveTab, setOrderActiveTab] = useState("tracking");
  const [trackingModalOpen, setTrackingModalOpen] = useState(false);
  const [trackingTimeline, setTrackingTimeline] = useState([]);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [returnStatusFilter, setReturnStatusFilter] = useState("all");
  const [imageUploading, setImageUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Form state for editing
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    companyName: "",
    gstin: "",
    accountType: "",
  });

  useEffect(() => {
    if (currentUser) {
      // Set form data from current user metadata
      setFormData({
        name: currentUser.user_metadata?.name || "",
        phone: currentUser.user_metadata?.phone || "",
        companyName: currentUser.user_metadata?.companyName || "",
        gstin: currentUser.user_metadata?.gstin || "",
        accountType: currentUser.user_metadata?.accountType || "",
      });
    }
  }, [currentUser]);

  const fetchUserOrders = async () => {
    setOrdersLoading(true);
    try {
      const result = await getUserOrders(50, 0);
      if (result.success) {
        setOrders(result.orders || []);
      } else {
        toast.error("Failed to fetch orders");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to fetch orders");
    } finally {
      setOrdersLoading(false);
    }
  };

  const fetchReturnOrders = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/return-orders/user/${currentUser?.id}`
      );
      const result = await response.json();
      if (result.success) {
        setReturnOrders(result.return_requests || []);
      }
    } catch (error) {
      console.error("Error fetching return orders:", error);
    }
  };

  useEffect(() => {
    if (activeTab === "orders" && orders.length === 0) {
      fetchUserOrders();
    }
    if (activeTab === "orders" && orderActiveTab === "return") {
      fetchReturnOrders();
    }
  }, [activeTab, orderActiveTab]);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setImageUploading(true);
    try {
      const result = await uploadProfileImage(file);
      if (result.success) {
        toast.success("Profile image updated successfully!");
        // Update user profile in context
        setUserProfile(result.user);
      } else {
        toast.error(result.error || "Failed to upload image");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    } finally {
      setImageUploading(false);
    }
  };

  const handleDeleteImage = async () => {
    if (
      !window.confirm("Are you sure you want to delete your profile image?")
    ) {
      return;
    }

    setImageUploading(true);
    try {
      const result = await deleteProfileImage();
      if (result.success) {
        toast.success("Profile image deleted successfully!");
        setUserProfile(result.user);
      } else {
        toast.error(result.error || "Failed to delete image");
      }
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("Failed to delete image");
    } finally {
      setImageUploading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const result = await logout();
      if (result && result.success) {
        toast.success("Logged out successfully!");
        router.push("/pages/login");
      } else {
        toast.error(result?.error || "Logout failed");
      }
    } catch (error) {
      toast.error("Error logging out");
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      // Update user metadata in Supabase
      const { error } = await supabase.auth.updateUser({
        data: formData,
      });

      if (error) {
        throw error;
      }

      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getReturnStatusCounts = () => {
    const counts = {
      all: returnOrders.length,
      pending: returnOrders.filter((o) => o.status === "pending").length,
      approved: returnOrders.filter((o) => o.status === "approved").length,
      processing: returnOrders.filter((o) => o.status === "processing").length,
      completed: returnOrders.filter((o) => o.status === "completed").length,
      rejected: returnOrders.filter((o) => o.status === "rejected").length,
      cancelled: returnOrders.filter((o) => o.status === "cancelled").length,
    };
    return counts;
  };

  const getFilteredReturnOrders = () => {
    if (returnStatusFilter === "all") {
      return returnOrders;
    }
    return returnOrders.filter((order) => order.status === returnStatusFilter);
  };

  const returnStatusCounts = getReturnStatusCounts();
  const filteredReturnOrders = getFilteredReturnOrders();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-2 sm:py-4 lg:py-6">
        <div className="container-responsive max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden min-h-[500px] flex flex-col lg:flex-row">
            {/* Sidebar */}
            <div className="w-full lg:w-80 bg-gradient-to-b from-orange-100 to-orange-200 flex flex-col h-auto lg:h-full">
              {/* Header */}
              <div className="p-3 sm:p-4 border-b border-orange-300">
                <h1 className="text-lg sm:text-xl font-bold text-gray-800">
                  My Profile
                </h1>
              </div>

              {/* Menu Items */}
              <div className="flex-1 p-3 sm:p-4">
                <nav className="space-y-1">
                  <button
                    onClick={() => setActiveTab("profile")}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-all font-medium text-sm ${
                      activeTab === "profile"
                        ? "bg-[#FF6B00] text-white shadow-md"
                        : "text-gray-700 hover:bg-orange-300"
                    }`}
                  >
                    Account Details
                  </button>
                  <button
                    onClick={() => setActiveTab("orders")}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-all font-medium text-sm ${
                      activeTab === "orders"
                        ? "bg-[#FF6B00] text-white shadow-md"
                        : "text-gray-700 hover:bg-orange-300"
                    }`}
                  >
                    Orders
                  </button>
                  <button className="w-full text-left px-3 py-2 rounded-lg transition-all font-medium text-sm text-gray-700 hover:bg-orange-300">
                    Return Requests
                  </button>
                  <button className="w-full text-left px-3 py-2 rounded-lg transition-all font-medium text-sm text-gray-700 hover:bg-orange-300">
                    Addresses
                  </button>
                  <button
                    onClick={() => setActiveTab("wallet")}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-all font-medium text-sm ${
                      activeTab === "wallet"
                        ? "bg-[#FF6B00] text-white shadow-md"
                        : "text-gray-700 hover:bg-orange-300"
                    }`}
                  >
                    My Wallet
                  </button>
                  <button className="w-full text-left px-3 py-2 rounded-lg transition-all font-medium text-sm text-gray-700 hover:bg-orange-300">
                    Bulk Request
                  </button>
                  <button className="w-full text-left px-3 py-2 rounded-lg transition-all font-medium text-sm text-gray-700 hover:bg-orange-300">
                    Help & Support
                  </button>
                  <button className="w-full text-left px-3 py-2 rounded-lg transition-all font-medium text-sm text-gray-700 hover:bg-orange-300">
                    Loyalty
                  </button>
                </nav>
              </div>

              {/* Divider */}
              <div className="px-3 sm:px-4">
                <div className="border-t border-orange-300"></div>
              </div>

              {/* Logout */}
              <div className="p-3 sm:p-4">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-100 rounded-lg transition-all font-medium text-sm border border-red-200 hover:border-red-300"
                >
                  Logout
                </button>
              </div>
            </div>

            {/* Main Content */}
            {activeTab === "profile" && (
              <div className="flex-1 bg-white p-3 sm:p-4 lg:p-6 overflow-y-auto">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">
                  Profile Details
                </h2>

                {/* Profile Avatar and Edit Button */}
                <div className="flex flex-col items-center mb-4">
                  <div className="relative">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center mb-3 shadow-lg border-2 border-white overflow-hidden">
                      {userProfile?.photo_url ||
                      currentUser?.user_metadata?.avatar_url ? (
                        <Image
                          src={
                            userProfile?.photo_url ||
                            currentUser?.user_metadata?.avatar_url
                          }
                          alt="Profile"
                          width={128}
                          height={128}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-lg sm:text-xl font-bold text-white">
                          {currentUser?.user_metadata?.name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2) ||
                            currentUser?.email?.slice(0, 2).toUpperCase() ||
                            "US"}
                        </span>
                      )}
                    </div>
                    {imageUploading && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      </div>
                    )}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={imageUploading}
                      className="absolute bottom-0 right-0 bg-[#FF6B00] hover:bg-[#e65c00] text-white p-2 rounded-full shadow-lg transition-colors"
                    >
                      <FaCamera className="w-3 h-3" />
                    </button>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="bg-[#FF6B00] hover:bg-[#e65c00] text-white px-4 py-2 rounded-lg font-medium transition-all text-sm shadow-md"
                  >
                    {isEditing ? "Cancel" : "Edit"}
                  </button>
                  {(userProfile?.photo_url ||
                    currentUser?.user_metadata?.avatar_url) && (
                    <button
                      onClick={handleDeleteImage}
                      disabled={imageUploading}
                      className="mt-2 text-red-600 hover:text-red-700 text-sm font-medium transition-colors"
                    >
                      Remove Photo
                    </button>
                  )}
                </div>

                {/* Profile Information Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {/* First Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#FF6B00] text-sm bg-white"
                      />
                    ) : (
                      <div className="text-gray-800 text-sm bg-gray-50 p-2 rounded-lg border border-gray-200">
                        {formData.name || "Not provided"}
                      </div>
                    )}
                  </div>

                  {/* Last Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="lastName"
                        value={formData.name?.split(" ")[1] || ""}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#FF6B00] text-sm bg-white"
                      />
                    ) : (
                      <div className="text-gray-800 text-sm bg-gray-50 p-2 rounded-lg border border-gray-200">
                        {formData.name?.split(" ")[1] || "singh"}
                      </div>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <div className="text-gray-800 text-sm bg-gray-50 p-2 rounded-lg border border-gray-200 break-all">
                      {currentUser?.email}
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#FF6B00] text-sm bg-white"
                      />
                    ) : (
                      <div className="text-gray-800 text-sm bg-gray-50 p-2 rounded-lg border border-gray-200">
                        {formData.phone || "9310433939"}
                      </div>
                    )}
                  </div>

                  {/* Addresses */}
                  <div className="col-span-1 sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Addresses
                    </label>
                    {isEditing ? (
                      <textarea
                        name="address"
                        defaultValue="abesit boy hostel, Gaziabad, 201016"
                        rows={2}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#FF6B00] text-sm bg-white"
                      />
                    ) : (
                      <div className="text-gray-800 text-sm bg-gray-50 p-2 rounded-lg border border-gray-200">
                        abesit boy hostel, Gaziabad, 201016
                      </div>
                    )}
                  </div>
                </div>

                {/* Save Button - Only show when editing */}
                {isEditing && (
                  <div className="mt-4 text-center">
                    <button
                      onClick={handleSaveProfile}
                      disabled={loading}
                      className="bg-[#FF6B00] hover:bg-[#e65c00] text-white px-6 py-2 rounded-lg font-medium transition-all text-sm shadow-md"
                    >
                      {loading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline-block mr-2"></div>
                      ) : null}
                      Save Changes
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Wallet Tab */}
            {activeTab === "wallet" && (
              <div className="flex-1 bg-white p-3 sm:p-4 lg:p-6 overflow-y-auto">
                <WalletSection />
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === "orders" && (
              <div className="flex-1 bg-white p-3 sm:p-4 lg:p-6 overflow-y-auto">
                {selectedOrder ? (
                  /* Order Details View */
                  <div>
                    <button
                      onClick={() => setSelectedOrder(null)}
                      className="flex items-center gap-2 text-[#FF6B00] hover:text-[#e65c00] mb-6 font-medium"
                    >
                      <FaArrowLeft />
                      Back to Orders
                    </button>

                    <div className="bg-white rounded-lg border overflow-hidden">
                      <div className="px-6 py-4 border-b">
                        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
                          <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                              Order #{selectedOrder.id}
                            </h1>
                            <p className="text-gray-600">
                              Placed on {formatDate(selectedOrder.created_at)}
                            </p>
                          </div>
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                              selectedOrder.status
                            )}`}
                          >
                            {selectedOrder.status.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      <div className="p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          <div className="lg:col-span-2">
                            <h3 className="text-lg font-semibold mb-4">
                              Order Items
                            </h3>
                            {selectedOrder.order_items?.map((item, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-4 p-4 border rounded-lg mb-4"
                              >
                                {item.products?.image && (
                                  <Image
                                    src={item.products.image}
                                    alt={item.products.name}
                                    width={80}
                                    height={80}
                                    className="rounded-lg object-cover"
                                  />
                                )}
                                <div className="flex-1">
                                  <h4 className="font-medium">
                                    {item.products?.name || "Product"}
                                  </h4>
                                  <p className="text-gray-600">
                                    Quantity: {item.quantity}
                                  </p>
                                  <p className="text-lg font-semibold text-[#FF6B00]">
                                    ₹{item.price} each
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-lg font-bold">
                                    ₹{(item.price * item.quantity).toFixed(2)}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div>
                            <h3 className="text-lg font-semibold mb-4">
                              Order Summary
                            </h3>
                            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                              <div className="flex justify-between">
                                <span>Subtotal:</span>
                                <span>₹{selectedOrder.subtotal}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Shipping:</span>
                                <span>₹{selectedOrder.shipping}</span>
                              </div>
                              <div className="border-t pt-3">
                                <div className="flex justify-between font-bold text-lg">
                                  <span>Total:</span>
                                  <span className="text-[#FF6B00]">
                                    ₹{selectedOrder.total}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Orders List View */
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-medium text-gray-900">
                        My Orders
                      </h3>
                      <button
                        onClick={fetchUserOrders}
                        disabled={ordersLoading}
                        className="bg-[#FF6B00] hover:bg-[#e65c00] text-white px-4 py-2 rounded text-sm"
                      >
                        {ordersLoading ? "Loading..." : "Refresh"}
                      </button>
                    </div>

                    {/* Tab Navigation */}
                    <div className="grid grid-cols-3 gap-2 mb-6">
                      <button
                        onClick={() => setOrderActiveTab("tracking")}
                        className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                          orderActiveTab === "tracking"
                            ? "bg-blue-500 text-white"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        Tracking
                      </button>
                      <button
                        onClick={() => setOrderActiveTab("history")}
                        className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                          orderActiveTab === "history"
                            ? "bg-blue-500 text-white"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        History
                      </button>
                      <button
                        onClick={() => setOrderActiveTab("return")}
                        className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                          orderActiveTab === "return"
                            ? "bg-blue-500 text-white"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        Return
                      </button>
                    </div>

                    {ordersLoading ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6B00]"></div>
                      </div>
                    ) : (
                      <div>
                        {orderActiveTab === "tracking" && (
                          <div>
                            {orders.length === 0 ? (
                              <div className="text-center py-8">
                                <FaShoppingBag className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                <p className="text-gray-500">
                                  No orders to track
                                </p>
                              </div>
                            ) : (
                              orders.map((order) => (
                                <div
                                  key={order.id}
                                  className="border border-gray-200 rounded-lg p-4 mb-4"
                                >
                                  <div className="flex justify-between items-start mb-3">
                                    <div>
                                      <h3 className="font-semibold">
                                        Order #{order.id}
                                      </h3>
                                      <p className="text-sm text-gray-600">
                                        Placed on {formatDate(order.created_at)}
                                      </p>
                                    </div>
                                    <span
                                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                                        order.status === "cancelled"
                                          ? "bg-red-100 text-red-800"
                                          : order.status === "delivered"
                                          ? "bg-green-100 text-green-800"
                                          : "bg-yellow-100 text-yellow-800"
                                      }`}
                                    >
                                      {order.status.toUpperCase()}
                                    </span>
                                  </div>

                                  <div className="mb-4">
                                    <p className="text-sm font-medium mb-2">
                                      Items ({order.order_items?.length || 0})
                                    </p>
                                    {order.order_items
                                      ?.slice(0, 1)
                                      .map((item, index) => (
                                        <div
                                          key={index}
                                          className="flex items-center gap-3"
                                        >
                                          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                                            📦
                                          </div>
                                          <div>
                                            <p className="font-medium">
                                              {item.products?.name || "Product"}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                              Qty: {item.quantity} | ₹
                                              {item.price}
                                            </p>
                                          </div>
                                        </div>
                                      ))}
                                  </div>

                                  {/* Tracking Progress */}
                                  <div className="mb-6">
                                    <p className="text-sm font-medium mb-3">
                                      Tracking Progress
                                    </p>
                                    <div className="relative pb-4">
                                      <div
                                        className="absolute left-4 top-8 w-0.5 bg-gray-200"
                                        style={{
                                          height:
                                            order.status === "cancelled"
                                              ? "64px"
                                              : "32px",
                                        }}
                                      ></div>
                                      <div
                                        className="absolute left-4 top-8 w-0.5 bg-green-500"
                                        style={{
                                          height:
                                            order.status === "cancelled"
                                              ? "64px"
                                              : "32px",
                                        }}
                                      ></div>

                                      <div className="space-y-4">
                                        <div className="flex items-center gap-3 relative">
                                          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center z-10">
                                            <FaCheck className="text-white text-sm" />
                                          </div>
                                          <div>
                                            <p className="font-medium">
                                              Order Placed
                                            </p>
                                            <p className="text-sm text-gray-600">
                                              {formatDate(order.created_at)}
                                            </p>
                                          </div>
                                        </div>
                                        {order.status === "cancelled" && (
                                          <div className="flex items-center gap-3 relative">
                                            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center z-10">
                                              <FaTimes className="text-white text-sm" />
                                            </div>
                                            <div>
                                              <p className="font-medium">
                                                Order Cancelled
                                              </p>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => setSelectedOrder(order)}
                                      className="flex-1 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
                                    >
                                      View Details
                                    </button>
                                    <button
                                      onClick={async () => {
                                        try {
                                          setTrackingLoading(true);
                                          const { getOrderTracking } =
                                            await import("@/api/trackingApi");
                                          const res = await getOrderTracking(
                                            order.id
                                          );
                                          if (res?.success) {
                                            setTrackingTimeline(
                                              res.tracking || []
                                            );
                                            setTrackingModalOpen(true);
                                          } else {
                                            alert(
                                              "Failed to fetch tracking data"
                                            );
                                          }
                                        } catch (err) {
                                          console.error(err);
                                          alert(
                                            "Failed to fetch tracking data"
                                          );
                                        } finally {
                                          setTrackingLoading(false);
                                        }
                                      }}
                                      className="flex-1 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600"
                                    >
                                      {trackingLoading
                                        ? "Loading..."
                                        : "Track Package"}
                                    </button>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                        {/* Tracking Modal */}
                        {trackingModalOpen && (
                          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                            <div className="bg-white rounded-lg w-11/12 max-w-xl p-6">
                              <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold">
                                  Tracking
                                </h3>
                                <button
                                  onClick={() => setTrackingModalOpen(false)}
                                  className="text-gray-600"
                                >
                                  Close
                                </button>
                              </div>
                              <div className="space-y-3">
                                {trackingTimeline.length === 0 ? (
                                  <div className="text-center text-gray-500">
                                    No tracking data available
                                  </div>
                                ) : (
                                  trackingTimeline.map((step, idx) => (
                                    <div
                                      key={idx}
                                      className="flex items-start gap-3"
                                    >
                                      <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center">
                                        {idx + 1}
                                      </div>
                                      <div>
                                        <div className="font-medium">
                                          {step.title}
                                        </div>
                                        {step.timestamp && (
                                          <div className="text-sm text-gray-500">
                                            {new Date(
                                              step.timestamp
                                            ).toLocaleString()}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {orderActiveTab === "history" && (
                          <div>
                            {orders.length === 0 ? (
                              <div className="text-center py-8">
                                <FaShoppingBag className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                <p className="text-gray-500">
                                  No order history
                                </p>
                              </div>
                            ) : (
                              orders.map((order) => (
                                <div
                                  key={order.id}
                                  className="border border-gray-200 rounded-lg p-4 mb-4"
                                >
                                  <div className="flex justify-between items-start mb-3">
                                    <div>
                                      <h3 className="font-semibold">
                                        Order #{order.id}
                                      </h3>
                                      <p className="text-sm text-gray-600">
                                        {formatDate(order.created_at)}
                                      </p>
                                      <p className="text-sm font-medium">
                                        Total: ₹{order.total}
                                      </p>
                                    </div>
                                    <span
                                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                        order.status
                                      )}`}
                                    >
                                      {order.status.toUpperCase()}
                                    </span>
                                  </div>

                                  <div className="mb-4">
                                    <p className="text-sm font-medium mb-2">
                                      Items ({order.order_items?.length || 0})
                                    </p>
                                    {order.order_items
                                      ?.slice(0, 1)
                                      .map((item, index) => (
                                        <div
                                          key={index}
                                          className="flex items-center gap-3"
                                        >
                                          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                                            📦
                                          </div>
                                          <div>
                                            <p className="font-medium">
                                              {item.products?.name || "Product"}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                              Qty: {item.quantity} | ₹
                                              {item.price}
                                            </p>
                                          </div>
                                        </div>
                                      ))}
                                  </div>

                                  <button
                                    onClick={() => setSelectedOrder(order)}
                                    className="w-full py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
                                  >
                                    View Details
                                  </button>
                                </div>
                              ))
                            )}
                          </div>
                        )}

                        {orderActiveTab === "return" && (
                          <div>
                            {/* Return Status Filter Tabs */}
                            <div className="grid grid-cols-3 gap-2 mb-6">
                              <button
                                onClick={() => setReturnStatusFilter("all")}
                                className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                                  returnStatusFilter === "all"
                                    ? "bg-blue-500 text-white"
                                    : "bg-gray-100 text-gray-700"
                                }`}
                              >
                                All{" "}
                                {returnStatusCounts.all > 0 && (
                                  <span className="ml-1">
                                    {returnStatusCounts.all}
                                  </span>
                                )}
                              </button>
                              <button
                                onClick={() => setReturnStatusFilter("pending")}
                                className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                                  returnStatusFilter === "pending"
                                    ? "bg-blue-500 text-white"
                                    : "bg-gray-100 text-gray-700"
                                }`}
                              >
                                Pending{" "}
                                {returnStatusCounts.pending > 0 && (
                                  <span className="ml-1">
                                    {returnStatusCounts.pending}
                                  </span>
                                )}
                              </button>
                              <button
                                onClick={() =>
                                  setReturnStatusFilter("approved")
                                }
                                className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                                  returnStatusFilter === "approved"
                                    ? "bg-blue-500 text-white"
                                    : "bg-gray-100 text-gray-700"
                                }`}
                              >
                                Approved{" "}
                                {returnStatusCounts.approved > 0 && (
                                  <span className="ml-1">
                                    {returnStatusCounts.approved}
                                  </span>
                                )}
                              </button>
                              <button
                                onClick={() =>
                                  setReturnStatusFilter("processing")
                                }
                                className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                                  returnStatusFilter === "processing"
                                    ? "bg-blue-500 text-white"
                                    : "bg-gray-100 text-gray-700"
                                }`}
                              >
                                Processing{" "}
                                {returnStatusCounts.processing > 0 && (
                                  <span className="ml-1">
                                    {returnStatusCounts.processing}
                                  </span>
                                )}
                              </button>
                              <button
                                onClick={() =>
                                  setReturnStatusFilter("completed")
                                }
                                className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                                  returnStatusFilter === "completed"
                                    ? "bg-blue-500 text-white"
                                    : "bg-gray-100 text-gray-700"
                                }`}
                              >
                                Completed{" "}
                                {returnStatusCounts.completed > 0 && (
                                  <span className="ml-1">
                                    {returnStatusCounts.completed}
                                  </span>
                                )}
                              </button>
                              <button
                                onClick={() =>
                                  setReturnStatusFilter("rejected")
                                }
                                className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                                  returnStatusFilter === "rejected"
                                    ? "bg-blue-500 text-white"
                                    : "bg-gray-100 text-gray-700"
                                }`}
                              >
                                Rejected{" "}
                                {returnStatusCounts.rejected > 0 && (
                                  <span className="ml-1">
                                    {returnStatusCounts.rejected}
                                  </span>
                                )}
                              </button>
                              <button
                                onClick={() =>
                                  setReturnStatusFilter("cancelled")
                                }
                                className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                                  returnStatusFilter === "cancelled"
                                    ? "bg-blue-500 text-white"
                                    : "bg-gray-100 text-gray-700"
                                }`}
                              >
                                Cancelled{" "}
                                {returnStatusCounts.cancelled > 0 && (
                                  <span className="ml-1">
                                    {returnStatusCounts.cancelled}
                                  </span>
                                )}
                              </button>
                            </div>

                            {filteredReturnOrders.length === 0 ? (
                              <div className="text-center py-8">
                                <FaShoppingBag className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                <p className="text-gray-500">
                                  No return requests found
                                </p>
                              </div>
                            ) : (
                              filteredReturnOrders.map((returnOrder) => (
                                <div
                                  key={returnOrder.id}
                                  className="border border-gray-200 rounded-lg p-4 mb-4"
                                >
                                  <div className="flex justify-between items-start mb-3">
                                    <div>
                                      <h3 className="font-semibold">
                                        Return Request #
                                        {returnOrder.id.slice(0, 8)}
                                      </h3>
                                      <p className="text-sm text-gray-600">
                                        Submitted:{" "}
                                        {formatDate(returnOrder.created_at)}
                                      </p>
                                      <p className="text-sm text-gray-600">
                                        Order: #
                                        {returnOrder.order_id.slice(0, 8)}
                                      </p>
                                    </div>
                                    <div className="flex gap-2">
                                      <span
                                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                                          returnOrder.status === "pending"
                                            ? "bg-yellow-100 text-yellow-800"
                                            : returnOrder.status === "approved"
                                            ? "bg-green-100 text-green-800"
                                            : returnOrder.status === "rejected"
                                            ? "bg-red-100 text-red-800"
                                            : returnOrder.status ===
                                              "processing"
                                            ? "bg-blue-100 text-blue-800"
                                            : returnOrder.status === "completed"
                                            ? "bg-gray-100 text-gray-800"
                                            : "bg-gray-100 text-gray-800"
                                        }`}
                                      >
                                        {returnOrder.status.toUpperCase()}
                                      </span>
                                      <span
                                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                                          returnOrder.return_type === "return"
                                            ? "bg-purple-100 text-purple-800"
                                            : "bg-orange-100 text-orange-800"
                                        }`}
                                      >
                                        {returnOrder.return_type.toUpperCase()}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                      <p className="text-sm font-medium">
                                        Refund Amount:
                                      </p>
                                      <p className="text-lg font-bold text-green-600">
                                        ₹
                                        {returnOrder.refund_amount?.toFixed(
                                          2
                                        ) || "0.00"}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium">
                                        Order Total:
                                      </p>
                                      <p className="text-sm font-bold">
                                        ₹
                                        {returnOrder.order_total?.toFixed(2) ||
                                          "0.00"}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="mb-4">
                                    <p className="text-sm font-medium mb-2">
                                      Reason:
                                    </p>
                                    <p className="text-sm text-gray-600">
                                      {returnOrder.reason ||
                                        "No reason provided"}
                                    </p>
                                  </div>

                                  <button className="w-full py-2 border border-blue-500 text-blue-500 rounded-lg text-sm font-medium hover:bg-blue-50">
                                    View Details
                                  </button>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default ProfilePage;
