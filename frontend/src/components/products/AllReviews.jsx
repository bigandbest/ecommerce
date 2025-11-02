"use client";
import { useState, useEffect, useRef } from 'react';
import { IoStar, IoStarOutline } from "react-icons/io5";
import Image from "next/image";
import { FaAngleRight, FaAngleLeft } from "react-icons/fa6";

const reviews = [
    {
        name: "Floyd Miles",
        rating: 4,
        img: "/user1.png",
        comment: "Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit. Exerci tation veniam consequat sunt nostrud amet Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit. Exerci tation veniam consequat sunt nostrud amet",
    },
    {
        name: "Ronald Richards",
        rating: 5,
        img: "/user2.png",
        comment: "Ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet...",
    },
    {
        name: "Savannah Nguyen",
        rating: 4,
        img: "/user3.png",
        comment: "Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostrud amet...",
    },
    {
        name: "Alex Johnson",
        rating: 5,
        img: "/user4.png",
        comment: "Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit. Exerci tation veniam consequat sunt nostrud amet Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit. Exerci tation veniam consequat sunt nostrud amet",
    },
    {
        name: "Maria Garcia",
        rating: 4,
        img: "/user5.png",
        comment: "Good value for the price. The material feels durable and the design is exactly as shown on the website. Shipping took a bit longer than expected but overall satisfied.",
    },
    {
        name: "David Wilson",
        rating: 3,
        img: "/user6.png",
        comment: "Decent product but not exactly what I was expecting. The sizing runs a bit small, so I'd recommend ordering a size up if you're between sizes.",
    },
    {
        name: "Emma Thompson",
        rating: 5,
        img: "/user7.png",
        comment: "Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit. Exerci tation veniam consequat sunt nostrud amet Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit. Exerci tation veniam consequat sunt nostrud amet",
    },
];

