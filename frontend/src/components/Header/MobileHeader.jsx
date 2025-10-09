import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { styled } from "@mui/material/styles";
import Badge from "@mui/material/Badge";
import { MdOutlineShoppingCart } from "react-icons/md";
import { ChevronRight, MapPin, Bell, ShoppingCart, AlignLeft } from "lucide-react";
import { useLocationContext } from "../../contexts/LocationContext";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
    getCartItems,
} from "../../utils/supabaseApi";
import { useNotifications } from "../../contexts/NotificationContext";
import supabase from "../../utils/supabase.ts";

const StyledBadge = styled(Badge)(({ theme }) => ({
    "& .MuiBadge-badge": {
        right: 3, // Move badge more to the left to avoid covering text
        top: 0, // Adjust top position slightly
        border: `2px solid ${theme.palette.background.paper}`,
        padding: "0 4px",
        backgroundColor: "#ff4081",
        fontSize: "0.7rem",
        minWidth: "16px",
        height: "16px",
    },
}));

const MobileHeader = ({ toggleMobileMenu }) => {
    const { currentUser } = useAuth();
    const [cartCount, setCartCount] = useState(0);
    const [profileImageUrl, setProfileImageUrl] = useState(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const { selectedAddress, setShowModal, setModalMode } = useLocationContext();
    const location = useLocation();
    const navigate = useNavigate();
    const { unread = new Set(), fetchNotifications = () => {} } = useNotifications() || {};

    useEffect(()=>{
        fetchNotifications();
    })

    // Fetch user profile image
    useEffect(() => {
        const fetchUserProfile = async () => {
            if (!currentUser?.id) {
                setProfileImageUrl(null);
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
            }
        };
        fetchUserProfile();
    }, [currentUser]);

    useEffect(() => {
        async function fetchCart() {
            if (!currentUser) {
                setCartCount(0);
                return;
            }
            const { success, cartItems } = await getCartItems(currentUser.id);
            if (success && cartItems) {
                const total = cartItems.reduce((sum, item) => sum + item.quantity, 0);
                setCartCount(total);
            } else {
                setCartCount(0);
            }
        }
        fetchCart();
        // Listen for cart updates
        window.addEventListener("cartUpdated", fetchCart);
        return () => window.removeEventListener("cartUpdated", fetchCart);
    }, [currentUser]);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    if (isMobile && location.pathname.startsWith("/subcategories")) return null;
    if (location.pathname.startsWith("/category")) return null;
    if (location.pathname.startsWith("/ProductLisingPage")) return null;
    if (location.pathname.startsWith("/b&b")) return null;
    if (location.pathname.startsWith("/quick-pick")) return null;
    if (location.pathname.startsWith("/saving-zone")) return null;
    if (location.pathname == "/all") {
        return null;
    }
    if (location.pathname == "/Notifications") {
        return null;
    }
    if (location.pathname == "/MobileAccount") {
    return null;
  }
  if (location.pathname == "/wishlist") {
    return null;
  }
  if (location.pathname == "/cart") {
    return null;
  }
    return (
        <header className="bg-white header-container shadow-sm sticky top-0 z-50">
            <div className="flex items-center w-full p-0 h-13 justify-between">
                {/* Hamburger icon */}
                <button className="p-2">
                    <AlignLeft size={24} onClick={toggleMobileMenu} />
                </button>

                {/* Logo */}
                <div className="flex flex-col mr-4">
                    {/* <span className="font-semibold leading-none text-sm">BigBestmart</span>
                    <span className="text-[10px] text-gray-500 leading-none">A2C Junctions</span> */}
                    <img src="https://i.postimg.cc/k4SvL710/BBM-Logo.png" alt="Logo" className="w-30 mt-1" />
                </div>

                {/* Right icons and button */}
                <div className="flex items-center mr-1">
                    <Link to='/Notifications'>
                        <button className="p-2">
                            <Bell size={27} />
                            {unread.size > 0 && (
                                <span className="absolute top-1 right-30 flex items-center justify-center align-middle w-[13px] h-[13px] bg-red-500 text-white text-xs font-bold rounded-full">
                                    {unread.size}
                                </span>
                            )}
                        </button>
                    </Link>
                    <Link
                        to="/cart"
                        className="flex items-center rounded-lg hover:bg-gray-100 transition-colors group"
                    >
                        <div className="relative">
                            <StyledBadge badgeContent={cartCount} color="secondary">
                                <MdOutlineShoppingCart className="w-7 h-7 text-gray-600 group-hover:text-blue-600" />
                            </StyledBadge>
                        </div>
                    </Link>
                    <button
                        onClick={() => { currentUser ? navigate("/MobileAccount") : navigate("/login") }}
                        className="flex items-center justify-center p-2 w-12 h-12 rounded-full overflow-hidden"
                    >
                        {currentUser ? (
                            profileImageUrl || currentUser?.photo_url || currentUser?.user_metadata?.photo_url ? (
                                <img 
                                    src={profileImageUrl || currentUser?.photo_url || currentUser?.user_metadata?.photo_url} 
                                    alt="User Profile" 
                                    className="w-full h-full object-cover rounded-lg"
                                />
                            ) : (
                                <img 
                                    src="/user-logo.svg" 
                                    alt="User Profile" 
                                    className="w-6 h-6 text-gray-700"
                                />
                            )
                        ) : (
                            <span className="text-xs font-medium text-gray-700">Sign</span>
                        )}
                    </button>

                </div>
            </div>


        </header>
    );
};

export default MobileHeader;



{/* <NavLink
                    to="/"
                    className={({ isActive }) =>
                        `md:hidden block !m-0  border rounded-md ${isActive ? "bg-blue-500 text-white" : "bg-white"
                        }`
                    }
                >
                    <img
                        src="https://i.postimg.cc/G21jC29J/Gemini-Generated-Image-592j5z592j5z592j.png"
                        alt={`image`}
                        className="h-10 w-12 p-0.5 rounded-md mt-2 object-contain bg-transparent"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                                "https://placehold.co/160x40?text=" +
                                getSetting("company_name", "BBMart");
                        }}
                    />
                </NavLink>
                <NavLink
                    to="/cart"
                    className={({ isActive }) =>
                        `md:hidden block !m-0  border rounded-md ${isActive ? "bg-blue-500 text-white" : "bg-white"
                        }`
                    }
                >
                    <img
                        src="https://i.postimg.cc/G21jC29J/Gemini-Generated-Image-592j5z592j5z592j.png"
                        alt={`image`}
                        className="h-10 w-12 p-0.5 rounded-md mt-2 object-contain bg-transparent"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                                "https://placehold.co/160x40?text=" +
                                getSetting("company_name", "BBMart");
                        }}
                    />
                </NavLink>
                <NavLink
                    to="/login"
                    className={({ isActive }) =>
                        `md:hidden block !m-0  border rounded-md ${isActive ? "bg-blue-500 text-white" : "bg-white"
                        }`
                    }
                >
                    <img
                        src="https://i.postimg.cc/G21jC29J/Gemini-Generated-Image-592j5z592j5z592j.png"
                        alt={`image`}
                        className="h-10 w-12 p-0.5 rounded-md mt-2 object-contain bg-transparent"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                                "https://placehold.co/160x40?text=" +
                                getSetting("company_name", "BBMart");
                        }}
                    />
                </NavLink>
                <NavLink
                    to="/signup"
                    className={({ isActive }) =>
                        `md:hidden block !m-0  border rounded-md ${isActive ? "bg-blue-500 text-white" : "bg-white"
                        }`
                    }
                >
                    <img
                        src="https://i.postimg.cc/G21jC29J/Gemini-Generated-Image-592j5z592j5z592j.png"
                        alt={`image`}
                        className="h-10 w-12 p-0.5 rounded-md mt-2 object-contain bg-transparent"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                                "https://placehold.co/160x40?text=" +
                                getSetting("company_name", "BBMart");
                        }}
                    />
                </NavLink>
                <NavLink
                    to="/about-us"
                    className={({ isActive }) =>
                        `md:hidden block !m-0  border rounded-md ${isActive ? "bg-blue-500 text-white" : "bg-white"
                        }`
                    }
                >
                    <img
                        src="https://i.postimg.cc/G21jC29J/Gemini-Generated-Image-592j5z592j5z592j.png"
                        alt={`image`}
                        className="h-10 w-12 p-0.5 rounded-md mt-2 object-contain bg-transparent"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                                "https://placehold.co/160x40?text=" +
                                getSetting("company_name", "BBMart");
                        }}
                    />
                </NavLink>
                <NavLink
                    to="/contact-us"
                    className={({ isActive }) =>
                        `md:hidden block !m-0  border rounded-md ${isActive ? "bg-blue-500 text-white" : "bg-white"
                        }`
                    }
                >
                    <img
                        src="https://i.postimg.cc/G21jC29J/Gemini-Generated-Image-592j5z592j5z592j.png"
                        alt={`image`}
                        className="h-10 w-12 p-0.5 rounded-md mt-2 object-contain bg-transparent"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                                "https://placehold.co/160x40?text=" +
                                getSetting("company_name", "BBMart");
                        }}
                    />
                </NavLink> */}