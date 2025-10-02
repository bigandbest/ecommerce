import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { getUserOrders } from '../../utils/supabaseApi'
import './MyOrders.css'

function MyOrders() {
  const { currentUser } = useAuth()
  const [activeTab, setActiveTab] = useState('tracking')
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)

  useEffect(() => {
    const fetchOrders = async () => {
      if (!currentUser?.id) {
        setLoading(false)
        return
      }
      
      setLoading(true)
      try {
        const { success, orders: fetchedOrders, error } = await getUserOrders(currentUser.id)
        if (success && fetchedOrders) {
          const formattedOrders = fetchedOrders
            .filter(order => order.status !== 'delivered') // Only show non-delivered orders
            .map(order => ({
            id: order.id,
            status: order.status || 'pending',
            items: order.order_items?.map(item => item.products?.name || 'Product') || [],
            total: order.total || 0,
            subtotal: order.subtotal || 0,
            shipping: order.shipping || 0,
            date: order.created_at,
            estimatedDelivery: order.created_at,
            address: order.address || 'No address provided',
            payment_method: order.payment_method || 'Unknown',
            order_items: order.order_items || [],
            trackingSteps: [
              { step: 'Order Placed', completed: true, time: new Date(order.created_at).toLocaleString() },
              { step: 'Processing', completed: ['processing', 'shipped', 'delivered'].includes(order.status), time: '' },
              { step: 'Shipped', completed: ['shipped', 'delivered'].includes(order.status), time: '' },
              { step: 'Out for Delivery', completed: order.status === 'delivered', time: '' },
              { step: 'Delivered', completed: order.status === 'delivered', time: order.status === 'delivered' ? 'Delivered' : '' }
            ]
          }))
          setOrders(formattedOrders)
        } else {
          console.error('Failed to fetch orders:', error)
          setOrders([])
        }
      } catch (error) {
        console.error('Error fetching orders:', error)
        setOrders([])
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [currentUser])

  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    // Generate notifications from orders
    const orderNotifications = orders.map((order, index) => ({
      id: index + 1,
      message: `Order ${order.id.slice(0, 8)} - Status: ${order.status}`,
      time: new Date(order.date).toLocaleDateString(),
      read: order.status === 'delivered'
    }))
    setNotifications(orderNotifications)
  }, [orders])

  // Auto-refresh orders every 30 seconds for real-time updates
  useEffect(() => {
    if (!currentUser?.id) return
    
    const interval = setInterval(async () => {
      try {
        const { success, orders: fetchedOrders } = await getUserOrders(currentUser.id)
        if (success && fetchedOrders) {
          const formattedOrders = fetchedOrders
            .filter(order => order.status !== 'delivered') // Only show non-delivered orders
            .map(order => ({
            id: order.id,
            status: order.status || 'pending',
            items: order.order_items?.map(item => item.products?.name || 'Product') || [],
            total: order.total || 0,
            subtotal: order.subtotal || 0,
            shipping: order.shipping || 0,
            date: order.created_at,
            estimatedDelivery: order.created_at,
            address: order.address || 'No address provided',
            payment_method: order.payment_method || 'Unknown',
            order_items: order.order_items || [],
            trackingSteps: [
              { step: 'Order Placed', completed: true, time: new Date(order.created_at).toLocaleString() },
              { step: 'Processing', completed: ['processing', 'shipped', 'delivered'].includes(order.status), time: '' },
              { step: 'Shipped', completed: ['shipped', 'delivered'].includes(order.status), time: '' },
              { step: 'Out for Delivery', completed: order.status === 'delivered', time: '' },
              { step: 'Delivered', completed: order.status === 'delivered', time: order.status === 'delivered' ? 'Delivered' : '' }
            ]
          }))
          setOrders(formattedOrders)
        }
      } catch (error) {
        console.error('Error refreshing orders:', error)
      }
    }, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [currentUser])

  const OrderTracking = () => {
    if (loading) {
      return (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your orders...</p>
        </div>
      )
    }

    if (orders.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No Active Orders</h3>
          <p className="text-gray-600 mb-6">You have no pending, processing, or shipped orders. Check your delivered orders in Profile section!</p>
          <a href="/" className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
            Start Shopping
          </a>
        </div>
      )
    }

    return (
      <div>
        <h2 className="text-gray-800 mb-3 sm:mb-6 text-lg sm:text-3xl font-semibold">Order Tracking</h2>
        {orders.map(order => (
          <div key={order.id} className="bg-white rounded-xl sm:rounded-2xl mb-3 sm:mb-6 shadow-sm border border-gray-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl overflow-hidden">
            <div className="flex flex-col sm:flex-row justify-between items-start p-3 sm:p-6 pb-0 mb-2 sm:mb-5 gap-2 sm:gap-0">
              <div className="flex flex-col gap-0.5 sm:gap-1">
                <div className="text-base sm:text-xl font-bold text-gray-900 tracking-tight">Order #{order.id.slice(0, 8)}</div>
                <div className="text-xs sm:text-sm text-gray-500 font-medium">Placed on {new Date(order.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
              </div>
              <span className={`px-2 sm:px-3.5 py-1 sm:py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider self-start ${
                order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {order.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>
          
          <div className="px-3 sm:px-6">
            <div className="mb-4 sm:mb-6">
              <div className="mb-3 sm:mb-5">
                <h4 className="text-sm sm:text-base font-semibold text-gray-700 mb-3 sm:mb-4">Items ({order.order_items?.length || 0})</h4>
                <div className="flex flex-col gap-2 sm:gap-3">
                  {order.order_items?.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 rounded-lg sm:rounded-xl border border-gray-100">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-md sm:rounded-lg flex items-center justify-center overflow-hidden">
                        {item.products?.image ? (
                          <img src={item.products.image} alt={item.products.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-lg sm:text-2xl">📦</span>
                        )}
                      </div>
                      <div className="flex-1 flex flex-col gap-0.5">
                        <span className="font-semibold text-gray-900 text-xs sm:text-sm leading-tight">{item.products?.name || 'Product'}</span>
                        <span className="text-xs sm:text-sm text-gray-500">Qty: {item.quantity} | ₹{item.price}</span>
                      </div>
                    </div>
                  )) || (
                    <div className="text-center py-4 text-gray-500">No items found</div>
                  )}
                </div>
              </div>
              
              <div className="mt-3 sm:mt-5 pt-3 sm:pt-5 border-t border-gray-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs sm:text-sm text-gray-500 font-medium">Total Amount</span>
                  <span className="font-semibold text-gray-900 text-sm sm:text-base">₹{order.total.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-gray-500 font-medium">Expected Delivery</span>
                  <span className="font-semibold text-green-600 text-xs sm:text-sm">{new Date(order.estimatedDelivery).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </div>
              </div>
            </div>
            
            <div className="mt-4 sm:mt-6">
              <h4 className="text-sm sm:text-base font-semibold text-gray-700 mb-3 sm:mb-5">Tracking Progress</h4>
              <div className="flex flex-col">
                {order.trackingSteps.map((step, index) => (
                  <div key={index} className="flex items-start gap-3 sm:gap-4 py-3 sm:py-4 relative border-b border-gray-100 last:border-b-0">
                    <div className="flex flex-col items-center relative mt-0.5">
                      <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border-2 sm:border-3 transition-all duration-300 z-10 ${
                        step.completed ? 'border-green-500 bg-green-500' : 'border-gray-300 bg-white'
                      }`}></div>
                      {index < order.trackingSteps.length - 1 && (
                        <div className={`w-0.5 h-8 sm:h-10 mt-1 ${
                          step.completed ? 'bg-green-500' : 'bg-gray-300'
                        }`}></div>
                      )}
                    </div>
                    <div className="flex-1 pt-0.5">
                      <div className={`font-semibold text-xs sm:text-sm mb-1 leading-tight ${
                        step.completed ? 'text-green-600' : 'text-gray-900'
                      }`}>{step.step}</div>
                      {step.time && <div className="text-xs sm:text-sm text-gray-500 font-medium">{step.time}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="p-3 sm:p-5 pt-3 sm:pt-5 flex flex-col sm:flex-row gap-2 sm:gap-3 border-t border-gray-100 mt-3 sm:mt-5">
            <button 
              onClick={() => setSelectedOrder(order)}
              className="flex-1 px-4 sm:px-6 py-2 sm:py-3 border border-gray-200 bg-gray-50 text-gray-600 rounded-xl cursor-pointer font-semibold text-xs sm:text-sm transition-all duration-200 hover:bg-gray-100 hover:border-gray-300 hover:-translate-y-0.5"
            >
              View Details
            </button>
            <button className="flex-1 px-4 sm:px-6 py-2 sm:py-3 border-none bg-indigo-500 text-white rounded-xl cursor-pointer font-semibold text-xs sm:text-sm transition-all duration-200 shadow-md hover:bg-indigo-600 hover:-translate-y-0.5 hover:shadow-lg">
              Track Package
            </button>
          </div>
        </div>
      ))}
    </div>
  )
  }

  const OrderHistory = () => {
    // Get all orders for history (including delivered orders)
    const [allOrders, setAllOrders] = useState([])
    const [historyLoading, setHistoryLoading] = useState(false)

    useEffect(() => {
      const fetchAllOrders = async () => {
        if (!currentUser?.id) return
        
        setHistoryLoading(true)
        try {
          const { success, orders: fetchedOrders } = await getUserOrders(currentUser.id)
          if (success && fetchedOrders) {
            const formattedOrders = fetchedOrders.map(order => ({
              id: order.id,
              status: order.status || 'pending',
              items: order.order_items?.map(item => item.products?.name || 'Product') || [],
              total: order.total || 0,
              subtotal: order.subtotal || 0,
              shipping: order.shipping || 0,
              date: order.created_at,
              estimatedDelivery: order.created_at,
              address: order.address || 'No address provided',
              payment_method: order.payment_method || 'Unknown',
              order_items: order.order_items || []
            }))
            setAllOrders(formattedOrders)
          }
        } catch (error) {
          console.error('Error fetching all orders:', error)
        } finally {
          setHistoryLoading(false)
        }
      }

      fetchAllOrders()
    }, [currentUser])

    if (historyLoading) {
      return (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading order history...</p>
        </div>
      )
    }

    if (allOrders.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📄</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No Order History</h3>
          <p className="text-gray-600">Your complete order history will appear here.</p>
        </div>
      )
    }

    return (
      <div>
        <h2 className="text-gray-800 mb-4 sm:mb-6 text-lg sm:text-3xl font-semibold">Complete Order History & Receipts</h2>
        {allOrders.map(order => (
          <div key={order.id} className="bg-white rounded-xl sm:rounded-2xl mb-4 sm:mb-6 shadow-sm border border-gray-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl overflow-hidden">
            <div className="flex justify-between items-start p-3 sm:p-6 pb-0 mb-3 sm:mb-5">
              <div className="flex flex-col gap-0.5 sm:gap-1">
                <div className="text-base sm:text-xl font-bold text-gray-900 tracking-tight">Order #{order.id.slice(0, 8)}</div>
                <div className="text-xs sm:text-sm text-gray-500 font-medium">{new Date(order.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
              </div>
              <span className={`px-2 sm:px-3.5 py-1 sm:py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {order.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>
          
          <div className="px-3 sm:px-6">
            <div className="mb-4 sm:mb-6">
              <div className="mb-3 sm:mb-4">
                <div className="flex flex-col gap-2 sm:gap-3">
                  {order.order_items?.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 rounded-lg sm:rounded-xl border border-gray-100">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-md sm:rounded-lg flex items-center justify-center overflow-hidden">
                        {item.products?.image ? (
                          <img src={item.products.image} alt={item.products.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-lg sm:text-2xl">📦</span>
                        )}
                      </div>
                      <div className="flex-1 flex flex-col gap-0.5">
                        <span className="font-semibold text-gray-900 text-xs sm:text-sm leading-tight">{item.products?.name || 'Product'}</span>
                        <span className="text-xs sm:text-sm text-gray-500">₹{item.price?.toLocaleString('en-IN')} x {item.quantity}</span>
                      </div>
                    </div>
                  )) || (
                    <div className="text-center py-4 text-gray-500">No items found</div>
                  )}
                </div>
              </div>
              
              <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t-2 border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="text-sm sm:text-base font-semibold text-gray-700">Total Amount</span>
                  <span className="text-lg sm:text-xl font-bold text-gray-900">₹{order.total.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-3 sm:p-5 pt-3 sm:pt-5 flex gap-2 sm:gap-3 border-t border-gray-100 mt-3 sm:mt-5">
            <button 
              onClick={() => setSelectedOrder(order)}
              className="flex-1 min-w-30 px-3 sm:px-6 py-2 sm:py-3 border border-gray-200 bg-gray-50 text-gray-600 rounded-lg sm:rounded-xl cursor-pointer font-semibold text-xs sm:text-sm transition-all duration-200 hover:bg-gray-100 hover:border-gray-300 hover:-translate-y-0.5"
            >
              View Details
            </button>
            <button className="flex-1 min-w-30 px-3 sm:px-6 py-2 sm:py-3 border-none bg-indigo-500 text-white rounded-lg sm:rounded-xl cursor-pointer font-semibold text-xs sm:text-sm transition-all duration-200 shadow-md hover:bg-indigo-600 hover:-translate-y-0.5 hover:shadow-lg">
              Download Receipt
            </button>
          </div>
        </div>
      ))}
    </div>
  )
  }

  const ReturnsExchange = () => (
    <div>
      <h2 className="text-gray-800 mb-4 sm:mb-6 text-lg sm:text-3xl font-semibold">Returns & Exchange</h2>
      {orders.filter(order => order.status === 'delivered').map(order => (
        <div key={order.id} className="bg-white rounded-xl sm:rounded-2xl mb-4 sm:mb-6 shadow-sm border border-gray-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl overflow-hidden">
          <div className="flex justify-between items-start p-3 sm:p-6 pb-0 mb-3 sm:mb-5">
            <div className="flex flex-col gap-0.5 sm:gap-1">
              <div className="text-base sm:text-xl font-bold text-gray-900 tracking-tight">Order #{order.id.slice(0, 8)}</div>
              <div className="text-xs sm:text-sm text-gray-500 font-medium">Delivered on {new Date(order.estimatedDelivery).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</div>
            </div>
            <span className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl sm:rounded-2xl text-xs font-semibold bg-green-100 text-green-800">
              ✓ Eligible for Return
            </span>
          </div>
          
          <div className="px-3 sm:px-6">
            <div className="flex flex-col gap-3 sm:gap-5">
              <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-blue-50 rounded-lg sm:rounded-xl border border-blue-100">
                <div className="text-lg sm:text-2xl">🔄</div>
                <div className="flex flex-col">
                  <h4 className="text-xs sm:text-sm font-semibold text-blue-900 mb-0.5">Return Window</h4>
                  <p className="text-xs sm:text-sm text-blue-700 m-0">25 days remaining</p>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm sm:text-base font-semibold text-gray-700 mb-3 sm:mb-4">Returnable Items</h4>
                <div className="flex flex-col gap-2 sm:gap-3">
                  {order.order_items?.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-white rounded-lg sm:rounded-xl border border-gray-200">
                      <div className="flex items-center">
                        <input type="checkbox" id={`item-${order.id}-${idx}`} className="w-4 h-4 sm:w-4.5 sm:h-4.5 accent-indigo-500" />
                      </div>
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-md sm:rounded-lg flex items-center justify-center overflow-hidden">
                        {item.products?.image ? (
                          <img src={item.products.image} alt={item.products.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-lg sm:text-2xl">📦</span>
                        )}
                      </div>
                      <div className="flex-1 flex flex-col gap-0.5">
                        <span className="font-semibold text-gray-900 text-xs sm:text-sm leading-tight">{item.products?.name || 'Product'}</span>
                        <span className="text-xs sm:text-sm text-gray-500">Condition: New</span>
                      </div>
                      <div className="font-semibold text-gray-900 text-xs sm:text-sm">₹{item.price?.toLocaleString('en-IN')}</div>
                    </div>
                  )) || (
                    <div className="text-center py-4 text-gray-500">No items available for return</div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-3 sm:p-5 pt-3 sm:pt-5 flex gap-2 sm:gap-3 border-t border-gray-100 mt-3 sm:mt-5">
            <button className="flex-1 min-w-30 px-3 sm:px-6 py-2 sm:py-3 border border-gray-200 bg-gray-50 text-gray-600 rounded-lg sm:rounded-xl cursor-pointer font-semibold text-xs sm:text-sm transition-all duration-200 hover:bg-gray-100 hover:border-gray-300 hover:-translate-y-0.5">
              Exchange Items
            </button>
            <button className="flex-1 min-w-30 px-3 sm:px-6 py-2 sm:py-3 border-none bg-red-500 text-white rounded-lg sm:rounded-xl cursor-pointer font-semibold text-xs sm:text-sm transition-all duration-200 shadow-md hover:bg-red-600 hover:-translate-y-0.5 hover:shadow-lg">
              Return Items
            </button>
          </div>
        </div>
      ))}
    </div>
  )

  const DeliveryNotifications = () => (
    <div>
      <h2 className="text-gray-800 mb-4 sm:mb-6 text-lg sm:text-3xl font-semibold">Delivery Status & Notifications</h2>
      <div className="flex flex-col gap-3 sm:gap-4">
        {notifications.map(notification => (
          <div key={notification.id} className={`flex items-center justify-between p-3 sm:p-5 bg-white rounded-lg sm:rounded-xl shadow-sm border-l-4 transition-all duration-300 ${
            notification.read ? 'border-l-transparent' : 'border-l-indigo-500 bg-indigo-50/30'
          }`}>
            <div className="flex-1">
              <p className="text-gray-800 mb-1 font-medium text-sm sm:text-base leading-tight">{notification.message}</p>
              <span className="text-gray-500 text-xs sm:text-sm">{notification.time}</span>
            </div>
            {!notification.read && <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-indigo-500 rounded-full"></div>}
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto p-2 sm:p-5 min-h-screen">
      <header className="bg-white/95 backdrop-blur-md p-3 sm:p-5 rounded-xl sm:rounded-2xl mb-4 sm:mb-5 flex flex-col sm:flex-row justify-between items-center shadow-lg gap-2 sm:gap-0">
        <h1 className="text-gray-800 text-xl sm:text-3xl font-semibold">My Orders</h1>
        <div className="relative bg-red-500 text-white rounded-full w-7 h-7 sm:w-10 sm:h-10 flex items-center justify-center font-bold">
          <span className="text-xs sm:text-sm">{notifications.filter(n => !n.read).length}</span>
        </div>
      </header>

      <nav className="flex bg-white/90 rounded-xl sm:rounded-2xl p-1.5 sm:p-2.5 mb-4 sm:mb-5 gap-1 sm:gap-2.5 overflow-x-auto shadow-md">
        <button 
          className={`flex-1 px-1.5 sm:px-5 py-2 sm:py-3 border-none rounded-lg sm:rounded-xl cursor-pointer transition-all duration-300 font-medium whitespace-nowrap text-xs sm:text-sm ${
            activeTab === 'tracking' 
              ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg' 
              : 'bg-transparent hover:bg-indigo-50'
          }`}
          onClick={() => setActiveTab('tracking')}
        >
          Tracking
        </button>
        <button 
          className={`flex-1 px-1.5 sm:px-5 py-2 sm:py-3 border-none rounded-lg sm:rounded-xl cursor-pointer transition-all duration-300 font-medium whitespace-nowrap text-xs sm:text-sm ${
            activeTab === 'history' 
              ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg' 
              : 'bg-transparent hover:bg-indigo-50'
          }`}
          onClick={() => setActiveTab('history')}
        >
          History
        </button>
        <button 
          className={`flex-1 px-1.5 sm:px-5 py-2 sm:py-3 border-none rounded-lg sm:rounded-xl cursor-pointer transition-all duration-300 font-medium whitespace-nowrap text-xs sm:text-sm ${
            activeTab === 'returns' 
              ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg' 
              : 'bg-transparent hover:bg-indigo-50'
          }`}
          onClick={() => setActiveTab('returns')}
        >
          Returns
        </button>
        <button 
          className={`flex-1 px-1.5 sm:px-5 py-2 sm:py-3 border-none rounded-lg sm:rounded-xl cursor-pointer transition-all duration-300 font-medium whitespace-nowrap text-xs sm:text-sm ${
            activeTab === 'notifications' 
              ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg' 
              : 'bg-transparent hover:bg-indigo-50'
          }`}
          onClick={() => setActiveTab('notifications')}
        >
          Notifications
        </button>
      </nav>

      <main className="bg-white/95 backdrop-blur-md rounded-xl sm:rounded-2xl p-3 sm:p-8 shadow-lg">
        {activeTab === 'tracking' && <OrderTracking />}
        {activeTab === 'history' && <OrderHistory />}
        {activeTab === 'returns' && <ReturnsExchange />}
        {activeTab === 'notifications' && <DeliveryNotifications />}
      </main>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-1 sm:p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl max-w-2xl w-full max-h-[98vh] sm:max-h-[90vh] overflow-y-auto mx-1 sm:mx-0">
            <div className="p-3 sm:p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg sm:text-2xl font-bold text-gray-900">Order Details</h3>
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-gray-600 text-xl sm:text-2xl"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-3 sm:p-6 space-y-3 sm:space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <h4 className="font-semibold text-gray-700 mb-1 sm:mb-2 text-xs sm:text-base">Order ID</h4>
                  <p className="text-gray-900 text-sm sm:text-base">#{selectedOrder.id.slice(0, 8)}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700 mb-1 sm:mb-2 text-xs sm:text-base">Status</h4>
                  <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold uppercase ${
                    selectedOrder.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                    selectedOrder.status === 'delivered' ? 'bg-green-100 text-green-800' :
                    selectedOrder.status === 'processing' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedOrder.status}
                  </span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700 mb-1 sm:mb-2 text-xs sm:text-base">Order Date</h4>
                  <p className="text-gray-900 text-xs sm:text-base">{new Date(selectedOrder.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700 mb-1 sm:mb-2 text-xs sm:text-base">Payment Method</h4>
                  <p className="text-gray-900 text-xs sm:text-base">{selectedOrder.payment_method}</p>
                </div>
              </div>

              {/* Items */}
              <div>
                <h4 className="font-semibold text-gray-700 mb-3 sm:mb-4 text-sm sm:text-base">Items Ordered</h4>
                <div className="space-y-2 sm:space-y-3">
                  {selectedOrder.order_items?.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded-md sm:rounded-lg flex items-center justify-center overflow-hidden">
                        {item.products?.image ? (
                          <img src={item.products.image} alt={item.products.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-lg sm:text-2xl">📦</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <h5 className="font-semibold text-gray-900 text-sm sm:text-base leading-tight">{item.products?.name || 'Product'}</h5>
                        <p className="text-xs sm:text-sm text-gray-600">Quantity: {item.quantity}</p>
                        <p className="text-xs sm:text-sm text-gray-600">Price: ₹{item.price?.toLocaleString('en-IN')}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 text-sm sm:text-base">₹{(item.price * item.quantity)?.toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Address */}
              <div>
                <h4 className="font-semibold text-gray-700 mb-2 text-sm sm:text-base">Delivery Address</h4>
                <p className="text-gray-900 bg-gray-50 p-2 sm:p-3 rounded-lg text-xs sm:text-base">{selectedOrder.address}</p>
              </div>

              {/* Order Summary */}
              <div className="border-t pt-3 sm:pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-sm sm:text-base">Subtotal:</span>
                    <span className="text-gray-900 text-sm sm:text-base">₹{selectedOrder.subtotal?.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 text-sm sm:text-base">Shipping:</span>
                    <span className="text-gray-900 text-sm sm:text-base">₹{selectedOrder.shipping?.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between font-bold text-base sm:text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>₹{selectedOrder.total?.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyOrders