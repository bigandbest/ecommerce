import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import SkeletonAccountPage from "../../components/SekeletonAccountPage/SkeletonAccountPage";
import {
  User,
  Wallet,
  ClipboardList,
  Phone,
  ShoppingCart,
  LogOut,
  List,
  Package,
  Heart,
  ChevronRight, // Added for navigation arrows
} from "lucide-react";
import { use } from "react";

// A reusable component for each link item to keep the code clean
const AccountLink = ({ to, icon: Icon, children }) => (
  <Link
    to={to}
    className="flex items-center justify-between w-full p-4 !m-0 text-gray-800 transition-colors hover:bg-gray-50"
  >
    <div className="flex items-center">
      <Icon className="w-5 h-5 text-gray-500" />
      <span className="font-medium pl-2">{children}</span>
    </div>
    <ChevronRight className="w-5 h-5 text-gray-400" />
  </Link>
);

function MobileAccountPage() {
  const { currentUser, logout } = useAuth(); // Get currentUser for name and avatar
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // This hook must run before the loading check
  useEffect(() => {
    // Simulate loading delay for 2 seconds
    const timer = setTimeout(() => setLoading(false), 2000); // Changed to 2000ms
    return () => clearTimeout(timer);
  }, []);


  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        navigate("/"); // Redirect to home on desktop
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [navigate]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };


  if (loading) {
    return <SkeletonAccountPage />;
  }

  return (
    <div className="bg-gray-50 md:hidden mt-[-55px] min-h-screen">
      <div className="p-4 space-y-5">

        {/* Profile Header */}
        <div className="p-4 bg-white rounded-xl shadow-sm">
          <div className="flex items-center space-x-4">
            <div className="relative inline-flex items-center justify-center w-16 h-16 overflow-hidden bg-gray-200 rounded-full">
              {/* You can replace this with an <img> tag if you have user avatars */}
              <span className="font-medium text-xl text-gray-600">
                {currentUser?.name ? currentUser.name[0].toUpperCase() : <User />}
              </span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{currentUser?.name || "Guest User"}</h1>
              <Link to="/account" className="text-sm font-medium text-blue-600 hover:underline">
                View and edit profile
              </Link>
            </div>
          </div>
        </div>

      

        {/* Main Actions Section */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-200">
            <AccountLink to="/coming-soon?feature=orders" icon={Package}> Orders</AccountLink>
             <AccountLink to="/account" icon={User}> Profile</AccountLink>
            <AccountLink to="/wishlist" icon={Heart}> Wishlist</AccountLink>
            <AccountLink to="/coming-soon?feature=wallet" icon={Wallet}> Wallet</AccountLink>
            <AccountLink to="/cart" icon={ShoppingCart}> Cart</AccountLink>
          </div>
        </div>

        {/* Other Links Section */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-200">
            <AccountLink to="/enquiry-history" icon={ClipboardList}> Enquiries</AccountLink>
            <AccountLink to="/coming-soon?feature=orders" icon={List}> Refund</AccountLink>
            <AccountLink to="/contact-us" icon={Phone}> Contact Us</AccountLink>
          </div>
        </div>

        {/* Logout Button */}
        <div className="pt-4">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center w-full text-center bg-white text-red-500 font-medium rounded-xl py-3 px-4 shadow-sm hover:bg-red-50 transition"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>

      </div>
    </div>
  );
}

export default MobileAccountPage;