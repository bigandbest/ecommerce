import React, { useState, useEffect } from "react";
import {
  getWishlistItems,
  removeFromWishlist,
  addToCart,
} from "../../utils/supabaseApi";
import { useAuth } from "../../contexts/AuthContext";
import { Link } from "react-router-dom";
import { FaTrashAlt, FaShoppingCart } from "react-icons/fa";

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
    <div className="bg-gray-50 py-4">
      <div className="container mx-auto max-w-4xl">
        <div className="px-4 flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-900">Your Wishlist</h2>
        </div>

        <div className="space-y-4 px-4">
          {wishlist.map((item) => (
            <div
              key={item.wishlist_item_id}
              className="flex bg-white rounded-lg shadow-sm overflow-hidden transition-shadow duration-300 hover:shadow-md"
            >
              {/* Image Link */}
              {/* 👇 FIX: Use item.id instead of item.product_id */}
              <Link
                to={`/product/${item.id}`}
                className="w-28 sm:w-32 flex-shrink-0"
              >
                <img
                  src={
                    item.image || "https://placehold.co/300x300?text=Product"
                  }
                  alt={item.name || "Product"}
                  className="w-full h-full object-cover"
                />
              </Link>

              {/* Details */}
              <div className="p-4 flex flex-col flex-grow justify-between">
                <div>
                  {/* Title Link */}
                  {/* 👇 FIX: Use item.id instead of item.product_id */}
                  <Link
                    to={`/product/${item.id}`}
                    className="hover:text-blue-600"
                  >
                    <h3 className="font-semibold text-gray-800 line-clamp-2">
                      {item.name}
                    </h3>
                  </Link>
                  <p className="text-lg font-bold text-blue-600 mt-1">
                    ₹{Number(item.price).toFixed(2)}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 mt-4">
                  {/* Add to Cart Button */}
                   <button
                     onClick={() => handleAddToCart(item.id)} //  👈 FIX: Use item.id
                     disabled={addingToCart === item.id}
                     className="flex-grow flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm font-semibold rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-300"
                   >
                     <FaShoppingCart />
                     {addingToCart === item.id
                       ? "Adding..."
                       : "Add to Cart"}
                   </button>
                  <button
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                    onClick={() => handleRemove(item.wishlist_item_id)}
                    title="Remove from wishlist"
                  >
                    <FaTrashAlt size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WishlistCarousel;