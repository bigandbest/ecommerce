/**
 * Dynamic Homepage Component - Renders sections based on admin configuration
 * This component fetches active product sections from the backend and renders them dynamically
 */

"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Marquee from "react-fast-marquee";

// Import all available components
import HeroSection from "@/components/homepage/HeroSection";
import TopSeller from "@/components/homepage/TopProducts";
import CustomerReview from "@/components/homepage/CustomerReview";
import Athletes from "@/components/homepage/Athletes";
import RefreshWorkspace from "@/components/homepage/RefreshWorkspace";
import WeeklyDeal from "@/components/homepage/WeeklyDeal";
import ShopGoal from "@/components/homepage/ShopGoals";
import QuickPicks from "@/components/homepage/QuickPicks";
import ShopByStore from "@/components/homepage/ShopByStore";
import DailyDeals from "@/components/homepage/DailyDeals";
import ShopByCategory from "@/components/homepage/ShopByCategory";
import EventElevate from "@/components/homepage/EventElevate";
import QuickAccess from "@/components/homepage/QuickAccess";
import Blog from "@/components/homepage/Blog";
import PromoBanner from "@/components/homepage/PromoBanner";
import InstagramReels from "@/components/homepage/InstagramReels";
import BrandVista from "@/components/homepage/BrandVista";
import PriceZone from "@/components/homepage/PriceZone";
import DualDeals from "@/components/homepage/DualDeals";
import VideoCardSection from "@/components/homepage/VideoCardSection";
import MegaMonsoon from "@/components/homepage/MegaMonsoon";
import YouMayLike from "@/components/homepage/YouMayLike";
import DiscountCorner from "@/components/homepage/DiscountCorner";
import BrandPartners from "@/components/homepage/BrandPartners";
import DynamicMegaSale from "@/components/homepage/DynamicMegaSale";
import LimitedEdition from "@/components/homepage/LimitedEdition";
import SpecialOffers from "@/components/homepage/SpecialOffers";
import RecommendedProducts from "@/components/homepage/RecommendedProducts";
import PopularProducts from "@/components/homepage/PopularProducts";
import FeaturedProducts from "@/components/homepage/FeaturedProducts";
import ProductSectionsGroup from "@/components/homepage/ProductSectionsGroup";

// Component mapping for dynamic rendering
const COMPONENT_MAP = {
  QuickAccess,
  HeroSection,
  DynamicMegaSale,
  QuickPicks,
  ShopByStore,
  DailyDeals,
  ShopByCategory,
  PromoBanner,
  EventElevate,
  PriceZone,
  BrandVista,
  DualDeals,
  VideoCardSection,
  MegaMonsoon,
  YouMayLike,
  DiscountCorner,
  ProductSectionsGroup,
  FeaturedProducts,
  PopularProducts,
  RecommendedProducts,
  SpecialOffers,
  LimitedEdition,
  TopProducts: TopSeller, // Map TopProducts to TopSeller component
  ShopGoals: ShopGoal, // Map ShopGoals to ShopGoal component
  WeeklyDeal,
  RefreshWorkspace,
  Athletes,
  InstagramReels,
  Blog,
  CustomerReviews: CustomerReview, // Map CustomerReviews to CustomerReview component
  BrandPartners,
};

// Fallback component for missing components
const FallbackComponent = ({ sectionName }) => (
  <div className="bg-gray-100 p-4 rounded-lg text-center text-gray-600 my-4">
    <p>Component "{sectionName}" not found</p>
  </div>
);

