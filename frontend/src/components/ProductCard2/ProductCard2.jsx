import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { addToCart } from '../../utils/supabaseApi'; // adjust import path
import { useAuth } from '../../contexts/AuthContext'; // adjust path

function ProductCard2({ product }) {
    const { currentUser } = useAuth();
    const [adding, setAdding] = useState(false);

    if (!product) return null;

    const handleAddToCart = async () => {
        if (!currentUser) {
            alert("Please log in to add items to your cart.");
            return;
        }
        setAdding(true);
        try {
            const res = await addToCart(currentUser.id, product.id, 1);
            if (res.success) {
                /* console.log("Added to cart:", res.cartItem); */
                // optional: show toast/notification
                window.dispatchEvent(new Event('cartUpdated'));
                setTimeout(() => setCartAdded(false), 1200);
            } else {
                console.error("Error adding to cart:", res.error);
                alert("Could not add to cart. Try again!");
            }
        } catch (err) {
            console.error("Unexpected error:", err);
            alert("Something went wrong.");
        } finally {
            setAdding(false);
        }
    };

    return (
        <div className="w-full bg-white rounded-lg flex flex-col shadow-2xl h-full">
            <div className="relative flex-shrink-0">
                <Link to={`/product/${product.id}`} className="block w-full h-full">
                    <img
                        src={product.image || 'https://placehold.co/150x150'}
                        alt={product.name}
                        className="w-full h-32 object-cover rounded-t-md"
                    />
                </Link>
            </div>
            <div className="flex-grow px-2 py-1">
                {product.uom != null
                    ? <p className="text-xs text-gray-500">{product.uom}</p>
                    : <p className="text-xs text-gray-500">1 Variant</p>}
                <h3 className="text-sm font-bold text-gray-800 truncate-2">{product.name}</h3>
                <div className="h-5 mt-1">
                    {product.discount
                        ? <p className="text-xs text-green-600">{product.discount}% OFF</p>
                        : ""}
                </div>
            </div>
            <div className="mt-auto flex justify-between items-center px-2 py-1">
                <p className="text-sm font-semibold text-gray-900">₹{product.price}</p>
                <button
                    onClick={handleAddToCart}
                    disabled={adding}
                    style={{ minHeight: '20px' }}
                    className={`border border-green-600 font-bold rounded-md px-2 py-1 text-sm transition-colors
                        ${adding ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                            : "text-green-600 hover:bg-green-600 hover:text-white"}`}
                >
                    {adding ? "Adding" : "ADD"}
                </button>
            </div>
        </div>
    );
}

export default ProductCard2;
