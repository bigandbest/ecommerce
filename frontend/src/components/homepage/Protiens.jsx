import React from 'react';
import Image from 'next/image';

const features = [
  {
    icon: (
      <div className="bg-[#FF6B00] rounded-xl w-14 h-14 flex items-center justify-center mb-4">
        <Image src="/protien.png" alt="protien" width={40} height={40} className="object-contain" />
      </div>
    ),
    title: 'Natural Protiens',
    desc: 'Unlock your athletic potential With topquality sports supplements designed to enhance your performance and support your fitness goals.'
  },
  // Repeat 4 more times for demo
  {
    icon: (
      <div className="bg-[#FF6B00] rounded-xl w-14 h-14 flex items-center justify-center mb-4">
        <Image src="/protien.png" alt="protien" width={40} height={40} className="object-contain" />
      </div>
    ),
    title: 'Natural Protiens',
    desc: 'Unlock your athletic potential With topquality sports supplements designed to enhance your performance and support your fitness goals.'
  },
  {
    icon: (
      <div className="bg-[#FF6B00] rounded-xl w-14 h-14 flex items-center justify-center mb-4">
        <Image src="/protien.png" alt="protien" width={40} height={40} className="object-contain" />
      </div>
    ),
    title: 'Natural Protiens',
    desc: 'Unlock your athletic potential With topquality sports supplements designed to enhance your performance and support your fitness goals.'
  },
  {
    icon: (
      <div className="bg-[#FF6B00] rounded-xl w-14 h-14 flex items-center justify-center mb-4">
        <Image src="/protien.png" alt="protien" width={40} height={40} className="object-contain" />
      </div>
    ),
    title: 'Natural Protiens',
    desc: 'Unlock your athletic potential With topquality sports supplements designed to enhance your performance and support your fitness goals.'
  },
  {
    icon: (
      <div className="bg-[#FF6B00] rounded-xl w-14 h-14 flex items-center justify-center mb-4">
        <Image src="/protien.png" alt="protien" width={40} height={40} className="object-contain" />
      </div>
    ),
    title: 'Natural Protiens',
    desc: 'Unlock your athletic potential With topquality sports supplements designed to enhance your performance and support your fitness goals.'
  },
];

const Protiens = () => {
  return (
    <section className="px-5 xl:px-8 w-full py-12 bg-white">
      <div className="w-full ">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 text-center">
          {features.map((feature, idx) => (
            <div key={idx} className="flex flex-col items-center">
              {feature.icon}
              <h3 className="text-2xl font-extrabold text-[#222] mb-2">{feature.title}</h3>
              <p className="text-[#222] text-sm font-medium opacity-70 ">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Protiens;
