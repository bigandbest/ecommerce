import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getYouMayLikeProducts,
  getAllProducts,
  addToCart,
  getProductsForRecommendedStore, // fallback if unknown section
  getProductsForBrand,
} from "../../utils/supabaseApi";
import { useAuth } from "../../contexts/AuthContext";
import { SlidersHorizontal, ArrowUpDown } from "lucide-react";

const ProductListingPage = () => {
  const { Name } = useParams();
  const [products, setProducts] = useState([]);
  const {id} = useParams();
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth(); 
  const [addingToCart, setAddingToCart] = useState(null);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      let result;
      if (Name === "you-may-like") {
        result = await getYouMayLikeProducts();
      } else if(Name === "shop-by-product"){
        result = await getProductsForRecommendedStore(id);
      } else if(Name === "shopbybrand"){
        result = await getProductsForBrand(id);
      }else {
        result = await getAllProducts(); // fallback
      }

      if (result && result.success !== false) {
        setProducts(result.products || result);
      }
      setLoading(false);
    }

    fetchProducts();
  }, [Name]);

  // Placeholder for Add to Cart functionality
  const handleAddToCart = async (e, productId) => {
    e.preventDefault();
    e.stopPropagation();

    if (!currentUser) {
      alert("Please log in to add items to your cart.");
      return;
    }

    setAddingToCart(productId); // Set loading state for this specific button

    const { success, error } = await addToCart(currentUser.id, productId, 1);

    if (success) {
      alert("Item added to cart!");
      // This event can be used by other components (like a navbar cart icon) to update themselves
      window.dispatchEvent(new Event("cartUpdated"));
    } else {
      alert(`Failed to add item to cart: ${error}`);
    }

    setAddingToCart(null); // Reset loading state
  };

  const calculateDiscount = (oldPrice, newPrice) => {
    if (!oldPrice || !newPrice) return 0;
    return Math.round(((oldPrice - newPrice) / oldPrice) * 100);
  };

  if (loading) return <p className="text-center py-10">Loading...</p>;

  return (
    <div className="bg-gray-50 min-h-screen mt-[-40px]">
      <div className="container mx-auto max-w-2xl px-2 py-4">
        {/* Header */}
       {/*  <div className="flex justify-between items-center mb-4 px-2">
          <p className="font-semibold text-gray-800">{products.length} Items</p>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-1 text-sm font-medium text-gray-700">
              <ArrowUpDown size={16} /> Sort
            </button>
            <button className="flex items-center gap-1 text-sm font-medium text-gray-700">
              <SlidersHorizontal size={16} /> Filter
            </button>
          </div>
        </div> */}

        {/* Product List */}
        {products.length === 0 ? (
          <p className="text-center text-gray-500 py-10">No products found.</p>
        ) : (
          <div className="space-y-3">
            {products.map((item) => {
              const discount = calculateDiscount(item.old_price, item.price);
              const isAdding = addingToCart === item.id;
              return (
                <Link
                  key={item.id}
                  to={`/product/${item.id}`}
                  className="flex bg-white !ml-0 rounded-lg shadow-sm overflow-hidden transition-shadow hover:shadow-md w-full"
                >
                  {/* Image Section */}
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0">
                    <img
                      src={item.image || "https://via.placeholder.com/150"}
                      alt={item.name}
                      className="w-full h-full object-cover rounded-md"
                    />
                    {discount > 0 && (
                      <div className="absolute top-0 left-0 bg-green-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                        {discount}% OFF
                      </div>
                    )}
                  </div>

                  {/* Details Section */}
                  <div className="px-3 py-2 flex flex-col flex-grow">
                    <div>
                      <p className="text-xs text-gray-400 uppercase font-medium">
                        {item.category || "Brand"}
                      </p>
                      <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 leading-tight">
                        {item.name}
                      </h3>
                    </div>

                    {/* Placeholder for size/variant selector */}
                    <div className="text-xs text-gray-600 mt-1 border rounded px-2 py-1 w-fit">
                      {item.uom ? <p>{item.uom}</p>: <p>1 Variant</p>}
                    </div>

                    <div className="flex justify-between items-end">
                      {/* Price */}
                      <div className="flex items-center">
                        <p className="text-base font-bold text-black">
                          ₹{item.price || "--"}
                        </p>
                        {item.old_price && (
                          <p className="text-xs line-through ml-1 text-gray-400">
                            ₹{item.old_price}
                          </p>
                        )}
                      </div>

                      {/* Add Button */}
                      <button
                        onClick={(e) => handleAddToCart(e, item.id)}
                        disabled={isAdding} 
                        style={{minHeight:'20px'}}
                        className="bg-red-400 text-white text-sm font-bold py-2 px-6 rounded-md hover:bg-red-600 transition-colors disabled:bg-red-300 disabled:cursor-not-allowed"
                      >
                        {isAdding ? "Adding..." : "Add"}
                      </button>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductListingPage;