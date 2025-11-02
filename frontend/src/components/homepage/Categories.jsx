import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const categories = [
  {
    title: 'Wholesale',
    count: 150,
    image: '/Wholesale.jpg',
    icon: '📦'
  },
  {
    title: 'Bazaar',
    count: 200,
    image: '/Bazaar.jpg',
    icon: '🛒'
  },
  {
    title: 'Qwik',
    count: 80,
    image: '/QwikCart.jpg',
    icon: '⚡'
  },
  {
    title: 'Eato',
    count: 120,
    image: '/Eato.jpg',
    icon: '🍽️'
  },
  {
    title: 'Printy',
    count: 50,
    image: '/Printy.jpg',
    icon: '🖨️'
  },
  {
    title: 'Promart',
    count: 75,
    image: '/Promart.jpg',
    icon: '🏪'
  },
  {
    title: 'Assista',
    count: 60,
    image: '/Assistant.jpg',
    icon: '🤝'
  },
  {
    title: 'BBMGO',
    count: 95,
    image: '/BBM GO.jpg',
    icon: '🚀'
  },
];

const Categories = () => {
  return (
    <section className="w-full pt-4 pb-8 bg-white px-4">
      <div className="w-full">
        <div className="text-center mb-8 md:mb-12">
          {/* Heading removed - will be added later */}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 sm:gap-4 md:gap-6">
          {categories.map((cat, idx) => {
            const CategoryWrapper = cat.title === 'Eato' ? Link : 'div';
            const wrapperProps = cat.title === 'Eato' ? { href: '/pages/eato' } : {};
            
            return (
              <CategoryWrapper key={idx} {...wrapperProps} className="flex flex-col items-center text-center cursor-pointer group">
                {/* Full Image Card */}
                <div className="w-full h-[120px] sm:h-[140px] md:h-[160px] rounded-xl md:rounded-2xl overflow-hidden mb-3 group-hover:scale-105 transition-transform duration-300 relative shadow-lg hover:shadow-xl">
                  <Image 
                    src={cat.image} 
                    alt={cat.title} 
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 16vw, 12vw"
                    priority={idx === 0}
                    className="object-cover"
                  />
                </div>
                {/* Text Below Image */}
                <div className="text-center">
                  <h3 className="text-xs sm:text-sm md:text-base font-bold text-[#222]">{cat.title}</h3>
                </div>
              </CategoryWrapper>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default Categories;
