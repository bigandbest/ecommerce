"use client";
import React, { useContext } from "react";
import { useRouter } from "next/navigation";
import { CartContext } from "@/Context/CartContext";

const AddToCartButton = ({
  product,
  variant = null,
  size = "default",
  className = "",
  showCheckoutButton = true,
}) => {
  const router = useRouter();
  const {
    addToCart,
    getItemQuantity,
    increaseQuantity,
    decreaseQuantity,
    isItemInCart,
  } = useContext(CartContext);

  // Create unique ID for variant or use product ID
  const itemId = variant ? `${product.id}_${variant.id}` : product.id;
  const quantity = getItemQuantity(itemId);
  const isInCart = isItemInCart(itemId);
  // Check stock status (support both inStock and in_stock properties)
  const stockStatus =
    product.inStock !== undefined ? product.inStock : product.in_stock;

  // Use variant stock if available, otherwise product stock
  const maxStock = variant ? variant.variant_stock : (
    product.stock ||
    (stockStatus !== false && stockStatus !== null && stockStatus !== 0
      ? 99
      : 0)
  );

  const handleAddToCart = () => {
    if (maxStock > 0) {
      addToCart({
        id: itemId,
        productId: product.id,
        variantId: variant?.id,
        name: variant ? `${product.name} (${variant.variant_weight})` : product.name,
        price: variant ? variant.variant_price : product.price,
        shipping_amount: product.shipping_amount || 0,
        image: product.image,
        weight: variant ? variant.variant_weight : product.weight,
        stock: maxStock,
        quantity: 1,
      });
    }
  };

  const handleIncrease = () => {
    increaseQuantity(itemId, maxStock);
  };

  const handleDecrease = () => {
    decreaseQuantity(itemId);
  };

  const handleCheckout = () => {
    router.push("/pages/cart");
  };

  // Size variants
  const sizeClasses = {
    small: {
      button: "px-2 py-1 text-xs sm:px-2 sm:py-1",
      quantityButton: "w-7 h-7 sm:w-6 sm:h-6 text-xs sm:text-xs",
      quantityText: "text-xs sm:text-xs px-1.5",
      checkoutButton: "px-2 py-1 text-xs mt-1",
    },
    default: {
      button: "px-2 sm:px-3 py-1 text-xs sm:text-sm",
      quantityButton: "w-7 h-7 sm:w-8 sm:h-8 text-sm",
      quantityText: "text-sm px-2 sm:px-3",
      checkoutButton: "px-3 py-1.5 text-xs sm:text-sm mt-2",
    },
    large: {
      button: "px-4 py-2 text-sm",
      quantityButton: "w-8 h-8 text-sm",
      quantityText: "text-sm px-3",
      checkoutButton: "px-4 py-2 text-sm mt-2",
    },
  };

  const currentSize = sizeClasses[size] || sizeClasses.default;

  // If product is out of stock (only show out of stock if explicitly marked as false/null/0)
  if (
    stockStatus === false ||
    stockStatus === null ||
    stockStatus === 0 ||
    maxStock === 0
  ) {
    return (
      <button
        disabled
        className={`bg-gray-300 text-gray-500 rounded font-semibold cursor-not-allowed ${currentSize.button} ${className}`}
      >
        Out of Stock
      </button>
    );
  }

  // If item is not in cart, show Add to Cart button
  if (!isInCart || quantity === 0) {
    return (
      <button
        onClick={handleAddToCart}
        className={`bg-white border-2 border-[#FF7558] text-[#FF7558] rounded font-semibold hover:bg-[#FF7558] hover:text-white transition-colors ${currentSize.button} ${className}`}
      >
        Add to Cart
      </button>
    );
  }

  // If item is in cart, show quantity controls and checkout button
  return (
    <div className={`flex flex-col space-y-1 ${className}`}>
      {/* Quantity Controls */}
      <div className="flex items-center justify-center bg-[#FF7558]/10 border border-[#FF7558]/30 rounded">
        <button
          onClick={handleDecrease}
          className={`bg-[#FF7558] text-white rounded-l hover:bg-[#e65c00] transition-colors flex items-center justify-center ${currentSize.quantityButton}`}
        >
          −
        </button>
        <span
          className={`bg-white text-gray-900 font-semibold flex items-center justify-center ${currentSize.quantityText}`}
        >
          {quantity}
        </span>
        <button
          onClick={handleIncrease}
          disabled={quantity >= maxStock}
          className={`bg-[#FF7558] text-white rounded-r hover:bg-[#e65c00] transition-colors flex items-center justify-center disabled:bg-gray-300 disabled:cursor-not-allowed ${currentSize.quantityButton}`}
        >
          +
        </button>
      </div>

      {/* Checkout Button */}
      {showCheckoutButton && (
        <button
          onClick={handleCheckout}
          className={`bg-[#FF7558] text-white rounded font-semibold hover:bg-[#e65c00] transition-colors ${currentSize.checkoutButton}`}
        >
          Checkout
        </button>
      )}
    </div>
  );
};

export default AddToCartButton;
