// ProductGrid2X2.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchUniqueSectionsByType,
  fetchProductsForUniqueSection,
} from "../../utils/supabaseApi"; // adjust path

// Best Quality
const SECTION_TYPE = "Best quality";

const ProductGrid2X2 = ({ title = SECTION_TYPE }) => {
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
        // 1) get all sections of this type
        const sections = await fetchUniqueSectionsByType(SECTION_TYPE);

        // use the first section's admin image as background
        const bg = sections?.[0]?.image_url || null;
        setBannerUrl(bg);

        // 2) fetch products for each section
        const productGroups = await Promise.all(
          sections.map((s) => fetchProductsForUniqueSection(s.id))
        );

        // 3) flatten + dedupe by product id
        const flat = productGroups.flat();
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

  const content = useMemo(() => {
    if (loading) return <div className="p-4">Loading...</div>;
    if (err) return <div className="p-4 text-red-600">{err}</div>;
    if (!products.length) return <div className="p-4 text-gray-600">No products found.</div>;

    // only show first 4 in the grid for preview
    const preview = products.slice(0, 4);

    return (
      <div className="grid grid-cols-2 gap-3 bg-white rounded-xl p-2">
        {preview.map((item) => (
          <div
            key={item.id}
            onClick={() => navigate(`/product/${item.id}`)}
            className="bg-white rounded-xl p-2 cursor-pointer"
          >
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-32 object-cover rounded-lg"
              onError={(e) => {
                e.currentTarget.src =
                  "https://via.placeholder.com/300x200?text=No+Image";
              }}
            />
            <p className="text-sm mt-2 line-clamp-2">{item.name}</p>
            <p className="text-xs font-semibold text-gray-700">
              {item.category || (item.price !== undefined ? `₹${item.price}` : "")}
            </p>
          </div>
        ))}
      </div>
    );
  }, [loading, err, products, navigate]);

  return (
    <div className="rounded-2xl overflow-hidden mb-6">
      {/* Section background from admin-uploaded image */}
      <div
        className="w-full bg-cover bg-center bg-no-repeat rounded-2xl relative p-4"
        style={{
          backgroundImage: bannerUrl ? `url('${bannerUrl}')` : "none",
          backgroundColor: bannerUrl ? "transparent" : "#f3e8ff", // fallback purple-ish
          minHeight: "260px",
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-semibold text-lg text-black drop-shadow-[0_1px_1px_rgba(255,255,255,0.6)]">
            {title}
          </h2>
          <button
            className="text-sm font-medium text-blue-600"
            onClick={() =>
              navigate(`/ProductLisingPage/best-quality/${encodeURIComponent(SECTION_TYPE)}`)
            }
          >
            View All
          </button>
        </div>

        {/* Products Grid overlay */}
        {content}
      </div>
    </div>
  );
};

export default ProductGrid2X2;
