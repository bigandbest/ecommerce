// EightProductSection.jsx
// section 1
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  fetchBannersByType,
  fetchGroupsForBanner,
} from "../../utils/supabaseApi";
import { notifications } from "@mantine/notifications";

const BANNER_TYPE = "Section 1";

const EightProductSection = ({ count = 1 }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [bannerUrl, setBannerUrl] = useState(null);
  const [groupCards, setGroupCards] = useState([]);
  const [loading, setLoading] = useState(true);

  const createDummyCard = (id) => ({
    id: `dummy-${id}`,
    title: `Product ${id}`,
    image: "https://i.postimg.cc/VNzkJTCT/Candle5.jpg",
    link: `/productListing`,
  });

  const createDummyData = () =>
    Array.from({ length: 8 }, (_, i) => createDummyCard(i + 1));

  useEffect(() => {
    const loadSectionData = async () => {
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
            link: `/ProductListingPage/section1/${group.id}`,
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
      loadSectionData();
    }
  }, [location.pathname]);

  if (location.pathname !== "/") {
    return null;
  }

  if (loading || (!bannerUrl && groupCards.length === 0)) {
    return <div className="p-4 text-center">Loading Section 1...</div>;
  }

  return (
    <div className="space-y-8 md:hidden">
      {Array.from({ length: count }).map((_, sectionIndex) => (
        <div
          key={sectionIndex}
          className="relative rounded-xl shadow-md overflow-hidden p-2"
        >
          <div
            className="bg-cover bg-center bg-no-repeat rounded-xl flex flex-col justify-end w-full min-h-[250px] sm:min-h-[300px] relative overflow-hidden"
            style={{
              backgroundImage: bannerUrl ? `url('${bannerUrl}')` : "none",
              backgroundColor: bannerUrl ? "transparent" : "#e0e0e0",
            }}
          >
            {/* Horizontal Scroll Cards */}
            <div
              className="flex overflow-x-scroll w-full gap-0 px-0 pb-3 no-scrollbar absolute bottom-0 left-0"
              style={{
                transform: "translateY(-5px)", // less overlap
                paddingLeft: "10px",
                paddingRight: "10px",
              }}
            >
              {groupCards.map((group) => (
                <div
                  key={group.id}
                  onClick={() => navigate(group.link)}
                  className="flex-shrink-0 w-40 flex flex-col items-center text-center cursor-pointer mx-2"
                >
                  {/* Image */}
                  <div className="w-full h-[100px] flex justify-center items-center  rounded-xl shadow-lg overflow-hidden">
                    <img
                      src={group.image}
                      alt={group.title}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  {/* Title */}
                  <p className="mt-2 text-xs font-semibold text-gray-800 truncate w-full">
                    {group.title}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EightProductSection;