export default function CustomerFeedback() {
    const [viewAll, setViewAll] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [slidesToShow, setSlidesToShow] = useState(3);
    const [autoSlide, setAutoSlide] = useState(true);
    const [touchStart, setTouchStart] = useState(0);
    const [touchEnd, setTouchEnd] = useState(0);
    const sliderRef = useRef(null);

    // Handle responsive slides
    useEffect(() => {
        const updateSlides = () => {
            const width = window.innerWidth;
            if (width < 640) setSlidesToShow(1);
            else if (width < 1024) setSlidesToShow(2);
            else setSlidesToShow(3);
        };

        updateSlides();
        window.addEventListener('resize', updateSlides);
        return () => window.removeEventListener('resize', updateSlides);
    }, []);

    // Auto slide functionality
    useEffect(() => {
        if (!autoSlide || viewAll) return;

        const interval = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % Math.ceil(reviews.length / slidesToShow));
        }, 5000);

        return () => clearInterval(interval);
    }, [autoSlide, viewAll, slidesToShow]);

    // Handle touch events for mobile swipe
    const handleTouchStart = (e) => {
        setTouchStart(e.targetTouches[0].clientX);
    };

    const handleTouchMove = (e) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = () => {
        if (touchStart - touchEnd > 50) {
            // Swipe left
            setCurrentSlide(prev =>
                prev < Math.ceil(reviews.length / slidesToShow) - 1 ? prev + 1 : 0
            );
        }

        if (touchStart - touchEnd < -50) {
            // Swipe right
            setCurrentSlide(prev =>
                prev > 0 ? prev - 1 : Math.ceil(reviews.length / slidesToShow) - 1
            );
        }
    };

    // Calculate visible reviews for carousel
    const startIndex = currentSlide * slidesToShow;
    const visibleReviews = reviews.slice(startIndex, startIndex + slidesToShow);

    return (
        <section className="w-full py-10 bg-white">
            <div className="container mx-auto px-4">
                <div className="flex flex-col sm:flex-row sm:justify-between gap-4 sm:items-center mb-6">
                    <div className="font-outfit text-[#133240]">
                        <h2 className="text-2xl font-bold lg:text-3xl xl:text-4xl">Our Customer Feedback</h2>
                        <p className="font-medium text-sm lg:text-lg xl:text-xl">
                            Don’t take our word for it. Trust our customers
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            setViewAll(!viewAll);
                            setAutoSlide(false);
                        }}
                        className="text-sm flex gap-2 transition-all duration-300 ease-in-out items-center cursor-pointer md:hover:text-[#FF7558] text-[#333333] font-medium underline-offset-4 hover:underline"
                    >
                        {viewAll ? "View Carousel" : "View All Comments"}
                        <FaAngleRight size={18} />
                    </button>
                </div>

                {/* Card Carousel View */}
                {!viewAll ? (
                    <div className="relative">
                        <div
                            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6 transition-all duration-500"
                            ref={sliderRef}
                            onTouchStart={handleTouchStart}
                            onTouchMove={handleTouchMove}
                            onTouchEnd={handleTouchEnd}
                        >
                            {visibleReviews.map((review, index) => (
                                <div
                                    key={index}
                                    className="bg-white rounded-2xl hover:shadow-xl cursor-default duration-300 ease-in-out transition-all shadow-sm border border-[#EFEFEF] font-outfit p-6 flex flex-col gap-4"
                                >
                                    <div className="flex items-center sm:items-start justify-between gap-4">
                                        <div className="w-12 h-12 overflow-hidden border lg:w-14 lg:h-14">
                                            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-full" />
                                        </div>
                                        <div className="">
                                            <div className="flex items-center gap-1">
                                                {[1, 2, 3, 4, 5].map((star) =>
                                                    review.rating >= star ? (
                                                        <IoStar key={star} className="text-[#F8A401] lg:size-5" />
                                                    ) : (
                                                        <IoStarOutline key={star} className="text-[#D9D3D3] lg:size-5" />
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <h1 className="font-semibold text-[#133240] lg:text-xl">{review.name}</h1>
                                    <p className="text-sm text-[#5E5E5E] leading-relaxed">{review.comment}</p>
                                </div>
                            ))}
                        </div>

                        {/* Navigation Arrows */}
                        <button
                            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 bg-white rounded-full shadow-md p-2 hover:bg-gray-100 transition-colors hidden md:block"
                            onClick={() => setCurrentSlide(prev =>
                                prev > 0 ? prev - 1 : Math.ceil(reviews.length / slidesToShow) - 1
                            )}
                        >
                            <FaAngleLeft className="text-[#133240]" size={24} />
                        </button>
                        <button
                            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 bg-white rounded-full shadow-md p-2 hover:bg-gray-100 transition-colors hidden md:block"
                            onClick={() => setCurrentSlide(prev =>
                                prev < Math.ceil(reviews.length / slidesToShow) - 1 ? prev + 1 : 0
                            )}
                        >
                            <FaAngleRight className="text-[#133240]" size={24} />
                        </button>
                    </div>
                ) : (
                    /* List View */
                    <div className="space-y-8 transition-all duration-500">
                        {reviews.map((review, index) => (
                            <div
                                key={index}
                                className="bg-white rounded-xl p-6 border border-[#EFEFEF] transition-all duration-300 hover:shadow-md"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 overflow-hidden border">
                                            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-full" />
                                        </div>
                                        <h3 className="font-semibold text-[#133240] text-lg">{review.name}</h3>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {[1, 2, 3, 4, 5].map((star) =>
                                            review.rating >= star ? (
                                                <IoStar key={star} className="text-[#F8A401] size-5" />
                                            ) : (
                                                <IoStarOutline key={star} className="text-[#D9D3D3] size-5" />
                                            )
                                        )}
                                    </div>
                                </div>
                                <p className="text-[#5E5E5E] leading-relaxed">{review.comment}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Carousel Dots - Only show in carousel mode */}
                {!viewAll && (
                    <div className="flex justify-center mt-8 gap-2">
                        {Array.from({ length: Math.ceil(reviews.length / slidesToShow) }).map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentSlide(i)}
                                className={`w-3 h-3 rounded-full transition-all duration-300 ${i === currentSlide ? "bg-[#ff7558] scale-125" : "bg-[#D9D9D9] hover:bg-[#ff7558]/70"
                                    }`}
                                aria-label={`Go to slide ${i + 1}`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}