import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { cancelReturnRequest } from "../../utils/supabaseApi";

const ReturnOrders = () => {
  const { currentUser } = useAuth();
  const [returnOrders, setReturnOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [cancellingId, setCancellingId] = useState(null);

  // Fetch user's return orders
  const fetchReturnOrders = useCallback(async () => {
    if (!currentUser?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Try production URL first, then fallback to localhost
      const urls = [
        `https://ecommerce-8342.onrender.com/api/return-orders/user/${currentUser.id}`,
        `http://localhost:8000/api/return-orders/user/${currentUser.id}`,
      ];

      let response;
      let lastError;

      for (const url of urls) {
        try {
          response = await fetch(url);
          if (response.ok) break;
          lastError = new Error(`HTTP error! status: ${response.status}`);
        } catch (err) {
          lastError = err;
          continue;
        }
      }

      if (!response || !response.ok) {
        throw lastError || new Error("Failed to fetch return orders");
      }

      const data = await response.json();

      if (data.success) {
        setReturnOrders(data.return_requests || []);
      } else {
        throw new Error(data.error || "Failed to fetch return orders");
      }
    } catch (err) {
      console.error("Error fetching return orders:", err);
      setError(err.message);
      setReturnOrders([]);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchReturnOrders();
  }, [fetchReturnOrders]);

  // Filter return orders based on selected status
  const filteredReturnOrders = returnOrders.filter((order) => {
    if (selectedStatus === "all") return true;
    return order.status === selectedStatus;
  });

  // Get status color class
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-blue-100 text-blue-800";
      case "processing":
        return "bg-indigo-100 text-indigo-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "cancelled":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get return type color class
  const getReturnTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case "return":
        return "bg-purple-100 text-purple-800";
      case "cancellation":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount || 0);
  };

  // Get status counts for filter tabs
  const getStatusCounts = () => {
    const counts = {
      all: returnOrders.length,
      pending: 0,
      approved: 0,
      processing: 0,
      completed: 0,
      rejected: 0,
      cancelled: 0,
    };

    returnOrders.forEach((order) => {
      const status = order.status?.toLowerCase();
      if (Object.prototype.hasOwnProperty.call(counts, status)) {
        counts[status]++;
      }
    });

    return counts;
  };

  const statusCounts = getStatusCounts();

  // Handle cancel return request
  const handleCancelRequest = async (returnRequestId) => {
    if (!currentUser?.id) return;
    
    if (!confirm("Are you sure you want to cancel this return request?")) {
      return;
    }

    setCancellingId(returnRequestId);
    
    try {
      const result = await cancelReturnRequest(returnRequestId, currentUser.id);
      
      if (result.success) {
        // Refresh the return orders list
        await fetchReturnOrders();
        alert("Return request cancelled successfully!");
      } else {
        alert(result.error || "Failed to cancel return request");
      }
    } catch (error) {
      console.error("Error cancelling return request:", error);
      alert("Failed to cancel return request");
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-8 text-center shadow-sm border border-gray-200">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading your return requests...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg p-8 text-center shadow-sm border border-gray-200">
        <div className="text-4xl mb-4">⚠️</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Returns</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button 
          onClick={fetchReturnOrders} 
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (returnOrders.length === 0) {
    return (
      <div className="bg-white rounded-lg p-8 text-center shadow-sm border border-gray-200">
        <div className="text-4xl mb-4">↩️</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Return Requests</h3>
        <p className="text-gray-600 mb-6">You haven&apos;t submitted any return or refund requests yet.</p>
        <a 
          href="/return-request" 
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Submit Return Request
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Return</h2>
            <p className="text-sm text-gray-600 mt-1">Track the status of your return requests</p>
          </div>
          <button 
            onClick={fetchReturnOrders} 
            className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="bg-white rounded-lg p-2 shadow-sm border border-gray-200">
        <div className="flex flex-wrap gap-1">
          {[
            { key: "all", label: "All", count: statusCounts.all },
            { key: "pending", label: "Pending", count: statusCounts.pending },
            { key: "approved", label: "Approved", count: statusCounts.approved },
            { key: "processing", label: "Processing", count: statusCounts.processing },
            { key: "completed", label: "Completed", count: statusCounts.completed },
            { key: "rejected", label: "Rejected", count: statusCounts.rejected },
            { key: "cancelled", label: "Cancelled", count: statusCounts.cancelled },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSelectedStatus(tab.key)}
              className={`flex items-center gap-1 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                selectedStatus === tab.key 
                  ? "bg-blue-600 text-white" 
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`px-1.5 py-0.5 text-xs rounded-full ${
                  selectedStatus === tab.key 
                    ? "bg-white/20 text-white" 
                    : "bg-gray-200 text-gray-700"
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Return Orders List */}
      <div className="space-y-4">
        {filteredReturnOrders.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center shadow-sm border border-gray-200">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No {selectedStatus !== "all" ? selectedStatus : ""} Returns Found
            </h3>
            <p className="text-gray-600">
              {selectedStatus !== "all"
                ? `No return requests with status "${selectedStatus}"`
                : "No return requests match your criteria"}
            </p>
          </div>
        ) : (
          filteredReturnOrders.map((returnOrder) => (
            <div key={returnOrder.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* Return Order Header */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Return Request #{returnOrder.id.slice(0, 8)}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Submitted: {new Date(returnOrder.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      Order: #{returnOrder.order_id?.slice(0, 8)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(returnOrder.status)}`}>
                      {returnOrder.status?.toUpperCase()}
                    </span>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getReturnTypeColor(returnOrder.return_type)}`}>
                      {returnOrder.return_type?.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Return Order Details */}
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-700">Refund Amount:</span>
                    <span className="text-sm font-semibold text-green-600">
                      {formatCurrency(returnOrder.refund_amount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-700">Order Status:</span>
                    <span className="text-sm text-gray-900">
                      {returnOrder.order_status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-700">Order Date:</span>
                    <span className="text-sm text-gray-900">
                      {returnOrder.order_date ? new Date(returnOrder.order_date).toLocaleDateString() : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-700">Order Total:</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {formatCurrency(returnOrder.order_total)}
                    </span>
                  </div>
                </div>

                {/* Return Reason */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Reason:</h4>
                  <p className="text-sm text-gray-900">{returnOrder.reason}</p>
                  {returnOrder.additional_details && (
                    <div className="mt-2">
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Additional Details:</h4>
                      <p className="text-sm text-gray-900">{returnOrder.additional_details}</p>
                    </div>
                  )}
                </div>

                {/* Bank Details */}
                {(returnOrder.status === "processing" || returnOrder.status === "completed") && (
                  <div className="bg-blue-50 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-blue-700 mb-2">Refund Account:</h4>
                    <p className="text-sm text-blue-900">
                      {returnOrder.bank_account_holder_name} - {returnOrder.bank_name}
                      (****{returnOrder.bank_account_number?.slice(-4)})
                    </p>
                  </div>
                )}

                {/* Admin Notes */}
                {returnOrder.admin_notes && (
                  <div className="bg-yellow-50 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-yellow-700 mb-2">Admin Notes:</h4>
                    <p className="text-sm text-yellow-900">{returnOrder.admin_notes}</p>
                  </div>
                )}

                {/* Processing Date */}
                {returnOrder.processed_at && (
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-700">Processed:</span>
                    <span className="text-sm text-gray-900">
                      {new Date(returnOrder.processed_at).toLocaleDateString()}
                    </span>
                  </div>
                )}

                {/* Status Message */}
                {returnOrder.status === "pending" && (
                  <div className="bg-orange-50 rounded-lg p-3">
                    <p className="text-sm text-orange-800">Your request is being reviewed by our team</p>
                  </div>
                )}
              </div>

              {/* Return Order Actions */}
              <div className="p-4 bg-gray-50 border-t border-gray-100">
                <div className="flex flex-col sm:flex-row gap-2">
                  {returnOrder.status === "pending" && (
                    <button 
                      className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                      onClick={() => handleCancelRequest(returnOrder.id)}
                      disabled={cancellingId === returnOrder.id}
                    >
                      {cancellingId === returnOrder.id ? "Cancelling..." : "Cancel Request"}
                    </button>
                  )}
                  <a
                    href={`/return-tracking?id=${returnOrder.id}`}
                    className="px-4 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors text-center"
                  >
                    View Details
                  </a>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary Stats */}
      {returnOrders.length > 0 && (
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{returnOrders.length}</div>
              <div className="text-sm text-gray-600">Total Requests</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(
                  returnOrders
                    .filter((order) => order.status === "completed")
                    .reduce((total, order) => total + (order.refund_amount || 0), 0)
                )}
              </div>
              <div className="text-sm text-gray-600">Total Refunded</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {returnOrders.filter((order) => order.status === "pending").length}
              </div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReturnOrders;
