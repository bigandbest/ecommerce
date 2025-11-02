"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { FaInstagram, FaYoutube, FaLinkedin } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { CiFacebook } from "react-icons/ci";
import { MdEmail, MdPhone, MdLocationOn } from "react-icons/md";
import Link from "next/link";

function Footer() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="w-full h-auto flex flex-col bg-[#F9F4ED] gap-responsive container-responsive pt-6 sm:pt-8 pb-4 sm:pb-5 xl:pb-9 xl:pt-14">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
          <div className="h-16 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="w-full h-auto flex flex-col bg-[#F9F4ED] gap-4 sm:gap-6 md:gap-8 container-responsive pt-4 sm:pt-6 md:pt-8 pb-3 sm:pb-4 md:pb-5 xl:pb-9 xl:pt-14"
      suppressHydrationWarning
    >
      {/* Main Footer Content */}

      <div className="w-full h-auto flex flex-col gap-6 sm:gap-8 md:flex-row md:flex-wrap lg:gap-8 lg:justify-between">
        {/* Company Info */}
        <div className="w-full h-auto flex flex-col gap-3 sm:gap-4 md:w-[48%] lg:w-[30%]">
          <Link href={"/"} className="w-auto h-auto">
            <div className="flex items-center gap-1">
              <div className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-[#FD5B00] to-[#FF8A00] bg-clip-text text-transparent">
                Big
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-[#FD5B00]">
                &
              </div>
              <div className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-[#2A2A2A] to-[#555] bg-clip-text text-transparent">
                Best
              </div>
              <div className="bg-[#FD5B00] text-white px-2 py-1 sm:px-3 rounded-lg text-xl sm:text-2xl font-bold shadow-lg">
                MART
              </div>
            </div>
            <div className="text-xs text-[#666] mt-1 font-medium tracking-wide">
              (OPC) PRIVATE LIMITED
            </div>
          </Link>
          <p className="font-dmsans text-[#2A2A2A] text-sm sm:text-base leading-relaxed">
            Big & Best Mart is a one-stop eCommerce destination offering a wide
            range of everyday essentials—from groceries and home goods to
            electronics, fashion, and fitness gear. With curated collections,
            exclusive deals, and a user-friendly shopping experience, we make
            quality products accessible and affordable for every lifestyle.
          </p>
          <div className="flex gap-2 sm:gap-3">
            <span className="bg-[#FD5B00] p-2 sm:p-2.5 rounded-full cursor-pointer hover:bg-[#fd5d00d2] transition-colors">
              <FaInstagram className="text-white" size={16} />
            </span>
            <span className="bg-[#FD5B00] p-2 sm:p-2.5 rounded-full cursor-pointer hover:bg-[#fd5d00d2] transition-colors">
              <CiFacebook className="text-white" size={16} />
            </span>
            <span className="bg-[#FD5B00] p-2 sm:p-2.5 rounded-full cursor-pointer hover:bg-[#fd5d00d2] transition-colors">
              <FaXTwitter className="text-white" size={16} />
            </span>
          </div>
        </div>

        <div className="w-full h-auto flex flex-col gap-8 sm:grid sm:grid-cols-2 sm:gap-8 md:w-[48%] lg:w-[30%]">
          <div className="w-full sm:w-auto h-auto flex flex-col gap-4 sm:gap-3">
            <h1 className="font-plus-jakarta text-[#2A2A2A] font-semibold text-lg sm:text-xl">
              Quick Links
            </h1>
            <div className="grid grid-cols-1 gap-3 sm:gap-2.5">
              <Link
                href="/pages/about"
                className="font-dmsans text-[#2A2A2A] text-sm sm:text-base hover:text-[#FD5B00] transition-colors py-1"
              >
                About Us
              </Link>
              <Link
                href="/pages/contactus"
                className="font-dmsans text-[#2A2A2A] text-sm sm:text-base hover:text-[#FD5B00] transition-colors py-1"
              >
                Contact Us
              </Link>
              <Link
                href="/pages/career"
                className="font-dmsans text-[#2A2A2A] text-sm sm:text-base hover:text-[#FD5B00] transition-colors py-1"
              >
                Career
              </Link>
              <Link
                href="/"
                className="font-dmsans text-[#2A2A2A] text-sm sm:text-base hover:text-[#FD5B00] transition-colors py-1"
              >
                BBM DOST
              </Link>
              <Link
                href="/"
                className="font-dmsans text-[#2A2A2A] text-sm sm:text-base hover:text-[#FD5B00] transition-colors py-1"
              >
                FAQ
              </Link>
              <Link
                href="/"
                className="font-dmsans text-[#2A2A2A] text-sm sm:text-base hover:text-[#FD5B00] transition-colors py-1"
              >
                Shipping & Returns
              </Link>
              <Link
                href="/"
                className="font-dmsans text-[#2A2A2A] text-sm sm:text-base hover:text-[#FD5B00] transition-colors py-1"
              >
                Privacy Policy
              </Link>
            </div>
          </div>
          <div className="w-full sm:w-auto h-auto flex flex-col gap-4 sm:gap-3">
            <h1 className="font-plus-jakarta text-[#2A2A2A] font-bold text-lg sm:text-xl">
              Contact Us
            </h1>
            <div className="flex flex-col gap-3 sm:gap-2.5 text-sm sm:text-base">
              <p className="font-dmsans text-[#2A2A2A] leading-relaxed">
                37/1, Central Road, K B Sarani, Uttapara, Madhyamgram, North 24
                Parganas, Barasat - II, West Bengal, India, 700129
              </p>
              <p className="font-dmsans text-[#2A2A2A] font-medium">
                +91 7059911480
              </p>
              <p className="font-dmsans text-[#2A2A2A]">
                bigandbestmart@gmail.com
              </p>
              <Link
                href="#"
                className="font-dmsans text-[#FD5B00] hover:text-[#e55a00] transition-colors font-medium"
              >
                View on Google Maps
              </Link>
            </div>
          </div>
        </div>

        <div className="w-full h-auto font-dmsans flex flex-col gap-3 sm:gap-4 lg:w-[30%] lg:gap-4">
          <p className="text-[#2A2A2A] text-sm sm:text-base">
            Join our newsletter to stay up to date on features and releases.
          </p>
          <div className="w-full h-auto flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-3">
            <input
              type="text"
              placeholder="Enter your email"
              className="w-full sm:flex-1 outline-[#FF7558] h-11 sm:h-12 rounded-xl p-3 sm:p-4 bg-white border border-[#FF7558] text-sm sm:text-base"
            />
            <button className="font-semibold px-4 py-3 sm:px-5 sm:py-3 rounded-lg bg-[#FF7558] text-white hover:bg-[#df7d69] transition-colors text-sm sm:text-base whitespace-nowrap">
              Subscribe
            </button>
          </div>
          <p className="text-[#2A2A2A] text-xs sm:text-sm leading-relaxed">
            By subscribing you agree to with our Privacy Policy and provide
            consent to receive updates from our company.
          </p>
          <div className="w-full h-auto flex gap-3 sm:gap-4 items-center justify-center sm:justify-start flex-wrap">
            <Image
              src="/authentic.png"
              alt="logo"
              className="w-10 sm:w-12 md:w-14"
              width={100}
              height={100}
            />
            <Image
              src="/certified1.png"
              alt="logo"
              className="w-10 sm:w-12 md:w-14"
              width={100}
              height={100}
            />
            <Image
              src="/fssai.png"
              alt="logo"
              className="w-10 sm:w-12 md:w-14"
              width={100}
              height={100}
            />
            <Image
              src="/last-icn.png"
              alt="logo"
              className="w-10 sm:w-12 md:w-14"
              width={100}
              height={100}
            />
            <Image
              src="/secure.png"
              alt="logo"
              className="w-10 sm:w-12 md:w-14"
              width={100}
              height={100}
            />
          </div>
        </div>
      </div>

      <div className="w-full h-auto flex flex-col sm:flex-row sm:justify-between justify-center items-center gap-3 sm:gap-5 font-dmsans text-[#2A2A2A] text-xs sm:text-sm md:text-base pt-3 sm:pt-4 border-t border-gray-200">
        <span className="text-center sm:text-left">
          © 2025 BBMart. All rights reserved.
        </span>
        <div className="w-full sm:w-auto h-auto flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-10 items-center">
          <button className="cursor-pointer hover:text-[#FD5B00] transition-colors">
            Privacy Policy
          </button>
          <Link
            href="/pages/termscondition"
            className="cursor-pointer hover:text-[#FD5B00] transition-colors"
          >
            Terms of Service
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Footer;
