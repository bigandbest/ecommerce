import React, { useState, useEffect } from "react";
import {
  getWishlistItems,
  removeFromWishlist,
  addToCart,
} from "../../utils/supabaseApi";
import { useAuth } from "../../contexts/AuthContext";
import { Link } from "react-router-dom";
import { FaTrashAlt } from "react-icons/fa";

const WishlistCarousel = () => {
  const { currentUser } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(null);

  useEffect(() => {
    async function fetchWishlist() {
      if (!currentUser?.id) {
        setWishlist([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      const { wishlistItems, success } = await getWishlistItems(currentUser.id);
      setWishlist(success && wishlistItems ? wishlistItems : []);
      setLoading(false);
    }
    fetchWishlist();
  }, [currentUser]);

  const handleRemove = async (wishlist_item_id) => {
    const originalWishlist = [...wishlist];
    setWishlist((current) =>
      current.filter((item) => item.wishlist_item_id !== wishlist_item_id)
    );
    const { success } = await removeFromWishlist(wishlist_item_id);
    if (!success) {
      alert("Failed to remove item. Please try again.");
      setWishlist(originalWishlist);
    }
  };

  const handleAddToCart = async (product_id) => {
    if (!currentUser) {
      alert("Please log in to add items to your cart.");
      return;
    }
    setAddingToCart(product_id);
    const { success } = await addToCart(currentUser.id, product_id, 1);
    if (success) {
      window.dispatchEvent(new Event("cartUpdated"));
    } else {
      alert("Failed to add item to cart. Please try again.");
    }
    setAddingToCart(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[380px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!wishlist.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[380px] px-4 text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Your wishlist is empty
        </h3>
        <p className="text-gray-600 mb-6 text-sm">
          Save your favorite products to see them here!
        </p>
        <Link
          to="/"
          className="px-6 py-3 bg-blue-600 text-white font-medium rounded-full shadow-md hover:bg-blue-700 transition"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 py-4 mt-[-42px]">
      <div className="container mx-auto max-w-4xl">
        <div className="px-4 flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-900">Your Wishlist</h2>
        </div>

        <div className="space-y-3 px-4">
          {wishlist.map((item) => (
            <div
              key={item.wishlist_item_id}
              className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm w-full"
            >
              {/* Left Side: Image and Title */}
              <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                <Link to={`/product/${item.id}`} className="flex-shrink-0">
                  <img
                    src={
                      item.image || "https://placehold.co/100x100?text=Product"
                    }
                    alt={item.name}
                    className="w-14 h-14 sm:w-16 sm:h-16 object-cover rounded-md"
                  />
                </Link>
                <div className="min-w-0">
                  <Link
                    to={`/product/${item.id}`}
                    className="hover:text-blue-600"
                  >
                    <h6 className="font-semibold text-gray-800 text-sm truncate-2">
                      {item.name}
                    </h6>
                  </Link>
                  {item.uom!=null ? <p className="text-xs text-gray-500">{item.uom}</p>: <p className="text-xs text-gray-500">1 Variant</p>}
                </div>
              </div>

              {/* Right Side: Price and Actions */}
              <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0 ml-2">
                <p className="text-sm sm:text-base font-bold text-gray-900 w-16 sm:w-20 text-right">
                  ₹{Number(item.price).toFixed(2)}
                </p>

                <button
                  onClick={() => handleAddToCart(item.id)}
                  disabled={addingToCart === item.id}
                  className="px-3 py-1.5 text-xs font-semibold rounded-md transition-colors bg-pink-100 text-pink-700 hover:bg-pink-200 disabled:bg-gray-200"
                  title="Add to Cart"
                >
                  {addingToCart === item.id ? "Adding" : "Add"}
                </button>

                <button
                  onClick={() => handleRemove(item.wishlist_item_id)}
                  className="p-1 text-red-500 hover:text-red-700"
                  title="Remove from wishlist"
                >
                  <FaTrashAlt size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WishlistCarousel;