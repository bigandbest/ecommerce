import React from "react";

const categories = [
  {
    label: "Idols & Pooja Needs",
    img: "https://i.postimg.cc/0NDbVTtd/21-removebg-preview.png",
  },
  {
    label: "Festive Get-Togethers",
    img: "https://i.postimg.cc/4NQj5D3p/images-removebg-preview.png",
  },
  {
    label: "Home Decor",
    img: "https://i.postimg.cc/BQ0d2SJq/download-2-removebg-preview.png",
  },
  {
    label: "Modak & Indian Sweets",
    img: "https://i.postimg.cc/BQ0d2SJq/download-2-removebg-preview.png",
  },
  {
    label: "Festive Ready",
    img: "https://i.postimg.cc/4NQj5D3p/images-removebg-preview.png",
  },
];

export default function HomeFestivalGrid() {
  return (
    <div className="flex flex-col items-center py-4 px-4 md:hidden bg-gradient-to-b from-[#e6e5d5] via-orange-100 to-white">
      {/* Header */}
      <div className="w-full max-w-xl mb-4 flex justify-center items-center">
        <h2 className="text-lg font-bold text-amber-700 mr-2">Powered By</h2>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 gap-2 w-full max-w-2xl">
        {/* First grid item spans 2 rows */}
        <div className="row-span-2 flex flex-col items-center bg-gradient-to-b from-amber-200 via-orange-100 to-amber-100 rounded-xl shadow-md justify-center">
          <p className="text-sm font-extrabold text-center text-amber-700">{categories[0].label}</p>
          <img src={categories[0].img} alt={categories[0].label} className="w-full h-full object-contain" />
          {/* <p className="text-sm font-medium text-center text-amber-700">{categories[0].label}</p> */}
        </div>

        {/* Other grid items */}
        {categories.slice(1).map((cat) => (
          <div
            key={cat.label}
            className="bg-gradient-to-b from-amber-200 via-orange-100 to-amber-100 rounded-xl shadow-md flex flex-col items-center justify-center"
          >
            <p className="text-sm font-extrabold text-center text-amber-700">{cat.label}</p>
            <img src={cat.img} alt={cat.label} className="w-30 h-30 object-contain" />
          </div>
        ))}
      </div>
    </div>
  );
}
