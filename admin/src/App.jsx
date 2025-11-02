import { useState } from "react";
import { AdminAuthProvider, useAdminAuth } from "./contexts/AdminAuthContext";
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  Navigate,
} from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/spotlight/styles.css";
import { Notifications } from "@mantine/notifications";
import { ModalsProvider } from "@mantine/modals";
import { Spotlight } from "@mantine/spotlight";
import {
  FaSearch,
  FaHome,
  FaUsers,
  FaBoxOpen,
  FaQuestionCircle,
} from "react-icons/fa";

// Components
import Sidebar from "./Components/Sidebar";
import Header from "./Components/Header";
import AuthenticationForm from "./Components/AuthenticationForm";
import ErrorBoundary from "./Components/ErrorBoundary";

// Pages
import Dashboard from "./Pages/Dashboard";
import ProductsPage from "./Pages/Products";
import AddProduct from "./Pages/Products/AddProduct";
import CategoriesPage from "./Pages/Categories";
import AddCategory from "./Pages/Categories/AddCategory";
import BannersPage from "./Pages/Banners";
import AdsBannersPage from "./Pages/AdsBanners"; // Import AdsBannersPage
import UsersPage from "./Pages/Users";
import EnquiryPage from "./Pages/Enquiry";
import PrintRequestsPage from "./Pages/PrintRequests";
import Profile from "./Pages/Profile";
import Messages from "./Pages/Messages";
import Settings from "./Pages/Settings";
import PromotionalSettings from "./Pages/PromotionalSettings";
import StorageDetailsPage from "./Pages/Storage";
import BusinessUsersList from "./Pages/BusinessWork/BusinessData.jsx";
import EnhancedStoragePage from "./Pages/Storage/enhanced";
import WarehouseList from "./Pages/WarehousePages/WarehouseList.jsx";
import WarehouseProducts from "./Pages/WarehousePages/WarehouseProducts.jsx";
import VideoBannerManagement from "./Pages/VideoBanners/VideoBannerManagement.jsx";
import AdminOrders from "./Pages/Orders/index.jsx";
import ShippingBanner from "./Pages/ShippingBanner/ShippingBanner.jsx";
import Notification from "./Pages/Notifications/Notification.jsx";
import Bnb from "./Pages/B&b/B&b.jsx";
import BnbGroup from "./Pages/B&b/B&bGroup.jsx";
import BnbGroupProducts from "./Pages/B&b/B&bGroupProducts.jsx";
import Brand from "./Pages/Brand/Brand.jsx";
import BrandProducts from "./Pages/Brand/BrandProducts.jsx";
import QuickPicksPage from "./Pages/QuickPicks/QuickPicks.jsx";
import QuickPickGroupPage from "./Pages/QuickPicks/QuickPickGroup.jsx";
import QuickPickGroupProducts from "./Pages/QuickPicks/QuickPickGroupProducts.jsx";
import RecommendedStore from "./Pages/RecommendedStore/RecommendedStore.jsx";
import RecommendedStoreProducts from "./Pages/RecommendedStore/RecommendedStoreProducts.jsx";
import ShopByStore from "./Pages/ShopByStore/ShopByStore.jsx";
import SavingZone from "./Pages/SavingZone/SavingZone.jsx";
import SavingZoneGroupPage from "./Pages/SavingZone/SavingZoneGroup.jsx";
import SavingZoneGroupProducts from "./Pages/SavingZone/SavingZoneGroupProducts.jsx";
import YouMayLikeProducts from "./Pages/YouMayLike/YouMayLikeProducts.jsx";
import Store from "./Components/Store/Store.jsx";
import SubStore from "./Pages/SubStore/SubStore.jsx";
import AdminWalletManagement from "./Pages/WalletManagement/index.jsx";
import AddBanner from "./Pages/AddBanners/AddBanner.jsx";
import AddBannerGroup from "./Pages/AddBanners/AddBannerGroup.jsx";
import AddBannerGroupProducts from "./Pages/AddBanners/AddBannerGroupProducts.jsx";
import UniqueSection from "./Pages/UniqueSection/UniqueSection.jsx";
import UniqueSectionProducts from "./Pages/UniqueSection/UniqueSectionProduct.jsx";
import VideoCards from "./Pages/VideoCards/VideoCards.jsx";
import BbmDost from "./Pages/BbmDost/BbmDost.jsx";
import ReturnOrdersAdmin from "./Pages/ReturnOrders/index.jsx";
import BulkOrderEnquiries from "./Components/BulkOrders/BulkOrderEnquiries.jsx";
import WholesaleBulkOrders from "./Components/BulkOrders/WholesaleBulkOrders.jsx";
import BulkProductSettings from "./Components/BulkProducts/BulkProductSettings.jsx";
import ProductSectionsManagement from "./Pages/ProductSections/index.jsx";
import StoreSectionMapping from "./Pages/StoreSectionMapping/StoreSectionMapping.jsx";

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen mantine-bg">
      <Sidebar isOpen={sidebarOpen} />
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          sidebarOpen ? "ml-60" : "ml-[70px]"
        }`}
      >
        <Header toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
        <main className="flex-1 overflow-y-auto mantine-bg rounded-tl-xl shadow-inner p-4">
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

// Actions for spotlight search
const spotlightActions = [
  {
    id: "home",
    label: "Dashboard",
    description: "Go to dashboard",
    icon: <FaHome size={18} />,
    onClick: () => (window.location.href = "/"),
  },
  {
    id: "products",
    label: "Products",
    description: "Manage your products",
    icon: <FaBoxOpen size={18} />,
    onClick: () => (window.location.href = "/products"),
  },
  {
    id: "users",
    label: "Users",
    description: "Manage your users",
    icon: <FaUsers size={18} />,
    onClick: () => (window.location.href = "/users"),
  },
  {
    id: "enquiry",
    label: "Enquiries",
    description: "View customer enquiries",
    icon: <FaQuestionCircle size={18} />,
    onClick: () => (window.location.href = "/enquiry"),
  },
];

function App() {
  // Auth state will be managed by the AdminAuthContext

  const router = createBrowserRouter([
    {
      path: "/login",
      element: <AuthenticationForm />,
    },
    {
      element: (
        <ProtectedRoute>
          <MainLayout />
        </ProtectedRoute>
      ),
      children: [
        {
          path: "/",
          element: <Dashboard />,
        },
        {
          path: "/products",
          element: <ProductsPage />,
        },
        {
          path: "/products/add",
          element: <AddProduct />,
        },
        {
          path: "/categories",
          element: <CategoriesPage />,
        },
        {
          path: "/categories/add",
          element: <AddCategory />,
        },
        {
          path: "/banners",
          element: <BannersPage />,
        },
        {
          path: "/ads-banners",
          element: <AdsBannersPage />,
        },
        {
          path: "/users",
          element: <UsersPage />,
        },
        {
          path: "/wallet-management",
          element: <AdminWalletManagement />,
        },
        {
          path: "/enquiry",
          element: <EnquiryPage />,
        },
        {
          path: "/print-requests",
          element: <PrintRequestsPage />,
        },
        {
          path: "/profile",
          element: <Profile />,
        },
        {
          path: "/messages",
          element: <Messages />,
        },
        {
          path: "/section",
          element: <Store />,
        },
        {
          path: "/sub-section",
          element: <SubStore />,
        },
        {
          path: "/settings",
          element: <Settings />,
        },
        {
          path: "/promotional-settings",
          element: <PromotionalSettings />,
        },
        {
          path: "/storage",
          element: <StorageDetailsPage />,
        },
        {
          path: "/storage/enhanced",
          element: <EnhancedStoragePage />,
        },
        {
          path: "/business-data",
          element: <BusinessUsersList />,
        },
        {
          path: "/warehouselist",
          element: <WarehouseList />,
        },
        {
          path: "/AdminOrders",
          element: <AdminOrders />,
        },
        {
          path: "/return-orders",
          element: <ReturnOrdersAdmin />,
        },
        {
          path: "/warehouseproducts/:id/products",
          element: <WarehouseProducts />,
        },
        {
          path: "/VideoBannerManagement",
          element: <VideoBannerManagement />,
        },
        {
          path: "/ShippingBanner",
          element: <ShippingBanner />,
        },
        {
          path: "/notifications",
          element: <Notification />,
        },
        {
          path: "/b&b",
          element: <Bnb />,
        },
        {
          path: "/bnb-groups",
          element: <BnbGroup />,
        },
        {
          path: "/b&b-groups-products/:id",
          element: <BnbGroupProducts />,
        },
        {
          path: "/add-banner",
          element: <AddBanner />,
        },
        { path: "/add-banner-group", element: <AddBannerGroup /> },
        {
          path: "/add-banner-group-products/:id",
          element: <AddBannerGroupProducts />,
        },
        {
          path: "/video-cards",
          element: <VideoCards />,
        },
        {
          path: "/brands",
          element: <Brand />,
        },
        {
          path: "/brandproducts/:id",
          element: <BrandProducts />,
        },
        {
          path: "/quick-picks",
          element: <QuickPicksPage />,
        },
        {
          path: "/quick-pick-groups",
          element: <QuickPickGroupPage />,
        },
        {
          path: "/quick-pick-group/products/:id",
          element: <QuickPickGroupProducts />,
        },
        {
          path: "/recommended-stores",
          element: <RecommendedStore />,
        },
        {
          path: "/recommendedstoreproducts/:id",
          element: <RecommendedStoreProducts />,
        },
        {
          path: "/shop-by-stores",
          element: <ShopByStore />,
        },
        {
          path: "/store-section-mapping",
          element: <StoreSectionMapping />,
        },
        {
          path: "/saving-zone",
          element: <SavingZone />,
        },
        {
          path: "/saving-zone-groups",
          element: <SavingZoneGroupPage />,
        },
        {
          path: "/saving-zone-group/products/:id",
          element: <SavingZoneGroupProducts />,
        },
        {
          path: "/youMayLikeProducts/:id",
          element: <YouMayLikeProducts />,
        },
        {
          path: "/unique-sections",
          element: <UniqueSection />,
        },
        {
          path: "/unique-sections/sections/:id",
          element: <UniqueSectionProducts />,
        },
        {
          path: "/bbm-dost",
          element: <BbmDost />,
        },
        {
          path: "/bulk-order-enquiries",
          element: <BulkOrderEnquiries />,
        },
        {
          path: "/wholesale-bulk-orders",
          element: <WholesaleBulkOrders />,
        },
        {
          path: "/bulk-product-settings",
          element: <BulkProductSettings />,
        },
        {
          path: "/product-sections",
          element: <ProductSectionsManagement />,
        },
      ],
    },
  ]);

  return (
    <ErrorBoundary>
      <AdminAuthProvider>
        <ModalsProvider>
          <Notifications position="top-right" zIndex={1000} />
          <Spotlight
            actions={spotlightActions}
            searchProps={{
              placeholder: "Search...",
              leftSection: <FaSearch size={18} />,
            }}
            shortcut="mod + k"
          />
          <RouterProvider router={router} />
        </ModalsProvider>
      </AdminAuthProvider>
    </ErrorBoundary>
  );
}

// Protected route component using the AdminAuthContext
import PropTypes from "prop-types";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, error } = useAdminAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen mantine-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800"></div>
        <p className="ml-4 text-gray-600">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen mantine-bg">
        <div className="text-center">
          <p className="text-red-600 mb-4">Authentication Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default App;
