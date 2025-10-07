import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  getAllProducts,
  getWishlistItems,
  addToWishlist,
  getYouMayLikeProducts,
  removeFromWishlist,
} from "../../utils/supabaseApi.js"; // adjust path if needed
import { useAuth } from "../../contexts/AuthContext.jsx"; // 👈 Import useAuth
import { FaHeart, FaRegHeart } from "react-icons/fa"; // 👈 Import icons

const ProductGrid3X3 = () => {
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const { currentUser } = useAuth(); // 👈 Get the current user
  const [wishlistMap, setWishlistMap] = useState(new Map());

  // Show only on home route
  if (location.pathname !== "/") return null;

  // Fetch initial products
  useEffect(() => {
    async function fetchProducts() {
      const { success, products } = await getYouMayLikeProducts();
      if (success && products.length > 0) {
        setProducts(products.slice(0, 9)); // only 9 for 3x3 grid
      }
    }
    fetchProducts();
  }, []);

  // 👈 Fetch wishlist when user logs in/out
  useEffect(() => {
    const fetchWishlist = async () => {
      if (currentUser) {
        const { success, wishlistItems } = await getWishlistItems(currentUser.id);
        if (success) {
          const newMap = new Map(
            wishlistItems.map((item) => [item.product_id, item.wishlist_item_id])
          );
          setWishlistMap(newMap);
        }
      } else {
        setWishlistMap(new Map()); // Clear wishlist if user logs out
      }
    };
    fetchWishlist();
  }, [currentUser]);

  // 👈 Function to handle adding/removing from wishlist
  const handleToggleWishlist = async (productId) => {
    if (!currentUser) {
      alert("Please log in to manage your wishlist.");
      return;
    }
    const isWishlisted = wishlistMap.has(productId);
    const newWishlistMap = new Map(wishlistMap);

    if (isWishlisted) {
      const wishlistItemId = wishlistMap.get(productId);
      const { success } = await removeFromWishlist(wishlistItemId);
      if (success) {
        newWishlistMap.delete(productId);
        setWishlistMap(newWishlistMap);
      }
    } else {
      const { success, wishlistItem } = await addToWishlist(currentUser.id, productId);
      if (success) {
        newWishlistMap.set(productId, wishlistItem.id);
        setWishlistMap(newWishlistMap);
      }
    }
  };

  return (
    <div className="sm:hidden px-4 py-4 bg-white">
      <h2 className="text-lg font-semibold mb-3">You may like...</h2>

      {/* 3x3 Grid */}
      <div className="grid grid-cols-3 gap-3">
        {products.map((item) => (
          <div key={item.id} className="relative flex bg-white rounded-lg shadow-sm">
            {/* 👇 Wishlist Button */}
            <span>
            <button
              onClick={() => handleToggleWishlist(item.id)}
              disabled={!currentUser}
              className="absolute !min-w-4 top-1 right-1 z-10 bg-opacity-20 rounded-full text-white disabled:opacity-50"
              aria-label="Toggle Wishlist"
              style={{ minHeight: 20 }}
            >
              {wishlistMap.has(item.id) ? (
                <FaHeart size={14} className="text-pink-500" />
              ) : (
                <FaRegHeart size={14} />
              )}
            </button>
            </span>
            
            <Link to={`/product/${item.id}`}>
              <img
                src={item.image || "https://via.placeholder.com/150"}
                alt={item.name}
                className="w-full h-24 object-cover rounded-t"
              />
              <div>
                <p className="text-xs mt-2 font-medium truncate">{item.name}</p>
                <p className="text-sm font-semibold text-black">₹{item.price || "--"}</p>
                {item.old_price && (
                  <p className="text-xs line-through text-gray-400">₹{item.old_price}</p>
                )}
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* See All Button */}
      <div className="mt-4">
        <Link to={`/ProductLisingPage/you-may-like`}>
          <button className="w-full bg-purple-800 text-white py-2 rounded-lg font-medium">
            See All →
          </button>
        </Link>
      </div>
    </div>
  );
};

export default ProductGrid3X3;