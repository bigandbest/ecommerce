import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
// 💡 Assuming fetchBannersByType is available in your utils/supabaseApi.js or similar
import { fetchBannersByType, fetchGroupsForBanner, fetchProductsForBannerGroup } from '../../utils/supabaseApi'; 
import { notifications } from '@mantine/notifications';

// Define the type we want to fetch for this component
const BANNER_TYPE = "Offer"; 

const CategoryOfferBanner = ({ count = 1 }) => {
  const location = useLocation();
  const [bannerUrl, setBannerUrl] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Show only on Home route
  if (location.pathname !== "/") {
    return null;
  }

  useEffect(() => {
    const loadOfferBannerData = async () => {
      setLoading(true);
      try {
        // 1. Fetch Banners of type 'Offer'
        const banners = await fetchBannersByType(BANNER_TYPE);

        if (banners.length === 0) {
          notifications.show({ color: 'yellow', message: `No banners found for type: ${BANNER_TYPE}` });
          setLoading(false);
          return;
        }

        // Use the first banner's image as the background
        const primaryBanner = banners[0];
        setBannerUrl(primaryBanner.image_url);

        // 2. Fetch Groups associated with that primary Banner
        const groups = await fetchGroupsForBanner(primaryBanner.id);

        if (groups.length === 0) {
          // If no groups, we can't fill the cards, so we use dummy data or stop.
          setCategoryData(createDummyData()); 
          notifications.show({ color: 'yellow', message: 'No groups associated with the primary offer banner.' });
          setLoading(false);
          return;
        }

        // 3. To mimic the 3-card structure, we fetch products for the first N groups (e.g., first 3)
        // You would typically link categories/products to the groups in the admin.
        const promises = groups.slice(0, 3).map(group => 
          fetchProductsForBannerGroup(group.id).then(products => ({
            id: group.id,
            title: group.name,
            subtitle: "View Products", // Placeholder subtitle
            image: group.image_url, // Use the group's image for the card image
            // Note: The product logic here is simplified. You might use the products
            // but for this UI, we just need the group's details.
          }))
        );

        const cardData = await Promise.all(promises);
        
        // Fill up to 3 cards, falling back to dummy data if fewer than 3 groups/products were found
        while (cardData.length < 3) {
             cardData.push(createDummyCard(cardData.length + 1));
        }
        
        setCategoryData(cardData);

      } catch (error) {
        console.error(`Error loading ${BANNER_TYPE} banner data:`, error);
        notifications.show({ color: 'red', message: `Failed to load ${BANNER_TYPE} banner data.` });
        setBannerUrl(null); // Clear URL on error
      } finally {
        setLoading(false);
      }
    };

    loadOfferBannerData();
  }, []); // Run once on component mount

  // Helper function to create dummy card data if data fetching fails or is incomplete
  const createDummyCard = (id) => ({
    id: id,
    title: `Placeholder Card ${id}`,
    subtitle: "Dummy Data",
    image: "https://i.postimg.cc/nrDyCyq1/Screenshot-2025-09-03-175154-removebg-preview.png",
  });
  
  const createDummyData = () => [
    createDummyCard(1),
    createDummyCard(2),
    createDummyCard(3),
  ];


  if (loading || !bannerUrl || categoryData.length === 0) {
    // Optionally render a loading state or nothing if no data is available
    return <div className="text-center p-4">Loading Offers...</div>;
  }

  // --- Render logic using fetched data ---
  return (
    // ... same UI structure as before, now using state data ...
    <div className="space-y-8 md:hidden">
      {Array.from({ length: count }).map((_, sectionIndex) => (
        <div
          key={sectionIndex}
          className="relative rounded-xl shadow-md overflow-hidden p-2"
        >
          {/* Banner Background */}
          <div
            className="bg-cover bg-center rounded-xl flex flex-col justify-end aspect-[2/1] sm:aspect-[16/7] md:aspect-[16/6]"
            style={{
              backgroundImage: `url('${bannerUrl}')`, // Uses fetched image URL
            }}
          >
            {/* Exactly 3 cards in a row */}
            <div className="grid grid-cols-3 gap-1 h-[81%]">
              {categoryData.slice(0, 3).map((category, idx) => (
                <div
                  key={category.id}
                  className={`flex flex-col justify-center items-center text-center p-1 ${
                    idx !== 2 // Check if it's not the last card (index 2)
                      ? "border-r border-gray-200"
                      : ""
                  }`}
                >
                  <img
                    src={category.image}
                    alt={category.title}
                    className="object-contain"
                  />
                  {/* You can add text/title here if needed, but the original code only had the image */}
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CategoryOfferBanner;