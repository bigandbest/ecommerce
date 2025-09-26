// second one
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  fetchBannersByType,
  fetchGroupsForBanner,
} from '../../utils/supabaseApi';
import { notifications } from '@mantine/notifications';

// Define the banner type this component is responsible for displaying
const BANNER_TYPE = "Offer";

const CategoryOfferBanner = ({ count = 1 }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [bannerUrl, setBannerUrl] = useState(null);
  const [groupCards, setGroupCards] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- Utility Functions (UNCHANGED) ---

  const createDummyCard = (id) => ({
    id: `dummy-${id}`,
    title: `Group ${id}`,
    image: "https://i.postimg.cc/B6gYq8Gk/Candle6.jpg",
    link: `/productListing`,
  });

  const createDummyData = () => [
    createDummyCard(1),
    createDummyCard(2),
    createDummyCard(3),
  ];

  // --- Data Fetching Logic (UNCHANGED) ---

  useEffect(() => {
    const loadOfferBannerData = async () => {
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
      loadOfferBannerData();
    }
  }, [location.pathname]);

  // --- Render Guards (UNCHANGED) ---

  if (location.pathname !== "/") {
    return null;
  }

  if (loading) {
    return (
      <div className="p-2 space-y-8 md:hidden">
        <div className="text-center bg-white p-4 rounded-xl shadow-md">Loading Offers...</div>
      </div>
    );
  }

  if (!bannerUrl && groupCards.length === 0) {
    return null;
  }


  // --- Render Logic (JSX) ---

  return (
    <div className="space-y-8 md:hidden">
      {Array.from({ length: count }).map((_, sectionIndex) => (
        <div
          key={sectionIndex}
          className="relative rounded-xl shadow-md overflow-hidden p-2"
        >
          {/* Banner Background */}
          <div
            className="bg-cover bg-center bg-no-repeat rounded-xl flex flex-col justify-end w-full min-h-[250px] sm:min-h-[300px] overflow-hidden"
            style={{
              backgroundImage: bannerUrl ? `url('${bannerUrl}')` : 'none',
              backgroundColor: bannerUrl ? 'transparent' : '#e0e0e0',
            }}
          >
            {/* Overlay Card Container */}
            <div
              // ✅ FIX 1: Set gap-0 to remove spacing between grid columns/rows.
              // ✅ FIX 2: Set px-0 to remove padding from container edges.
              className="grid grid-cols-3 gap-0 w-full px-0 pt-4 pb-0 -mb-2"
            >
              {groupCards.slice(0, 3).map((group, idx) => (
                <div
                  key={group.id}
                  onClick={() => navigate(group.link)}
                  className={`
                                        flex flex-col justify-center items-center text-center rounded-xl shadow-xl cursor-pointer transition-transform duration-200 transform hover:scale-[1.02] 
                                        bg-white
                                        h-28 
                                        // ❌ FIX 3: Removed margin class (m-[4px]) to stop card separation
                                    `}
                >
                  {/* Card Content: The group image is the entire content of the box */}
                  <div className="w-full h-full flex justify-center items-center">
                    <img
                      src={group.image}
                      alt={group.title}
                      className="object-contain max-w-full max-h-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
      {/* Footer/Bank Offer Section (Hardcoded example from your image - if uncommented) */}
      {/* <div className="flex justify-between items-center bg-white rounded-b-xl px-4 py-2 text-xs text-gray-700 shadow-md">
                        <span className="font-semibold">10% off on ₹499</span>
                        <span className="font-extrabold text-blue-700">HDFC BANK</span>
                        <span className="font-semibold">₹200 off on ₹2,000</span>
                    </div> */}
    </div>
  );
};

export default CategoryOfferBanner;