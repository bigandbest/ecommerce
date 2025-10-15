import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { getUserOrders, cancelOrder } from "../../utils/supabaseApi";
import { useNotifications } from "../../contexts/NotificationContext";
import ReturnOrders from "./ReturnOrders";
import ReturnNotificationBell from "../../components/ReturnNotificationBell";
import "./MyOrders.css";

function MyOrders() {
  const { currentUser } = useAuth();
  const { notifications, fetchNotifications } = useNotifications();
  const [activeTab, setActiveTab] = useState("tracking");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [networkStatus, setNetworkStatus] = useState("checking");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [cancellingOrder, setCancellingOrder] = useState(null);

  // Handle cancel order
  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;

    setCancellingOrder(orderId);
    try {
      const result = await cancelOrder(orderId);
      if (result.success) {
        alert("Order cancelled successfully!");
        // Force refresh to show updated status
        forceRefresh();
      } else {
        alert("Failed to cancel order: " + result.error);
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
      alert("Unable to cancel order. Please try again.");
    } finally {
      setCancellingOrder(null);
    }
  };

  // Handle return request
  const handleReturnOrder = async (orderId) => {
    try {
      // Check if order can be returned
      const eligibilityResponse = await fetch(
        `https://ecommerce-8342.onrender.com/api/return-orders/eligibility/${orderId}`
      );
      const eligibilityData = await eligibilityResponse.json();

      if (eligibilityData.success && eligibilityData.eligibility.can_return) {
        // Redirect to return request page
        window.location.href = `/return-request?orderId=${orderId}&type=return`;
      } else {
        alert(
          eligibilityData.eligibility?.reason ||
            "This order is not eligible for return."
        );
      }
    } catch (error) {
      console.error("Error checking return eligibility:", error);
      alert("Unable to process return request. Please try again.");
    }
  };

  // Check network connectivity
  useEffect(() => {
    const checkNetwork = async () => {
      try {
        const API_BASE_URL = import.meta.env.VITE_API_URL || "https://ecommerce-8342.onrender.com";
        const response = await fetch(
          `${API_BASE_URL}/api/order/all`
        );
        if (response.ok) {
          setNetworkStatus("connected");
        } else {
          setNetworkStatus("error");
        }
      } catch (error) {
        setNetworkStatus("offline");
      }
    };
    checkNetwork();
  }, []);

  // Force refresh function
  const forceRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };



  // Listen for order placement events
  useEffect(() => {
    const handleOrderPlaced = () => {
      console.log("Order placed event received, refreshing orders...");
      forceRefresh();
    };

    window.addEventListener("orderPlaced", handleOrderPlaced);
    return () => window.removeEventListener("orderPlaced", handleOrderPlaced);
  }, []);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!currentUser?.id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const {
          success,
          orders: fetchedOrders,
          error,
        } = await getUserOrders(currentUser.id);

        if (success && fetchedOrders) {
          const formattedOrders = fetchedOrders
            .filter(
              (order) =>
                order.status !== "delivered" &&
                order.status !== "Delivered"
            ) // Hide delivered orders from tracking
            .map((order) => ({
              id: order.id,
              status: order.status || "pending",
              items:
                order.order_items?.map(
                  (item) => item.products?.name || "Product"
                ) || [],
              total: order.total || 0,
              subtotal: order.subtotal || 0,
              shipping: order.shipping || 0,
              date: order.created_at,
              estimatedDelivery: order.created_at,
              address: order.address || "No address provided",
              payment_method: order.payment_method || "Unknown",
              order_items: order.order_items || [],
              trackingSteps: order.status.toLowerCase() === "cancelled" ? [
                {
                  step: "Order Placed",
                  completed: true,
                  time: new Date(order.created_at).toLocaleString(),
                },
                {
                  step: "Order Cancelled",
                  completed: true,
                  cancelled: true,
                  time: order.updated_at ? new Date(order.updated_at).toLocaleString() : "",
                },
              ] : [
                {
                  step: "Order Placed",
                  completed: true,
                  time: new Date(order.created_at).toLocaleString(),
                },
                {
                  step: "Processing",
                  completed: ["processing", "shipped", "delivered"].includes(
                    order.status.toLowerCase()
                  ),
                  time: "",
                },
                {
                  step: "Shipped",
                  completed: ["shipped", "delivered"].includes(
                    order.status.toLowerCase()
                  ),
                  time: "",
                },
                {
                  step: "Out for Delivery",
                  completed: order.status.toLowerCase() === "delivered",
                  time: "",
                },
                {
                  step: "Delivered",
                  completed: order.status.toLowerCase() === "delivered",
                  time:
                    order.status.toLowerCase() === "delivered"
                      ? new Date(
                          order.updated_at || order.created_at
                        ).toLocaleString()
                      : "",
                },
              ],
            }));
          setOrders(formattedOrders);
        } else {
          console.error("Failed to fetch orders:", error);
          setOrders([]);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
    if (currentUser?.id) {
      fetchNotifications(currentUser.id);
    }
  }, [currentUser, refreshTrigger]);

  // Generate notifications from orders for future use
  useEffect(() => {
    const orderNotifications = orders.map((order, index) => ({
      id: index + 1,
      message: `Order ${order.id.slice(0, 8)} - Status: ${order.status}`,
      time: new Date(order.date).toLocaleDateString(),
      read: order.status === "delivered",
    }));
    // Store notifications for future implementation
    console.log("Generated notifications:", orderNotifications);
  }, [orders]);

  // Auto-refresh orders every 30 seconds for real-time updates
  useEffect(() => {
    if (!currentUser?.id) return;

    const userId = currentUser.id;
    const interval = setInterval(async () => {
      try {
        const { success, orders: fetchedOrders } = await getUserOrders(userId);
        if (success && fetchedOrders) {
          const formattedOrders = fetchedOrders
            .filter(
              (order) =>
                order.status !== "delivered" &&
                order.status !== "Delivered"
            )
            .map((order) => ({
              id: order.id,
              status: order.status || "pending",
              items:
                order.order_items?.map(
                  (item) => item.products?.name || "Product"
                ) || [],
              total: order.total || 0,
              subtotal: order.subtotal || 0,
              shipping: order.shipping || 0,
              date: order.created_at,
              estimatedDelivery: order.created_at,
              address: order.address || "No address provided",
              payment_method: order.payment_method || "Unknown",
              order_items: order.order_items || [],
              trackingSteps: order.status.toLowerCase() === "cancelled" ? [
                {
                  step: "Order Placed",
                  completed: true,
                  time: new Date(order.created_at).toLocaleString(),
                },
                {
                  step: "Order Cancelled",
                  completed: true,
                  cancelled: true,
                  time: order.updated_at ? new Date(order.updated_at).toLocaleString() : "",
                },
              ] : [
                {
                  step: "Order Placed",
                  completed: true,
                  time: new Date(order.created_at).toLocaleString(),
                },
                {
                  step: "Processing",
                  completed: ["processing", "shipped", "delivered"].includes(
                    order.status.toLowerCase()
                  ),
                  time: "",
                },
                {
                  step: "Shipped",
                  completed: ["shipped", "delivered"].includes(
                    order.status.toLowerCase()
                  ),
                  time: "",
                },
                {
                  step: "Out for Delivery",
                  completed: order.status.toLowerCase() === "delivered",
                  time: "",
                },
                {
                  step: "Delivered",
                  completed: order.status.toLowerCase() === "delivered",
                  time:
                    order.status.toLowerCase() === "delivered"
                      ? new Date(
                          order.updated_at || order.created_at
                        ).toLocaleString()
                      : "",
                },
              ],
            }));
          setOrders(formattedOrders);
        }
      } catch (error) {
        console.error("Error refreshing orders:", error);
      }
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [currentUser?.id]); // currentUser?.id is needed to restart interval when user changes

  const OrderTracking = () => {
    if (loading) {
      return (
        <div className="loading-container">
          <div className="modern-loader">
            <div className="loader-circle"></div>
            <div className="loader-circle"></div>
            <div className="loader-circle"></div>
          </div>
          <p>Loading your orders...</p>
        </div>
      );
    }

    if (orders.length === 0) {
      return (
        <div className="no-orders">
          <div className="no-orders-icon">📦</div>
          <h3>No Active Orders</h3>
          <p>You don&apos;t have any orders to track right now.</p>
          <button
            onClick={() => (window.location.href = "/")}
            className="start-shopping-btn"
          >
            Start Shopping
          </button>
        </div>
      );
    }

    return (
      <div className="orders-list">
        {orders.map((order) => (
          <div key={order.id} className="order-card">
            <div className="order-header">
              <div className="order-info">
                <h3>Order #{order.id.slice(0, 8)}</h3>
                <p className="order-date">
                  Placed on {new Date(order.date).toLocaleDateString()}
                </p>
              </div>
              <div
                className={`order-status status-${order.status.toLowerCase()}`}
              >
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </div>
            </div>

            <div className="order-items">
              <h4>Items ({order.order_items?.length || 0})</h4>
              <div className="items-list">
                {order.order_items?.slice(0, 1).map((item, idx) => (
                  <div key={idx} className="order-item">
                    <div className="order-item-image">
                      <img
                        src={
                          item.products?.image ||
                          "https://via.placeholder.com/40x40?text=📦"
                        }
                        alt={item.products?.name || "Product"}
                        onError={(e) => {
                          e.target.src =
                            "https://via.placeholder.com/40x40?text=📦";
                        }}
                      />
                    </div>
                    <div className="item-details">
                      <p className="item-name">
                        {item.products?.name || "Product"}
                      </p>
                      <p className="item-qty">
                        Qty: {item.quantity} | ₹{item.price?.toLocaleString()}
                      </p>
                    </div>
                  </div>
                )) || (
                  <div className="order-item">
                    <div className="order-item-image">
                      <img
                        src="https://via.placeholder.com/40x40?text=📦"
                        alt="Product"
                      />
                    </div>
                    <div className="item-details">
                      <p className="item-name">Product Details</p>
                      <p className="item-qty">Loading...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="total-amount">
              <h4>Total Amount</h4>
              <div className="amount">₹{order.total.toLocaleString()}</div>
            </div>

            <div className="expected-delivery">
              <h4>Expected Delivery</h4>
              <div className="delivery-date">
                {new Date(
                  new Date(order.date).getTime() + 6 * 24 * 60 * 60 * 1000
                ).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </div>
            </div>

            <div className="tracking-progress">
              <h4>Tracking Progress</h4>
              <div className="tracking-steps">
                {order.trackingSteps.map((step, idx) => (
                  <div
                    key={idx}
                    className={`tracking-step ${
                      step.completed ? "completed" : ""
                    } ${step.cancelled ? "cancelled" : ""}`}
                  >
                    <div className={`step-circle ${step.cancelled ? "cancelled-circle" : ""}`}>
                      {step.completed ? (step.cancelled ? "✕" : "✓") : ""}
                    </div>
                    <div className="step-content">
                      <h4 className={step.cancelled ? "cancelled-text" : ""}>{step.step}</h4>
                      {step.time && <p className="step-time">{step.time}</p>}
                    </div>
                  </div>
                ))}
                {order.status.toLowerCase() !== "cancelled" && 
                 ["pending", "processing"].includes(order.status.toLowerCase()) && (
                  <div className="cancel-order-section">
                    <button
                      onClick={() => handleCancelOrder(order.id)}
                      disabled={cancellingOrder === order.id}
                      className="cancel-order-btn"
                    >
                      {cancellingOrder === order.id ? "Cancelling..." : "Cancel Order"}
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="order-actions">
              <button
                onClick={() => setSelectedOrder(order)}
                className="view-details-btn"
              >
                View Details
              </button>
              <button
                onClick={() => window.open("#", "_blank")}
                className="track-package-btn"
              >
                Track Package
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const OrderHistory = () => {
    const [historyOrders, setHistoryOrders] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(true);

    useEffect(() => {
      const fetchHistoryOrders = async () => {
        if (!currentUser?.id) {
          setHistoryLoading(false);
          return;
        }

        try {
          const { success, orders: fetchedOrders } = await getUserOrders(
            currentUser.id
          );
          if (success && fetchedOrders) {
            const deliveredOrders = fetchedOrders
              .filter(
                (order) =>
                  order.status === "delivered" ||
                  order.status === "Delivered" ||
                  order.status === "cancelled" ||
                  order.status === "Cancelled"
              )
              .map((order) => ({
                id: order.id,
                status: order.status,
                items:
                  order.order_items?.map(
                    (item) => item.products?.name || "Product"
                  ) || [],
                total: order.total || 0,
                date: order.created_at,
                address: order.address || "No address provided",
                payment_method: order.payment_method || "Unknown",
                order_items: order.order_items || [],
              }));
            setHistoryOrders(deliveredOrders);
          }
        } catch (error) {
          console.error("Error fetching order history:", error);
        } finally {
          setHistoryLoading(false);
        }
      };

      fetchHistoryOrders();
    }, [currentUser?.id]);

    if (historyLoading) {
      return (
        <div className="loading-container">
          <div className="modern-loader">
            <div className="loader-circle"></div>
            <div className="loader-circle"></div>
            <div className="loader-circle"></div>
          </div>
          <p>Loading order history...</p>
        </div>
      );
    }

    if (historyOrders.length === 0) {
      return (
        <div className="no-orders">
          <div className="no-orders-icon">📋</div>
          <h3>No Order History</h3>
          <p>Your completed and cancelled orders will appear here.</p>
        </div>
      );
    }

    return (
      <div className="orders-list">
        {historyOrders.map((order) => (
          <div key={order.id} className="order-card history-card">
            <div className="order-header">
              <div className="order-info">
                <h3>Order #{order.id.slice(0, 8)}</h3>
                <p className="order-date">
                  {new Date(order.date).toLocaleDateString()}
                </p>
                <p className="order-total">
                  Total: ₹{order.total.toLocaleString()}
                </p>
              </div>
              <div
                className={`order-status status-${order.status.toLowerCase()}`}
              >
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </div>
            </div>

            <div className="order-items">
              <h4>Items ({order.order_items?.length || 0})</h4>
              <div className="items-list">
                {order.order_items?.slice(0, 1).map((item, idx) => (
                  <div key={idx} className="order-item">
                    <div className="order-item-image">
                      <img
                        src={
                          item.products?.image ||
                          "https://via.placeholder.com/40x40?text=📦"
                        }
                        alt={item.products?.name || "Product"}
                        onError={(e) => {
                          e.target.src =
                            "https://via.placeholder.com/40x40?text=📦";
                        }}
                      />
                    </div>
                    <div className="item-details">
                      <p className="item-name">
                        {item.products?.name || "Product"}
                      </p>
                      <p className="item-qty">
                        Qty: {item.quantity} | ₹{item.price?.toLocaleString()}
                      </p>
                    </div>
                  </div>
                )) || (
                  <div className="order-item">
                    <div className="order-item-image">
                      <img
                        src="https://via.placeholder.com/40x40?text=📦"
                        alt="Product"
                      />
                    </div>
                    <div className="item-details">
                      <p className="item-name">Product Details</p>
                      <p className="item-qty">Loading...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="order-actions">
              <button
                onClick={() => setSelectedOrder(order)}
                className="view-details-btn"
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="my-orders-container">
      <div className="my-orders-header">
        <h1>
          My Orders
          {activeTab === "tracking" && orders.length > 0 && (
            <span className="order-count-badge">{orders.length}</span>
          )}
        </h1>
        <div className="header-actions">
          <ReturnNotificationBell />
          <div className="network-status">
            <span className={`status-indicator ${networkStatus}`}></span>
            {networkStatus === "connected" && "Connected"}
            {networkStatus === "offline" && "Offline"}
            {networkStatus === "error" && "Connection Error"}
            {networkStatus === "checking" && "Checking..."}
          </div>
        </div>
      </div>

      <div className="orders-tabs">
        <div className="tab-row">
          <button
            className={`tab-button ${activeTab === "tracking" ? "active" : ""}`}
            onClick={() => setActiveTab("tracking")}
          >
            Tracking
          </button>
          <button
            className={`tab-button ${activeTab === "history" ? "active" : ""}`}
            onClick={() => setActiveTab("history")}
          >
            History
          </button>
        </div>
        <div className="tab-row">
          <button
            className={`tab-button ${activeTab === "returns" ? "active" : ""}`}
            onClick={() => setActiveTab("returns")}
          >
            Return
          </button>
          <button
            className={`tab-button ${
              activeTab === "notifications" ? "active" : ""
            }`}
            onClick={() => setActiveTab("notifications")}
          >
            Notifications
          </button>
        </div>
      </div>

      <div className="orders-content">
        {activeTab === "tracking" && (
          <div>
            <h2>Order Tracking</h2>
            <OrderTracking />
          </div>
        )}
        {activeTab === "history" && (
          <div>
            <h2>Order History</h2>
            <OrderHistory />
          </div>
        )}
        {activeTab === "returns" && (
          <div>
            <ReturnOrders />
          </div>
        )}
        {activeTab === "notifications" && (
          <NotificationsSection currentUser={currentUser} />
        )}
      </div>

      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Order Details</h2>
              <button
                className="close-button"
                onClick={() => setSelectedOrder(null)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="order-detail-section">
                <h3>Order Information</h3>
                <p>
                  <strong>Order ID:</strong> {selectedOrder.id}
                </p>
                <p>
                  <strong>Status:</strong> {selectedOrder.status}
                </p>
                <p>
                  <strong>Date:</strong>{" "}
                  {new Date(selectedOrder.date).toLocaleDateString()}
                </p>
                <p>
                  <strong>Payment Method:</strong>{" "}
                  {selectedOrder.payment_method}
                </p>
              </div>

              <div className="order-detail-section">
                <h3>Items</h3>
                {selectedOrder.order_items?.map((item, idx) => (
                  <div
                    key={idx}
                    className="order-item-detail flex items-center gap-4"
                  >
                    <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={
                          item.products?.image ||
                          "https://via.placeholder.com/64x64?text=📦"
                        }
                        alt={item.products?.name || "Product"}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src =
                            "https://via.placeholder.com/64x64?text=📦";
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <p>
                        <strong>{item.products?.name || "Product"}</strong>
                      </p>
                      <p>Quantity: {item.quantity}</p>
                      <p>Price: ₹{item.price?.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="order-detail-section">
                <h3>Delivery Address</h3>
                <p>{selectedOrder.address}</p>
              </div>

              <div className="order-detail-section">
                <h3>Order Summary</h3>
                <p>
                  <strong>Subtotal:</strong> ₹
                  {selectedOrder.subtotal?.toLocaleString()}
                </p>
                <p>
                  <strong>Shipping:</strong> ₹
                  {selectedOrder.shipping?.toLocaleString()}
                </p>
                <p>
                  <strong>Total:</strong> ₹
                  {selectedOrder.total?.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Enhanced Notifications Section Component
const NotificationsSection = ({ currentUser }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    if (!currentUser?.id) return;

    try {
      console.log('Fetching notifications for user:', currentUser.id);
      const servers = [
        'http://localhost:8000',
        'https://ecommerce-backend-umber.vercel.app'
      ];

      let response = null;
      for (const server of servers) {
        try {
          const url = `${server}/api/notifications/user/${currentUser.id}`;
          console.log('Trying URL:', url);
          response = await fetch(url);
          if (response.ok) {
            const data = await response.json();
            console.log('API Response:', data);
            if (data.success) {
              console.log('Setting notifications:', data.notifications);
              setNotifications(data.notifications || []);
            }
            break;
          }
        } catch (err) {
          console.log('Server failed:', server, err.message);
          continue;
        }
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // Refresh every 15 seconds
    return () => clearInterval(interval);
  }, [currentUser?.id]);

  const getNotificationIcon = (notification) => {
    if (notification.related_type === 'return') {
      if (notification.heading?.toLowerCase().includes('approved')) return '✅';
      if (notification.heading?.toLowerCase().includes('rejected')) return '❌';
      return '🔄';
    }
    if (notification.related_type === 'order') return '📦';
    return '🔔';
  };

  if (loading) {
    return (
      <div>
        <h2>Notifications</h2>
        <div className="loading-container">
          <div className="modern-loader">
            <div className="loader-circle"></div>
            <div className="loader-circle"></div>
            <div className="loader-circle"></div>
          </div>
          <p>Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2>Notifications</h2>
      {notifications.length === 0 ? (
        <div className="no-orders">
          <div className="no-orders-icon">🔔</div>
          <h3>No Notifications</h3>
          <p>Your order and return notifications will appear here.</p>
        </div>
      ) : (
        <div className="notifications-list">
          {notifications.map((notification) => (
            <div 
              key={notification.id} 
              className={`notification-card ${!notification.is_read ? 'unread' : ''}`}
            >
              <div className="notification-header">
                <div className="notification-icon">
                  {getNotificationIcon(notification)}
                </div>
                <div className="notification-content">
                  <h4>{notification.heading}</h4>
                  <span className="notification-time">
                    {new Date(notification.created_at).toLocaleDateString()}
                  </span>
                </div>
                {!notification.is_read && <div className="unread-dot"></div>}
              </div>
              <p className="notification-description">{notification.description}</p>
              {notification.related_id && (
                <div className="notification-footer">
                  <span className="related-id">#{notification.related_id.slice(0, 8)}</span>
                  <span className="notification-type">{notification.related_type}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;