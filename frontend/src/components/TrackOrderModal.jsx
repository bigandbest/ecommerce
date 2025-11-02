import { useState, useEffect } from 'react';
import { FaTimes, FaSearch } from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';
import { getUserOrders } from '@/api/userApi';
import TrackingProgress from './TrackingProgress';

const TrackOrderModal = ({ isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    if (isOpen && currentUser?.id) {
      fetchOrders();
    }
  }, [isOpen, currentUser]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const result = await getUserOrders(20, 0);
      if (result.success) {
        setOrders(result.orders || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => 
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Track Your Orders</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FaTimes className="text-gray-500" />
          </button>
        </div>

        {selectedOrder ? (
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            <button
              onClick={() => setSelectedOrder(null)}
              className="mb-4 text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              ← Back to Orders
            </button>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-lg mb-2">Order #{selectedOrder.id.slice(0, 8)}</h3>
              <p className="text-sm text-gray-600">
                Placed on {new Date(selectedOrder.created_at).toLocaleDateString()}
              </p>
              <p className="text-sm font-medium">Total: ₹{selectedOrder.total}</p>
            </div>

            <TrackingProgress order={selectedOrder} />

            {selectedOrder.order_items && (
              <div className="mt-6">
                <h4 className="font-semibold mb-3">Order Items</h4>
                <div className="space-y-3">
                  {selectedOrder.order_items.map((item, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                        📦
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{item.products?.name || 'Product'}</p>
                        <p className="text-sm text-gray-600">Qty: {item.quantity} | ₹{item.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-6">
            <div className="mb-4">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by Order ID or Status..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="overflow-y-auto max-h-96">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No orders found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredOrders.map((order) => (
                    <div
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold">Order #{order.id.slice(0, 8)}</h3>
                          <p className="text-sm text-gray-600">
                            {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-600">
                          {order.order_items?.length || 0} items
                        </p>
                        <p className="font-medium">₹{order.total}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackOrderModal;