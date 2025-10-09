import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";

const ReturnRequest = () => {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [eligibility, setEligibility] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    return_type: "",
    reason: "",
    additional_details: "",
    bank_account_holder_name: "",
    bank_account_number: "",
    bank_ifsc_code: "",
    bank_name: "",
  });

  const returnReasons = {
    return: [
      "Product damaged/defective",
      "Wrong product received",
      "Product not as described",
      "Size/fit issues",
      "Quality issues",
      "Changed mind",
      "Other",
    ],
    cancellation: [
      "Changed mind",
      "Found better price elsewhere",
      "No longer needed",
      "Delivery taking too long",
      "Payment issues",
      "Other",
    ],
  };

  // Fetch user's eligible orders
  useEffect(() => {
    const fetchOrders = async () => {
      if (!currentUser?.id) return;

      try {
        const response = await fetch(
          `https://ecommerce-8342.onrender.com/api/order/user/${currentUser.id}`
        );
        const data = await response.json();

        if (data.success) {
          setOrders(data.orders || []);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchOrders();
  }, [currentUser]);

  const checkEligibility = async (orderId) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://ecommerce-8342.onrender.com/api/return-orders/eligibility/${orderId}`
      );
      const data = await response.json();

      setEligibility(data);

      if (
        data.success &&
        (data.eligibility.can_return || data.eligibility.can_cancel)
      ) {
        setSelectedOrder(orderId);
        setShowForm(true);

        // Set return type based on eligibility
        if (data.eligibility.can_return) {
          setFormData((prev) => ({ ...prev, return_type: "return" }));
        } else if (data.eligibility.can_cancel) {
          setFormData((prev) => ({ ...prev, return_type: "cancellation" }));
        }
      } else {
        alert(
          data.reason || "This order is not eligible for return/cancellation"
        );
      }
    } catch (error) {
      console.error("Error checking eligibility:", error);
      alert("Error checking eligibility. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedOrder || !currentUser?.id) {
      alert("Please select an order and ensure you're logged in");
      return;
    }

    // Validate required fields
    const requiredFields = [
      "return_type",
      "reason",
      "bank_account_holder_name",
      "bank_account_number",
      "bank_ifsc_code",
      "bank_name",
    ];

    const missingFields = requiredFields.filter((field) => !formData[field]);
    if (missingFields.length > 0) {
      alert(`Please fill in all required fields: ${missingFields.join(", ")}`);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        "https://ecommerce-8342.onrender.com/api/return-orders/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            order_id: selectedOrder,
            user_id: currentUser.id,
            ...formData,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        alert(
          "Return request submitted successfully! You will receive updates via email."
        );

        // Reset form
        setShowForm(false);
        setSelectedOrder(null);
        setEligibility(null);
        setFormData({
          return_type: "",
          reason: "",
          additional_details: "",
          bank_account_holder_name: "",
          bank_account_number: "",
          bank_ifsc_code: "",
          bank_name: "",
        });
      } else {
        alert(data.error || "Failed to submit return request");
      }
    } catch (error) {
      console.error("Error submitting return request:", error);
      alert("Error submitting return request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Please Log In
          </h2>
          <p className="text-gray-600">
            You need to be logged in to submit return requests.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Return & Refund Request
        </h1>
        <p className="text-gray-600">
          Request a return for delivered products (within 7 days) or cancel
          undelivered orders
        </p>
      </div>

      {!showForm ? (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Select Order for Return/Cancellation
          </h2>

          {orders.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                No Orders Found
              </h3>
              <p className="text-gray-600">
                You don&apos;t have any orders yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">
                        Order #{order.id.slice(0, 8)}
                      </h3>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>
                          Order Date:{" "}
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                        <p>Total: {formatCurrency(order.total)}</p>
                        <p>Items: {order.order_items?.length || 0}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold uppercase mb-2 inline-block ${
                          order.status === "delivered"
                            ? "bg-green-100 text-green-800"
                            : order.status === "shipped"
                            ? "bg-blue-100 text-blue-800"
                            : order.status === "processing"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {order.status}
                      </span>

                      <div>
                        <button
                          onClick={() => checkEligibility(order.id)}
                          disabled={loading}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50"
                        >
                          {loading ? "Checking..." : "Request Return/Cancel"}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-900 mb-2">Items:</h4>
                    <div className="space-y-2">
                      {order.order_items?.slice(0, 3).map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-3 text-sm"
                        >
                          <div className="w-10 h-10 bg-gray-200 rounded overflow-hidden">
                            <img 
                              src={item.products?.image || 'https://via.placeholder.com/40x40?text=📦'} 
                              alt={item.products?.name || "Product"}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/40x40?text=📦';
                              }}
                            />
                          </div>
                          <div>
                            <p className="font-medium">
                              {item.products?.name || "Product"}
                            </p>
                            <p className="text-gray-600">
                              Qty: {item.quantity} ×{" "}
                              {formatCurrency(item.price)}
                            </p>
                          </div>
                        </div>
                      ))}
                      {order.order_items?.length > 3 && (
                        <p className="text-sm text-gray-500">
                          +{order.order_items.length - 3} more items
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Submit{" "}
              {formData.return_type === "return" ? "Return" : "Cancellation"}{" "}
              Request
            </h2>

            {eligibility && (
              <div
                className={`p-4 rounded-md mb-4 ${
                  eligibility.success
                    ? "bg-green-50 border border-green-200"
                    : "bg-red-50 border border-red-200"
                }`}
              >
                <p
                  className={`text-sm ${
                    eligibility.success ? "text-green-800" : "text-red-800"
                  }`}
                >
                  {eligibility.eligibility?.reason || eligibility.reason}
                </p>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Return Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Request Type *
              </label>
              <select
                name="return_type"
                value={formData.return_type}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select request type</option>
                {eligibility?.eligibility?.can_return && (
                  <option value="return">Return Product</option>
                )}
                {eligibility?.eligibility?.can_cancel && (
                  <option value="cancellation">Cancel Order</option>
                )}
              </select>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason *
              </label>
              <select
                name="reason"
                value={formData.reason}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select reason</option>
                {formData.return_type &&
                  returnReasons[formData.return_type]?.map((reason) => (
                    <option key={reason} value={reason}>
                      {reason}
                    </option>
                  ))}
              </select>
            </div>

            {/* Additional Details */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Details
              </label>
              <textarea
                name="additional_details"
                value={formData.additional_details}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Please provide any additional details about your request..."
              />
            </div>

            {/* Bank Details */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Bank Details for Refund
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Holder Name *
                  </label>
                  <input
                    type="text"
                    name="bank_account_holder_name"
                    value={formData.bank_account_holder_name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter account holder name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Number *
                  </label>
                  <input
                    type="text"
                    name="bank_account_number"
                    value={formData.bank_account_number}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter account number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    IFSC Code *
                  </label>
                  <input
                    type="text"
                    name="bank_ifsc_code"
                    value={formData.bank_ifsc_code}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter IFSC code"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bank Name *
                  </label>
                  <input
                    type="text"
                    name="bank_name"
                    value={formData.bank_name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter bank name"
                  />
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {loading ? "Submitting..." : "Submit Request"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setSelectedOrder(null);
                  setEligibility(null);
                }}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ReturnRequest;
