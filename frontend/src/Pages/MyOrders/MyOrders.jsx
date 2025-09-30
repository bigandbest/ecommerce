import React, { useState, useEffect } from 'react'
import './MyOrders.css'

function MyOrders() {
  const [activeTab, setActiveTab] = useState('tracking')
  const [orders, setOrders] = useState([
    {
      id: 'ORD001',
      status: 'shipped',
      items: ['iPhone 15 Pro', 'AirPods Pro'],
      total: 107999,
      date: '2024-01-15',
      estimatedDelivery: '2024-01-18',
      trackingSteps: [
        { step: 'Order Placed', completed: true, time: '2024-01-15 10:30 AM' },
        { step: 'Processing', completed: true, time: '2024-01-15 2:15 PM' },
        { step: 'Shipped', completed: true, time: '2024-01-16 9:00 AM' },
        { step: 'Out for Delivery', completed: false, time: '' },
        { step: 'Delivered', completed: false, time: '' }
      ]
    },
    {
      id: 'ORD002',
      status: 'delivered',
      items: ['MacBook Air M2'],
      total: 82999,
      date: '2024-01-10',
      estimatedDelivery: '2024-01-13',
      trackingSteps: [
        { step: 'Order Placed', completed: true, time: '2024-01-10 11:20 AM' },
        { step: 'Processing', completed: true, time: '2024-01-10 3:45 PM' },
        { step: 'Shipped', completed: true, time: '2024-01-11 8:30 AM' },
        { step: 'Out for Delivery', completed: true, time: '2024-01-13 7:00 AM' },
        { step: 'Delivered', completed: true, time: '2024-01-13 2:30 PM' }
      ]
    }
  ])

  const [notifications, setNotifications] = useState([
    { id: 1, message: 'Your order ORD001 has been shipped!', time: '2 hours ago', read: false },
    { id: 2, message: 'Order ORD002 delivered successfully', time: '3 days ago', read: true }
  ])

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setOrders(prevOrders => 
        prevOrders.map(order => {
          if (order.id === 'ORD001' && order.status === 'shipped') {
            const updatedSteps = [...order.trackingSteps]
            if (!updatedSteps[3].completed) {
              updatedSteps[3] = { ...updatedSteps[3], completed: true, time: new Date().toLocaleString() }
              return { ...order, status: 'out_for_delivery', trackingSteps: updatedSteps }
            }
          }
          return order
        })
      )
    }, 10000) // Update every 10 seconds for demo

    return () => clearInterval(interval)
  }, [])

  const OrderTracking = () => (
    <div>
      <h2 className="text-gray-800 mb-6 text-3xl font-semibold">Order Tracking</h2>
      {orders.map(order => (
        <div key={order.id} className="bg-white rounded-2xl mb-6 shadow-sm border border-gray-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl overflow-hidden">
          <div className="flex justify-between items-start p-6 pb-0 mb-5">
            <div className="flex flex-col gap-1">
              <div className="text-xl font-bold text-gray-900 tracking-tight">Order #{order.id}</div>
              <div className="text-sm text-gray-500 font-medium">Placed on {new Date(order.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
            </div>
            <span className={`px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
              order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
              order.status === 'delivered' ? 'bg-green-100 text-green-800' :
              order.status === 'out_for_delivery' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {order.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>
          
          <div className="px-6">
            <div className="mb-6">
              <div className="mb-5">
                <h4 className="text-base font-semibold text-gray-700 mb-4">Items ({order.items.length})</h4>
                <div className="flex flex-col gap-3">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center text-2xl">📱</div>
                      <div className="flex-1 flex flex-col gap-0.5">
                        <span className="font-semibold text-gray-900 text-sm">{item}</span>
                        <span className="text-sm text-gray-500">Qty: 1</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-5 pt-5 border-t border-gray-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-500 font-medium">Total Amount</span>
                  <span className="font-semibold text-gray-900">₹{order.total.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 font-medium">Expected Delivery</span>
                  <span className="font-semibold text-green-600">{new Date(order.estimatedDelivery).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <h4 className="text-base font-semibold text-gray-700 mb-5">Tracking Progress</h4>
              <div className="flex flex-col">
                {order.trackingSteps.map((step, index) => (
                  <div key={index} className="flex items-start gap-4 py-4 relative border-b border-gray-100 last:border-b-0">
                    <div className="flex flex-col items-center relative mt-0.5">
                      <div className={`w-3 h-3 rounded-full border-3 transition-all duration-300 z-10 ${
                        step.completed ? 'border-green-500 bg-green-500' : 'border-gray-300 bg-white'
                      }`}></div>
                      {index < order.trackingSteps.length - 1 && (
                        <div className={`w-0.5 h-10 mt-1 ${
                          step.completed ? 'bg-green-500' : 'bg-gray-300'
                        }`}></div>
                      )}
                    </div>
                    <div className="flex-1 pt-0.5">
                      <div className={`font-semibold text-sm mb-1 ${
                        step.completed ? 'text-green-600' : 'text-gray-900'
                      }`}>{step.step}</div>
                      {step.time && <div className="text-sm text-gray-500 font-medium">{step.time}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="p-5 pt-5 flex gap-3 border-t border-gray-100 mt-5">
            <button className="flex-1 min-w-30 px-6 py-3 border border-gray-200 bg-gray-50 text-gray-600 rounded-xl cursor-pointer font-semibold text-sm transition-all duration-200 hover:bg-gray-100 hover:border-gray-300 hover:-translate-y-0.5">
              View Details
            </button>
            <button className="flex-1 min-w-30 px-6 py-3 border-none bg-indigo-500 text-white rounded-xl cursor-pointer font-semibold text-sm transition-all duration-200 shadow-md hover:bg-indigo-600 hover:-translate-y-0.5 hover:shadow-lg">
              Track Package
            </button>
          </div>
        </div>
      ))}
    </div>
  )

  const OrderHistory = () => (
    <div>
      <h2 className="text-gray-800 mb-6 text-3xl font-semibold">Order History & Receipts</h2>
      {orders.map(order => (
        <div key={order.id} className="bg-white rounded-2xl mb-6 shadow-sm border border-gray-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl overflow-hidden">
          <div className="flex justify-between items-start p-6 pb-0 mb-5">
            <div className="flex flex-col gap-1">
              <div className="text-xl font-bold text-gray-900 tracking-tight">Order #{order.id}</div>
              <div className="text-sm text-gray-500 font-medium">{new Date(order.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
            </div>
            <span className={`px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
              order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
              order.status === 'delivered' ? 'bg-green-100 text-green-800' :
              order.status === 'out_for_delivery' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {order.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>
          
          <div className="px-6">
            <div className="mb-6">
              <div className="mb-4">
                <div className="flex flex-col gap-3">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center text-2xl">📱</div>
                      <div className="flex-1 flex flex-col gap-0.5">
                        <span className="font-semibold text-gray-900 text-sm">{item}</span>
                        <span className="text-sm text-gray-500">₹{Math.round(order.total / order.items.length).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t-2 border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="text-base font-semibold text-gray-700">Total Amount</span>
                  <span className="text-xl font-bold text-gray-900">₹{order.total.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-5 pt-5 flex gap-3 border-t border-gray-100 mt-5">
            <button className="flex-1 min-w-30 px-6 py-3 border border-gray-200 bg-gray-50 text-gray-600 rounded-xl cursor-pointer font-semibold text-sm transition-all duration-200 hover:bg-gray-100 hover:border-gray-300 hover:-translate-y-0.5">
              Reorder
            </button>
            <button className="flex-1 min-w-30 px-6 py-3 border-none bg-indigo-500 text-white rounded-xl cursor-pointer font-semibold text-sm transition-all duration-200 shadow-md hover:bg-indigo-600 hover:-translate-y-0.5 hover:shadow-lg">
              Download Receipt
            </button>
          </div>
        </div>
      ))}
    </div>
  )

  const ReturnsExchange = () => (
    <div>
      <h2 className="text-gray-800 mb-6 text-3xl font-semibold">Returns & Exchange</h2>
      {orders.filter(order => order.status === 'delivered').map(order => (
        <div key={order.id} className="bg-white rounded-2xl mb-6 shadow-sm border border-gray-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl overflow-hidden">
          <div className="flex justify-between items-start p-6 pb-0 mb-5">
            <div className="flex flex-col gap-1">
              <div className="text-xl font-bold text-gray-900 tracking-tight">Order #{order.id}</div>
              <div className="text-sm text-gray-500 font-medium">Delivered on {new Date(order.estimatedDelivery).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</div>
            </div>
            <span className="px-3 py-1.5 rounded-2xl text-xs font-semibold bg-green-100 text-green-800">
              ✓ Eligible for Return
            </span>
          </div>
          
          <div className="px-6">
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                <div className="text-2xl">🔄</div>
                <div className="flex flex-col">
                  <h4 className="text-sm font-semibold text-blue-900 mb-0.5">Return Window</h4>
                  <p className="text-sm text-blue-700 m-0">25 days remaining</p>
                </div>
              </div>
              
              <div>
                <h4 className="text-base font-semibold text-gray-700 mb-4">Returnable Items</h4>
                <div className="flex flex-col gap-3">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-200">
                      <div className="flex items-center">
                        <input type="checkbox" id={`item-${order.id}-${idx}`} className="w-4.5 h-4.5 accent-indigo-500" />
                      </div>
                      <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center text-2xl">📱</div>
                      <div className="flex-1 flex flex-col gap-0.5">
                        <span className="font-semibold text-gray-900 text-sm">{item}</span>
                        <span className="text-sm text-gray-500">Condition: New</span>
                      </div>
                      <div className="font-semibold text-gray-900 text-sm">₹{Math.round(order.total / order.items.length).toLocaleString('en-IN')}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-5 pt-5 flex gap-3 border-t border-gray-100 mt-5">
            <button className="flex-1 min-w-30 px-6 py-3 border border-gray-200 bg-gray-50 text-gray-600 rounded-xl cursor-pointer font-semibold text-sm transition-all duration-200 hover:bg-gray-100 hover:border-gray-300 hover:-translate-y-0.5">
              Exchange Items
            </button>
            <button className="flex-1 min-w-30 px-6 py-3 border-none bg-red-500 text-white rounded-xl cursor-pointer font-semibold text-sm transition-all duration-200 shadow-md hover:bg-red-600 hover:-translate-y-0.5 hover:shadow-lg">
              Return Items
            </button>
          </div>
        </div>
      ))}
    </div>
  )

  const DeliveryNotifications = () => (
    <div>
      <h2 className="text-gray-800 mb-6 text-3xl font-semibold">Delivery Status & Notifications</h2>
      <div className="flex flex-col gap-4">
        {notifications.map(notification => (
          <div key={notification.id} className={`flex items-center justify-between p-5 bg-white rounded-xl shadow-sm border-l-4 transition-all duration-300 ${
            notification.read ? 'border-l-transparent' : 'border-l-indigo-500 bg-indigo-50/30'
          }`}>
            <div className="flex-1">
              <p className="text-gray-800 mb-1 font-medium">{notification.message}</p>
              <span className="text-gray-500 text-sm">{notification.time}</span>
            </div>
            {!notification.read && <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>}
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto p-5 min-h-screen">
      <header className="bg-white/95 backdrop-blur-md p-5 rounded-2xl mb-5 flex justify-between items-center shadow-lg">
        <h1 className="text-gray-800 text-3xl font-semibold">My Orders</h1>
        <div className="relative bg-red-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold">
          <span className="text-sm">{notifications.filter(n => !n.read).length}</span>
        </div>
      </header>

      <nav className="flex bg-white/90 rounded-2xl p-2.5 mb-5 gap-2.5 overflow-x-auto shadow-md">
        <button 
          className={`flex-1 px-5 py-3 border-none rounded-xl cursor-pointer transition-all duration-300 font-medium whitespace-nowrap ${
            activeTab === 'tracking' 
              ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg' 
              : 'bg-transparent hover:bg-indigo-50'
          }`}
          onClick={() => setActiveTab('tracking')}
        >
          Order Tracking
        </button>
        <button 
          className={`flex-1 px-5 py-3 border-none rounded-xl cursor-pointer transition-all duration-300 font-medium whitespace-nowrap ${
            activeTab === 'history' 
              ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg' 
              : 'bg-transparent hover:bg-indigo-50'
          }`}
          onClick={() => setActiveTab('history')}
        >
          Order History
        </button>
        <button 
          className={`flex-1 px-5 py-3 border-none rounded-xl cursor-pointer transition-all duration-300 font-medium whitespace-nowrap ${
            activeTab === 'returns' 
              ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg' 
              : 'bg-transparent hover:bg-indigo-50'
          }`}
          onClick={() => setActiveTab('returns')}
        >
          Returns & Exchange
        </button>
        <button 
          className={`flex-1 px-5 py-3 border-none rounded-xl cursor-pointer transition-all duration-300 font-medium whitespace-nowrap ${
            activeTab === 'notifications' 
              ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg' 
              : 'bg-transparent hover:bg-indigo-50'
          }`}
          onClick={() => setActiveTab('notifications')}
        >
          Notifications
        </button>
      </nav>

      <main className="bg-white/95 backdrop-blur-md rounded-2xl p-8 shadow-lg">
        {activeTab === 'tracking' && <OrderTracking />}
        {activeTab === 'history' && <OrderHistory />}
        {activeTab === 'returns' && <ReturnsExchange />}
        {activeTab === 'notifications' && <DeliveryNotifications />}
      </main>
    </div>
  )
}

export default MyOrders