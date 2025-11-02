"use client"
import { useState } from 'react';
import { FiShoppingCart, FiUsers, FiDollarSign, FiPackage, FiArrowUp, FiArrowDown } from 'react-icons/fi';


function Dashboard({ setActiveTab, orders, products }) {
    const [stats, setStats] = useState({
        totalRevenue: 12540,
        orders: 342,
        products: 87,
        customers: 215,
        revenueChange: '+12.5%',
        ordersChange: '-3.2%'
    });
    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
                <p className="text-gray-600">Welcome back, Admin! Here's what's happening with your store today.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center">
                        <div className="p-3 rounded-lg bg-[#FD5B00]/10">
                            <FiDollarSign className="text-[#FD5B00] text-xl" />
                        </div>
                        <div className="ml-4">
                            <h3 className="text-sm font-medium text-gray-600">Total Revenue</h3>
                            <p className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</p>
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm">
                        <FiArrowUp className="text-green-500 mr-1" />
                        <span className="text-green-500 font-medium">{stats.revenueChange}</span>
                        <span className="text-gray-500 ml-1">from last month</span>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center">
                        <div className="p-3 rounded-lg bg-[#FD5B00]/10">
                            <FiShoppingCart className="text-[#FD5B00] text-xl" />
                        </div>
                        <div className="ml-4">
                            <h3 className="text-sm font-medium text-gray-600">Total Orders</h3>
                            <p className="text-2xl font-bold">{stats.orders}</p>
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm">
                        <FiArrowDown className="text-red-500 mr-1" />
                        <span className="text-red-500 font-medium">{stats.ordersChange}</span>
                        <span className="text-gray-500 ml-1">from last month</span>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center">
                        <div className="p-3 rounded-lg bg-[#FD5B00]/10">
                            <FiPackage className="text-[#FD5B00] text-xl" />
                        </div>
                        <div className="ml-4">
                            <h3 className="text-sm font-medium text-gray-600">Products</h3>
                            <p className="text-2xl font-bold">{stats.products}</p>
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm">
                        <span className="text-gray-500">In stock and active</span>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center">
                        <div className="p-3 rounded-lg bg-[#FD5B00]/10">
                            <FiUsers className="text-[#FD5B00] text-xl" />
                        </div>
                        <div className="ml-4">
                            <h3 className="text-sm font-medium text-gray-600">Customers</h3>
                            <p className="text-2xl font-bold">{stats.customers}</p>
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm">
                        <span className="text-gray-500">Active customers</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-800">Recent Orders</h2>
                        <button
                            onClick={() => setActiveTab('orders')}
                            className="text-sm text-[#FD5B00] hover:text-[#e05100]"
                        >
                            View All
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {orders.slice(0, 5).map(order => (
                                    <tr key={order.id}>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">#{order.id}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{order.customer}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{order.date}</td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${order.status === 'Delivered'
                                                ? 'bg-green-100 text-green-800'
                                                : order.status === 'Processing'
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : order.status === 'Shipped'
                                                        ? 'bg-blue-100 text-blue-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">${order.total}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-800">Top Selling Products</h2>
                        <button
                            onClick={() => setActiveTab('products')}
                            className="text-sm text-[#FD5B00] hover:text-[#e05100]"
                        >
                            View All
                        </button>
                    </div>
                    <div className="space-y-4">
                        {products.slice(0, 4).map(product => (
                            <div key={product.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                                <div className="flex items-center">
                                    <div className="w-10 h-10 bg-gray-200 border-2 border-dashed rounded-xl"></div>
                                    <div className="ml-4">
                                        <h3 className="text-sm font-medium text-gray-900">{product.name}</h3>
                                        <p className="text-xs text-gray-500">{product.category}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">${product.price}</p>
                                    <p className="text-xs text-gray-500">{product.sales} sold</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Dashboard