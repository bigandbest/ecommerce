import Image from 'next/image';
import React from 'react';
import Link from 'next/link';

function page() {
  return (
    <div className="w-full h-auto py-20 flex flex-col items-center justify-center px-5 font-outfit text-center">
      <Image src="/thankyou.png" width={200} height={150} alt="cart" className="object-contain" />
      
      <span className="text-xl sm:text-2xl lg:text-3xl mt-6 font-bold text-[#383838]">
        Your Order is successfully Placed
      </span>

      <span className="text-base sm:text-lg lg:text-xl mt-3 font-semibold text-[#8B8B8B]">
        Order #1234 | 3 Items | ₹3,599
      </span>

      <span className="text-base sm:text-lg lg:text-xl mt-2 text-[#8B8B8B] font-semibold">
        Your Product will be delivered in 3-5 Working days
      </span>

      <div className="mt-6 flex gap-4">
        <Link href="/">
          <button className="bg-orange-500 text-white font-semibold py-2 px-5 rounded-full">
            Back To home
          </button>
        </Link>
        <Link href="/track-order">
          <button className="border border-orange-500 text-orange-500 font-semibold py-2 px-5 rounded-full">
            Track Order
          </button>
        </Link>
      </div>
    </div>
  );
}

export default page;
