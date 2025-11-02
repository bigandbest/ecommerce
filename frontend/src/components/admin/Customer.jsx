"use client"
import { FiUser } from 'react-icons/fi';

function Customer() {
    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Customers</h1>
                <p className="text-gray-600">Manage your store customers</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(customer => (
                    <div key={customer} className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex items-center">
                            <div className="w-12 h-12 rounded-full bg-[#FD5B00]/10 flex items-center justify-center">
                                <FiUser className="text-[#FD5B00] text-xl" />
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg font-medium text-gray-900">Customer {customer}</h3>
                                <p className="text-gray-500">customer{customer}@example.com</p>
                            </div>
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">Orders</p>
                                <p className="font-medium">{Math.floor(Math.random() * 20) + 1}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Total Spent</p>
                                <p className="font-medium">${(Math.random() * 1000 + 100).toFixed(2)}</p>
                            </div>
                        </div>
                        <button className="mt-4 w-full py-2 text-sm font-medium text-[#FD5B00] hover:text-[#e05100] border border-[#FD5B00] rounded-lg transition-colors">
                            View Details
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Customer