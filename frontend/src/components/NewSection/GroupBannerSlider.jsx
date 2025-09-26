// third one
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  fetchBannersByType,
  fetchGroupsForBanner,
} from '../../utils/supabaseApi';
import { notifications } from '@mantine/notifications';

// Define the banner type this component is now responsible for displaying
const BANNER_TYPE = "Deals";

const GroupBannerSlider = ({ count = 1 }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [bannerUrl, setBannerUrl] = useState(null);
  const [groupCards, setGroupCards] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- Utility Functions ---

  const createDummyCard = (id) => ({
    id: `dummy-${id}`,
    title: id === 1 ? "Tea, Coffee & More" : id === 2 ? "Noodles, & Pasta" : "Cleaning Essentials",
    image: "https://i.postimg.cc/nrDyCyq1/Screenshot-2025-09-03-175154-removebg-preview.png",
    link: `/productListing`,
  });

  const createDummyData = () => [
    createDummyCard(1),
    createDummyCard(2),
    createDummyCard(3),
  ];

  // --- Data Fetching Logic (UNCHANGED) ---

  useEffect(() => {
    const loadDealsBannerData = async () => {
      setLoading(true);
      try {
        const banners = await fetchBannersByType(BANNER_TYPE);

        if (banners.length === 0) {
          notifications.show({ color: 'yellow', message: `No banners found for type: ${BANNER_TYPE}` });
          setGroupCards(createDummyData());
          return;
        }

        const primaryBanner = banners[0];
        setBannerUrl(primaryBanner.image_url);

        const groups = await fetchGroupsForBanner(primaryBanner.id);

        let cardData = [];
        if (groups.length > 0) {
          cardData = groups.slice(0, 3).map(group => ({
            id: group.id,
            title: group.name,
            image: group.image_url,
            link: `/ProductLisingPage/offers/${group.id}`
          }));
        }

        while (cardData.length < 3) {
          cardData.push(createDummyCard(cardData.length + 1));
        }

        setGroupCards(cardData);

      } catch (error) {
        console.error(`Error loading ${BANNER_TYPE} banner data:`, error);
        notifications.show({ color: 'red', message: `Failed to load ${BANNER_TYPE} banner data.` });
        setBannerUrl(null);
        setGroupCards(createDummyData());
      } finally {
        setLoading(false);
      }
    };

    if (location.pathname === "/") {
      loadDealsBannerData();
    }
  }, [location.pathname]);

  // --- Render Guards ---

  if (location.pathname !== "/") {
    return null;
  }

  if (loading || (!bannerUrl && groupCards.length === 0)) {
    return <div className="p-4 text-center">Loading Deals...</div>;
  }


  // --- Render Logic (JSX) ---

  return (
    <div className="md:hidden p-2 ">
      {Array.from({ length: count }).map((_, sectionIndex) => (
        <div
          key={sectionIndex}
          className="relative rounded-xl shadow-md overflow-hidden"
        >
          {/* Banner Background */}
          <div
            className="w-full bg-cover bg-center bg-no-repeat rounded-xl relative flex flex-col justify-end p-2"
            style={{
              backgroundImage: bannerUrl ? `url('${bannerUrl}')` : 'none',
              backgroundColor: bannerUrl ? 'transparent' : '#f8f8f8',
              // Increased minHeight to provide more space at the top
              minHeight: "280px",
            }}
          >
            {/* Category Cards */}
            <div
              // 💡 FIX: Added mt-12 (or mt-10) to push the cards down further into the banner area.
              className="grid grid-cols-3 gap-2 mt-12 mb-2"
            >
              {groupCards.slice(0, 3).map((cat) => (
                <div
                  key={cat.id}
                  onClick={() => navigate(cat.link)} // Navigate to listing on click
                  className="bg-white rounded-lg shadow flex flex-col items-center justify-center text-center cursor-pointer hover:shadow-lg transition-shadow duration-200"
                >
                  {/* Card Content: The group image is the entire content of the box */}
                  <img
                    src={cat.image} // Fetched group image
                    alt={cat.title}
                    // Ensures the image fits inside the card without distortion or border clipping
                    className="w-full h-full object-contain p-2"
                  />
                </div>
              ))}
            </div>

            {/* Footer (Removed per request) */}
            {/* <div className="bg-white w-[85%] mx-auto rounded-xl text-xs sm:text-sm text-center py-2 font-semibold">
                            Rainy Deals Inside
                        </div> 
                        */}
          </div>
        </div>
      ))}
    </div>
  );
};

export default GroupBannerSlider;