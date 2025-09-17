// controllers/cartController.js
import { supabase } from "../config/supabaseClient.js";

/**
 * @description Get all cart items for a specific user, joining product details.
 * @route GET /api/cart/:user_id
 */
export const getCartItems = async (req, res) => {
  const { user_id } = req.params;

  const { data, error } = await supabase
    .from("cart_items")
    .select("id, product_id, quantity, added_at, products(*)")
    .eq("user_id", user_id);

  if (error) {
    console.error("Error fetching cart items:", error.message);
    return res.status(500).json({ success: false, error: error.message });
  }

  // Restructure the data to be more convenient on the client-side
  const cartItems = data.map((item) => ({
    ...item.products, // Spread product details (name, price, etc.)
    cart_item_id: item.id,
    quantity: item.quantity,
    added_at: item.added_at,
  }));

  return res.json({ success: true, cartItems });
};

/**
 * @description Add a product to the cart. If it already exists, increment the quantity.
 * @route POST /api/cart/add
 */
export const addToCart = async (req, res) => {
  const { user_id, product_id, quantity = 1 } = req.body;

  // Validate input
  if (!user_id || !product_id) {
    return res.status(400).json({ success: false, error: "user_id and product_id are required." });
  }
  if (!Number.isInteger(quantity) || quantity <= 0) {
    return res.status(400).json({ success: false, error: "Quantity must be a positive integer." });
  }

  // Check if the item already exists in the cart
  const { data: existingItem, error: findError } = await supabase
    .from("cart_items")
    .select("id, quantity")
    .eq("user_id", user_id)
    .eq("product_id", product_id)
    .single();

  // Handle errors, but ignore PGRST116 which means "no rows found" - this is expected
  if (findError && findError.code !== "PGRST116") {
    console.error("Error finding cart item:", findError.message);
    return res.status(500).json({ success: false, error: findError.message });
  }

  // If item exists, update its quantity
  if (existingItem) {
    const { data: updatedItem, error: updateError } = await supabase
      .from("cart_items")
      .update({ quantity: existingItem.quantity + quantity })
      .eq("id", existingItem.id)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating cart item quantity:", updateError.message);
      return res.status(500).json({ success: false, error: updateError.message });
    }
    return res.status(200).json({ success: true, cartItem: updatedItem });
  } 
  
  // If item does not exist, insert a new row
  else {
    const { data: newItem, error: insertError } = await supabase
      .from("cart_items")
      .insert([{ user_id, product_id, quantity }])
      .select()
      .single();

    if (insertError) {
      console.error("Error inserting new cart item:", insertError.message);
      return res.status(500).json({ success: false, error: insertError.message });
    }
    return res.status(201).json({ success: true, cartItem: newItem });
  }
};

/**
 * @description Update the quantity of a specific item in the cart.
 * @route PUT /api/cart/:cart_item_id
 */
export const updateCartItem = async (req, res) => {
  const { cart_item_id } = req.params;
  const { quantity } = req.body;

  // Validate input: quantity must be a positive integer
  if (!Number.isInteger(quantity) || quantity <= 0) {
    return res.status(400).json({ success: false, error: "Quantity must be a positive integer." });
  }

  const { data, error } = await supabase
    .from("cart_items")
    .update({ quantity })
    .eq("id", cart_item_id)
    .select()
    .single();

  if (error) {
    // If the error indicates no rows were found, return a 404
    if (error.code === 'PGRST116') {
        return res.status(404).json({ success: false, error: "Cart item not found." });
    }
    console.error("Error updating cart item:", error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
  
  return res.status(200).json({ success: true, cartItem: data });
};

/**
 * @description Remove a single item from the cart.
 * @route DELETE /api/cart/:cart_item_id
 */
export const removeCartItem = async (req, res) => {
  const { cart_item_id } = req.params;

  const { error, count } = await supabase
    .from("cart_items")
    .delete()
    .eq("id", cart_item_id);

  if (error) {
    console.error("Error removing cart item:", error.message);
    return res.status(500).json({ success: false, error: error.message });
  }

  // If count is 0, no item was deleted, meaning it wasn't found
  if (count === 0) {
    return res.status(404).json({ success: false, error: "Cart item not found." });
  }

  return res.status(200).json({ success: true, message: "Item removed successfully." });
};

/**
 * @description Remove all items from a user's cart.
 * @route DELETE /api/cart/clear/:user_id
 */
export const clearCart = async (req, res) => {
  const { user_id } = req.params;

  const { error } = await supabase
    .from("cart_items")
    .delete()
    .eq("user_id", user_id);

  if (error) {
    console.error("Error clearing cart:", error.message);
    return res.status(500).json({ success: false, error: error.message });
  }

  return res.status(200).json({ success: true, message: "Cart cleared successfully." });
};