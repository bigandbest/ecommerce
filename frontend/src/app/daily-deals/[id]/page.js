"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { dailyDealsService } from "../../../services/dailyDealsService";

const DailyDealPage = () => {
  const params = useParams();
  const router = useRouter();
  const dealId = params.id;

  const [deal, setDeal] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDealAndProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch deal details and products in parallel
        const [dealResponse, productsResponse] = await Promise.all([
          dailyDealsService.getDailyDealById(dealId),
          dailyDealsService.getProductsForDailyDeal(dealId),
        ]);

        if (dealResponse.success) {
          setDeal(dealResponse.deal);
        } else {
          setError("Failed to load deal details");
        }

        setProducts(productsResponse || []);
      } catch (err) {
        console.error("Error fetching deal:", err);
        setError("Failed to load deal information");
      } finally {
        setLoading(false);
      }
    };

    if (dealId) {
      fetchDealAndProducts();
    }
  }, [dealId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="bg-white rounded-xl shadow-md p-6 mb-8">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-1/3">
                  <div className="h-64 bg-gray-200 rounded-lg"></div>
                </div>
                <div className="w-full md:w-2/3">
                  <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, idx) => (
                <div key={idx} className="bg-white rounded-lg shadow-md p-4">
                  <div className="h-48 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !deal) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {error || "Deal Not Found"}
          </h1>
          <p className="text-gray-600 mb-6">
            The daily deal you're looking for doesn't exist or has expired.
          </p>
          <button
            onClick={() => router.back()}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="flex items-center space-x-2 text-sm text-gray-600">
          <Link href="/" className="hover:text-orange-600 transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/" className="hover:text-orange-600 transition-colors">
            Daily Deals
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{deal.title}</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Deal Header */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
          <div className="relative">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 opacity-10"></div>

            <div className="relative p-6 md:p-8">
              <div className="flex flex-col lg:flex-row gap-8 items-center">
                {/* Deal Image */}
                <div className="flex-shrink-0">
                  <div className="relative w-48 h-48 md:w-64 md:h-64 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl overflow-hidden shadow-lg">
                    <Image
                      src={
                        deal.image_url ||
                        "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQwIiBoZWlnaHQ9IjE3NiIgdmlld0JveD0iMCAwIDI0MCAxNzYiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyNDAiIGhlaWdodD0iMTc2IiBmaWxsPSIjZjNlNGVkIi8+Cjx0ZXh0IHg9IjEyMCIgeT0iODgiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk3OTdhNyIgdGV4dC1hbmNob3I9Im1pZGRsZSI+UHJvZHVjdCBJbWFnZTwvdGV4dD4KPC9zdmc+"
                      }
                      alt={deal.title}
                      width={256}
                      height={256}
                      className="object-contain w-full h-full p-4"
                      onError={(e) => {
                        e.target.src =
                          "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQwIiBoZWlnaHQ9IjE3NiIgdmlld0JveD0iMCAwIDI0MCAxNzYiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyNDAiIGhlaWdodD0iMTc2IiBmaWxsPSIjZjNlNGVkIi8+Cjx0ZXh0IHg9IjEyMCIgeT0iODgiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk3OTdhNyIgdGV4dC1hbmNob3I9Im1pZGRsZSI+UHJvZHVjdCBJbWFnZTwvdGV4dD4KPC9zdmc+";
                      }}
                    />

                    {/* Deal Badge */}
                    <div className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full shadow-md">
                      {deal.badge || "DEAL"}
                    </div>
                  </div>
                </div>

                {/* Deal Info */}
                <div className="flex-1 text-center lg:text-left">
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                    {deal.title}
                  </h1>

                  {deal.discount && (
                    <div className="mb-4">
                      <span className="inline-block bg-orange-500 text-white text-lg font-bold px-4 py-2 rounded-full">
                        {deal.discount}
                      </span>
                    </div>
                  )}

                  <p className="text-gray-600 text-lg mb-6">
                    Discover amazing products at unbeatable prices! This
                    exclusive deal features{" "}
                    <span className="font-semibold text-orange-600">
                      {products.length} premium{" "}
                      {products.length === 1 ? "product" : "products"}
                    </span>{" "}
                    carefully selected just for you.
                  </p>

                  {/* Deal Stats */}
                  <div className="flex flex-wrap justify-center lg:justify-start gap-4 mb-6">
                    <div className="bg-orange-50 px-4 py-2 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        {products.length}
                      </div>
                      <div className="text-sm text-gray-600">Products</div>
                    </div>
                    <div className="bg-green-50 px-4 py-2 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        24
                      </div>
                      <div className="text-sm text-gray-600">Hours Left</div>
                    </div>
                    <div className="bg-blue-50 px-4 py-2 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">★</div>
                      <div className="text-sm text-gray-600">Limited Time</div>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-colors shadow-md hover:shadow-lg">
                    Shop All Products
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Deal Products ({products.length})
          </h2>

          {products.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📦</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Products Available
              </h3>
              <p className="text-gray-600">
                Products for this deal are being prepared. Check back soon!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((item) => {
                const product = item.products;
                if (!product) return null;

                return (
                  <div
                    key={item.product_id}
                    className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer"
                    onClick={() => router.push(`/singleproduct/${product.id}`)}
                  >
                    {/* Product Image */}
                    <div className="relative h-48 bg-gray-100 overflow-hidden">
                      <Image
                        src={product.image || "/placeholder-product.jpg"}
                        alt={product.name}
                        width={300}
                        height={200}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.src =
                            "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjZjNlNGVkIi8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5NzE3YTciIHRleHQtYW5jaG9yPSJtaWRkbGUiPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4=";
                        }}
                      />

                      {/* Deal Badge */}
                      <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded shadow-md">
                        DEAL
                      </div>

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <button className="bg-white text-orange-600 px-4 py-2 rounded-full font-medium transform scale-90 group-hover:scale-100 transition-transform duration-300">
                          View Product
                        </button>
                      </div>
                    </div>

                    {/* Product Info */}
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 leading-tight group-hover:text-orange-600 transition-colors">
                        {product.name}
                      </h3>

                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-1">
                          <span className="text-yellow-400">★★★★★</span>
                          <span className="text-sm text-gray-500">
                            ({product.rating || 4.5})
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-lg font-bold text-green-600">
                            ₹{product.price}
                          </span>
                          {product.old_price && (
                            <span className="text-sm text-gray-500 line-through ml-2">
                              ₹{product.old_price}
                            </span>
                          )}
                        </div>

                        {product.discount && (
                          <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded font-medium">
                            {product.discount}% OFF
                          </span>
                        )}
                      </div>

                      {product.category && (
                        <div className="mt-2">
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {product.category}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Back to Deals Button */}
        <div className="text-center">
          <button
            onClick={() => router.back()}
            className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            ← Back to All Deals
          </button>
        </div>
      </div>
    </div>
  );
};

export default DailyDealPage;
