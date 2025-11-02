"use client";
import { createContext, useState, useEffect } from "react";
import { toast } from "react-toastify";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [lastAction, setLastAction] = useState(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage after component mounts (client-side only)
  useEffect(() => {
    setIsHydrated(true);
    if (typeof window !== "undefined") {
      const storedCartItems = localStorage.getItem("cartItems");
      if (storedCartItems) {
        try {
          setCartItems(JSON.parse(storedCartItems));
        } catch (error) {
          console.warn("Failed to parse cart items from localStorage:", error);
          localStorage.removeItem("cartItems");
        }
      }
    }
  }, []);

  // Save to localStorage when cartItems change (only after hydration)
  useEffect(() => {
    if (isHydrated && typeof window !== "undefined") {
      localStorage.setItem("cartItems", JSON.stringify(cartItems));
    }
  }, [cartItems, isHydrated]);

  const addToCart = (item) => {
    const quantityToAdd = item.quantity || 1;
    setCartItems((prevCartItems) => {
      // For bulk items, check both id and isBulkOrder flag
      const existingItemIndex = prevCartItems.findIndex(
        (cartItem) => cartItem.id === item.id && 
        (cartItem.isBulkOrder === item.isBulkOrder || (!cartItem.isBulkOrder && !item.isBulkOrder))
      );

      let newCartItems;
      if (existingItemIndex !== -1 && !item.isBulkOrder) {
        // Only merge quantities for regular items, not bulk items
        newCartItems = prevCartItems.map((cartItem, index) =>
          index === existingItemIndex
            ? { ...cartItem, quantity: cartItem.quantity + quantityToAdd }
            : cartItem
        );
        setLastAction({ type: "update", name: item.name });
      } else {
        // Add as new item (always for bulk items, or new regular items)
        newCartItems = [...prevCartItems, { ...item, quantity: quantityToAdd }];
        setLastAction({ type: "add", name: item.name + (item.isBulkOrder ? ' (Bulk)' : '') });
      }

      return newCartItems;
    });
  };

  // Handle toast notifications after state updates
  useEffect(() => {
    if (lastAction) {
      if (lastAction.type === "add") {
        toast.success(`${lastAction.name} added to cart successfully!`);
      } else if (lastAction.type === "update") {
        toast.success(`${lastAction.name} quantity updated in cart!`);
      }
      setLastAction(null);
    }
  }, [lastAction]);

  const removeFromCart = (item) => {
    setCartItems((prevCartItems) => {
      const existingItem = prevCartItems.find(
        (cartItem) =>
          cartItem.id === item.id &&
          JSON.stringify(cartItem.variations) ===
            JSON.stringify(item.variations)
      );

      if (!existingItem) return prevCartItems;

      if (existingItem.quantity === 1) {
        return prevCartItems.filter(
          (cartItem) =>
            !(
              cartItem.id === item.id &&
              JSON.stringify(cartItem.variations) ===
                JSON.stringify(item.variations)
            )
        );
      } else {
        return prevCartItems.map((cartItem) =>
          cartItem.id === item.id &&
          JSON.stringify(cartItem.variations) ===
            JSON.stringify(item.variations)
            ? { ...cartItem, quantity: cartItem.quantity - 1 }
            : cartItem
        );
      }
    });
  };

  const deleteFromCart = (item) => {
    setCartItems((prevCartItems) =>
      prevCartItems.filter(
        (cartItem) =>
          !(
            cartItem.id === item.id &&
            JSON.stringify(cartItem.variations) ===
              JSON.stringify(item.variations)
          )
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartTotal = () => {
    return cartItems.reduce(
      (total, item) => {
        const basePrice = item.isBulkOrder ? item.bulkPrice || item.price : item.price;
        const shippingAmount = item.shipping_amount || 0;
        const itemTotal = (basePrice + shippingAmount) * item.quantity;
        return total + itemTotal;
      },
      0
    );
  };

  const getBulkItemsCount = () => {
    return cartItems.filter(item => item.isBulkOrder).length;
  };

  const hasBulkItems = () => {
    return cartItems.some(item => item.isBulkOrder);
  };

  const getItemQuantity = (itemId) => {
    const item = cartItems.find((cartItem) => cartItem.id === itemId);
    return item ? item.quantity : 0;
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const updateQuantity = (itemId, newQuantity, maxStock = 999) => {
    if (newQuantity < 1 || newQuantity > maxStock) return;

    setCartItems((prevCartItems) => {
      return prevCartItems.map((cartItem) =>
        cartItem.id === itemId
          ? { ...cartItem, quantity: newQuantity }
          : cartItem
      );
    });
  };

  const increaseQuantity = (itemId, maxStock = 999) => {
    const currentQuantity = getItemQuantity(itemId);
    if (currentQuantity < maxStock) {
      updateQuantity(itemId, currentQuantity + 1, maxStock);
    }
  };

  const decreaseQuantity = (itemId) => {
    const currentQuantity = getItemQuantity(itemId);
    if (currentQuantity > 1) {
      updateQuantity(itemId, currentQuantity - 1);
    } else if (currentQuantity === 1) {
      // Remove item completely when quantity reaches 0
      const item = cartItems.find((cartItem) => cartItem.id === itemId);
      if (item) {
        deleteFromCart(item);
      }
    }
  };

  const isItemInCart = (itemId) => {
    return cartItems.some((cartItem) => cartItem.id === itemId);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        deleteFromCart,
        clearCart,
        getCartTotal,
        getItemQuantity,
        getTotalItems,
        updateQuantity,
        increaseQuantity,
        decreaseQuantity,
        isItemInCart,
        getBulkItemsCount,
        hasBulkItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
