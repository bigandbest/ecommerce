import React, { useEffect, useState } from "react";
import { getAllProducts } from "../../utils/supabaseApi.js"; 

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

const EigthProductSection = ({ sectionCount = 8, startIndex = 0 }) => {
  const [sections, setSections] = useState([]);

  useEffect(() => {
    async function fetchProducts() {
      const { success, products } = await getAllProducts();
      if (success) {
        const minProducts = 4; 
        const maxProducts = 5; 

        const newSections = Array.from({ length: sectionCount }, (_, i) => {
          let start = (i * minProducts) % products.length;
          let end = start + minProducts;
          let sectionProducts = products.slice(start, end);

          while (sectionProducts.length < minProducts) {
            sectionProducts = [
              ...sectionProducts,
              ...products.slice(0, minProducts - sectionProducts.length),
            ];
          }

          if (sectionProducts.length < maxProducts && products.length > minProducts) {
            sectionProducts.push(products[end % products.length]);
          }

          return {
            title: `Section ${startIndex + i + 1}`, // 👈 continuous numbering
            bg: sectionColors[(startIndex + i) % sectionColors.length],
            products: sectionProducts,
          };
        });
        setSections(newSections);
      }
    }
    fetchProducts();
  }, [sectionCount, startIndex]);

  return (
    <div className="block md:hidden p-3 bg-white">
      {sections.map((section, i) => (
        <div key={i} className={`${section.bg} py-4 mb-4 rounded-md shadow-md`}>
          <h2 className="text-lg font-semibold px-3 mb-2">{section.title}</h2>
          <div className="flex overflow-x-auto px-3 space-x-4 hide-scrollbar">
            {section.products.map((product, idx) => (
              <div
                key={`${product.id}-${idx}`}
                className="flex-shrink-0 w-[40%] flex flex-col items-center"
              >
                <div className="w-full h-40 flex flex-col items-center justify-center rounded-2xl overflow-hidden">
                  <img
                    src={
                      /* product.image || */ "https://i.postimg.cc/VNzkJTCT/Candle5.jpg"
                    }
                    alt={product.name}
                    className="h-full w-full object-cover rounded-t-2xl"
                  />
                  <div className="bg-blue-600 w-full text-center">From ₹299</div>
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
