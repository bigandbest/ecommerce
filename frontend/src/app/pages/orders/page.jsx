"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { toast } from "react-toastify";
import { getUserOrders } from "@/api/userApi";
import { getOrderTracking } from "@/api/trackingApi";
import { FaShoppingBag, FaArrowLeft, FaCheck, FaTimes } from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";
import TrackingProgress from "@/components/TrackingProgress";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://big-best-backend.vercel.app/api";

function OrdersPage() {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [returnOrders, setReturnOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [trackingModalOpen, setTrackingModalOpen] = useState(false);
  const [trackingTimeline, setTrackingTimeline] = useState([]);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("tracking");
  const [returnStatusFilter, setReturnStatusFilter] = useState("all");

  useEffect(() => {
    fetchUserOrders();
    if (activeTab === "return") {
      fetchReturnOrders();
    }
  }, [activeTab]);

  const fetchUserOrders = async () => {
    setLoading(true);
    try {
      const result = await getUserOrders(50, 0); // Get more orders for this dedicated page
      if (result.success) {
        setOrders(result.orders || []);
      } else {
        toast.error("Failed to fetch orders");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return "⏳";
      case "confirmed":
        return "✅";
      case "shipped":
        return "🚚";
      case "delivered":
        return "📦";
      case "cancelled":
        return "❌";
      default:
        return "📋";
    }
  };

  if (selectedOrder) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 py-4 lg:py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Back Button */}
            <button
              onClick={() => setSelectedOrder(null)}
              className="flex items-center gap-2 text-[#FF6B00] hover:text-[#e65c00] mb-6 font-medium"
            >
              <FaArrowLeft />
              Back to Orders
            </button>

            {/* Order Details */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      Order #{selectedOrder.id}
                    </h1>
                    <p className="text-gray-600">
                      Placed on {formatDate(selectedOrder.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                        selectedOrder.status
                      )}`}
                    >
                      {getStatusIcon(selectedOrder.status)}{" "}
                      {selectedOrder.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {/* Order Summary */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                  <div className="lg:col-span-2">
                    <h3 className="text-lg font-semibold mb-4">Order Items</h3>
                    {selectedOrder.order_items &&
                    selectedOrder.order_items.length > 0 ? (
                      <div className="space-y-4">
                        {selectedOrder.order_items.map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg"
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
                              <h4 className="font-medium text-gray-900">
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
                              <p className="text-lg font-bold text-gray-900">
                                ₹{(item.price * item.quantity).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">
                        No items found for this order.
                      </p>
                    )}
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
                      <div className="border-t pt-3">
                        <div className="flex justify-between">
                          <span>Payment Method:</span>
                          <span className="capitalize">
                            {selectedOrder.payment_method}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Delivery Address */}
                    {selectedOrder.address && (
                      <div className="mt-6">
                        <h4 className="font-semibold mb-2">Delivery Address</h4>
                        <div className="bg-gray-50 p-3 rounded text-sm">
                          {typeof selectedOrder.address === "string"
                            ? selectedOrder.address
                            : JSON.stringify(selectedOrder.address, null, 2)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

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

  const filteredOrders = orders;
  const returnStatusCounts = getReturnStatusCounts();
  const filteredReturnOrders = getFilteredReturnOrders();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#F9F4ED] py-4">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
                <span className="bg-red-500 text-white text-sm px-2 py-1 rounded-full">
                  {orders.length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Connected</span>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setActiveTab("tracking")}
                className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === "tracking"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                Tracking
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === "history"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                History
              </button>
              <button
                onClick={() => setActiveTab("return")}
                className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === "return"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                Return
              </button>
            </div>
          </div>

          {/* Content based on active tab */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6B00]"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {activeTab === "tracking" && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-bold mb-4">Order Tracking</h2>
                  {filteredOrders.length === 0 ? (
                    <div className="text-center py-8">
                      <FaShoppingBag className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-500">No orders to track</p>
                    </div>
                  ) : (
                    filteredOrders.map((order) => (
                      <div
                        key={order.id}
                        className="border border-gray-200 rounded-lg p-4 mb-4"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold">Order #{order.id}</h3>
                            <p className="text-sm text-gray-600">
                              Placed on{" "}
                              {new Date(order.created_at).toLocaleDateString()}
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
                          {order.order_items?.slice(0, 1).map((item, index) => (
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
                                  Qty: {item.quantity} | ₹{item.price}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>

                        <TrackingProgress order={order} />
                        {/* Tracking Progress */}
                        <div className="mb-6">
                          <p className="text-sm font-medium mb-3">
                            Tracking Progress
                          </p>
                          <div className="relative pb-4">
                            {/* Progress Line */}
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
                              className={`absolute left-4 top-8 w-0.5 bg-green-500`}
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
                                  <p className="font-medium">Order Placed</p>
                                  <p className="text-sm text-gray-600">
                                    {new Date(
                                      order.created_at
                                    ).toLocaleDateString()}
                                    ,{" "}
                                    {new Date(
                                      order.created_at
                                    ).toLocaleTimeString()}
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
                                const res = await getOrderTracking(order.id);
                                if (res?.success) {
                                  setTrackingTimeline(res.tracking || []);
                                  setTrackingModalOpen(true);
                                } else {
                                  toast.error("Failed to fetch tracking data");
                                }
                              } catch (err) {
                                console.error(err);
                                toast.error("Failed to fetch tracking data");
                              } finally {
                                setTrackingLoading(false);
                              }
                            }}
                            className="flex-1 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600"
                          >
                            {trackingLoading ? "Loading..." : "Track Package"}
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === "history" && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-bold mb-4">Order History</h2>
                  {orders.length === 0 ? (
                    <div className="text-center py-8">
                      <FaShoppingBag className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-500">No order history</p>
                    </div>
                  ) : (
                    orders.map((order) => (
                      <div
                        key={order.id}
                        className="border border-gray-200 rounded-lg p-4 mb-4"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold">Order #{order.id}</h3>
                            <p className="text-sm text-gray-600">
                              {new Date(order.created_at).toLocaleDateString()}
                            </p>
                            <p className="text-sm font-medium">
                              Total: ₹{order.total}
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
                          {order.order_items?.slice(0, 1).map((item, index) => (
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
                                  Qty: {item.quantity} | ₹{item.price}
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

              {activeTab === "return" && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-bold mb-4">Return Requests</h2>

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
                        <span className="ml-1">{returnStatusCounts.all}</span>
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
                      onClick={() => setReturnStatusFilter("approved")}
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
                      onClick={() => setReturnStatusFilter("processing")}
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
                      onClick={() => setReturnStatusFilter("completed")}
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
                      onClick={() => setReturnStatusFilter("rejected")}
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
                      onClick={() => setReturnStatusFilter("cancelled")}
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
                      <p className="text-gray-500">No return requests found</p>
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
                              Return Request #{returnOrder.id.slice(0, 8)}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Submitted:{" "}
                              {new Date(
                                returnOrder.created_at
                              ).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-gray-600">
                              Order: #{returnOrder.order_id.slice(0, 8)}
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
                                  : returnOrder.status === "processing"
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
                              ₹{returnOrder.refund_amount?.toFixed(2) || "0.00"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Order Status:</p>
                            <p className="text-sm">
                              {returnOrder.order_status || "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Order Date:</p>
                            <p className="text-sm">
                              {returnOrder.order_date
                                ? new Date(
                                    returnOrder.order_date
                                  ).toLocaleDateString()
                                : "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Order Total:</p>
                            <p className="text-sm font-bold">
                              ₹{returnOrder.order_total?.toFixed(2) || "0.00"}
                            </p>
                          </div>
                        </div>

                        <div className="mb-4">
                          <p className="text-sm font-medium mb-2">Reason:</p>
                          <p className="text-sm text-gray-600">
                            {returnOrder.reason || "No reason provided"}
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

              {/* Tracking Modal */}
              {trackingModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
                  <div className="bg-white rounded-lg w-11/12 max-w-xl p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">Tracking</h3>
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
                          <div key={idx} className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center">
                              {idx + 1}
                            </div>
                            <div>
                              <div className="font-medium">{step.title}</div>
                              {step.timestamp && (
                                <div className="text-sm text-gray-500">
                                  {new Date(step.timestamp).toLocaleString()}
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
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default OrdersPage;
