import React from "react";
import Image from "next/image";
import Link from "next/link";

const quickAccessItems = [
  {
    title: "ALL",
    image: "/All.jpg",
  },
  {
    title: "Qwik",
    image: "/QwikCart.jpg",
  },
  {
    title: "Eato",
    image: "/Eato.jpg",
  },
  {
    title: "Bazaar",
    image: "/Bazaar.jpg",
  },
  {
    title: "Assista",
    image: "/Assistant.jpg",
  },
  {
    title: "BBMGO",
    image: "/BBM GO.jpg",
  },
  {
    title: "Promart",
    image: "/Promart.jpg",
  },
  {
    title: "Printy",
    image: "/Printy.jpg",
  },
  {
    title: "Wholesale",
    image: "/Wholesale.jpg",
  },
];

const QuickAccess = () => {
  return (
    <section className="w-full bg-[#F9F4ED] pt-2 pb-2">
      <div className="w-full px-4">
        <div className="flex flex-row gap-2 overflow-x-auto pb-2 sm:grid sm:grid-cols-6 md:grid-cols-9 sm:gap-1.5 md:gap-2">
          {quickAccessItems.map((item, idx) => {
            const ItemWrapper = item.title === 'Eato' ? Link : 'div';
            const wrapperProps = item.title === 'Eato' ? { href: '/pages/eato' } : {};
            
            return (
              <ItemWrapper key={idx} {...wrapperProps} className="flex flex-col items-center flex-shrink-0">
                <div className="relative w-12 h-12 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-300 shadow-sm hover:shadow-md border-2 border-red-500">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(max-width: 640px) 25vw, (max-width: 768px) 16vw, 12vw"
                    className="object-cover"
                  />
                </div>
                <h3 className="text-[10px] sm:text-xs md:text-sm font-semibold text-gray-800 text-center mt-1 sm:mt-2">
                  {item.title}
                </h3>
              </ItemWrapper>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default QuickAccess;
