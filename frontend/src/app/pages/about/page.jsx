import React from 'react';
import Image from 'next/image';
import Marquee from 'react-fast-marquee';

const partnerLogos = [
  '/comp1.svg',
  '/comp2.svg',
  '/comp3.svg',
  '/comp4.svg',
  '/comp5.svg',
  '/comp1.svg',
  '/comp2.svg',
  '/comp3.svg',
  '/comp4.svg',
  '/comp5.svg',
  '/comp1.svg',
  '/comp2.svg',
  '/comp3.svg',
  '/comp4.svg',
  '/comp5.svg',
];
const certLogos = [
  '/cert1.svg',
  '/cert2.svg',
  '/cert3.svg',
  '/cert4.svg',
  '/cert5.svg',
];

const Page = () => {
  return (
    <div className="w-full min-h-screen bg-white font-[outfit] px-2 md:px-8 py-8 flex flex-col gap-16">
      {/* Top Section: About (45% image, 55% text) */}
      <section className="flex flex-col md:flex-row gap-8 items-center md:items-start w-full mt-6 mb-8">
        {/* Image Placeholder */}
        <div className="w-full md:w-[45%] h-[260px] md:h-[450px] rounded-2xl bg-gray-100 flex-shrink-0 mb-4 md:mb-0 relative">
          <Image 
            src="/about-image.jpg" 
            alt="About Suppkart"
            fill
            className="object-cover rounded-2xl"
            priority
          />
        </div>
        
        {/* About Text */}
        <div className="w-full md:w-[55%] flex flex-col gap-2">
          <h2 className="text-3xl md:text-4xl font-bold mb-2">About Our Company</h2>
          <div className="text-3xl md:text-4xl font-bold text-[#FD5B00] mb-2">Big&Best Mart</div>
          <div className="text-base md:text-lg text-[#222] leading-relaxed mb-2">
            Welcome to Big&Best Mart, India's most trusted online grocery destination. We're more than just an e-commerce platform; we're your neighborhood grocery store, reimagined for the digital age. Our mission is to make fresh, quality groceries accessible to every Indian household with the convenience of doorstep delivery.
            <br /><br />
            From farm-fresh fruits and vegetables to daily essentials, dairy products, and household items, we ensure every product meets our strict quality standards. We partner directly with farmers, trusted brands, and certified suppliers to bring you authentic products at the best prices.
            <br /><br />
            <span className="font-bold">Join millions of satisfied customers who trust Big&Best Mart for their daily grocery needs. Fresh. Fast. Reliable.</span>
          </div>
        </div>
      </section>
      
      {/* Partnered Companies */}
      <section className="flex flex-col items-center gap-4 w-full mt-10">
        <h2 className="text-3xl md:text-4xl font-bold text-center">Our Trusted Brand Partners</h2>
        <div className="text-[#FD5B00] text-center text-base md:text-lg font-medium mb-2">
          We collaborate with India's most trusted brands to bring you<br />
          authentic products at the best prices
        </div>
        <div className="w-full mt-4">
          <Marquee 
            speed={40}
            gradient={false}
            pauseOnHover={true}
            className="py-4 px-20"
          >
            {partnerLogos.map((logo, index) => (
              <div key={index} className="relative h-20 w-40 mx-8">
                <Image
                  src={logo}
                  alt={`Partner company ${index + 1}`}
                  fill
                  className="object-contain grayscale hover:grayscale-0 transition-all duration-300"
                />
              </div>
            ))}
          </Marquee>
        </div>
      </section>
      
      {/* Certified Protein Company */}
      <section className="flex flex-col items-center gap-4 w-full mt-10 mb-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center">Quality Certifications</h2>
        <div className="text-[#FD5B00] text-center text-base md:text-lg font-medium mb-2">
          Our commitment to quality is backed by industry-leading<br />
          certifications and food safety standards
        </div>
        <div className="flex flex-wrap justify-center items-center gap-12 mt-4 w-full">
          {certLogos.map((logo, index) => (
            <div key={index} className="relative h-36 w-36">
              <Image
                src={logo}
                alt={`Certification ${index + 1}`}
                fill
                className="object-contain"
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Page;