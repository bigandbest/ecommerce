import { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaPlus, FaBox } from "react-icons/fa";
import PropTypes from "prop-types";
import api from "../../utils/api";

// Component to handle adding/editing a Daily Deal
const DailyDealForm = ({ initialData, onSave, onCancel }) => {
  const [title, setTitle] = useState(initialData?.title || "");
  const [discount, setDiscount] = useState(initialData?.discount || "");
  const [badge, setBadge] = useState(initialData?.badge || "");
  const [sortOrder, setSortOrder] = useState(initialData?.sort_order || 0);
  const [active, setActive] = useState(initialData?.active ?? true);
  const [image, setImage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", title);
    formData.append("discount", discount);
    formData.append("badge", badge);
    formData.append("sort_order", sortOrder);
    formData.append("active", active);
    if (image) {
      formData.append("image_url", image);
    }

    if (initialData) {
      // Update existing deal
      onSave(initialData.id, formData);
    } else {
      // Add new deal
      onSave(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
      <div className="bg-white p-8 rounded-md shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-4">
          {initialData ? "Edit Daily Deal" : "Add Daily Deal"}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="title"
            >
              Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Deal Title"
              required
            />
          </div>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="discount"
            >
              Discount
            </label>
            <input
              type="text"
              id="discount"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="e.g., Up to 50% Off"
            />
          </div>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="badge"
            >
              Badge
            </label>
            <input
              type="text"
              id="badge"
              value={badge}
              onChange={(e) => setBadge(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="e.g., HOT, NEW, SALE"
            />
          </div>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="sortOrder"
            >
              Sort Order
            </label>
            <input
              type="number"
              id="sortOrder"
              value={sortOrder}
              onChange={(e) => setSortOrder(parseInt(e.target.value))}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              min="0"
            />
          </div>
          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="mr-2"
              />
              Active
            </label>
          </div>
          <div className="mb-4">
            <label
              className="block text-gray-700 text-sm font-bold mb-2"
              htmlFor="image"
            >
              Choose File
            </label>
            <input
              type="file"
              id="image"
              onChange={(e) => setImage(e.target.files[0])}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
            {initialData && initialData.image_url && !image && (
              <p className="text-sm text-gray-500 mt-2">
                Current image selected.
              </p>
            )}
          </div>
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={onCancel}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              {initialData ? "Update" : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

DailyDealForm.propTypes = {
  initialData: PropTypes.shape({
    id: PropTypes.number,
    title: PropTypes.string,
    discount: PropTypes.string,
    badge: PropTypes.string,
    sort_order: PropTypes.number,
    active: PropTypes.bool,
    image_url: PropTypes.string,
  }),
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

// Main Daily Deals page component
const DailyDealsPage = () => {
  const [deals, setDeals] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingDeal, setEditingDeal] = useState(null);
  const [isProductModalVisible, setIsProductModalVisible] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [dealProducts, setDealProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [productSearch, setProductSearch] = useState("");
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [isMappingProduct, setIsMappingProduct] = useState(false);

  const fetchDeals = async () => {
    try {
      const response = await api.get("/daily-deals/list");
      setDeals(response.data.deals);
    } catch (error) {
      console.error("Error fetching deals:", error);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, []);

  const handleAdd = async (formData) => {
    try {
      await api.post("/daily-deals/add", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setIsFormVisible(false);
      fetchDeals(); // Refresh the list
    } catch (error) {
      console.error("Error adding deal:", error);
    }
  };

  const handleUpdate = async (id, formData) => {
    try {
      await api.put(`/daily-deals/update/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setIsFormVisible(false);
      setEditingDeal(null);
      fetchDeals(); // Refresh the list
    } catch (error) {
      console.error("Error updating deal:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this deal?")) {
      try {
        await api.delete(`/daily-deals/delete/${id}`);
        fetchDeals(); // Refresh the list
      } catch (error) {
        console.error("Error deleting deal:", error);
      }
    }
  };

  const handleEditClick = (deal) => {
    setEditingDeal(deal);
    setIsFormVisible(true);
  };

  const handleAddClick = () => {
    setEditingDeal(null);
    setIsFormVisible(true);
  };

  const handleManageProducts = async (deal) => {
    setSelectedDeal(deal);
    setIsLoadingProducts(true);
    try {
      const [productsResponse, allProductsResponse] = await Promise.all([
        api.get(`/daily-deals-product/daily-deal/${deal.id}`),
        api.get("/productsroute/allproducts"),
      ]);
      setDealProducts(productsResponse.data || []);
      setAllProducts(allProductsResponse.data.products || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setIsLoadingProducts(false);
    }
    setIsProductModalVisible(true);
  };

  const handleMapProduct = async (productId) => {
    setIsMappingProduct(true);
    try {
      await api.post("/daily-deals-product/map", {
        product_id: productId,
        daily_deal_id: selectedDeal.id,
      });
      // Refresh products
      const response = await api.get(
        `/daily-deals-product/daily-deal/${selectedDeal.id}`
      );
      setDealProducts(response.data || []);
    } catch (error) {
      console.error("Error mapping product:", error);
    } finally {
      setIsMappingProduct(false);
    }
  };

  const handleUnmapProduct = async (productId) => {
    setIsMappingProduct(true);
    try {
      await api.delete("/daily-deals-product/remove", {
        data: { product_id: productId, daily_deal_id: selectedDeal.id },
      });
      // Refresh products
      const response = await api.get(
        `/daily-deals-product/daily-deal/${selectedDeal.id}`
      );
      setDealProducts(response.data || []);
    } catch (error) {
      console.error("Error unmapping product:", error);
    } finally {
      setIsMappingProduct(false);
    }
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Daily Deals</h1>
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-6 flex items-center"
        onClick={handleAddClick}
      >
        <FaPlus className="mr-2" /> Add Daily Deal
      </button>

      {isFormVisible && (
        <DailyDealForm
          initialData={editingDeal}
          onSave={editingDeal ? handleUpdate : handleAdd}
          onCancel={() => setIsFormVisible(false)}
        />
      )}

      {/* Product Management Modal */}
      {isProductModalVisible && selectedDeal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-11/12 max-w-6xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-linear-to-r from-blue-600 to-blue-700 text-white p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">Manage Products</h2>
                  <p className="text-blue-100 mt-1">
                    Daily Deal: {selectedDeal.title}
                  </p>
                </div>
                <button
                  onClick={() => setIsProductModalVisible(false)}
                  className="text-white hover:bg-blue-800 rounded-full p-2 transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {isLoadingProducts ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  <p className="ml-4 text-gray-600">Loading products...</p>
                </div>
              ) : (
                <>
                  {/* Current Products Section */}
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                        <FaBox className="mr-2 text-blue-600" />
                        Current Products
                        <span className="ml-2 bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full">
                          {dealProducts.length}
                        </span>
                      </h3>
                    </div>

                    {dealProducts.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <FaBox className="mx-auto text-4xl mb-4 text-gray-300" />
                        <p>No products mapped to this deal yet.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {dealProducts.map((item) => (
                          <div
                            key={item.product_id}
                            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900 mb-1">
                                  {item.products?.name ||
                                    `Product ${item.product_id}`}
                                </h4>
                                {item.products?.category && (
                                  <p className="text-sm text-gray-500 mb-2">
                                    Category: {item.products.category}
                                  </p>
                                )}
                                {item.products?.price && (
                                  <p className="text-sm font-medium text-green-600">
                                    ₹{item.products.price}
                                  </p>
                                )}
                              </div>
                              <button
                                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors ml-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={() => {
                                  if (
                                    window.confirm(
                                      `Remove "${
                                        item.products?.name || "this product"
                                      }" from this deal?`
                                    )
                                  ) {
                                    handleUnmapProduct(item.product_id);
                                  }
                                }}
                                disabled={isMappingProduct}
                              >
                                {isMappingProduct ? (
                                  <div className="flex items-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b border-white mr-1"></div>
                                    Removing...
                                  </div>
                                ) : (
                                  "Remove"
                                )}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Add Products Section */}
                  <div className="border-t pt-8">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold text-gray-800 flex items-center">
                        <FaPlus className="mr-2 text-green-600" />
                        Add Products
                      </h3>
                    </div>

                    {/* Search Bar */}
                    <div className="mb-6">
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg
                            className="h-5 w-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                          </svg>
                        </div>
                        <input
                          type="text"
                          placeholder="Search products by name..."
                          value={productSearch}
                          onChange={(e) => setProductSearch(e.target.value)}
                          className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    {/* Products Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
                      {allProducts
                        .filter(
                          (product) =>
                            product.name
                              .toLowerCase()
                              .includes(productSearch.toLowerCase()) &&
                            !dealProducts.some(
                              (dp) => dp.product_id === product.id
                            )
                        )
                        .map((product) => (
                          <div
                            key={product.id}
                            className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-blue-300 transition-all"
                          >
                            <div className="flex items-start space-x-3">
                              {product.image && (
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  className="w-12 h-12 object-cover rounded-md shrink-0"
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-gray-900 mb-1 truncate">
                                  {product.name}
                                </h4>
                                {product.category && (
                                  <p className="text-sm text-gray-500 mb-1">
                                    {product.category}
                                  </p>
                                )}
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-medium text-green-600">
                                    ₹{product.price}
                                  </p>
                                  <button
                                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={() => handleMapProduct(product.id)}
                                    disabled={isMappingProduct}
                                  >
                                    {isMappingProduct ? (
                                      <div className="flex items-center">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b border-white mr-1"></div>
                                        Adding...
                                      </div>
                                    ) : (
                                      "Add"
                                    )}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>

                    {allProducts.filter(
                      (product) =>
                        product.name
                          .toLowerCase()
                          .includes(productSearch.toLowerCase()) &&
                        !dealProducts.some((dp) => dp.product_id === product.id)
                    ).length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400 mb-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-.966-5.618-2.479.048.092.1.184.152.274a7.962 7.962 0 005.316 2.195c2.34 0 4.29-.966 5.618-2.479-.048.092-.1.184-.152.274z"
                          />
                        </svg>
                        <p>No products found matching your search.</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t">
              <div className="flex justify-end">
                <button
                  onClick={() => setIsProductModalVisible(false)}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                ID
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Title
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Discount
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Badge
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Image
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Active
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {deals.length > 0 ? (
              deals.map((deal) => (
                <tr key={deal.id}>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">
                      {deal.id}
                    </p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">
                      {deal.title}
                    </p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">
                      {deal.discount}
                    </p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">
                      {deal.badge}
                    </p>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <img
                      src={deal.image_url}
                      alt={deal.title}
                      className="h-12 w-12 object-cover rounded-full"
                    />
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        deal.active
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {deal.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <div className="flex space-x-2">
                      <button
                        className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-3 rounded text-sm"
                        onClick={() => handleEditClick(deal)}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded text-sm"
                        onClick={() => handleManageProducts(deal)}
                      >
                        <FaBox />
                      </button>
                      <button
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-3 rounded text-sm"
                        onClick={() => handleDelete(deal.id)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center py-4">
                  No deals found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DailyDealsPage;
