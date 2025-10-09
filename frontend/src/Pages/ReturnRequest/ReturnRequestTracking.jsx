import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";

const ReturnRequestTracking = () => {
  const { currentUser } = useAuth();
  const [returnRequests, setReturnRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    const fetchReturnRequests = async () => {
      if (!currentUser?.id) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `https://ecommerce-8342.onrender.com/api/return-orders/user/${currentUser.id}`
        );
        const data = await response.json();

        if (data.success) {
          setReturnRequests(data.return_requests || []);
        }
      } catch (error) {
        console.error("Error fetching return requests:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReturnRequests();
  }, [currentUser]);

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

  const getStatusDescription = (status) => {
    const descriptions = {
      pending: "Your request is being reviewed by our team",
      approved: "Your request has been approved and will be processed soon",
      rejected: "Your request has been rejected. Check admin notes for details",
      processing: "Your refund is being processed",
      completed:
        "Your refund has been completed and should reflect in your account",
    };
    return descriptions[status] || "Status update";
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Please Log In
          </h2>
          <p className="text-gray-600">
            You need to be logged in to view your return requests.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          My Return Requests
        </h1>
        <p className="text-gray-600">
          Track the status of your return and refund requests
        </p>
      </div>

      {returnRequests.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            No Return Requests
          </h3>
          <p className="text-gray-600 mb-6">
            You haven&apos;t submitted any return requests yet.
          </p>
          <a
            href="/return-request"
            className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Submit Return Request
          </a>
        </div>
      ) : (
        <div className="space-y-6">
          {returnRequests.map((request) => (
            <div
              key={request.id}
              className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Request #{request.id.slice(0, 8)}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${getStatusColor(
                        request.status
                      )}`}
                    >
                      {request.status}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${
                        request.return_type === "return"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-orange-100 text-orange-800"
                      }`}
                    >
                      {request.return_type}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                    <div>
                      <span className="font-medium">Order ID:</span>
                      <br />
                      {request.order_id?.slice(0, 8)}...
                    </div>
                    <div>
                      <span className="font-medium">Refund Amount:</span>
                      <br />
                      <span className="font-semibold text-green-600">
                        {formatCurrency(request.refund_amount)}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Submitted:</span>
                      <br />
                      {new Date(request.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  <p className="text-sm text-gray-600">
                    {getStatusDescription(request.status)}
                  </p>
                </div>

                <button
                  onClick={() =>
                    setSelectedRequest(
                      selectedRequest === request.id ? null : request.id
                    )
                  }
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-sm"
                >
                  {selectedRequest === request.id
                    ? "Hide Details"
                    : "View Details"}
                </button>
              </div>

              {/* Expanded Details */}
              {selectedRequest === request.id && (
                <div className="border-t pt-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Request Details */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">
                        Request Details
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium">Reason:</span>
                          <p className="text-gray-700 mt-1">{request.reason}</p>
                        </div>
                        {request.additional_details && (
                          <div>
                            <span className="font-medium">
                              Additional Details:
                            </span>
                            <p className="text-gray-700 mt-1">
                              {request.additional_details}
                            </p>
                          </div>
                        )}
                        <div>
                          <span className="font-medium">Request Type:</span>
                          <p className="text-gray-700 mt-1 capitalize">
                            {request.return_type}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Bank Details */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">
                        Refund Details
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium">Account Holder:</span>
                          <p className="text-gray-700 mt-1">
                            {request.bank_account_holder_name}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium">Account Number:</span>
                          <p className="text-gray-700 mt-1">
                            {"*".repeat(
                              request.bank_account_number?.length - 4
                            ) + request.bank_account_number?.slice(-4)}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium">Bank:</span>
                          <p className="text-gray-700 mt-1">
                            {request.bank_name}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium">IFSC:</span>
                          <p className="text-gray-700 mt-1">
                            {request.bank_ifsc_code}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Information */}
                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-900 mb-3">
                      Original Order Information
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Order Status:</span>
                        <br />
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            request.order_status === "delivered"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {request.order_status}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Order Total:</span>
                        <br />
                        {formatCurrency(request.order_total)}
                      </div>
                      <div>
                        <span className="font-medium">Order Date:</span>
                        <br />
                        {new Date(request.order_date).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="font-medium">Delivery Address:</span>
                        <br />
                        <span className="text-xs text-gray-600">
                          {request.delivery_address?.slice(0, 50)}...
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-900 mb-3">
                      Timeline
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <div className="text-sm">
                          <span className="font-medium">Request Submitted</span>
                          <span className="text-gray-500 ml-2">
                            {new Date(request.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {request.status !== "pending" && (
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-3 h-3 rounded-full ${
                              request.status === "rejected"
                                ? "bg-red-500"
                                : "bg-green-500"
                            }`}
                          ></div>
                          <div className="text-sm">
                            <span className="font-medium">
                              {request.status === "rejected"
                                ? "Request Rejected"
                                : "Request Approved"}
                            </span>
                            <span className="text-gray-500 ml-2">
                              {new Date(
                                request.updated_at
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      )}

                      {["processing", "completed"].includes(request.status) && (
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          <div className="text-sm">
                            <span className="font-medium">
                              Processing Started
                            </span>
                          </div>
                        </div>
                      )}

                      {request.status === "completed" && (
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                          <div className="text-sm">
                            <span className="font-medium">
                              Refund Completed
                            </span>
                            {request.processed_at && (
                              <span className="text-gray-500 ml-2">
                                {new Date(
                                  request.processed_at
                                ).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Admin Notes */}
                  {request.admin_notes && (
                    <div className="mt-6">
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Admin Notes
                      </h4>
                      <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
                        {request.admin_notes}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReturnRequestTracking;
