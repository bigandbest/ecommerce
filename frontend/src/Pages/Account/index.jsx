import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  updateUserProfileWithAddress,
  getUserOrders,
} from "../../utils/supabaseApi";
import { formatDateOnlyIST } from "../../utils/dateUtils";
import supabase from "../../utils/supabase.ts";
import {
  FaUserEdit,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaShoppingBag,
  FaHistory,
  FaShoppingCart,
} from "react-icons/fa";
import AddressManager from "../../components/AddressManager";
import ComingSoonPlaceholder from "../../components/ComingSoonPlaceholder";
import { useLocation } from "react-router-dom";

const AccountPage = () => {
  const { currentUser, logout, resetPassword, updatePassword, setCurrentUser } =
    useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state || {};

  // Tab configuration
  const TAB_CONFIG = {
    horizontal: [
      { key: "personal", label: "Personal Details" },
      { key: "account", label: "My Account" },
      { key: "repeat", label: "Repeat Order" },
    ],
    vertical: {
      personal: [
        { key: "profile", label: "Edit Profile", icon: <FaUserEdit /> },
        {
          key: "addresses",
          label: "Delivery Address",
          icon: <FaMapMarkerAlt />,
        },
        {
          key: "contact",
          label: "Contact No",
          icon: <FaPhone className="transform rotate-90" />,
        },
        { key: "email", label: "Email Id", icon: <FaEnvelope /> },
      ],
      account: [
        { key: "orders", label: "My Orders", icon: <FaShoppingBag /> },
        { key: "security", label: "Security", icon: <FaLock /> },
      ],
      repeat: [
        { key: "past-orders", label: "Past Orders", icon: <FaHistory /> },
        { key: "cart", label: "Cart", icon: <FaShoppingCart /> },
      ],
    },
  };

  // State management
  const [activeHorizontalTab, setActiveHorizontalTab] = useState(
    state.horizontalTab || "personal"
  );
  const [activeVerticalTab, setActiveVerticalTab] = useState(
    state.verticalTab || "profile"
  );
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });
  const [loading, setLoading] = useState(false);

  const [profileData, setProfileData] = useState({
    name: currentUser?.name || currentUser?.user_metadata?.name || "",
    phone: currentUser?.phone || currentUser?.user_metadata?.phone || "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [allOrders, setAllOrders] = useState([]);
  const [allOrdersLoading, setAllOrdersLoading] = useState(false);

  // Force refresh function
  const forceRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  // Listen for order placement events
  useEffect(() => {
    const handleOrderPlaced = () => {
      console.log(
        "Account page: Order placed event received, refreshing orders..."
      );
      forceRefresh();
    };

    window.addEventListener("orderPlaced", handleOrderPlaced);
    return () => window.removeEventListener("orderPlaced", handleOrderPlaced);
  }, []);

  // Utility functions
  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(
      () => setNotification({ show: false, message: "", type: "" }),
      3000
    );
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  // Effects
  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    // Initialize profile data from current user
    setProfileData({
      name: currentUser?.name || currentUser?.user_metadata?.name || "",
      phone: currentUser?.phone || currentUser?.user_metadata?.phone || "",
    });

    // Load cached profile data
    const storedProfile = localStorage.getItem("userProfile");
    if (storedProfile) {
      try {
        const parsed = JSON.parse(storedProfile);
        if (parsed?.id === currentUser.id) {
          setProfileData((prev) => ({
            ...prev,
            name: parsed.name || prev.name,
            phone: parsed.phone || prev.phone,
          }));
        }
      } catch (error) {
        console.error("Error parsing stored profile:", error);
      }
    }

    // Fetch user orders
    fetchUserOrders();
  }, [currentUser, navigate, refreshTrigger]);

  // Fetch all orders for repeat order tab
  useEffect(() => {
    fetchAllOrders();
  }, []);

  const fetchUserOrders = async () => {
    if (!currentUser?.id) return;

    console.log("Account page: Fetching orders for user:", currentUser.id);
    setOrdersLoading(true);
    try {
      const {
        success,
        orders: fetchedOrders,
        error,
      } = await getUserOrders(currentUser.id);
      console.log("Account page API response:", {
        success,
        fetchedOrders,
        error,
      });
      if (success && fetchedOrders) {
        console.log(
          "Account page: Setting orders, count:",
          fetchedOrders.length
        );
        setOrders(fetchedOrders);
      } else {
        console.error("Failed to fetch orders:", error);
        setOrders([]);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  const fetchAllOrders = async () => {
    setAllOrdersLoading(true);
    try {
      const response = await fetch(
        "https://ecommerce-8342.onrender.com/api/order/all"
      );
      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }
      const data = await response.json();
      console.log("All orders API response:", data);
      if (Array.isArray(data)) {
        setAllOrders(data);
      } else if (data && Array.isArray(data.orders)) {
        setAllOrders(data.orders);
      } else {
        setAllOrders([]);
      }
    } catch (error) {
      console.error("Error fetching all orders:", error);
      setAllOrders([]);
    } finally {
      setAllOrdersLoading(false);
    }
  };

  // Update vertical tab when horizontal tab changes
  useEffect(() => {
    // only override vertical tab if it wasn't passed via navigation state
    if (!state.verticalTab) {
      const firstVerticalTab =
        TAB_CONFIG.vertical[activeHorizontalTab]?.[0]?.key;
      if (firstVerticalTab) {
        setActiveVerticalTab(firstVerticalTab);
      }
    }
  }, [activeHorizontalTab, state.verticalTab]);

  // Event handlers
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { success, user, error } = await updateUserProfileWithAddress(
        currentUser.id,
        profileData
      );

      if (!success || error) {
        throw new Error(error || "Failed to update profile");
      }

      showNotification("Profile updated successfully!");

      if (user) {
        setCurrentUser(user);
        localStorage.setItem("userProfile", JSON.stringify(user));
        // Update profile data state
        setProfileData({
          name: user.name || "",
          phone: user.phone || "",
        });
      }
    } catch (err) {
      console.error("Profile update error:", err);
      showNotification(err.message || "Failed to update profile", "error");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      showNotification("All password fields are required", "error");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showNotification("New passwords do not match", "error");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showNotification("Password must be at least 6 characters long", "error");
      return;
    }

    setLoading(true);
    try {
      // First, verify the current password by attempting to sign in
      const { data: verifyData, error: verifyError } =
        await supabase.auth.signInWithPassword({
          email: currentUser.email,
          password: passwordData.currentPassword,
        });

      if (verifyError) {
        throw new Error("Current password is incorrect");
      }

      // If current password is correct, update to new password
      const { success, error } = await updatePassword(passwordData.newPassword);

      if (!success || error) {
        throw new Error(error || "Failed to update password");
      }

      showNotification("Password updated successfully!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      showNotification(err.message || "Failed to update password", "error");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    setLoading(true);
    try {
      const userEmail = currentUser?.email;
      if (!userEmail) throw new Error("No email found for password reset");

      const { success, error } = await resetPassword(userEmail);

      if (!success || error) {
        throw new Error(error || "Failed to send reset email");
      }

      showNotification("Reset email sent! Check your inbox.");
    } catch (err) {
      showNotification(err.message || "Failed to send reset email", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-6">
          <div className="flex items-center text-sm text-gray-600 mb-4">
            <span>Profile</span>
            <span className="mx-2">{">"}</span>
            <span className="text-indigo-600 font-medium">My Account</span>
          </div>
          <h1 className="text-3xl font-bold">My Account</h1>
        </div>

        {notification.show && (
          <div
            className={`mb-4 px-4 py-2 rounded ${
              notification.type === "success"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {notification.message}
          </div>
        )}

        {/* Horizontal Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {TAB_CONFIG.horizontal.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveHorizontalTab(tab.key)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    activeHorizontalTab === tab.key
                      ? "border-indigo-500 text-indigo-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Vertical Sidebar */}
          <aside className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-4 space-y-2">
              {TAB_CONFIG.vertical[activeHorizontalTab]?.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveVerticalTab(tab.key)}
                  className={`w-full flex items-center px-3 py-3 rounded-lg text-left transition-colors ${
                    activeVerticalTab === tab.key
                      ? "bg-indigo-100 text-indigo-700 border-l-4 border-indigo-500"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <span className="mr-3">{tab.icon}</span>
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </div>
          </aside>

          {/* Content Area */}
          <section className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {/* Personal Details Content */}
              {activeHorizontalTab === "personal" && (
                <>
                  {activeVerticalTab === "profile" && (
                    <div>
                      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                        <FaUserEdit className="text-indigo-600" />
                        Edit Profile
                      </h2>
                      <form
                        onSubmit={handleProfileUpdate}
                        className="space-y-4"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Full Name
                            </label>
                            <input
                              type="text"
                              value={profileData.name}
                              onChange={(e) =>
                                setProfileData({
                                  ...profileData,
                                  name: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                              placeholder="Enter your full name"
                            />
                          </div>
                        </div>
                        <button
                          type="submit"
                          className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                          disabled={loading}
                        >
                          {loading ? "Saving..." : "Save Changes"}
                        </button>
                      </form>
                    </div>
                  )}

                  {activeVerticalTab === "addresses" && (
                    <div>
                      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                        <FaMapMarkerAlt className="text-indigo-600" />
                        Delivery Address
                      </h2>
                      <AddressManager
                        userId={currentUser.id}
                        onAddressChange={() =>
                          showNotification("Address updated successfully!")
                        }
                      />
                    </div>
                  )}

                  {activeVerticalTab === "contact" && (
                    <div>
                      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                        <FaPhone className="text-indigo-600 transform rotate-90" />
                        Contact Number
                      </h2>
                      <form
                        onSubmit={handleProfileUpdate}
                        className="space-y-4"
                      >
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            value={profileData.phone}
                            onChange={(e) =>
                              setProfileData({
                                ...profileData,
                                phone: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Enter your phone number"
                          />
                        </div>
                        <button
                          type="submit"
                          className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                          disabled={loading}
                        >
                          {loading ? "Updating..." : "Update Contact"}
                        </button>
                      </form>
                    </div>
                  )}

                  {activeVerticalTab === "email" && (
                    <div>
                      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                        <FaEnvelope className="text-indigo-600" />
                        Email Address
                      </h2>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          value={currentUser?.email || ""}
                          readOnly
                          disabled
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
                        />
                        <p className="text-sm text-gray-500 mt-2">
                          Email address cannot be changed. Contact support if
                          you need to update your email.
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* My Account Content */}
              {activeHorizontalTab === "account" && (
                <>
                  {activeVerticalTab === "orders" && (
                    <div>
                      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                        <FaShoppingBag className="text-indigo-600" />
                        My Orders (Delivered Products)
                      </h2>
                      {allOrdersLoading ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                          <p className="mt-4 text-gray-600">
                            Loading delivered orders...
                          </p>
                        </div>
                      ) : (
                        <div>
                          {allOrders.filter(
                            (order) =>
                              order.status === "delivered" ||
                              order.status === "Delivered"
                          ).length === 0 ? (
                            <div className="text-center py-12">
                              <div className="text-6xl mb-4">📦</div>
                              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                No Delivered Orders
                              </h3>
                              <p className="text-gray-600 mb-6">
                                Your delivered orders will appear here once
                                completed.
                              </p>
                              <Link
                                to="/MyOrders"
                                className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                              >
                                View Active Orders
                              </Link>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {allOrders
                                .filter(
                                  (order) =>
                                    order.status === "delivered" ||
                                    order.status === "Delivered"
                                )
                                .slice(0, 5)
                                .map((order) => (
                                  <div
                                    key={order.id}
                                    className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                                  >
                                    <div className="flex justify-between items-start mb-3">
                                      <div>
                                        <h4 className="font-semibold text-gray-900">
                                          Order #{order.id.slice(0, 8)}
                                        </h4>
                                        <p className="text-sm text-gray-600">
                                          {new Date(
                                            order.created_at
                                          ).toLocaleDateString()}
                                        </p>
                                      </div>
                                      <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase bg-green-100 text-green-800">
                                        Delivered
                                      </span>
                                    </div>
                                    <div className="mb-3">
                                      <p className="text-sm text-gray-600 mb-2">
                                        Items: {order.order_items?.length || 0}
                                      </p>
                                      <div className="flex flex-wrap gap-2">
                                        {order.order_items
                                          ?.slice(0, 3)
                                          .map((item, idx) => (
                                            <span
                                              key={idx}
                                              className="text-xs bg-white px-2 py-1 rounded border"
                                            >
                                              {item.products?.name || "Product"}
                                            </span>
                                          ))}
                                        {order.order_items?.length > 3 && (
                                          <span className="text-xs text-gray-500">
                                            +{order.order_items.length - 3} more
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                      <span className="font-semibold text-gray-900">
                                        ₹{order.total?.toLocaleString("en-IN")}
                                      </span>
                                      <div className="flex gap-2">
                                        <button
                                          onClick={() =>
                                            setSelectedOrder(order)
                                          }
                                          className="px-4 py-2 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
                                        >
                                          View Details
                                        </button>
                                        <button className="px-4 py-2 text-sm border border-indigo-600 text-indigo-600 rounded hover:bg-indigo-50 transition-colors">
                                          Reorder
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              <div className="text-center pt-4">
                                <Link
                                  to="/MyOrders"
                                  className="inline-flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                                >
                                  View Active Orders
                                </Link>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {activeVerticalTab === "security" && (
                    <div>
                      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                        <FaLock className="text-indigo-600" />
                        Security Settings
                      </h2>
                      <form
                        onSubmit={handlePasswordChange}
                        className="space-y-4"
                      >
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Current Password
                          </label>
                          <div className="relative">
                            <input
                              type={showPasswords.current ? "text" : "password"}
                              value={passwordData.currentPassword}
                              onChange={(e) =>
                                setPasswordData({
                                  ...passwordData,
                                  currentPassword: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                              placeholder="Enter current password"
                              required
                            />
                            <button
                              type="button"
                              className="absolute inset-y-0 right-0 pr-3 flex items-center"
                              onClick={() =>
                                togglePasswordVisibility("current")
                              }
                            >
                              {showPasswords.current ? (
                                <FaEyeSlash className="text-gray-400" />
                              ) : (
                                <FaEye className="text-gray-400" />
                              )}
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            New Password
                          </label>
                          <div className="relative">
                            <input
                              type={showPasswords.new ? "text" : "password"}
                              value={passwordData.newPassword}
                              onChange={(e) =>
                                setPasswordData({
                                  ...passwordData,
                                  newPassword: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                              placeholder="Enter new password (min 6 characters)"
                              minLength="6"
                              required
                            />
                            <button
                              type="button"
                              className="absolute inset-y-0 right-0 pr-3 flex items-center"
                              onClick={() => togglePasswordVisibility("new")}
                            >
                              {showPasswords.new ? (
                                <FaEyeSlash className="text-gray-400" />
                              ) : (
                                <FaEye className="text-gray-400" />
                              )}
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Confirm New Password
                          </label>
                          <div className="relative">
                            <input
                              type={showPasswords.confirm ? "text" : "password"}
                              value={passwordData.confirmPassword}
                              onChange={(e) =>
                                setPasswordData({
                                  ...passwordData,
                                  confirmPassword: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                              placeholder="Confirm new password"
                              required
                            />
                            <button
                              type="button"
                              className="absolute inset-y-0 right-0 pr-3 flex items-center"
                              onClick={() =>
                                togglePasswordVisibility("confirm")
                              }
                            >
                              {showPasswords.confirm ? (
                                <FaEyeSlash className="text-gray-400" />
                              ) : (
                                <FaEye className="text-gray-400" />
                              )}
                            </button>
                          </div>
                        </div>
                        <button
                          type="submit"
                          className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                          disabled={loading}
                        >
                          {loading ? "Updating..." : "Update Password"}
                        </button>
                        <button
                          type="button"
                          onClick={handlePasswordReset}
                          className="ml-4 px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                          disabled={loading}
                        >
                          {loading ? "Sending..." : "Reset Password via Email"}
                        </button>
                      </form>
                      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                        <h3 className="font-medium text-gray-800 mb-2">
                          Account Information
                        </h3>
                        <div className="text-sm text-gray-600">
                          <p>Email: {currentUser?.email}</p>
                          <p>
                            Phone:{" "}
                            {currentUser?.phone ||
                              currentUser?.user_metadata?.phone ||
                              "Not provided"}
                          </p>
                          <p>
                            Account created:{" "}
                            {currentUser?.created_at
                              ? formatDateOnlyIST(currentUser.created_at)
                              : "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Repeat Order Content */}
              {activeHorizontalTab === "repeat" && (
                <>
                  {activeVerticalTab === "past-orders" && (
                    <div>
                      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                        <FaHistory className="text-indigo-600" />
                        Past Orders (Delivered Products)
                      </h2>
                      {allOrdersLoading ? (
                        <div className="text-center py-8">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                          <p className="mt-4 text-gray-600">
                            Loading delivered orders...
                          </p>
                        </div>
                      ) : allOrders.filter(
                          (order) =>
                            order.status === "delivered" ||
                            order.status === "Delivered"
                        ).length === 0 ? (
                        <div className="text-center py-12">
                          <div className="text-6xl mb-4">📦</div>
                          <h3 className="text-xl font-semibold text-gray-800 mb-2">
                            No Delivered Orders Yet
                          </h3>
                          <p className="text-gray-600 mb-6">
                            Your delivered orders will appear here for easy
                            reordering!
                          </p>
                          <Link
                            to="/"
                            className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                          >
                            Start Shopping
                          </Link>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {allOrders
                            .filter(
                              (order) =>
                                order.status === "delivered" ||
                                order.status === "Delivered"
                            )
                            .slice(0, 3)
                            .map((order) => (
                              <div
                                key={order.id}
                                className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                              >
                                <div className="flex justify-between items-start mb-3">
                                  <div>
                                    <h4 className="font-semibold text-gray-900">
                                      Order #{order.id.slice(0, 8)}
                                    </h4>
                                    <p className="text-sm text-gray-600">
                                      {new Date(
                                        order.created_at
                                      ).toLocaleDateString()}
                                    </p>
                                  </div>
                                  <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase bg-green-100 text-green-800">
                                    Delivered
                                  </span>
                                </div>
                                <div className="mb-3">
                                  <p className="text-sm text-gray-600 mb-2">
                                    Items: {order.order_items?.length || 0}
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    {order.order_items
                                      ?.slice(0, 3)
                                      .map((item, idx) => (
                                        <span
                                          key={idx}
                                          className="text-xs bg-white px-2 py-1 rounded border"
                                        >
                                          {item.products?.name || "Product"}
                                        </span>
                                      ))}
                                    {order.order_items?.length > 3 && (
                                      <span className="text-xs text-gray-500">
                                        +{order.order_items.length - 3} more
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="font-semibold text-gray-900">
                                    ₹{order.total?.toLocaleString("en-IN")}
                                  </span>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => setSelectedOrder(order)}
                                      className="px-4 py-2 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
                                    >
                                      View Details
                                    </button>
                                    <button className="px-4 py-2 text-sm border border-indigo-600 text-indigo-600 rounded hover:bg-indigo-50 transition-colors">
                                      Reorder
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          <div className="text-center pt-4">
                            <button
                              onClick={() => {
                                setActiveHorizontalTab("repeat");
                                setActiveVerticalTab("past-orders");
                              }}
                              className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors mr-3"
                            >
                              <FaHistory className="mr-2" />
                              View All Delivered Orders
                            </button>
                            <Link
                              to="/MyOrders"
                              className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                              View Active Orders
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {activeVerticalTab === "cart" && (
                    <div>
                      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                        <FaShoppingCart className="text-indigo-600" />
                        Shopping Cart
                      </h2>
                      <ComingSoonPlaceholder
                        icon={FaShoppingCart}
                        title="View Your Cart"
                        description="Check your current cart items and proceed to checkout."
                        linkTo="/cart"
                        linkText="Go to Cart"
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </section>
        </div>

        {/* Logout Button */}
        <div className="mt-6 text-center">
          <button
            onClick={handleLogout}
            className="inline-flex items-center px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            <FaLock className="mr-2" />
            Logout
          </button>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-gray-900">
                  Order Details
                </h3>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Order ID</h4>
                  <p className="text-gray-900">
                    #{selectedOrder.id.slice(0, 8)}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Status</h4>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase bg-green-100 text-green-800">
                    {selectedOrder.status}
                  </span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">
                    Order Date
                  </h4>
                  <p className="text-gray-900">
                    {new Date(selectedOrder.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">
                    Payment Method
                  </h4>
                  <p className="text-gray-900">
                    {selectedOrder.payment_method || "N/A"}
                  </p>
                </div>
              </div>

              {/* Items */}
              <div>
                <h4 className="font-semibold text-gray-700 mb-4">
                  Items Ordered
                </h4>
                <div className="space-y-3">
                  {selectedOrder.order_items?.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                        {item.products?.image ? (
                          <img
                            src={item.products.image}
                            alt={item.products.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-2xl">📦</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <h5 className="font-semibold text-gray-900 leading-tight">
                          {item.products?.name || "Product"}
                        </h5>
                        <p className="text-sm text-gray-600">
                          Quantity: {item.quantity}
                        </p>
                        <p className="text-sm text-gray-600">
                          Price: ₹{item.price?.toLocaleString("en-IN")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          ₹
                          {(item.price * item.quantity)?.toLocaleString(
                            "en-IN"
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Address */}
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">
                  Delivery Address
                </h4>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                  {selectedOrder.address || "No address provided"}
                </p>
              </div>

              {/* Order Summary */}
              <div className="border-t pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="text-gray-900">
                      ₹{selectedOrder.subtotal?.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping:</span>
                    <span className="text-gray-900">
                      ₹{selectedOrder.shipping?.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>₹{selectedOrder.total?.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountPage;
