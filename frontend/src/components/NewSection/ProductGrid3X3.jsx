import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { getAllProducts } from "../../utils/supabaseApi.js"; // adjust path if needed

const ProductGrid3X3 = () => {
  const location = useLocation();
  const [products, setProducts] = useState([]);

  // Show only on home route
  if (location.pathname !== "/") return null;

  useEffect(() => {
    async function fetchProducts() {
      const { success, products } = await getAllProducts();
      if (success && products.length > 0) {
        setProducts(products.slice(0, 9)); // only 9 for 3x3 grid
      }
    }
    fetchProducts();
  }, []);

  return (
    <div className="sm:hidden px-4 py-4 bg-white">
      <h2 className="text-lg font-semibold mb-3">You may like...</h2>

      {/* 3x3 Grid */}
      <div className="grid grid-cols-3 gap-3">
        {products.map((item) => (
          <div key={item.id} className="bg-white rounded-lg shadow-sm ">
            <img
              src={item.image || "https://via.placeholder.com/150"}
              alt={item.name}
              className="w-full h-24 object-cover rounded-t"
            />
           <div>

             <p className="text-xs mt-2 font-medium truncate">{item.name}</p>
            <p className="text-sm font-semibold text-black">
              ₹{item.price || "--"}
            </p>
            {item.old_price && (
              <p className="text-xs line-through text-gray-400">
                ₹{item.old_price}
              </p>
            )}
           </div>
          </div>
        ))}
      </div>

      {/* See All Button */}
      <div className="mt-4">
        <Link to="/productListing">
        <button className="w-full bg-purple-800 text-white py-2 rounded-lg font-medium">
          See All →
        </button>
        </Link>
      </div>
    </div>
  );
};

export default ProductGrid3X3;
