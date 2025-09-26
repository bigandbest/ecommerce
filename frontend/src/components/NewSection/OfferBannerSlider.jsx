// OfferBannerSlider.jsx
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

    // --- Utility Functions ---

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
                    // Map the first 3 groups
                    cardData = groups.slice(0, 3).map(group => ({
                        id: group.id,
                        title: group.name,
                        image: group.image_url,
                        link: `/ProductLisingPage/discount/${group.id}`
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
                    // Retain p-2 for padding around the entire banner section
                    className="relative rounded-xl shadow-md overflow-hidden p-2" 
                >
                    {/* Banner Background */}
                    <div
                        className="h-[310px] bg-cover bg-center bg-no-repeat rounded-xl flex flex-col justify-end"
                        style={{
                            backgroundImage: bannerUrl ? `url('${bannerUrl}')` : 'none',
                            backgroundColor: bannerUrl ? 'transparent' : '#f8f8f8',
                        }}
                    >
                        {/* Group Images Container (Grid Layout) */}
                        <div 
                            // ❌ FIX 1: Used px-4 for horizontal padding and gap-3 for spacing between cards
                            // ❌ FIX 2: Added pb-4 and negative mb to position the container lower
                            className="grid grid-cols-3 gap-3 w-full px-4 pb-4" 
                        >
                            {groupCards.slice(0, 3).map((group) => (
                                <div
                                    key={group.id}
                                    onClick={() => navigate(group.link)}
                                    // ❌ FIX 3: Styling to make the cards look like rounded white boxes
                                    className="bg-white rounded-xl shadow h-30 flex flex-col justify-center items-center text-center cursor-pointer transition-shadow duration-200"
                                >
                                    {/* Card Content: Displaying only the Group Image */}
                                    {/* ❌ FIX 4: Use a container with no padding to make the image fill the whole box */}
                                    <div className="w-full h-full flex justify-center items-center">
                                        <img
                                            src={group.image}
                                            alt={group.title}
                                            // The image content should stretch to the box edges without external padding
                                            className="object-cover w-full h-full" 
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ))}
            {/* Bank Offer bar */}
            {/* <div className="flex justify-between items-center bg-white rounded-xl mx-2 px-4 py-2 text-xs text-gray-700 shadow-md">
                <span className="font-semibold">10% off on ₹499</span>
                <span className="font-extrabold text-blue-700">HDFC BANK</span>
                <span className="font-semibold">₹200 off on ₹2,000</span>
            </div>
            */}
        </div>
    );
};

export default OfferBannerSlider;