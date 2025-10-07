// BannerImagesSlider.jsx
// Fourth one
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  fetchBannersByType,
  fetchGroupsForBanner,
} from "../../utils/supabaseApi";
import { notifications } from "@mantine/notifications";

// ✅ Banner type for this component
const BANNER_TYPE = "Opening Soon";

const BannerImagesSlider = ({ count = 1 }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [bannerUrl, setBannerUrl] = useState(null);
  const [groupCards, setGroupCards] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- Dummy Fallback ---
  const createDummyCard = (id) => ({
    id: `dummy-${id}`,
    title:
      id === 1
        ? "Monsoon Must-haves"
        : id === 2
        ? "Hot Meals & Drinks"
        : id === 3
        ? "Self Care"
        : id === 4
        ? "Home Essentials"
        : "Health & Safety",
    image: "https://i.postimg.cc/0NDbVTtd/21-removebg-preview.png",
    link: `/productListing`,
  });

  const createDummyData = () => [
    createDummyCard(1),
    createDummyCard(2),
    createDummyCard(3),
    createDummyCard(4),
    createDummyCard(5),
  ];

  // --- Fetch Data ---
  useEffect(() => {
    const loadOpeningSoonBannerData = async () => {
      setLoading(true);
      try {
        const banners = await fetchBannersByType(BANNER_TYPE);

        if (banners.length === 0) {
          notifications.show({
            color: "yellow",
            message: `No banners found for type: ${BANNER_TYPE}`,
          });
          setGroupCards(createDummyData());
          return;
        }

        const primaryBanner = banners[0];
        setBannerUrl(primaryBanner.image_url);

        const groups = await fetchGroupsForBanner(primaryBanner.id);

        let cardData = [];
        if (groups.length > 0) {
          cardData = groups.map((group) => ({
            id: group.id,
            title: group.name,
            image: group.image_url,
            link: `/ProductLisingPage/opening-soon/${group.id}`,
          }));
        }

        if (cardData.length === 0) {
          cardData = createDummyData();
        }

        setGroupCards(cardData);
      } catch (error) {
        console.error(`Error loading ${BANNER_TYPE} banner data:`, error);
        notifications.show({
          color: "red",
          message: `Failed to load ${BANNER_TYPE} banner data.`,
        });
        setBannerUrl(null);
        setGroupCards(createDummyData());
      } finally {
        setLoading(false);
      }
    };

    if (location.pathname === "/") {
      loadOpeningSoonBannerData();
    }
  }, [location.pathname]);

  // --- Render Guards ---
  if (location.pathname !== "/") {
    return null;
  }

  if (loading || (!bannerUrl && groupCards.length === 0)) {
    return <div className="p-4 text-center">Loading Opening Soon...</div>;
  }

  // --- Render ---
  return (
    <div className="md:hidden p-2">
      {Array.from({ length: count }).map((_, sectionIndex) => (
        <div
          key={sectionIndex}
          className="relative rounded-xl shadow-md overflow-hidden"
        >
          {/* Banner Background */}
          <div
            className="w-full bg-cover bg-center bg-no-repeat rounded-xl relative flex flex-col justify-end p-2"
            style={{
              backgroundImage: bannerUrl ? `url('${bannerUrl}')` : "none",
              backgroundColor: bannerUrl ? "transparent" : "#f8f8f8",
              minHeight: "220px",
            }}
          >
            {/* Horizontal scroll container */}
            <div
              className="flex overflow-x-scroll w-full gap-3 no-scrollbar absolute bottom-0 left-0"
              style={{
                transform: "translateY(-10px)",
                paddingLeft: "10px",
                paddingRight: "10px",
              }}
            >
              {groupCards.map((group) => (
                <div
                  key={group.id}
                  onClick={() => navigate(group.link)}
                  className="min-w-[20%] flex-shrink-0 h-25 flex justify-center items-center text-center cursor-pointer bg-white rounded-xl"
                >
                  <div className="w-full h-full flex justify-center items-center">
                    <img
                      src={group.image}
                      alt={group.title}
                      className="object-contain max-w-full max-h-full rounded-md"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BannerImagesSlider;
