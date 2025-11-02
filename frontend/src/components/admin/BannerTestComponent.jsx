'use client';
import { useState, useEffect } from 'react';
import { getAllAdminBanners, getBannersByType } from '@/api/bannerApi';

const BannerTestComponent = () => {
    const [allBanners, setAllBanners] = useState([]);
    const [heroBanners, setHeroBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        testBannerAPI();
    }, []);

    const testBannerAPI = async () => {
        try {
            setLoading(true);
            setError(null);

            // Test getting all admin banners
            console.log('Testing getAllAdminBanners...');
            const allResult = await getAllAdminBanners();
            console.log('All banners result:', allResult);

            if (allResult.success) {
                setAllBanners(allResult.banners || []);
            }

            // Test getting hero banners specifically
            console.log('Testing getBannersByType("hero")...');
            const heroResult = await getBannersByType('hero');
            console.log('Hero banners result:', heroResult);

            if (heroResult.success) {
                setHeroBanners(heroResult.banners || []);
            }

        } catch (error) {
            console.error('Error testing banner API:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="p-6">
                <h2 className="text-xl font-bold mb-4">Banner API Test</h2>
                <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span>Testing banner API...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Banner API Test Results</h2>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    <strong>Error:</strong> {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* All Banners */}
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-3">All Admin Banners</h3>
                    <p className="text-sm text-gray-600 mb-3">
                        Total banners: {allBanners.length}
                    </p>

                    {allBanners.length > 0 ? (
                        <div className="space-y-2">
                            {allBanners.map((banner, index) => (
                                <div key={banner.id} className="border rounded p-3">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                            {banner.banner_type || 'no type'}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            #{index + 1}
                                        </span>
                                    </div>
                                    <h4 className="font-medium text-sm">{banner.name}</h4>
                                    {banner.image_url && (
                                        <div className="mt-2">
                                            <img
                                                src={banner.image_url}
                                                alt={banner.name}
                                                className="w-full h-20 object-cover rounded"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.nextSibling.style.display = 'block';
                                                }}
                                            />
                                            <div className="hidden w-full h-20 bg-gray-200 rounded flex items-center justify-center text-gray-500 text-xs">
                                                Image failed to load
                                            </div>
                                        </div>
                                    )}
                                    <p className="text-xs text-gray-500 mt-1">
                                        ID: {banner.id.slice(0, 8)}...
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-gray-500 text-sm">
                            No banners found in admin panel
                        </div>
                    )}
                </div>

                {/* Hero Banners */}
                <div className="bg-white p-4 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-3">Hero Banners</h3>
                    <p className="text-sm text-gray-600 mb-3">
                        Hero banners: {heroBanners.length}
                    </p>

                    {heroBanners.length > 0 ? (
                        <div className="space-y-2">
                            {heroBanners.map((banner, index) => (
                                <div key={banner.id} className="border rounded p-3">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                            HERO
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            #{index + 1}
                                        </span>
                                    </div>
                                    <h4 className="font-medium text-sm">{banner.name}</h4>
                                    {banner.image_url && (
                                        <div className="mt-2">
                                            <img
                                                src={banner.image_url}
                                                alt={banner.name}
                                                className="w-full h-20 object-cover rounded"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.nextSibling.style.display = 'block';
                                                }}
                                            />
                                            <div className="hidden w-full h-20 bg-gray-200 rounded flex items-center justify-center text-gray-500 text-xs">
                                                Image failed to load
                                            </div>
                                        </div>
                                    )}
                                    <p className="text-xs text-gray-500 mt-1">
                                        ID: {banner.id.slice(0, 8)}...
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-gray-500 text-sm">
                            No hero banners found. Try adding banners with type "hero" in admin panel.
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">How to Add Hero Banners:</h4>
                <ol className="text-sm text-blue-700 space-y-1">
                    <li>1. Go to your admin panel</li>
                    <li>2. Navigate to the "Banner" section</li>
                    <li>3. Click "Add Banner"</li>
                    <li>4. Set Banner Type to "hero"</li>
                    <li>5. Upload your banner image</li>
                    <li>6. Save the banner</li>
                    <li>7. Refresh this page to see the new banner</li>
                </ol>
            </div>

            <div className="mt-4">
                <button
                    onClick={testBannerAPI}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
                >
                    Refresh Test
                </button>
            </div>
        </div>
    );
};

export default BannerTestComponent;
