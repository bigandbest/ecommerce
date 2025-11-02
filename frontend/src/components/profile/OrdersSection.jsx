"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getUserOrders } from "@/api/userApi";
import { toast } from "react-toastify";

function OrdersSection() {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
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
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "confirmed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "shipped":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="flex-1 bg-gradient-to-br from-gray-50 to-white p-6 lg:p-12">
        <h2 className="text-2xl lg:text-3xl font-bold text-[#1E3473] mb-8 tracking-wide">Orders</h2>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#FF6B00] border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gradient-to-br from-gray-50 to-white p-6 lg:p-12">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl lg:text-3xl font-bold text-[#1E3473] tracking-wide">Orders</h2>
        <button
          onClick={fetchOrders}
          disabled={loading}
          className="bg-gradient-to-r from-[#FF6B00] to-[#F7941D] hover:from-[#e65c00] hover:to-[#e6850d] text-white px-6 py-3 rounded-xl text-base font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-[#1E3473] to-[#4A90E2] rounded-full flex items-center justify-center shadow-lg">
            <span className="text-3xl">📦</span>
          </div>
          <p className="text-[#1E3473] text-xl font-semibold mb-2">No orders found</p>
          <p className="text-gray-500 text-base">Your orders will appear here once you make a purchase</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="border-2 border-gray-100 rounded-2xl p-6 hover:shadow-xl hover:border-[#FF6B00]/30 transition-all duration-300 bg-white">
              <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="font-bold text-[#1E3473] text-lg">Order #{order.id.slice(0, 8)}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(order.status)}`}>
                      {order.status.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="text-gray-600 mb-4">
                    <p className="text-base">Placed on {formatDate(order.created_at)}</p>
                    <p className="font-bold text-[#1E3473] text-lg">Total: ₹{order.total}</p>
                  </div>

                  {/* Order Items Preview */}
                  <div className="mb-4">
                    <p className="text-base font-semibold text-[#1E3473] mb-3">
                      Items ({order.order_items?.length || 0})
                    </p>
                    {order.order_items?.slice(0, 2).map((item, index) => (
                      <div key={index} className="flex items-center gap-4 mb-3 p-3 bg-gray-50 rounded-xl">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#1E3473] to-[#4A90E2] rounded-xl flex items-center justify-center shadow-md">
                          <span className="text-white">📦</span>
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-[#1E3473]">{item.products?.name || "Product"}</p>
                          <p className="text-sm text-gray-600">Qty: {item.quantity} | ₹{item.price}</p>
                        </div>
                      </div>
                    ))}
                    {order.order_items?.length > 2 && (
                      <p className="text-sm text-gray-500 font-medium">+{order.order_items.length - 2} more items</p>
                    )}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button className="px-6 py-3 border-2 border-[#1E3473] text-[#1E3473] rounded-xl font-semibold hover:bg-[#1E3473] hover:text-white transition-all duration-300">
                    View Details
                  </button>
                  {order.status !== "delivered" && order.status !== "cancelled" && (
                    <button className="px-6 py-3 bg-gradient-to-r from-[#4A90E2] to-[#1E3473] text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                      Track Order
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default OrdersSection;