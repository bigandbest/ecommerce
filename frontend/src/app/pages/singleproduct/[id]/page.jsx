"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, useContext } from "react";
import { useParams, useRouter } from "next/navigation";
import { FaArrowLeft, FaAngleRight, FaPlay } from "react-icons/fa6";
import { IoStarSharp, IoStarHalfSharp, IoStarOutline } from "react-icons/io5";
import { CiCircleCheck } from "react-icons/ci";
import ProductCard from "@/components/homepage/ProductCard";
import CustomerFeedback from "@/components/products/AllReviews";
import { CartContext } from "@/Context/CartContext";
import { productService } from "@/services/productService";
import BulkOrderModal from "@/components/BulkOrder/BulkOrderModal";

// Normalize API base so it always includes the `/api` prefix. Accepts
// environment values like `http://localhost:8000` or `http://localhost:8000/api`.
const RAW_API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://big-best-backend.vercel.app/api";

const API_BASE_URL = RAW_API_BASE.endsWith("/api")
  ? RAW_API_BASE
  : RAW_API_BASE.replace(/\/+$/, "") + "/api";

// Helpful debug log (remove in production)
if (process.env.NODE_ENV === "development") {
  console.log("Using API_BASE_URL:", API_BASE_URL);
}

function page() {
  const params = useParams();
  const router = useRouter();

  // Function to extract YouTube video ID from URL
  const getYouTubeVideoId = (url) => {
    if (!url) return null;
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };
  const productId = params.id;
  const { addToCart, getItemQuantity } = useContext(CartContext);
  const cartQuantity = getItemQuantity(productId);

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedFlavor, setSelectedFlavor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [parentCategory, setParentCategory] = useState("Category");

  const tabs = ["Description", "Portion", "Quantity", "FAQ"];
  const [activeTab, setActiveTab] = useState(0);
  const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 });
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const tabRefs = useRef([]);

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${API_BASE_URL}/productsroute/${productId}`
        );
        const data = await response.json();

        if (data.success) {
          setProduct(data.product);
        } else {
          setError(data.error || "Product not found");
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  // Fetch related products and parent category when product is loaded
  useEffect(() => {
    const fetchRelatedProducts = async () => {
      if (!product || !product.category) return;

      try {
        setRelatedLoading(true);
        const related = await productService.getProductsByCategory(
          product.category
        );
        // Filter out the current product and limit to 5 products
        const filtered = related.filter((p) => p.id !== product.id).slice(0, 5);
        setRelatedProducts(filtered);
      } catch (err) {
        console.error("Error fetching related products:", err);
      } finally {
        setRelatedLoading(false);
      }
    };

    const fetchParentCategory = async () => {
      if (!product || !product.category) return;

      try {
        const categories = await productService.getCategoriesHierarchy();
        const parent =
          categories.find((cat) =>
            cat.subcategories.some((sub) => sub.name === product.category)
          )?.name || "Category";
        setParentCategory(parent);
      } catch (err) {
        console.error("Error fetching parent category:", err);
        setParentCategory("Category");
      }
    };

    fetchRelatedProducts();
    fetchParentCategory();
  }, [product]);

  // Initialize tab refs array
  useEffect(() => {
    tabRefs.current = tabRefs.current.slice(0, tabs.length);
  }, [tabs]);

  // Update underline position when active tab changes
  useEffect(() => {
    if (tabRefs.current[activeTab]) {
      const { offsetLeft, offsetWidth } = tabRefs.current[activeTab];
      setUnderlineStyle({
        left: offsetLeft,
        width: offsetWidth,
      });
    }
  }, [activeTab]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (tabRefs.current[activeTab]) {
        const { offsetLeft, offsetWidth } = tabRefs.current[activeTab];
        setUnderlineStyle({ left: offsetLeft, width: offsetWidth });
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [activeTab]);

  // Tab content data
  const tabContents = [
    {
      title: "Product Description",
      content:
        product?.description ||
        "This premium product features high-quality materials and expert craftsmanship. Designed for durability and comfort, it combines style with functionality. Perfect for everyday use, it offers exceptional value and long-lasting performance.",
    },
    {
      title: "Portion Information",
      content:
        "Each serving provides a balanced nutritional profile. The recommended portion size is 200g per meal, containing approximately 250 calories, 20g of protein, 30g of carbohydrates, and 10g of healthy fats.",
    },
    {
      title: "Quantity Details",
      content:
        "Available in multiple package sizes: 1 unit, 3-pack, and 5-pack bundle. Each unit contains 500ml of product. The bulk packages offer discounted pricing and are ideal for frequent users or families.",
    },
    {
      title: "Frequently Asked Questions",
      content:
        "Q: How should I store this product? A: Store in a cool, dry place. Q: What is the return policy? A: We offer 30-day hassle-free returns. Q: Is this product eco-friendly? A: Yes, it's made from 100% recycled materials.",
    },
  ];

  if (loading) {
    return (
      <div className="w-full min-h-screen px-5 lg:px-10 flex flex-col py-8 gap-10">
        <div className="flex justify-center items-center h-64">
          <div className="text-xl">Loading product...</div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="w-full min-h-screen px-5 lg:px-10 flex flex-col py-8 gap-10">
        <div className="flex justify-center items-center h-64">
          <div className="text-xl text-red-500">
            {error || "Product not found"}
          </div>
        </div>
      </div>
    );
  }

  // Calculate discount percentage
  const discountPercentage =
    product.old_price && product.old_price > product.price
      ? Math.round(
          ((product.old_price - product.price) / product.old_price) * 100
        )
      : 0;

  // Create combined media array (images + video)
  const mediaItems = [];
  if (product.images && product.images.length > 0) {
    mediaItems.push(
      ...product.images.map((img) => ({ type: "image", src: img }))
    );
  } else if (product.image) {
    mediaItems.push({ type: "image", src: product.image });
  }
  if (product.video && getYouTubeVideoId(product.video)) {
    mediaItems.push({ type: "video", src: product.video });
  }

  return (
    <div className="w-full min-h-screen px-5 lg:px-10 flex flex-col py-8 gap-10">
      {/* Heading */}
      <div className="w-full h-auto flex gap-3 lg:gap-5 flex-wrap items-center font-outfit">
        <Link href={"/"} className="p-3 bg-[#2A2A2A] text-white rounded-full">
          <FaArrowLeft size={20} />
        </Link>
        <span className="text-[#2F294D] font-semibold lg:text-lg">
          {parentCategory}
        </span>
        <span className="text-[#2F294D] font-semibold">
          <FaAngleRight size={20} />
        </span>
        <span className="text-[#2F294D] font-semibold lg:text-lg">
          {product.category || "Category"}
        </span>
        <span className="text-[#2F294D] font-semibold">
          <FaAngleRight size={20} />
        </span>
        <span className="text-[#FF7558] font-semibold lg:text-lg">
          {product.name}
        </span>
      </div>
      {/* product details */}
      <div className="w-full h-auto flex flex-col md:flex-row gap-6">
        <div className="w-full h-auto flex flex-col gap-4 sm:flex-row sm:justify-evenly sm:items-center md:w-1/2">
          {/* Main Media Display */}
          <div className="w-full h-auto bg-gray-100 rounded-lg overflow-hidden">
            {mediaItems[selectedImageIndex] ? (
              mediaItems[selectedImageIndex].type === "video" ? (
                <iframe
                  src={`https://www.youtube.com/embed/${getYouTubeVideoId(
                    mediaItems[selectedImageIndex].src
                  )}?autoplay=1&mute=1&loop=1&playlist=${getYouTubeVideoId(
                    mediaItems[selectedImageIndex].src
                  )}`}
                  className="w-full h-64 sm:h-96 md:h-[400px] lg:h-[500px]"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="Product Video"
                ></iframe>
              ) : (
                <Image
                  src={mediaItems[selectedImageIndex].src}
                  alt="product"
                  width={1000}
                  height={1000}
                  className="w-full h-auto"
                />
              )
            ) : (
              <div className="w-full h-64 sm:h-96 md:h-[400px] lg:h-[500px] flex items-center justify-center text-gray-500">
                No media available
              </div>
            )}
          </div>
          <div className="w-full h-auto flex flex-wrap justify-around gap-4 items-center sm:w-auto sm:flex sm:flex-col">
            {mediaItems.map((media, index) => (
              <div
                onClick={() => setSelectedImageIndex(index)}
                className={`${
                  selectedImageIndex === index
                    ? "border border-[#FF7558]"
                    : "bg-[#0000004D]"
                } p-3 sm:px-5 rounded-2xl cursor-pointer`}
                key={index}
              >
                {media.type === "video" ? (
                  <div className="w-14 h-14 bg-gray-800 rounded flex items-center justify-center">
                    <FaPlay className="text-white ml-1" size={16} />
                  </div>
                ) : (
                  <Image
                    src={media.src || "/prod1.png"}
                    alt="product"
                    width={100}
                    height={100}
                    className="w-14 h-auto rounded"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="w-full h-auto flex flex-col gap-4 font-outfit md:w-1/2 lg:gap-6">
          <div>
            <h1 className="text-2xl font-bold text-[#2A2A2A] lg:text-4xl">
              {product.name}
            </h1>
            <p className="text-[#D9D3D3] font-semibold lg:text-xl">
              {product.category || "Sports & Nutrition"}
            </p>
          </div>
          <div className="w-full h-auto flex gap-2 items-center flex-wrap">
            {[1, 2, 3, 4, 5].map((star) => {
              if (product.rating >= star) {
                return (
                  <IoStarSharp
                    key={star}
                    size={20}
                    className="text-[#F1D900] lg:size-8"
                  />
                );
              } else if (product.rating >= star - 0.5) {
                return (
                  <IoStarHalfSharp
                    key={star}
                    size={20}
                    className="text-[#F1D900] lg:size-8"
                  />
                );
              } else {
                return (
                  <IoStarOutline
                    key={star}
                    size={20}
                    className="text-[#D9D3D3] lg:size-8"
                  />
                );
              }
            })}
            <span className="text-[#2F294D] font-semibold lg:text-xl">
              {product.rating || 4.0}
            </span>
            <span className="text-[#2F294D] lg:text-xl">
              From {product.review_count || 0} Reviews
            </span>
          </div>
          <p className="text-[#2F294D] lg:text-xl">(Incl. of all taxes)</p>
          <div className="w-full h-auto flex gap-1 items-center">
            <span className="lg:text-2xl">₹</span>
            <span className="text-[#FD5B00] font-semibold text-3xl lg:text-5xl">
              {product.price}
            </span>
            <span className="text-[#8B8B8B] ml-3 lg:text-2xl">
              +₹{product.shipping_amount || 41} shipping
            </span>
          </div>
          {product.old_price && product.old_price > product.price && (
            <div className="w-full h-auto flex gap-1 items-center lg:text-2xl">
              <span className="text-[#656565]">MRP</span>
              <span className="text-[#656565] line-through">
                ₹{product.old_price}
              </span>
              <span className="text-[#FD5B00] font-semibold ml-3">
                {discountPercentage}% Off
              </span>
            </div>
          )}
          <div className="w-full h-auto flex gap-2 items-center">
            <button
              className="text-xl cursor-pointer lg:text-2xl"
              onClick={() => quantity > 1 && setQuantity(quantity - 1)}
            >
              -
            </button>
            <input
              type="number"
              className="w-12 text-center lg:text-2xl"
              value={quantity}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                if (!isNaN(value) && value >= 1) {
                  setQuantity(value);
                } else if (e.target.value === "") {
                  setQuantity("");
                }
              }}
              onBlur={(e) => {
                if (quantity === "" || quantity < 1) {
                  setQuantity(1);
                }
              }}
              min="1"
            />
            <button
              className="text-xl cursor-pointer lg:text-2xl"
              onClick={() => setQuantity(quantity + 1)}
            >
              +
            </button>
            <span className="text-[#2F294D] font-semibold lg:text-xl ml-4">
              {product.uom || "Unit"}
            </span>
          </div>
          <div className="w-full h-auto flex flex-col sm:flex-row gap-2 sm:gap-3 items-center">
            <button
              onClick={() => {
                const cartItem = {
                  id: product.id || productId,
                  name: product.name,
                  price: Number(product.price),
                  oldPrice: Number(product.old_price || product.price * 1.2),
                  image:
                    product.image ||
                    (product.images && product.images[0]) ||
                    "/prod1.png",
                  rating: product.rating || 4.0,
                  reviews: product.review_count || 0,
                  quantity: quantity,
                };
                addToCart({ ...cartItem, quantity: quantity });
              }}
              className="w-full sm:flex-1 bg-[#FF7558] text-white py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base lg:text-xl hover:bg-[#e66a4f] transition-colors"
            >
              Add to Cart {cartQuantity > 0 && `(${cartQuantity})`}
            </button>
            <button
              onClick={async () => {
                try {
                  // Calculate total amount with GST and shipping
                  const basePrice = Number(product.price) * quantity;
                  const gstAmount = basePrice * 0.18; // 18% GST
                  const shippingAmount = Number(product.shipping_amount) || 41;
                  const totalAmount = basePrice + gstAmount + shippingAmount;

                  // Create Razorpay order
                  const response = await fetch(
                    `${API_BASE_URL}/payment/create-order`,
                    {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ amount: totalAmount }),
                    }
                  );

                  const orderData = await response.json();

                  if (!orderData.success) {
                    alert("Payment initialization failed");
                    return;
                  }

                  // Initialize Razorpay
                  const options = {
                    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                    amount: orderData.amount,
                    currency: orderData.currency,
                    name: "BigBest Mart",
                    description: `${product.name} - Qty: ${quantity}`,
                    order_id: orderData.order_id,
                    handler: async function (response) {
                      // Payment success - create order
                      try {
                        const orderResponse = await fetch(
                          `${API_BASE_URL}/order/place`,
                          {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              productId: product.id,
                              quantity: quantity,
                              totalAmount: totalAmount,
                              paymentId: response.razorpay_payment_id,
                              orderId: response.razorpay_order_id,
                            }),
                          }
                        );

                        if (orderResponse.ok) {
                          alert("Order placed successfully!");
                          router.push("/pages/orders");
                        }
                      } catch (error) {
                        console.error("Order creation failed:", error);
                      }
                    },
                    prefill: {
                      name: "Customer",
                      email: "customer@example.com",
                      contact: "9999999999",
                    },
                    theme: {
                      color: "#FF7558",
                    },
                  };

                  const rzp = new window.Razorpay(options);
                  rzp.open();
                } catch (error) {
                  console.error("Payment error:", error);
                  alert("Payment failed. Please try again.");
                }
              }}
              className="w-full sm:flex-1 border border-[#FF7558] text-[#FF7558] py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base lg:text-xl hover:bg-[#FF7558] hover:text-white transition-colors"
            >
              Buy Now
            </button>
          </div>

          {/* Product Specifications */}
          <div className="w-full h-auto flex flex-col gap-3 bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-[#2A2A2A]">
              Product Specifications
            </h3>
            <div className="grid grid-cols-1 gap-2 text-sm lg:text-base">
              {product.specifications ? (
                product.specifications.split("\n").map((spec, index) => (
                  <div key={index} className="text-[#2F294D] flex items-center">
                    <span className="w-2 h-2 bg-[#FF7558] rounded-full mr-3 flex-shrink-0"></span>
                    {spec.trim()}
                  </div>
                ))
              ) : (
                <>
                  <div className="text-[#2F294D] flex items-center">
                    <span className="w-2 h-2 bg-[#FF7558] rounded-full mr-3 flex-shrink-0"></span>
                    Electric Wheelchairs/Scooters
                  </div>
                  <div className="text-[#2F294D] flex items-center">
                    <span className="w-2 h-2 bg-[#FF7558] rounded-full mr-3 flex-shrink-0"></span>
                    Solar Power Banks/Storage
                  </div>
                  <div className="text-[#2F294D] flex items-center">
                    <span className="w-2 h-2 bg-[#FF7558] rounded-full mr-3 flex-shrink-0"></span>
                    RV (Recreational Vehicle) or Marine Power Systems
                  </div>
                  <div className="text-[#2F294D] flex items-center">
                    <span className="w-2 h-2 bg-[#FF7558] rounded-full mr-3 flex-shrink-0"></span>
                    Electric Vehicle/E-Bike battery builds
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="w-full h-auto flex flex-col sm:flex-row gap-2 sm:gap-3 items-center">
            <button
              onClick={() => {
                console.log("Added to wishlist:", product.name);
                // Add wishlist functionality here
              }}
              className="w-full sm:flex-1 bg-red-500 text-white py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base lg:text-xl hover:bg-red-600 transition-colors"
            >
              Add To Wishlist
            </button>
            <button
              onClick={() => setShowBulkModal(true)}
              className="w-full sm:flex-1 bg-blue-800 text-white py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base lg:text-xl hover:bg-blue-900 transition-colors"
            >
              Bulk Order
            </button>
          </div>
          <div className="w-full h-auto flex gap-2 items-center">
            <CiCircleCheck size={24} className="text-green-500" />
            <span className="text-[#2F294D] font-semibold lg:text-xl">
              In Stock ({product.in_stock ? "Available" : "Out of Stock"})
            </span>
          </div>
        </div>
      </div>

      {/* Video Section */}
      {/* {product.video && getYouTubeVideoId(product.video) && (
        <div className="w-full h-auto flex flex-col gap-6">
          <h2 className="text-2xl font-bold text-[#2A2A2A]">Product Video</h2>
          <div className="w-full max-w-4xl mx-auto">
            <iframe
              width="100%"
              height="400"
              src={`https://www.youtube.com/embed/${getYouTubeVideoId(
                product.video
              )}`}
              title="Product Video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="rounded-lg"
            ></iframe>
          </div>
        </div>
      )} */}

      {/* Tabs Section */}
      <div className="w-full h-auto flex flex-col gap-6">
        <div className="w-full h-auto relative">
          <div className="flex gap-8 border-b border-gray-200">
            {tabs.map((tab, index) => (
              <button
                key={index}
                ref={(el) => (tabRefs.current[index] = el)}
                className={`pb-2 text-lg font-semibold transition-colors ${
                  activeTab === index
                    ? "text-[#FF7558]"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab(index)}
                onMouseEnter={() => setHoveredIdx(index)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                {tab}
              </button>
            ))}
          </div>
          <div
            className="absolute bottom-0 h-0.5 bg-[#FF7558] transition-all duration-300"
            style={underlineStyle}
          />
        </div>
        <div className="w-full h-auto">
          <h2 className="text-2xl font-bold text-[#2A2A2A] mb-4">
            {tabContents[activeTab].title}
          </h2>
          <p className="text-[#2F294D] text-lg leading-relaxed">
            {tabContents[activeTab].content}
          </p>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="w-full h-auto flex flex-col gap-6">
        <h2 className="text-2xl font-bold text-[#2A2A2A]">Customer Reviews</h2>
        <CustomerFeedback productId={productId} />
      </div>

      {/* Related Products */}
      <div className="w-full h-auto flex flex-col gap-6">
        <h2 className="text-2xl font-bold text-[#2A2A2A]">Related Products</h2>
        {relatedLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="text-lg">Loading related products...</div>
          </div>
        ) : relatedProducts.length > 0 ? (
          <div className="w-full h-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {relatedProducts.map((prod, index) => (
              <ProductCard
                key={prod.id || index}
                product={{
                  _id: prod.id,
                  name: prod.name,
                  image: prod.image,
                  price: prod.price.toString(),
                  oldPrice: prod.old_price ? prod.old_price.toString() : null,
                  rating: prod.rating || 4.0,
                  reviews: prod.review_count || 0,
                }}
                onClick={() => router.push(`/pages/singleproduct/${prod.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="flex justify-center items-center h-32">
            <div className="text-lg text-gray-500">
              No related products found
            </div>
          </div>
        )}
      </div>

      {/* Bulk Order Modal */}
      <BulkOrderModal
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        product={product}
      />
    </div>
  );
}

export default page;
