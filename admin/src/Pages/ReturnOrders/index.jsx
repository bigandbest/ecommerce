import React, { useEffect, useState } from "react";
import axios from "axios";

const ReturnOrdersAdmin = () => {
  const [returnOrders, setReturnOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchReturnOrders = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;

      const res = await axios.get(
        "http://localhost:8000/api/return-orders/admin/all",
        { params }
      );
      setReturnOrders(res.data.return_requests || []);
    } catch (error) {
      console.error("Error fetching return orders:", error);
      setReturnOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const updateReturnStatus = async (returnId, status, adminNotes = "") => {
    try {
      await axios.put(
        `http://localhost:8000/api/return-orders/admin/status/${returnId}`,
        {
          status,
          admin_notes: adminNotes,
          // admin_id will be handled by the backend - omitting for now
        }
      );

      fetchReturnOrders(); // Refresh the list
      alert("Return request status updated successfully!");
    } catch (error) {
      console.error("Error updating return status:", error);
      alert("Failed to update return request status");
    }
  };

  const deleteReturnRequest = async (returnId) => {
    if (!window.confirm("Are you sure you want to delete this return request?"))
      return;

    try {
      await axios.delete(
        `http://localhost:8000/api/return-orders/admin/delete/${returnId}`
      );
      fetchReturnOrders(); // Refresh the list
      alert("Return request deleted successfully!");
    } catch (error) {
      console.error("Error deleting return request:", error);
      alert("Failed to delete return request");
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      processing: "bg-blue-100 text-blue-800",
      completed: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const filteredReturns = returnOrders.filter((returnOrder) => {
    const matchesSearch =
      searchTerm === "" ||
      returnOrder.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      returnOrder.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      returnOrder.order_id.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  useEffect(() => {
    fetchReturnOrders();
  }, [statusFilter]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🔄 Return Orders Management
        </h1>
        <p className="text-gray-600">
          Manage customer return and cancellation requests
        </p>

        {/* Statistics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {returnOrders.filter((r) => r.status === "pending").length}
            </div>
            <div className="text-sm text-gray-600">Pending Review</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {returnOrders.filter((r) => r.status === "approved").length}
            </div>
            <div className="text-sm text-gray-600">Approved</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {returnOrders.filter((r) => r.status === "rejected").length}
            </div>
            <div className="text-sm text-gray-600">Rejected</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {returnOrders.filter((r) => r.status === "processing").length}
            </div>
            <div className="text-sm text-gray-600">Processing</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              ₹
              {returnOrders
                .filter((r) => r.status === "approved")
                .reduce((sum, r) => sum + (r.refund_amount || 0), 0)
                .toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Total Refunds</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <input
              type="text"
              placeholder="Search by Order ID, User, or Return ID"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={fetchReturnOrders}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Return Orders List */}
      <div className="space-y-4">
        {filteredReturns.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow-sm text-center">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No Return Requests Found
            </h3>
            <p className="text-gray-600">
              {statusFilter
                ? `No return requests with status "${statusFilter}"`
                : "No return requests to display"}
            </p>
          </div>
        ) : (
          filteredReturns.map((returnOrder) => (
            <div
              key={returnOrder.id}
              className="bg-white p-6 rounded-lg shadow-sm border"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Return Request #{returnOrder.id.slice(0, 8)}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${getStatusColor(
                        returnOrder.status
                      )}`}
                    >
                      {returnOrder.status}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${
                        returnOrder.return_type === "return"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-orange-100 text-orange-800"
                      }`}
                    >
                      {returnOrder.return_type}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Order ID:</span>
                      <br />
                      {returnOrder.order_id.slice(0, 8)}...
                    </div>
                    <div>
                      <span className="font-medium">Customer:</span>
                      <br />
                      {returnOrder.user_name || "N/A"}
                    </div>
                    <div>
                      <span className="font-medium">Refund Amount:</span>
                      <br />₹{returnOrder.refund_amount?.toLocaleString()}
                    </div>
                    <div>
                      <span className="font-medium">Created:</span>
                      <br />
                      {new Date(returnOrder.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() =>
                      setSelectedReturn(
                        selectedReturn === returnOrder.id
                          ? null
                          : returnOrder.id
                      )
                    }
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-sm"
                  >
                    {selectedReturn === returnOrder.id
                      ? "Hide Details"
                      : "View Details"}
                  </button>

                  {returnOrder.status === "pending" && (
                    <div className="flex gap-1">
                      <button
                        onClick={() =>
                          updateReturnStatus(returnOrder.id, "approved")
                        }
                        className="px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors text-sm"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() =>
                          updateReturnStatus(returnOrder.id, "rejected")
                        }
                        className="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors text-sm"
                      >
                        Reject
                      </button>
                    </div>
                  )}

                  {returnOrder.status === "approved" && (
                    <button
                      onClick={() =>
                        updateReturnStatus(returnOrder.id, "processing")
                      }
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-sm"
                    >
                      Start Processing
                    </button>
                  )}

                  {returnOrder.status === "processing" && (
                    <button
                      onClick={() =>
                        updateReturnStatus(returnOrder.id, "completed")
                      }
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm"
                    >
                      Mark Complete
                    </button>
                  )}
                </div>
              </div>

              {/* Expanded Details */}
              {selectedReturn === returnOrder.id && (
                <ReturnOrderDetails
                  returnOrder={returnOrder}
                  onUpdate={fetchReturnOrders}
                  onDelete={deleteReturnRequest}
                />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const ReturnOrderDetails = ({ returnOrder, onUpdate, onDelete }) => {
  const [adminNotes, setAdminNotes] = useState(returnOrder.admin_notes || "");
  const [newStatus, setNewStatus] = useState(returnOrder.status);

  const handleStatusUpdate = async () => {
    try {
      await axios.put(
        `http://localhost:8000/api/return-orders/admin/status/${returnOrder.id}`,
        {
          status: newStatus,
          admin_notes: adminNotes,
          // admin_id will be handled by the backend - omitting for now
        }
      );

      onUpdate();
      alert("Return request updated successfully!");
    } catch (error) {
      console.error("Error updating return request:", error);
      alert("Failed to update return request");
    }
  };

  return (
    <div className="border-t pt-4 mt-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Details */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">
            Customer Information
          </h4>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium">Name:</span>{" "}
              {returnOrder.user_name || "N/A"}
            </div>
            <div>
              <span className="font-medium">Email:</span>{" "}
              {returnOrder.user_email || "N/A"}
            </div>
            <div>
              <span className="font-medium">Phone:</span>{" "}
              {returnOrder.user_phone || "N/A"}
            </div>
          </div>
        </div>

        {/* Bank Details */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Bank Details</h4>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium">Account Holder:</span>{" "}
              {returnOrder.bank_account_holder_name}
            </div>
            <div>
              <span className="font-medium">Account Number:</span>{" "}
              {returnOrder.bank_account_number}
            </div>
            <div>
              <span className="font-medium">IFSC Code:</span>{" "}
              {returnOrder.bank_ifsc_code}
            </div>
            <div>
              <span className="font-medium">Bank Name:</span>{" "}
              {returnOrder.bank_name}
            </div>
          </div>
        </div>
      </div>

      {/* Return Reason */}
      <div className="mt-4">
        <h4 className="font-semibold text-gray-900 mb-2">Return Reason</h4>
        <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
          {returnOrder.reason}
        </p>
        {returnOrder.additional_details && (
          <div className="mt-2">
            <h5 className="font-medium text-gray-900 mb-1">
              Additional Details
            </h5>
            <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
              {returnOrder.additional_details}
            </p>
          </div>
        )}
      </div>

      {/* Order Information */}
      <div className="mt-4">
        <h4 className="font-semibold text-gray-900 mb-2">Order Information</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="font-medium">Order Status:</span>
            <br />
            <span
              className={`px-2 py-1 rounded text-xs ${
                returnOrder.order_status === "delivered"
                  ? "bg-green-100 text-green-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {returnOrder.order_status}
            </span>
          </div>
          <div>
            <span className="font-medium">Order Total:</span>
            <br />₹{returnOrder.order_total?.toLocaleString()}
          </div>
          <div>
            <span className="font-medium">Order Date:</span>
            <br />
            {new Date(returnOrder.order_date).toLocaleDateString()}
          </div>
          <div>
            <span className="font-medium">Refund Amount:</span>
            <br />
            <span className="font-semibold text-green-600">
              ₹{returnOrder.refund_amount?.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Admin Actions */}
      <div className="mt-6 p-4 bg-gray-50 rounded-md">
        <h4 className="font-semibold text-gray-900 mb-3">Admin Actions</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Update Status
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Admin Notes
            </label>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Add notes about this return request..."
            />
          </div>
        </div>

        <div className="flex gap-3 mt-4">
          <button
            onClick={handleStatusUpdate}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Update Request
          </button>

          <button
            onClick={() => onDelete(returnOrder.id)}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Delete Request
          </button>
        </div>

        {returnOrder.admin_notes && (
          <div className="mt-4">
            <h5 className="font-medium text-gray-900 mb-1">
              Previous Admin Notes
            </h5>
            <p className="text-sm text-gray-700 bg-white p-3 rounded-md border">
              {returnOrder.admin_notes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReturnOrdersAdmin;
