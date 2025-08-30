import React from "react";

const ProductGrid2X2 = ({ title, products }) => {
  return (
    <div className="bg-purple-100 rounded-2xl p-4 mb-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-semibold text-lg">{title}</h2>
        <button className="text-sm font-medium text-blue-600">View All</button>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 gap-3 bg-white">
        {products.map((item, idx) => (
          <div key={idx} className="bg-white rounded-xl p-2 ">
            <img
              src={item.image}
              alt={item.label}
              className="w-full h-32 object-cover rounded-lg"
            />
            <p className="text-sm mt-2">{item.label}</p>
            <p className="text-xs font-semibold text-gray-700">{item.tagline}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductGrid2X2;
