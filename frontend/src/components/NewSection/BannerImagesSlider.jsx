import React from "react";

const BannerImagesSlider = ({ count = 5, bannerUrl }) => {
  // Dummy data
  const sectionData = [
    { title: "Monsoon Must-haves", img: "https://i.postimg.cc/0NDbVTtd/21-removebg-preview.png" },
    { title: "Hot Meals & Drinks", img: "https://i.postimg.cc/rwZXC126/Product-Showcase-1-removebg-preview.png" },
    { title: "Self Care", img: "https://i.postimg.cc/2SSNZHJF/Product-removebg-preview.png" },
    { title: "Home Essentials", img: "https://i.postimg.cc/kXcdDrjg/Product-Image-removebg-preview.png" },
    { title: "Health & Safety", img: "https://i.postimg.cc/G3gFR9RL/download-3-removebg-preview.png" },
  ];

  return (
    <div className="space-y-6 bg-white md:hidden">
      {Array.from({ length: count }).map((_, sectionIndex) => (
        <div
          key={sectionIndex}
          className="relative shadow-md overflow-hidden"
        >
          {/* Banner as background container */}
          <div
            className="h-56 sm:h-64 bg-cover bg-center flex flex-col justify-end p-4"
            style={{
              backgroundImage: `url('${bannerUrl}')`,
            }}
          >
            {/* Horizontally scrollable cards inside the banner */}
            <div className="flex space-x-2 overflow-x-auto hide-scrollbar mt-20">
              {sectionData.map((section, idx) => (
                <div
                  key={idx}
                  className="flex align-baseline bg-white rounded-lg shadow flex-shrink-0 w-25 sm:w-40 text-center"
                >
                  <img
                    src={section.img}
                    alt={section.title}
                    className="h-full w-full object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BannerImagesSlider;
