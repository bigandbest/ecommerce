

function ShowOrderModal({ currentOrder, orderForm, updateOrder, handleOrderChange, setShowOrderModal }) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
                <div className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                        Update Order Status
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Order ID</label>
                            <input
                                type="text"
                                value={currentOrder.id}
                                disabled
                                className="w-full rounded-lg border-gray-300 border p-2 bg-gray-100"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
                            <input
                                type="text"
                                value={currentOrder.customer}
                                disabled
                                className="w-full rounded-lg border-gray-300 border p-2 bg-gray-100"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select
                                name="status"
                                value={orderForm.status}
                                onChange={handleOrderChange}
                                className="w-full rounded-lg border-gray-300 border p-2 focus:border-[#FD5B00] focus:ring focus:ring-[#FD5B00] focus:ring-opacity-50"
                            >
                                <option value="Pending">Pending</option>
                                <option value="Processing">Processing</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                            </select>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={() => setShowOrderModal(false)}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={updateOrder}
                            className="px-4 py-2 bg-[#FD5B00] text-white rounded-lg hover:bg-[#e05100]"
                        >
                            Update Order
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ShowOrderModal