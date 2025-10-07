// src/components/ProductGrid/ProductGrid.jsx

import React, { useEffect, useState } from "react";
import ProductCard from "../../components/ProductCard2/ProductCard.jsx";
import { useLocationContext } from "../../contexts/LocationContext.jsx";
import { useAuth } from "../../contexts/AuthContext.jsx"; // 👈 Import useAuth
import {
  getNearbyProducts,
  getAllProducts,
  getWishlistItems,    // 👈 Import wishlist functions
  addToWishlist,
  removeFromWishlist,
} from "../../utils/supabaseApi.js";

const ProductGrid = () => {
  const [products, setProducts] = useState([]);
  const { selectedAddress } = useLocationContext();
  const { currentUser } = useAuth(); // 👈 Get the current user

  // Use a Map for efficient lookups (productId -> wishlistItemId)
  const [wishlistMap, setWishlistMap] = useState(new Map());

  // Effect to fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        let fetchedProducts = [];
        if (selectedAddress) {
          const { latitude, longitude } = selectedAddress;
          const { success, products } = await getNearbyProducts(latitude, longitude);
          fetchedProducts = success && Array.isArray(products) ? products : [];
        } else {
          const { success, products } = await getAllProducts();
          fetchedProducts = success && Array.isArray(products) ? products : [];
        }
        const filtered = fetchedProducts.filter((p) => p.is_last_section === true);
        setProducts(filtered);
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts([]);
      }
    };
    fetchProducts();
  }, [selectedAddress]);

  // Effect to fetch wishlist when user logs in/out
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

  // Function to handle adding/removing from wishlist
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
    <div className="flex justify-center">
      <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 gap-4 px-4 sm:px-6 md:px-8 justify-items-center">
        {products.map((product) => (
          <ProductCard
            key={product.id || product.product_id}
            {...product}
            // 👇 Pass new props to the card
            isWishlisted={wishlistMap.has(product.id || product.product_id)}
            onToggleWishlist={() => handleToggleWishlist(product.id || product.product_id)}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductGrid;