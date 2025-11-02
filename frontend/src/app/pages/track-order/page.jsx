"use client";
import { useState } from "react";
import {
  FaSearch,
  FaBox,
  FaTruck,
  FaMapMarkerAlt,
  FaCheck,
  FaUser,
  FaPhone,
} from "react-icons/fa";
import Link from "next/link";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://big-best-backend.vercel.app/api";

const TrackOrderPage = () => {
  const [activeTab, setActiveTab] = useState("track");
  const [orderId, setOrderId] = useState("");
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!orderId.trim()) {
      setError("Please enter an Order ID");
      return;
    }
    if (!emailOrPhone.trim()) {
      setError("Please enter email or phone number");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/tracking/order/${orderId}`);
      const result = await response.json();

      if (result.success) {
        setTrackingData(result);
      } else {
        setError(result.message || "Order not found");
        setTrackingData(null);
      }
    } catch (err) {
      setError("Failed to fetch tracking information");
      setTrackingData(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case "placed":
        return "📝";
      case "confirmed":
        return "✅";
      case "processing":
        return "⚙️";
      case "packed":
        return "📦";
      case "shipped":
        return "🚚";
      case "out_for_delivery":
        return "🏃";
      case "delivered":
        return "🎉";
      default:
        return "📋";
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "placed":
        return "bg-blue-100 text-blue-800";
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "packed":
        return "bg-orange-100 text-orange-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "out_for_delivery":
        return "bg-indigo-100 text-indigo-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="bg-blue-600 p-3 rounded-full">
              <FaTruck className="text-white text-2xl" />
            </div>
            <h1 className="text-3xl font-bold text-blue-900">
              Track Your Orders
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Enter your order details to track your shipment
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-white rounded-xl shadow-sm border mb-8 p-1">
          <button
            onClick={() => setActiveTab("track")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all ${
              activeTab === "track"
                ? "bg-orange-500 text-white shadow-md"
                : "text-gray-600 hover:text-orange-500"
            }`}
          >
            <FaSearch className="text-sm" />
            Track by Order ID
          </button>
          <Link
            href="/pages/orders"
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all text-gray-600 hover:text-orange-500 hover:bg-orange-50"
          >
            <FaUser className="text-sm" />
            My Orders
          </Link>
        </div>

        {/* Track Order Form - Always Visible */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl shadow-lg border-2 border-orange-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-orange-800 mb-6 text-center">
            Track Your Order
          </h2>

          <form onSubmit={handleSearch} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-orange-700 mb-2">
                Order ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="Enter your order ID"
                className="w-full px-4 py-4 border-2 border-orange-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-lg bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-orange-700 mb-2">
                Email or Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FaPhone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-orange-400" />
                <input
                  type="text"
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  placeholder="Enter email or phone number"
                  className="w-full pl-12 pr-4 py-4 border-2 border-orange-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-lg bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
            >
              <FaSearch className="text-lg" />
              {loading ? "Tracking Order..." : "Track Order"}
            </button>
          </form>

          {error && (
            <div className="mt-6 p-4 bg-red-50 border-2 border-red-200 text-red-700 rounded-xl">
              <div className="flex items-center gap-2">
                <span className="text-red-500">⚠️</span>
                {error}
              </div>
            </div>
          )}
        </div>

        {/* Tracking Results */}
        {trackingData && (
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-2xl shadow-lg border p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    Order #{trackingData.order.id.slice(0, 8)}
                  </h2>
                  <p className="text-gray-600 text-lg">
                    Placed on{" "}
                    {new Date(
                      trackingData.order.created_at
                    ).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(
                    trackingData.order.status
                  )}`}
                >
                  {trackingData.order.status.toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-xl">
                  <p className="text-sm text-blue-600 font-medium">
                    Total Amount
                  </p>
                  <p className="text-2xl font-bold text-blue-800">
                    ₹{trackingData.order.total}
                  </p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-xl">
                  <p className="text-sm text-green-600 font-medium">Items</p>
                  <p className="text-2xl font-bold text-green-800">
                    {trackingData.order.order_items?.length || 0} items
                  </p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-xl">
                  <p className="text-sm text-purple-600 font-medium">
                    Current Location
                  </p>
                  <p className="text-lg font-bold text-purple-800">
                    {trackingData.order.current_location || "Processing Center"}
                  </p>
                </div>
              </div>
            </div>

            {/* Tracking Timeline */}
            <div className="bg-white rounded-2xl shadow-lg border p-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-8 text-center">
                Tracking Timeline
              </h3>

              {trackingData.tracking.length > 0 ? (
                <div className="relative">
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 to-green-500"></div>
                  <div className="space-y-8">
                    {trackingData.tracking.map((update, index) => (
                      <div key={update.id} className="flex items-start gap-6">
                        <div className="flex-shrink-0 relative z-10">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                            <span className="text-xl">
                              {getStatusIcon(update.status)}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1 bg-gray-50 rounded-xl p-6">
                          <div className="flex items-center gap-3 mb-3">
                            <h4 className="text-xl font-bold text-gray-800">
                              {update.status.replace("_", " ").toUpperCase()}
                            </h4>
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                                update.status
                              )}`}
                            >
                              {update.status}
                            </span>
                          </div>
                          <p className="text-gray-700 text-lg mb-3">
                            {update.description}
                          </p>
                          {update.location && (
                            <p className="text-gray-600 flex items-center gap-2 mb-2">
                              <FaMapMarkerAlt className="text-blue-500" />
                              <span className="font-medium">
                                {update.location}
                              </span>
                            </p>
                          )}
                          <p className="text-gray-500 text-sm">
                            📅 {new Date(update.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                    <FaBox className="h-12 w-12 text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-xl">
                    No tracking updates available yet
                  </p>
                  <p className="text-gray-400 mt-2">
                    Your order is being processed
                  </p>
                </div>
              )}
            </div>

            {/* Order Items */}
            {trackingData.order.order_items &&
              trackingData.order.order_items.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg border p-8">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                    Order Items
                  </h3>
                  <div className="space-y-4">
                    {trackingData.order.order_items.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-6 p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200 hover:shadow-md transition-all"
                      >
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center shadow-sm">
                          <span className="text-2xl">📦</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-xl font-bold text-gray-800 mb-2">
                            {item.products?.name || "Product"}
                          </h4>
                          <div className="flex items-center gap-4">
                            <p className="text-gray-600">
                              Qty:{" "}
                              <span className="font-semibold">
                                {item.quantity}
                              </span>
                            </p>
                            <p className="text-2xl font-bold text-blue-600">
                              ₹{item.price}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackOrderPage;
