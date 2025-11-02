import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaEye, FaEdit, FaBox, FaTruck } from 'react-icons/fa';

const WholesaleBulkOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    fetchOrders();
  }, [pagination.page, statusFilter]);

  const fetchOrders = async () => {
    try {
      // First try wholesale bulk orders
      const wholesaleResponse = await fetch(
        `${import.meta.env.VITE_BACKEND}/api/bulk-orders/wholesale?page=${pagination.page}&limit=${pagination.limit}&status=${statusFilter}`
      );
      const wholesaleData = await wholesaleResponse.json();
      
      // Then get regular orders with bulk items
      const regularResponse = await fetch(
        `${import.meta.env.VITE_BACKEND}/api/order?page=${pagination.page}&limit=${pagination.limit}`
      );
      const regularData = await regularResponse.json();
      
      let allOrders = [];
      
      // Add wholesale bulk orders
      if (wholesaleData.success && wholesaleData.orders) {
        allOrders = [...wholesaleData.orders.map(order => ({ ...order, type: 'wholesale' }))];
      }
      
      // Add regular orders that have bulk items
      if (regularData.success && regularData.orders) {
        const bulkOrders = regularData.orders.filter(order => order.is_bulk_order);
        allOrders = [...allOrders, ...bulkOrders.map(order => ({ ...order, type: 'regular' }))];
      }
      
      setOrders(allOrders);
      setPagination(prev => ({
        ...prev,
        total: allOrders.length,
        totalPages: Math.ceil(allOrders.length / pagination.limit)
      }));
    } catch (error) {
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (id, order_status, payment_status) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND}/api/bulk-orders/wholesale/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ order_status, payment_status }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Order updated successfully');
        fetchOrders();
        setShowModal(false);
      } else {
        toast.error(data.error || 'Failed to update order');
      }
    } catch (error) {
      toast.error('Network error');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'PAYMENT_PENDING': return 'bg-orange-100 text-orange-800';
      case 'PAYMENT_COMPLETED': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Wholesale Bulk Orders</h1>
        <div className="flex gap-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      #{order.id}
                    </div>
                    <div className="flex items-center space-x-1 mt-1">
                      <FaBox className="text-orange-500 text-xs" />
                      <span className="text-xs text-gray-500">Bulk Order</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {order.type === 'wholesale' 
                          ? `${order.shipping_first_name} ${order.shipping_last_name}`
                          : `Order #${order.id}`
                        }
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.email || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {order.contact || order.shipping_house_number || 'N/A'}
                      </div>
                      {order.company_name && (
                        <div className="text-sm text-gray-500 font-medium">
                          {order.company_name}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {order.type === 'wholesale' 
                        ? (order.wholesale_bulk_order_items?.length || 0)
                        : (order.order_items?.length || 0)
                      } items
                    </div>
                    <div className="text-xs text-gray-500">
                      {order.type === 'wholesale' 
                        ? order.wholesale_bulk_order_items?.slice(0, 2).map((item, idx) => (
                            <div key={idx}>
                              {item.products?.name} (x{item.quantity})
                            </div>
                          ))
                        : order.order_items?.slice(0, 2).map((item, idx) => (
                            <div key={idx}>
                              Product ID: {item.product_id} (x{item.quantity})
                              {item.is_bulk_order && <span className="text-orange-600"> [BULK]</span>}
                            </div>
                          ))
                      }
                      {((order.type === 'wholesale' && order.wholesale_bulk_order_items?.length > 2) ||
                        (order.type === 'regular' && order.order_items?.length > 2)) && (
                        <div>+{(order.type === 'wholesale' ? order.wholesale_bulk_order_items?.length : order.order_items?.length) - 2} more</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      ₹{parseFloat(order.total_price || order.total || 0).toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.order_status || order.status)}`}>
                        {order.order_status || order.status}
                      </span>
                      <br />
                      {order.type === 'wholesale' ? (
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(order.payment_status)}`}>
                          {order.payment_status === 'PAYMENT_PENDING' ? 'Payment Pending' : 'Payment Completed'}
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {order.payment_method || 'bulk_order'}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(order.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <FaEye />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
              disabled={pagination.page === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
              disabled={pagination.page === pagination.totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(pagination.page * pagination.limit, pagination.total)}
                </span>{' '}
                of <span className="font-medium">{pagination.total}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                  disabled={pagination.page === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
                  disabled={pagination.page === pagination.totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {showModal && selectedOrder && (
        <OrderModal
          order={selectedOrder}
          onClose={() => setShowModal(false)}
          onUpdate={updateOrderStatus}
        />
      )}
    </div>
  );
};

const OrderModal = ({ order, onClose, onUpdate }) => {
  const [orderStatus, setOrderStatus] = useState(order.order_status);
  const [paymentStatus, setPaymentStatus] = useState(order.payment_status);

  const handleUpdate = () => {
    onUpdate(order.id, orderStatus, paymentStatus);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-4/5 lg:w-3/4 shadow-lg rounded-md bg-white max-h-[80vh] overflow-y-auto">
        <div className="mt-3">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Bulk Order Details - #{order.id}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Customer Information */}
            <div className="space-y-4">
              <h4 className="text-md font-semibold text-gray-800 border-b pb-2">Customer Information</h4>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <p className="mt-1 text-sm text-gray-900">{order.shipping_first_name} {order.shipping_last_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-sm text-gray-900">{order.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contact</label>
                  <p className="mt-1 text-sm text-gray-900">{order.contact}</p>
                </div>
                {order.company_name && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Company</label>
                    <p className="mt-1 text-sm text-gray-900">{order.company_name}</p>
                  </div>
                )}
                {order.gst_number && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">GST Number</label>
                    <p className="mt-1 text-sm text-gray-900">{order.gst_number}</p>
                  </div>
                )}
              </div>

              {/* Shipping Address */}
              <div>
                <h5 className="text-sm font-semibold text-gray-800 mb-2">Shipping Address</h5>
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-sm text-gray-900">
                    {order.shipping_full_address}
                    {order.shipping_apartment && `, ${order.shipping_apartment}`}
                    <br />
                    {order.shipping_city}, {order.shipping_state} - {order.shipping_zip_code}
                    <br />
                    {order.shipping_country}
                  </p>
                </div>
              </div>
            </div>

            {/* Order Information */}
            <div className="space-y-4">
              <h4 className="text-md font-semibold text-gray-800 border-b pb-2">Order Information</h4>
              
              {/* Status Updates */}
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Order Status</label>
                  <select
                    value={orderStatus}
                    onChange={(e) => setOrderStatus(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Payment Status</label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="PAYMENT_PENDING">Payment Pending</option>
                    <option value="PAYMENT_COMPLETED">Payment Completed</option>
                  </select>
                </div>
              </div>

              {/* Order Summary */}
              <div>
                <h5 className="text-sm font-semibold text-gray-800 mb-2">Order Summary</h5>
                <div className="bg-gray-50 p-3 rounded-md">
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span>Total Amount:</span>
                    <span className="text-green-600">₹{parseFloat(order.total_price).toFixed(2)}</span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    Order Date: {new Date(order.created_at).toLocaleDateString('en-IN')}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="mt-6">
            <h4 className="text-md font-semibold text-gray-800 border-b pb-2 mb-4">Order Items</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {order.wholesale_bulk_order_items?.map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {item.products?.name || `Product ID: ${item.product_id}`}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">{item.quantity}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">₹{parseFloat(item.price).toFixed(2)}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">₹{(parseFloat(item.price) * item.quantity).toFixed(2)}</td>
                      <td className="px-4 py-2 text-sm">
                        {item.is_bulk_order ? (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                            Bulk
                          </span>
                        ) : (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                            Regular
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdate}
              className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700"
            >
              Update Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WholesaleBulkOrders;