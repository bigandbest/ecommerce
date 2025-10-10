import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../contexts/AuthContext";

const ReturnOrders = () => {
  const { currentUser } = useAuth();
  const [returnOrders, setReturnOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("all");

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

  if (loading) {
    return (
      <div className="return-orders-loading">
        <div className="loading-spinner"></div>
        <p>Loading your return requests...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="return-orders-error">
        <div className="error-icon">⚠️</div>
        <h3>Error Loading Returns</h3>
        <p>{error}</p>
        <button onClick={fetchReturnOrders} className="retry-btn">
          Try Again
        </button>
      </div>
    );
  }

  if (returnOrders.length === 0) {
    return (
      <div className="no-return-orders">
        <div className="no-orders-icon">↩️</div>
        <h3>No Return Requests</h3>
        <p>You haven&apos;t submitted any return or refund requests yet.</p>
        <a href="/return-request" className="submit-return-btn">
          Submit Return Request
        </a>
      </div>
    );
  }

  return (
    <div className="return-orders-container">
      {/* Header */}
      <div className="return-orders-header">
        <div className="header-info">
          <h2>Return & Refund Requests</h2>
          <p>Track the status of your return and refund requests</p>
        </div>
        <button onClick={fetchReturnOrders} className="refresh-btn">
          🔄 Refresh
        </button>
      </div>

      {/* Status Filter Tabs */}
      <div className="status-filter-tabs">
        {[
          { key: "all", label: "All", count: statusCounts.all },
          { key: "pending", label: "Pending", count: statusCounts.pending },
          { key: "approved", label: "Approved", count: statusCounts.approved },
          {
            key: "processing",
            label: "Processing",
            count: statusCounts.processing,
          },
          {
            key: "completed",
            label: "Completed",
            count: statusCounts.completed,
          },
          { key: "rejected", label: "Rejected", count: statusCounts.rejected },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSelectedStatus(tab.key)}
            className={`filter-tab ${
              selectedStatus === tab.key ? "active" : ""
            }`}
          >
            {tab.label}
            {tab.count > 0 && <span className="count-badge">{tab.count}</span>}
          </button>
        ))}
      </div>

      {/* Return Orders List */}
      <div className="return-orders-list">
        {filteredReturnOrders.length === 0 ? (
          <div className="no-filtered-orders">
            <div className="no-orders-icon">🔍</div>
            <h3>
              No {selectedStatus !== "all" ? selectedStatus : ""} Returns Found
            </h3>
            <p>
              {selectedStatus !== "all"
                ? `No return requests with status "${selectedStatus}"`
                : "No return requests match your criteria"}
            </p>
          </div>
        ) : (
          filteredReturnOrders.map((returnOrder) => (
            <div key={returnOrder.id} className="return-order-card">
              {/* Return Order Header */}
              <div className="return-order-header">
                <div className="return-order-info">
                  <h3>Return Request #{returnOrder.id.slice(0, 8)}</h3>
                  <p className="return-order-date">
                    Submitted:{" "}
                    {new Date(returnOrder.created_at).toLocaleDateString()}
                  </p>
                  <p className="order-reference">
                    Order: #{returnOrder.order_id?.slice(0, 8)}
                  </p>
                </div>

                <div className="return-order-badges">
                  <span
                    className={`status-badge ${getStatusColor(
                      returnOrder.status
                    )}`}
                  >
                    {returnOrder.status?.toUpperCase()}
                  </span>
                  <span
                    className={`type-badge ${getReturnTypeColor(
                      returnOrder.return_type
                    )}`}
                  >
                    {returnOrder.return_type?.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Return Order Details */}
              <div className="return-order-details">
                <div className="details-grid">
                  <div className="detail-item">
                    <strong>Refund Amount:</strong>
                    <span className="refund-amount">
                      {formatCurrency(returnOrder.refund_amount)}
                    </span>
                  </div>

                  <div className="detail-item">
                    <strong>Order Status:</strong>
                    <span
                      className={`order-status ${returnOrder.order_status?.toLowerCase()}`}
                    >
                      {returnOrder.order_status}
                    </span>
                  </div>

                  <div className="detail-item">
                    <strong>Order Date:</strong>
                    <span>
                      {returnOrder.order_date
                        ? new Date(returnOrder.order_date).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>

                  <div className="detail-item">
                    <strong>Order Total:</strong>
                    <span>{formatCurrency(returnOrder.order_total)}</span>
                  </div>
                </div>

                {/* Return Reason */}
                <div className="return-reason">
                  <strong>Reason:</strong>
                  <p>{returnOrder.reason}</p>
                  {returnOrder.additional_details && (
                    <div className="additional-details">
                      <strong>Additional Details:</strong>
                      <p>{returnOrder.additional_details}</p>
                    </div>
                  )}
                </div>

                {/* Bank Details (for completed/processing returns) */}
                {(returnOrder.status === "processing" ||
                  returnOrder.status === "completed") && (
                  <div className="bank-details">
                    <strong>Refund Account:</strong>
                    <p>
                      {returnOrder.bank_account_holder_name} -
                      {returnOrder.bank_name}
                      (****{returnOrder.bank_account_number?.slice(-4)})
                    </p>
                  </div>
                )}

                {/* Admin Notes */}
                {returnOrder.admin_notes && (
                  <div className="admin-notes">
                    <strong>Admin Notes:</strong>
                    <p>{returnOrder.admin_notes}</p>
                  </div>
                )}

                {/* Processing Date */}
                {returnOrder.processed_at && (
                  <div className="processed-date">
                    <strong>Processed:</strong>
                    <span>
                      {new Date(returnOrder.processed_at).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Return Order Actions */}
              <div className="return-order-actions">
                {returnOrder.status === "pending" && (
                  <button className="action-btn cancel-btn">
                    Cancel Request
                  </button>
                )}

                <a
                  href={`/return-tracking?id=${returnOrder.id}`}
                  className="action-btn view-details-btn"
                >
                  View Details
                </a>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary Stats */}
      {returnOrders.length > 0 && (
        <div className="return-orders-summary">
          <div className="summary-stats">
            <div className="stat-item">
              <span className="stat-number">{returnOrders.length}</span>
              <span className="stat-label">Total Requests</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">
                {formatCurrency(
                  returnOrders
                    .filter((order) => order.status === "completed")
                    .reduce(
                      (total, order) => total + (order.refund_amount || 0),
                      0
                    )
                )}
              </span>
              <span className="stat-label">Total Refunded</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">
                {
                  returnOrders.filter((order) => order.status === "pending")
                    .length
                }
              </span>
              <span className="stat-label">Pending</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReturnOrders;
