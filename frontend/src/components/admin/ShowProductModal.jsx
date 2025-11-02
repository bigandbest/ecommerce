
function ShowProductModal({ currentProduct, productForm, handleProductChange, setShowProductModal, updateProduct, createProduct }) {
    return (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
                <div className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                        {currentProduct ? 'Edit Product' : 'Add New Product'}
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                            <input
                                type="text"
                                name="name"
                                value={productForm.name}
                                onChange={handleProductChange}
                                className="w-full rounded-lg border-gray-300 border p-2 focus:border-[#FD5B00] focus:ring focus:ring-[#FD5B00] focus:ring-opacity-50"
                                placeholder="Product name"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <input
                                type="text"
                                name="category"
                                value={productForm.category}
                                onChange={handleProductChange}
                                className="w-full rounded-lg border-gray-300 border p-2 focus:border-[#FD5B00] focus:ring focus:ring-[#FD5B00] focus:ring-opacity-50"
                                placeholder="Product category"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                                <input
                                    type="number"
                                    name="price"
                                    value={productForm.price}
                                    onChange={handleProductChange}
                                    className="w-full rounded-lg border-gray-300 border p-2 focus:border-[#FD5B00] focus:ring focus:ring-[#FD5B00] focus:ring-opacity-50"
                                    placeholder="0.00"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                                <input
                                    type="number"
                                    name="stock"
                                    value={productForm.stock}
                                    onChange={handleProductChange}
                                    className="w-full rounded-lg border-gray-300 border p-2 focus:border-[#FD5B00] focus:ring focus:ring-[#FD5B00] focus:ring-opacity-50"
                                    placeholder="0"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                name="description"
                                value={productForm.description}
                                onChange={handleProductChange}
                                rows="3"
                                className="w-full rounded-lg border-gray-300 border p-2 focus:border-[#FD5B00] focus:ring focus:ring-[#FD5B00] focus:ring-opacity-50"
                                placeholder="Product description"
                            ></textarea>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={() => setShowProductModal(false)}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={currentProduct ? updateProduct : createProduct}
                            className="px-4 py-2 bg-[#FD5B00] text-white rounded-lg hover:bg-[#e05100]"
                        >
                            {currentProduct ? 'Update Product' : 'Create Product'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ShowProductModal