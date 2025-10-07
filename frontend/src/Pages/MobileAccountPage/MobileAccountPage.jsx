import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import SkeletonAccountPage from "../../components/SekeletonAccountPage/SkeletonAccountPage";
import supabase from "../../utils/supabase.ts";
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
    className="flex items-center justify-between w-full p-4 !m-0 text-gray-800 transition-colors hover:bg-gray-50 mobile-account-link"
  >
    <div className="flex items-center flex-1 min-w-0">
      <Icon className="w-5 h-5 text-gray-500 flex-shrink-0" />
      <span className="font-medium pl-2">{children}</span>
    </div>
    <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
  </Link>
);

function MobileAccountPage() {
  const { currentUser, logout } = useAuth(); // Get currentUser for name and avatar
  const [loading, setLoading] = useState(true);
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const navigate = useNavigate();

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!currentUser?.id) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("users")
          .select("photo_url")
          .eq("id", currentUser.id)
          .single();

        if (data && !error) {
          setProfileImageUrl(data.photo_url);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [currentUser]);


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
      <div className="p-4 space-y-5 mobile-account-container">

        {/* Profile Header */}
        <div className="p-3 mt-12 bg-white rounded-xl shadow-sm mobile-profile-header">
          <div className="flex items-start space-x-3">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 border border-gray-200 overflow-hidden">
              {profileImageUrl || currentUser?.photo_url || currentUser?.user_metadata?.photo_url ? (
                <img 
                  src={profileImageUrl || currentUser?.photo_url || currentUser?.user_metadata?.photo_url} 
                  alt="User Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <img 
                  src="/user-logo.svg" 
                  alt="User Profile" 
                  className="w-8 h-8 text-gray-600"
                />
              )}
            </div>
            <div className="flex-1 overflow-hidden">
              <h1 className="text-base font-bold text-gray-900 break-words leading-tight">
                {currentUser?.name || "Guest User"}
              </h1>
              <Link to="/account" className="text-sm text-blue-600 hover:underline inline-block mt-1">
                View and edit profile
              </Link>
            </div>
          </div>
        </div>

      

        {/* Main Actions Section */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-200">
            <AccountLink to="/MyOrders" icon={Package}> Orders</AccountLink>
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
            className="flex items-center justify-center w-full text-center bg-white text-red-500 font-medium rounded-xl py-3 px-4 shadow-sm hover:bg-red-50 transition mobile-logout-btn"
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