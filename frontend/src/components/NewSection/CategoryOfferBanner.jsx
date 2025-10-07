// CategoryOfferBanner.jsx
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
        // Add extra dummies to confirm horizontal scroll works
        createDummyCard(4),
        createDummyCard(5),
    ];

    // --- Data Fetching Logic (MODIFIED to map ALL groups for scroll) ---

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
                    // Map ALL groups to enable scrolling
                    cardData = groups.map(group => ({
                        id: group.id,
                        title: group.name,
                        image: group.image_url,
                        link: `/ProductLisingPage/offers/${group.id}` // Ensure correct link type
                    }));
                }

                if (cardData.length === 0) {
                    cardData = createDummyData();
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

    if (loading || (!bannerUrl && groupCards.length === 0)) {
        return <div className="p-4 text-center">Loading Offers...</div>;
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
                        className="bg-cover bg-center bg-no-repeat rounded-xl flex flex-col justify-end w-full min-h-[250px] sm:min-h-[300px] relative overflow-hidden"
                        style={{
                            backgroundImage: bannerUrl ? `url('${bannerUrl}')` : 'none',
                            backgroundColor: bannerUrl ? 'transparent' : '#e0e0e0',
                        }}
                    >
                        {/* 💡 CHANGE 1: Group Images Container (Horizontal Scroll) */}
                        <div
                            // Switched from grid to flex for scrolling
                            className="flex overflow-x-scroll w-full gap-0 px-0 pb-0 no-scrollbar absolute bottom-0 left-0" 
                            style={{
                                height: 'auto',
                                // Lift the cards up into the image area
                                transform: 'translateY(-10px)', 
                                paddingLeft: '10px', 
                                paddingRight: '10 px',
                            }}
                        >
                            {groupCards.map((group) => (
                                <div
                                    key={group.id}
                                    onClick={() => navigate(group.link)}
                                    // Removed white background/shadow here and moved it to the image wrapper below
                                    // Use flex-shrink-0 and min-w to make it scrollable
                                    className="flex-shrink-0 h-25 flex justify-center items-center text-center cursor-pointer mx-1"
                                >
                                    {/* Card Content: The group image is the entire content of the box */}
                                    <div 
                                        // This wrapper now provides the visual styling (rounded white box)
                                        className="w-full h-full flex justify-center items-center bg-white rounded-xl shadow-lg"
                                    >
                                        <img
                                            src={group.image}
                                            alt={group.title}
                                            // The image should contain the content inside the white box
                                            className="object-contain max-w-full max-h-full rounded-md" // Added p-1 for space inside the card
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        {/* 💡 CHANGE 2: Footer/Bank Offer Section positioned at the bottom */}
                        {/*}
                        <div className="absolute bottom-0 w-full z-20 px-4 pb-2">
                            <div className="flex justify-between items-center bg-white rounded-xl px-4 py-2 text-xs text-gray-700 shadow-xl whitespace-nowrap">
                                <span className="font-semibold">10% off on ₹499</span>
                                <span className="font-extrabold text-blue-700">HDFC BANK</span>
                                <span className="font-semibold">₹200 off on ₹2,000</span>
                            </div>
                        </div>    */}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default CategoryOfferBanner;