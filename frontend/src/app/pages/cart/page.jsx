"use client";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa6";
import { FaAngleRight } from "react-icons/fa6";
import { useContext } from "react";
import { CartContext } from "@/Context/CartContext";
import Image from "next/image";
import AddToCartButton from "@/components/common/AddToCartButton";

const page = () => {
  const { cartItems, addToCart, removeFromCart, deleteFromCart, getCartTotal } =
    useContext(CartContext);
  return (
    <div className="w-full h-auto flex flex-col px-5 lg:px-10 py-8 gap-10">
      <div className="w-full h-auto flex gap-3 lg:gap-5 flex-wrap items-center font-outfit">
        <Link href={"/"} className="p-3 bg-[#2A2A2A] text-white rounded-full">
          <FaArrowLeft size={20} />
        </Link>
        <Link href={"/"} className="text-[#2F294D] font-semibold lg:text-lg">
          Home
        </Link>
        <span className="text-[#2F294D] font-semibold">
          <FaAngleRight size={20} />
        </span>
        <span className="text-[#2F294D] font-semibold lg:text-lg">
          Product Categories
        </span>
        <span className="text-[#2F294D] font-semibold">
          <FaAngleRight size={20} />
        </span>
        <span className="text-[#2F294D] font-semibold lg:text-lg">
          Single Product
        </span>
        <span className="text-[#2F294D] font-semibold">
          <FaAngleRight size={20} />
        </span>
        <span className="text-[#FF7558] font-semibold lg:text-lg">Cart</span>
      </div>
      <div className="w-full flex flex-col lg:flex-row gap-8 font-outfit items-start">
        {/* Left: Order & Coupons */}
        <div className="w-full lg:w-[65%] flex flex-col gap-6">
          {/* Current Order */}
          <div className="bg-white rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-1">Current Order</h2>
            <p className="text-sm text-gray-500 mb-6">
              The sum of all total payments for goods there
            </p>
            <div className="flex flex-col gap-4">
              {cartItems.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">Your cart is empty</p>
                  <Link
                    href="/"
                    className="bg-[#FF7558] text-white px-6 py-2 rounded-lg"
                  >
                    Continue Shopping
                  </Link>
                </div>
              ) : (
                cartItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between border border-gray-200 rounded-2xl p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 flex items-center justify-center bg-gray-50 rounded">
                        <Image
                          src={item.image || "/prod1.png"}
                          alt={item.name}
                          width={56}
                          height={56}
                          className="w-12 h-12 object-contain"
                        />
                      </div>
                      <div>
                        <div className="font-semibold text-base">
                          {item.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {item.weight && `${item.weight} • `}Price: ₹{item.price} + Shipping: ₹{item.shipping_amount || 0}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-3">
                      <div className="text-[#FF7558] font-bold text-lg">
                        ₹ {((parseFloat(item.price) + (item.shipping_amount || 0)) * item.quantity).toFixed(2)}
                      </div>
                      <div className="flex items-center gap-3">
                        <AddToCartButton
                          product={item}
                          size="default"
                          showCheckoutButton={false}
                        />
                        <button
                          onClick={() => deleteFromCart(item)}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          {/* Discount Coupon */}
          <div className="bg-white max-w-lg rounded-xl p-6 flex flex-col gap-4">
            <h3 className="text-2xl font-semibold">Discount coupon</h3>
            <p className="text-sm text-gray-500">
              Surprise yourself with one coupon
            </p>
            <div className="flex gap-3 items-center">
              <input
                type="text"
                placeholder="Enter code promo"
                className="rounded-xl px-4 py-3 flex-1 outline-none"
                style={{ boxShadow: "0px 2px 8px 0px #00000040" }}
              />
              <button className="bg-[#FF7558] text-white px-6 py-3 rounded-xl font-semibold shadow-md hover:bg-[#ff5a36] transition">
                Apply
              </button>
            </div>
            <a href="#" className="text-xs text-gray-400 underline">
              View available coupons
            </a>
          </div>
          {/* Recommended Coupons */}
          <div className="bg-white rounded-xl max-w-xl p-6 flex flex-col gap-3">
            <h3 className="text-2xl font-semibold mb-2">Recommended coupons</h3>
            <div
              className="rounded-3xl px-10 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
              style={{ boxShadow: "0px 2px 8px 0px #00000040" }}
            >
              <div>
                <div className="font-bold text-xl mb-1">Save Rs145</div>
                <ul className="text-sm text-gray-600 list-disc pl-4">
                  <li>
                    Coupon code: <span className="font-semibold">TRYWACC</span>
                  </li>
                  <li>
                    Coupon Discount: 15% off (Your total saving: Rs. 134!)
                  </li>
                  <li>Applicable on: All orders</li>
                </ul>
              </div>
              <button className="bg-[#FF7558] text-white px-14 py-3 rounded-xl font-semibold shadow-md hover:bg-[#ff5a36] transition self-start md:self-center">
                Apply
              </button>
            </div>
          </div>
        </div>
        {/* Right: Summary */}
        <div className="w-full lg:w-[35%] flex-shrink-0">
          <div className="bg-[#232224] text-white rounded-3xl shadow p-7 flex flex-col gap-4">
            <h3 className="text-xl font-semibold mb-2">Summary</h3>
            <div className="border-b-2 border-gray-200 mb-1"></div>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <span>Total MRP</span>
                <span>₹{cartItems.reduce((total, item) => total + ((item.old_price || item.price) * item.quantity), 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Discount on MRP</span>
                <span className="text-[#FF7558]">- ₹{cartItems.reduce((total, item) => total + (((item.old_price || item.price) - item.price) * item.quantity), 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Code Discount</span>
                <span className="text-[#FF7558]">- ₹0.00</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping Charges</span>
                <span>₹{cartItems.reduce((total, item) => total + ((item.shipping_amount || 0) * item.quantity), 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>GST (18%)</span>
                <span>₹{(getCartTotal() * 0.18).toFixed(2)}</span>
              </div>
            </div>
            <div className="border-b-2 border-gray-200 my-1"></div>
            <div className="flex justify-between items-center text-lg font-semibold">
              <span>Total Amount</span>
              <span>
                ₹{(getCartTotal() + cartItems.reduce((total, item) => total + ((item.shipping_amount || 0) * item.quantity), 0) + (getCartTotal() * 0.18)).toFixed(2)}
              </span>
            </div>
            <Link
              href={"/pages/checkout"}
              className="w-full flex justify-center items-center bg-[#FF7558] text-white py-3 rounded-2xl font-bold text-lg mt-2 shadow-md hover:bg-[#ff5a36] transition"
            >
              Checkout
            </Link>
          </div>
          <div className="text-center text-base text-gray-500 mt-3">
            If you're not 100% satisfied, we'll give you a full refund
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