export default function DynamicHomepage() {
  const [sections, setSections] = useState([]);
  const [sectionProducts, setSectionProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMounted, setIsMounted] = useState(false);

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    "https://big-best-backend.vercel.app/api";

  useEffect(() => {
    setIsMounted(true);
    fetchActiveSections();
  }, []);

  const fetchProductsForSection = async (sectionKey) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/store-section-mappings/section/${sectionKey}/products`
      );
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          return data.products || [];
        }
      }
      return [];
    } catch (err) {
      console.warn(
        `Failed to fetch products for section ${sectionKey}:`,
        err.message
      );
      return [];
    }
  };

  const fetchActiveSections = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/product-sections/active`);

      // Check if we got HTML instead of JSON (endpoint doesn't exist)
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.warn(
          "Product sections endpoint not available on deployed server, using fallback data"
        );
        throw new Error("Endpoint not available - using fallback");
      }

      const data = await response.json();

      if (data.success) {
        const sectionsData = data.data;
        setSections(sectionsData);

        // Fetch products for each section
        const productsPromises = sectionsData.map(async (section) => {
          if (section.section_key) {
            const products = await fetchProductsForSection(section.section_key);
            return { sectionKey: section.section_key, products };
          }
          return null;
        });

        const productsResults = await Promise.all(productsPromises);
        const productsMap = {};
        productsResults.forEach((result) => {
          if (result) {
            productsMap[result.sectionKey] = result.products;
          }
        });

        setSectionProducts(productsMap);
        setError(null);
      } else {
        throw new Error(data.error || "Failed to fetch sections");
      }
    } catch (err) {
      console.warn("API unavailable, using default sections:", err.message);

      // Use fallback sections when API is not available
      const fallbackSections = [
        {
          id: 1,
          section_key: "hero_section",
          section_name: "Hero Section",
          component_name: "HeroSection",
          is_active: true,
          display_order: 1,
        },
        {
          id: 2,
          section_key: "quick_picks",
          section_name: "Quick Picks",
          component_name: "QuickPicks",
          is_active: true,
          display_order: 2,
        },
        {
          id: 3,
          section_key: "shop_by_store",
          section_name: "Shop by Store",
          component_name: "ShopByStore",
          is_active: true,
          display_order: 3,
        },
        {
          id: 4,
          section_key: "daily_deals",
          section_name: "Daily Deals",
          component_name: "DailyDeals",
          is_active: true,
          display_order: 4,
        },
        {
          id: 5,
          section_key: "top_products",
          section_name: "Top Products",
          component_name: "TopProducts",
          is_active: true,
          display_order: 5,
        },
        {
          id: 6,
          section_key: "video_cards",
          section_name: "Video Cards",
          component_name: "VideoCardSection",
          is_active: true,
          display_order: 6,
        },
      ];

      setSections(fallbackSections);

      // Fetch products for fallback sections
      const productsPromises = fallbackSections.map(async (section) => {
        if (section.section_key) {
          const products = await fetchProductsForSection(section.section_key);
          return { sectionKey: section.section_key, products };
        }
        return null;
      });

      const productsResults = await Promise.all(productsPromises);
      const productsMap = {};
      productsResults.forEach((result) => {
        if (result) {
          productsMap[result.sectionKey] = result.products;
        }
      });

      setSectionProducts(productsMap);

      // Only show error for non-network errors
      if (
        !err.message.includes("Failed to fetch") &&
        !err.message.includes("NetworkError") &&
        !err.message.includes("Endpoint not available")
      ) {
        setError(err.message);
      } else {
        setError(null); // Don't show offline message for network errors
      }

      // Always fallback to default sections
      const defaultSections = getDefaultSections();
      setSections(defaultSections);
      console.log(
        `📋 Using ${defaultSections.length} default homepage sections`
      );
    } finally {
      setLoading(false);
    }
  };

  // Fallback sections if API is not available
  const getDefaultSections = () => [
    {
      id: 1,
      section_key: "quick_access",
      component_name: "QuickAccess",
      display_order: 1,
    },
    {
      id: 2,
      section_key: "hero_section",
      component_name: "HeroSection",
      display_order: 2,
    },
    {
      id: 2.5,
      section_key: "mega_sale",
      component_name: "DynamicMegaSale",
      display_order: 2.5,
    },
    {
      id: 3,
      section_key: "quick_picks",
      component_name: "QuickPicks",
      display_order: 3,
    },
    {
      id: 4,
      section_key: "shop_by_store",
      component_name: "ShopByStore",
      display_order: 4,
    },
    {
      id: 5,
      section_key: "daily_deals",
      component_name: "DailyDeals",
      display_order: 5,
    },
    {
      id: 6,
      section_key: "shop_by_category",
      component_name: "ShopByCategory",
      display_order: 6,
    },
    {
      id: 7,
      section_key: "promo_banner",
      component_name: "PromoBanner",
      display_order: 7,
    },
    {
      id: 8,
      section_key: "event_elevate",
      component_name: "EventElevate",
      display_order: 8,
    },
    {
      id: 9,
      section_key: "price_zone",
      component_name: "PriceZone",
      display_order: 9,
    },
    {
      id: 10,
      section_key: "brand_vista",
      component_name: "BrandVista",
      display_order: 10,
    },
  ];

  const renderSection = (section) => {
    const Component = COMPONENT_MAP[section.component_name];

    if (!Component) {
      console.warn(`Component ${section.component_name} not found`);
      return (
        <div key={section.id} className="mt-2 sm:mt-3 md:mt-4">
          <FallbackComponent sectionName={section.component_name} />
        </div>
      );
    }

    return (
      <div key={section.id} className="mt-2 sm:mt-3 md:mt-4">
        <Component
          sectionName={section.section_name}
          sectionDescription={section.description}
          products={sectionProducts[section.section_key] || []}
        />
      </div>
    );
  };

  const renderBrandPartners = () => {
    // Find the brand partners section from the sections data
    const brandPartnersSection = sections.find(
      (section) => section.component_name === "BrandPartners"
    );

    return (
      <div className="w-full -mx-2 sm:-mx-4 md:-mx-6 lg:-mx-8 xl:-mx-10 -mt-2 sm:-mt-3 md:-mt-4 mb-1 sm:mb-2">
        <div className="text-center py-3 sm:py-4 md:py-6 px-2 sm:px-4 md:px-6 lg:px-8 xl:px-10">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-[#2A2A2A] mb-2 sm:mb-3 md:mb-4">
            {brandPartnersSection?.section_name || "Our Trusted Brand Partners"}
          </h2>
          <p className="text-[#FD5B00] text-sm sm:text-base md:text-lg lg:text-xl font-medium px-1 sm:px-2">
            {brandPartnersSection?.description ||
              "We collaborate with India's most trusted brands to bring you authentic products at the best prices"}
          </p>
        </div>
        <div className="w-full">
          <Marquee
            speed={40}
            gradient={false}
            pauseOnHover={true}
            className="py-2 sm:py-3 md:py-4"
          >
            {[
              "/comp1.svg",
              "/comp2.svg",
              "/comp3.svg",
              "/comp4.svg",
              "/comp5.svg",
              "/comp1.svg",
              "/comp2.svg",
              "/comp3.svg",
              "/comp4.svg",
              "/comp5.svg",
            ].map((logo, index) => (
              <div
                key={index}
                className="relative h-12 sm:h-14 md:h-16 lg:h-20 w-24 sm:w-32 md:w-36 lg:w-40 mx-3 sm:mx-4 md:mx-6 lg:mx-8"
              >
                <Image
                  src={logo}
                  alt={`Brand partner ${index + 1}`}
                  fill
                  className="object-contain grayscale hover:grayscale-0 transition-all duration-300"
                />
              </div>
            ))}
          </Marquee>
        </div>
      </div>
    );
  };

  if (!isMounted) {
    return (
      <div className="font-roboto min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FD5B00]"></div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="font-roboto min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FD5B00] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading homepage sections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="font-roboto" suppressHydrationWarning>
      {/* Render sections dynamically based on admin configuration */}
      {sections.map(renderSection)}

      {/* Brand Partners section - always at the end */}
      {renderBrandPartners()}

      {/* Show error message if API failed but still show content
      {error && (
        <div className="fixed bottom-4 right-4 bg-orange-100 border border-orange-400 text-orange-700 px-4 py-3 rounded shadow-lg">
          <p className="text-sm">
            Using offline mode - some sections may not be up to date
          </p>
        </div>
      )} */}
    </div>
  );
}
