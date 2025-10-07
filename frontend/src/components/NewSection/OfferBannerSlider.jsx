// OfferBannerSlider.jsx
// first one
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    fetchBannersByType,
    fetchGroupsForBanner,
} from '../../utils/supabaseApi';
import { notifications } from '@mantine/notifications';

// Define the banner type this component is responsible for displaying
const BANNER_TYPE = "Discount";

const OfferBannerSlider = ({ count = 1 }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [bannerUrl, setBannerUrl] = useState(null);
    const [groupCards, setGroupCards] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- Utility Functions (UNCHANGED) ---

    const createDummyCard = (id) => ({
        id: `dummy-${id}`,
        title: `Group ${id}`,
        image: "https://i.postimg.cc/nrDyCyq1/Screenshot-2025-09-03-175154-removebg-preview.png",
        link: `/productListing`,
    });

    const createDummyData = () => [
        createDummyCard(1),
        createDummyCard(2),
        createDummyCard(3),
        createDummyCard(4),
        createDummyCard(5),
    ];

    // --- Data Fetching Logic (UNCHANGED) ---

    useEffect(() => {
        const loadDiscountBannerData = async () => {
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
                    cardData = groups.map(group => ({
                        id: group.id,
                        title: group.name,
                        image: group.image_url,
                        link: `/ProductLisingPage/discount/${group.id}`
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
            loadDiscountBannerData();
        }
    }, [location.pathname]);

    // --- Render Guards (UNCHANGED) ---

    if (location.pathname !== "/") {
        return null;
    }

    if (loading || (!bannerUrl && groupCards.length === 0)) {
        return <div className="p-4 text-center">Loading Discounts...</div>;
    }


    // --- Render Logic (JSX) ---

    return (
        <div className="md:hidden">
            {Array.from({ length: 1 }).map((_, sectionIndex) => (
                <div
                    key={sectionIndex}
                    className="relative rounded-xl overflow-hidden p-2"
                >
                    {/* Banner Background */}
                    <div
                        className="h-[250px] bg-cover bg-center bg-no-repeat rounded-xl flex flex-col justify-end"
                        style={{
                            backgroundImage: bannerUrl ? `url('${bannerUrl}')` : 'none',
                            backgroundColor: bannerUrl ? 'transparent' : '#f8f8f8',
                        }}
                    >
                        {/* Group Images Container (Horizontal Scroll) */}
                        <div
                            className="flex overflow-x-scroll w-full gap-0 px-0 pb-4 no-scrollbar"
                            style={{
                                height: 'auto',
                               /*  paddingTop: '150px', // Push content down */
                                marginBottom: '-25px',
                            }}
                        >
                            {groupCards.map((group) => (
                                <div
                                    key={group.id}
                                    onClick={() => navigate(group.link)}
                                    // ❌ FIX 1: Removed bg-white, rounded-xl, and shadow-lg from the card container
                                    // to make it transparent, allowing only the image's background to show.
                                    className="min-w-[32%] h-32 flex justify-center items-center text-center cursor-pointer mx-1"
                                >
                                    {/* Card Content: Displaying only the Group Image */}
                                    <div className="w-full h-full flex justify-center items-center">
                                        <img
                                            src={group.image}
                                            alt={group.title}
                                            // ✅ FIX 2: Switched back to object-contain to ensure the full image is visible
                                            // and use 'rounded-xl' on the image itself if needed for a uniform look.
                                            className="object-contain w-full h-full rounded-xl"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ))}
            {/* Bank Offer bar */}{/*
            <div className="flex justify-between items-center bg-white rounded-xl mx-2 px-4 py-2 text-xs text-gray-700 shadow-md">
                <span className="font-semibold">10% off on ₹499</span>
                <span className="font-extrabold text-blue-700">HDFC BANK</span>
                <span className="font-semibold">₹200 off on ₹2,000</span>
            </div>  */}
        </div>
    );
};

export default OfferBannerSlider;