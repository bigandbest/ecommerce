import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { getAllProducts } from "../../utils/supabaseApi.js"; // adjust path if needed

const sectionColors = [
  "bg-blue-100",
  "bg-green-100",
  "bg-pink-100",
  "bg-yellow-100",
  "bg-purple-100",
  "bg-red-100",
  "bg-indigo-100",
  "bg-orange-100",
];

const EigthProductSection = () => {
  const location = useLocation();
  const [sections, setSections] = useState([]);

  useEffect(() => {
    async function fetchProducts() {
      const { success, products } = await getAllProducts();
      if (success) {
        const chunkSize = Math.ceil(products.length / 8);
        const newSections = Array.from({ length: 8 }, (_, i) => {
          const start = i * chunkSize;
          const end = start + chunkSize;
          return {
            title: `Section ${i + 1}`,
            bg: sectionColors[i % sectionColors.length],
            products: products.slice(start, end),
          };
        });
        setSections(newSections);
      }
    }
    fetchProducts();
  }, []);

  if (location.pathname !== "/") return null;

  return (
    <div className="block md:hidden p-3 bg-white">
      {sections.map((section, i) => (
        <div key={i} className={`${section.bg} py-4 mb-4 rounded-md shadow-md`}>
          <h2 className="text-lg font-semibold px-3 mb-2">{section.title}</h2>
          <div className="flex overflow-x-auto px-3 space-x-4 hide-scrollbar">
            {section.products.map((product) => (
              <div
                key={product.id}
                className="flex-shrink-0 w-[40%] flex flex-col items-center"
              >
                <div className="w-full h-40 flex flex-col items-center justify-center rounded-2xl overflow-hidden">
                  <img
                    src={
                     /*  product.image || */ "https://i.postimg.cc/VNzkJTCT/Candle5.jpg"
                    }
                    alt={product.name}
                    className="h-full w-full object-cover rounded-t-2xl"
                  />
                  <div className='bg-blue-600 w-full text-center'>From ₹299</div>
                </div>
                <p className="text-sm font-medium mt-2 text-center line-clamp-2">
                  {product.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default EigthProductSection;
