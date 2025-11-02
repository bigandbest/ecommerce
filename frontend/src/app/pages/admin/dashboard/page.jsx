"use client"
import Customer from '@/components/admin/Customer';
import Dashboard from '@/components/admin/Dashboard';
import Orders from '@/components/admin/Orders';
import Products from '@/components/admin/Products';
import Settings from '@/components/admin/Settings';
import ShowOrderModal from '@/components/admin/ShowOrderModal';
import ShowProductModal from '@/components/admin/ShowProductModal';
import { useState, useEffect, useRef } from 'react';
import { FiHome, FiShoppingBag, FiChevronDown, FiShoppingCart, FiUsers, FiLogOut, FiSettings, FiMenu, FiPackage, FiUser } from 'react-icons/fi';

const AdminDashboard = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [showProductModal, setShowProductModal] = useState(false);
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(null);
    const [currentOrder, setCurrentOrder] = useState(null);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const profileDropdownRef = useRef(null);

    const toggleProfileDropdown = () => {
        setProfileDropdownOpen(!profileDropdownOpen);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
                setProfileDropdownOpen(false);
            }
        };

        if (profileDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [profileDropdownOpen]);

    const handleLogout = () => {
        alert('Logout successful! Redirecting to login...');
        // In a real app, you would redirect to the login page
        // router.push('/login');
    };

    // Form states
    const [productForm, setProductForm] = useState({
        name: '',
        category: '',
        price: '',
        stock: '',
        description: ''
    });

    const [orderForm, setOrderForm] = useState({
        status: '',
        customer: '',
        total: '',
        items: ''
    });


    // Initialize sample data
    useEffect(() => {
        // Sample products
        const sampleProducts = [
            { id: 1, name: 'Wireless Headphones', category: 'Electronics', price: 129.99, stock: 42, sales: 128 },
            { id: 2, name: 'Running Shoes', category: 'Sports', price: 89.99, stock: 24, sales: 76 },
            { id: 3, name: 'Coffee Maker', category: 'Home', price: 59.99, stock: 15, sales: 53 },
            { id: 4, name: 'Smart Watch', category: 'Electronics', price: 199.99, stock: 8, sales: 94 },
        ];

        // Sample orders
        const sampleOrders = [
            { id: 1001, customer: 'John Doe', date: '2023-06-15', status: 'Delivered', total: 249.98 },
            { id: 1002, customer: 'Jane Smith', date: '2023-06-17', status: 'Processing', total: 89.99 },
            { id: 1003, customer: 'Robert Johnson', date: '2023-06-18', status: 'Shipped', total: 199.99 },
            { id: 1004, customer: 'Emily Davis', date: '2023-06-19', status: 'Pending', total: 149.97 },
        ];

        setProducts(sampleProducts);
        setOrders(sampleOrders);
    }, []);

    // Handle product form changes
    const handleProductChange = (e) => {
        const { name, value } = e.target;
        setProductForm(prev => ({ ...prev, [name]: value }));
    };

    // Handle order form changes
    const handleOrderChange = (e) => {
        const { name, value } = e.target;
        setOrderForm(prev => ({ ...prev, [name]: value }));
    };

    // Create new product
    const createProduct = () => {
        const newProduct = {
            id: products.length + 1,
            ...productForm,
            price: parseFloat(productForm.price),
            stock: parseInt(productForm.stock),
            sales: 0
        };
        setProducts([...products, newProduct]);
        setShowProductModal(false);
        resetProductForm();
    };

    // Update existing product
    const updateProduct = () => {
        const updatedProducts = products.map(p =>
            p.id === currentProduct.id ? { ...p, ...productForm } : p
        );
        setProducts(updatedProducts);
        setShowProductModal(false);
        setCurrentProduct(null);
        resetProductForm();
    };

    // Delete product
    const deleteProduct = (id) => {
        setProducts(products.filter(p => p.id !== id));
    };

    // Update order status
    const updateOrder = () => {
        const updatedOrders = orders.map(o =>
            o.id === currentOrder.id ? { ...o, status: orderForm.status } : o
        );
        setOrders(updatedOrders);
        setShowOrderModal(false);
        setCurrentOrder(null);
    };

    // Delete order
    const deleteOrder = (id) => {
        setOrders(orders.filter(o => o.id !== id));
    };

    // Reset product form
    const resetProductForm = () => {
        setProductForm({
            name: '',
            category: '',
            price: '',
            stock: '',
            description: ''
        });
    };

    // Open product modal for editing
    const openEditProduct = (product) => {
        setCurrentProduct(product);
        setProductForm({
            name: product.name,
            category: product.category,
            price: product.price,
            stock: product.stock,
            description: product.description || ''
        });
        setShowProductModal(true);
    };

    // Open order modal for editing
    const openEditOrder = (order) => {
        setCurrentOrder(order);
        setOrderForm({
            status: order.status,
            customer: order.customer,
            total: order.total,
            items: order.items || ''
        });
        setShowOrderModal(true);
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
            <div
                className={`bg-white shadow-md transform top-0 left-0 w-64 fixed h-full overflow-auto ease-in-out transition-all duration-300 z-30 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="flex items-center justify-between p-4 border-b">
                    <div className="flex items-center space-x-2">
                        <div className="w-10 h-10 rounded-md bg-[#FD5B00]/10 flex items-center justify-center">
                            <FiShoppingBag className="text-[#FD5B00] text-xl" />
                        </div>
                        <span className="text-xl font-bold text-gray-800">ShopAdmin</span>
                    </div>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="text-gray-500 hover:text-[#FD5B00]"
                    >
                        <FiMenu className="text-xl" />
                    </button>
                </div>

                <nav className="mt-6 px-2">
                    <button
                        onClick={() => setActiveTab('dashboard')}
                        className={`flex items-center w-full p-3 rounded-lg mb-2 ${activeTab === 'dashboard'
                            ? 'bg-[#FD5B00]/10 text-[#FD5B00]'
                            : 'text-gray-700 hover:bg-gray-100'
                            }`}
                    >
                        <FiHome className="mr-3" />
                        <span>Dashboard</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('products')}
                        className={`flex items-center w-full p-3 rounded-lg mb-2 ${activeTab === 'products'
                            ? 'bg-[#FD5B00]/10 text-[#FD5B00]'
                            : 'text-gray-700 hover:bg-gray-100'
                            }`}
                    >
                        <FiPackage className="mr-3" />
                        <span>Products</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('orders')}
                        className={`flex items-center w-full p-3 rounded-lg mb-2 ${activeTab === 'orders'
                            ? 'bg-[#FD5B00]/10 text-[#FD5B00]'
                            : 'text-gray-700 hover:bg-gray-100'
                            }`}
                    >
                        <FiShoppingCart className="mr-3" />
                        <span>Orders</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('customers')}
                        className={`flex items-center w-full p-3 rounded-lg mb-2 ${activeTab === 'customers'
                            ? 'bg-[#FD5B00]/10 text-[#FD5B00]'
                            : 'text-gray-700 hover:bg-gray-100'
                            }`}
                    >
                        <FiUsers className="mr-3" />
                        <span>Customers</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`flex items-center w-full p-3 rounded-lg ${activeTab === 'settings'
                            ? 'bg-[#FD5B00]/10 text-[#FD5B00]'
                            : 'text-gray-700 hover:bg-gray-100'
                            }`}
                    >
                        <FiSettings className="mr-3" />
                        <span>Settings</span>
                    </button>
                </nav>

                <div className="absolute bottom-0 w-full p-4 border-t">
                    <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-[#FD5B00]/10 flex items-center justify-center">
                            <FiUser className="text-[#FD5B00]" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">Admin User</p>
                            <p className="text-xs text-gray-500">admin@example.com</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'
                }`}>
                {/* Header */}
                <header className="bg-white shadow-sm z-10">
                    <div className="flex items-center justify-between p-4">
                        <div className="flex items-center">
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="text-gray-500 hover:text-[#FD5B00] mr-4"
                            >
                                <FiMenu className="text-xl" />
                            </button>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="relative" ref={profileDropdownRef}>
                                <button
                                    onClick={toggleProfileDropdown}
                                    className="flex items-center space-x-2 focus:outline-none"
                                >
                                    <div className="w-8 h-8 rounded-full bg-[#FD5B00]/10 flex items-center justify-center">
                                        <FiUser className="text-[#FD5B00]" />
                                    </div>
                                    <FiChevronDown className={`text-gray-500 transition-transform duration-200 ${profileDropdownOpen ? 'transform rotate-180' : ''
                                        }`} />
                                </button>

                                {/* Dropdown Menu */}
                                {profileDropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50">
                                        <div className="px-4 py-3 border-b">
                                            <p className="text-sm font-medium text-gray-900">Admin User</p>
                                            <p className="text-xs text-gray-500 truncate">admin@example.com</p>
                                        </div>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 focus:outline-none transition-colors"
                                        >
                                            <FiLogOut className="mr-3" />
                                            <span>Logout</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Dashboard Content */}
                <main className="flex-1 h-auto p-6 bg-gray-50">
                    {/* Dashboard Stats */}
                    {activeTab === 'dashboard' && (
                        <>
                            <Dashboard setActiveTab={setActiveTab} orders={orders} products={products} />
                        </>
                    )}

                    {/* Products Management */}
                    {activeTab === 'products' && (
                        <Products openEditProduct={openEditProduct} deleteProduct={deleteProduct} setCurrentProduct={setCurrentProduct} resetProductForm={resetProductForm} setShowProductModal={setShowProductModal} products={products} />
                    )}

                    {/* Orders Management */}
                    {activeTab === 'orders' && (
                        <Orders orders={orders} openEditOrder={openEditOrder} deleteOrder={deleteOrder} />
                    )}

                    {/* Customers View */}
                    {activeTab === 'customers' && (
                        <Customer />
                    )}

                    {/* Settings View */}
                    {activeTab === 'settings' && (
                        <Settings />
                    )}
                </main>
            </div>

            {/* Product Modal */}
            {showProductModal && (
                <ShowProductModal currentProduct={currentProduct} productForm={productForm} handleProductChange={handleProductChange} setShowProductModal={setShowProductModal} updateProduct={updateProduct} createProduct={createProduct} />
            )}

            {/* Order Modal */}
            {showOrderModal && (
                <ShowOrderModal currentOrder={currentOrder} orderForm={orderForm} updateOrder={updateOrder} handleOrderChange={handleOrderChange} setShowOrderModal={setShowOrderModal} />
            )}
        </div>
    );
};

export default AdminDashboard; 