"use client";
import React, { useState, useContext } from "react";
import { CartContext } from "@/Context/CartContext";
import { useRouter } from "next/navigation";

const AddToCartModal = ({ isOpen, onClose, product }) => {
  const { addToCart, getItemQuantity } = useContext(CartContext);
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const existingQuantity = getItemQuantity(product?.id);

  const handleAddToCart = () => {
    if (!product) return;
    const cartItem = {
      id: product.id,
      name: product.name,
      price: parseFloat(product.price.toString().replace(/,/g, "")),
      oldPrice: parseFloat(product.oldPrice.toString().replace(/,/g, "")),
      image: product.image,
      rating: product.rating,
      reviews: product.reviews,
      brand: product.brand,
    };
    addToCart(cartItem);
    onClose();
  };

  const handleGoToCheckout = () => {
    if (!product) return;
    const cartItem = {
      id: product.id,
      name: product.name,
      price: parseFloat(product.price.toString().replace(/,/g, "")),
      oldPrice: parseFloat(product.oldPrice.toString().replace(/,/g, "")),
      image: product.image,
      rating: product.rating,
      reviews: product.reviews,
      brand: product.brand,
    };

    // Add to cart if not already present
    if (existingQuantity === 0) {
      addToCart(cartItem);
    }

    router.push("/pages/cart");
    onClose();
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Choose Action</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ×
          </button>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <img
            src={product.image}
            alt={product.name}
            className="w-16 h-16 object-contain rounded-lg bg-gray-50 p-2"
          />
          <div className="flex-1">
            <h4 className="font-medium text-sm mb-1">{product.name}</h4>
            <p className="text-lg font-bold text-[#FF6B00]">₹{product.price}</p>
          </div>
        </div>

        {existingQuantity > 0 && (
          <div className="mb-4 p-3 bg-orange-50 rounded-lg">
            <p className="text-sm text-orange-700">
              You already have {existingQuantity} item(s) in your cart
            </p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <button
            onClick={handleAddToCart}
            className="w-full bg-[#FF6B00] hover:bg-[#e65c00] text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            {existingQuantity > 0 ? "Add 1 More to Cart" : "Add to Cart"}
          </button>

          <button
            onClick={handleGoToCheckout}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Go to Checkout
          </button>

          <button
            onClick={onClose}
            className="w-full border border-gray-300 text-gray-700 font-medium py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddToCartModal;
