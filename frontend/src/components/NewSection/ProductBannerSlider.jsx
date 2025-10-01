// ProductBannerSlider.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchUniqueSectionsByType,
  fetchProductsForUniqueSection,
} from "../../utils/supabaseApi"; // adjust path

const SECTION_TYPE = "New Menu";

const ProductBannerSlider = ({ count = 1 }) => {
  const [products, setProducts] = useState([]);
  const [bannerUrl, setBannerUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setErr(null);
      try {
        // Fetch section info
        const sections = await fetchUniqueSectionsByType(SECTION_TYPE);

        // Use the first section’s admin-uploaded image as background
        const bg = sections?.[0]?.image_url || null;
        setBannerUrl(bg);

        // Fetch products for this section
        const productGroups = await Promise.all(
          sections.map((s) => fetchProductsForUniqueSection(s.id))
        );
        const flat = productGroups.flat();

        // Deduplicate by product id
        const dedupedById = Object.values(
          flat.reduce((acc, p) => {
            if (p?.id) acc[p.id] = p;
            return acc;
          }, {})
        );

        setProducts(dedupedById);
      } catch (e) {
        setErr(e.message || "Failed to load products");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="p-4">Loading...</div>;
  if (err) return <div className="p-4 text-red-600">{err}</div>;
  if (!products.length) return <div className="p-4 text-gray-600">No products found.</div>;

  // Preview: only 4 products
  const preview = products.slice(0, 4);

  return (
    <div className="space-y-8 md:hidden">
      {Array.from({ length: count }).map((_, sectionIndex) => (
        <div
          key={sectionIndex}
          className="relative rounded-xl shadow-md overflow-hidden"
        >
          {/* Banner Background */}
          <div
            className="h-[530px] bg-cover bg-center flex flex-col justify-end p-1"
            style={{
              backgroundImage: bannerUrl ? `url('${bannerUrl}')` : "none",
              backgroundColor: bannerUrl ? "transparent" : "#f8f8f8",
            }}
          >
            {/* Product Cards - Horizontal scroll */}
            <div className="flex space-x-2 overflow-x-auto hide-scrollbar pb-2">
              {preview.map((product) => {
                const discount =
                  product.old_price && product.price
                    ? product.old_price - product.price
                    : null;

                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-xl shadow p-3 flex-shrink-0 w-40 sm:w-56 flex flex-col cursor-pointer"
                    onClick={() => navigate(`/ProductLisingPage/product/${product.id}`)}
                  >
                    {/* Product Image */}
                    <div>
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-28 w-full object-contain mb-2"
                        onError={(e) => {
                          e.currentTarget.src =
                            "https://via.placeholder.com/150x150?text=No+Image";
                        }}
                      />
                    </div>

                    {/* Price */}
                    <div className="flex items-center gap-x-1 mt-1">
                      <p className="text-sm font-bold">₹{product.price}</p>
                      {product.old_price && (
                        <p className="text-xs line-through text-gray-400">
                          ₹{product.old_price}
                        </p>
                      )}
                    </div>

                    {/* Quantity & Save */}
                    <div className="mt-0.5 text-xs">1pc</div>
                    {discount > 0 && (
                      <div className="mt-0.5 text-green-600 text-xs">
                        SAVE ₹{discount}
                      </div>
                    )}

                    {/* Name */}
                    <h3 className="text-xs sm:text-sm font-medium line-clamp-2 mt-1 mb-2 flex-grow">
                      {product.name}
                    </h3>

                    {/* Add Button */}
                    <button className="bg-pink-500 text-white text-xs px-3 py-1 rounded-lg w-full mt-auto">
                      ADD
                    </button>
                  </div>
                );
              })}
            </div>

            {/* See All Button */}
            <div
              className="bg-red-900 text-white w-[90%] mx-auto rounded-xl text-center py-2 mt-2 cursor-pointer hover:bg-purple-800"
              onClick={() => navigate(`/ProductLisingPage/new-menu/${SECTION_TYPE}`)}
            >
              See All →
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductBannerSlider;
