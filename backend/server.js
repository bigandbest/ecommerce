import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

dotenv.config();

import authRoutes from "./routes/authRoute.js";
import geoAddressRoute from "./routes/geoAddressRoute.js";
import warehouseRoute from "./routes/warehouseRoute.js";
import productWarehouseRoute from "./routes/productWarehouseRoutes.js";
import productsRoute from "./routes/productRoutes.js";
import locationRoute from "./routes/locationRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import orderItemsRoutes from "./routes/orderItemsRoutes.js";
import checkCartAvailabilityRoute from "./routes/checkCartAvailabilityRoute.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import bnbRoutes from "./routes/b&bRoutes.js";
import bnbGroupRoutes from "./routes/b&bGroupRoutes.js";
import bnbGroupProductRoutes from "./routes/b&bGroupProductRoutes.js";
import dailyDealsRoutes from "./routes/dailyDealsRoutes.js";
import dailyDealsProductRoutes from "./routes/dailyDealsProductRoutes.js";
import brandRoutes from "./routes/brandRoutes.js";
import brandProductsRoutes from "./routes/brandProducts.js";
import recommendedStoreRoutes from "./routes/recommendedStoreRoutes.js";

import productRecommendedStoreRoutes from "./routes/productRecommendedStoreRoutes.js";
import quickPickRoutes from "./routes/quickPickRoutes.js";
import quickPickGroupRoutes from "./routes/quickPickGroupRoutes.js";
import quickPickGroupProductRoutes from "./routes/quickPickGroupProductRoutes.js";
import savingZoneRoutes from "./routes/savingZoneRoutes.js";
import savingZoneGroupRoutes from "./routes/savingZoneGroupRoutes.js";
import savingZoneGroupProductRoutes from "./routes/savingZoneGroupProductRoutes.js";
import storeRoutes from "./routes/storeRoute.js";
import subStoreRoutes from "./routes/subStoreRoute.js";
import YouMayLikeProductRoutes from "./routes/youMayLikeRoutes.js";
import addBannerRoutes from "./routes/addBannerRoutes.js";
import addBannerGroupRoutes from "./routes/addBannerGroupRoutes.js";
import addBannerGroupProductRoutes from "./routes/addBannerGroupProductRoutes.js";
import uniqueSectionRoutes from "./routes/uniqueSectionRoutes.js";
import uniqueSectionProductRoutes from "./routes/uniqueSectionProductRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import returnOrderRoutes from "./routes/returnOrderRoutes.js";
import walletRoutes from "./routes/walletRoutes.js";
import refundRoutes from "./routes/refundRoutes.js";
import debugRoutes from "./routes/debugRoutes.js";
import quickFixRoutes from "./routes/quickFixRoutes.js";
import trackingRoutes from "./routes/trackingRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import bulkOrderRoutes from "./routes/bulkOrderRoutes.js";
import bulkProductRoutes from "./routes/bulkProductRoutes.js";
import productVariantsRoutes from "./routes/productVariantsRoutes.js";
import locationRoutes from "./routes/locationRoutes.js";
import variantRoutes from "./routes/variantRoutes.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";
import videoCardRoutes from "./routes/videoCardRoutes.js";
import shopByStoreRoutes from "./routes/shopByStoreRoutes.js";
import productSectionRoutes from "./routes/productSectionRoutes.js";
import promoBannerRoutes from "./routes/promoBannerRoutes.js";
import storeSectionMappingRoutes from "./routes/storeSectionMappingRoutes.js";

const app = express();
const PORT = process.env.PORT || 8000;
const allowedOrigins = [
  "http://localhost:3000", // Next.js frontend
  "http://localhost:3001", // Next.js frontend (alternative port)
  "http://localhost:5173",
  "http://localhost:5174",
  "https://big-best-admin.vercel.app", // Admin panel (without trailing slash)
  "https://big-best-admin.vercel.app/", // Admin panel (with trailing slash)
  "https://ecommerce-umber-five-95.vercel.app",
  "https://admin-eight-flax.vercel.app",
  "https://ecommerce-six-brown-12.vercel.app",
  "https://www.bigbestmart.com",
  "https://admin-eight-ruddy.vercel.app",
  "https://big-best-frontend.vercel.app", // New deployed frontend
];

const corsOptions = {
  origin: function (origin, callback) {
    // allow requests with no origin like mobile apps or curl
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  exposedHeaders: ["Authorization"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
    "Cache-Control",
    "X-File-Name",
  ],
};
/* app.use(cors({
   origin: function (origin, callback) {
    // allow requests with no origin like mobile apps or curl
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  }, 
  origin: 'http://localhost:5173', //https://ecommerce-umber-five-95.vercel.app http://localhost:5173 Temporarily allowing all origins for development
  credentials: true,
})); */

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/business", authRoutes);
app.use("/api/geo-address", geoAddressRoute);
app.use("/api/warehouse", warehouseRoute);
app.use("/api/productwarehouse", productWarehouseRoute);
app.use("/api/productsroute", productsRoute);
app.use("/api/locationsroute", locationRoute);
app.use("/api/cart", cartRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/orderItems", orderItemsRoutes);
app.use("/api/check", checkCartAvailabilityRoute);
app.use("/api/payment", paymentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/bnb", bnbRoutes);
app.use("/api/b&b-group", bnbGroupRoutes);
app.use("/api/b&b-group-product", bnbGroupProductRoutes);
app.use("/api/daily-deals", dailyDealsRoutes);
app.use("/api/daily-deals-product", dailyDealsProductRoutes);
app.use("/api/brand", brandRoutes);
app.use("/api/product-brand", brandProductsRoutes);
app.use("/api/recommended-stores", recommendedStoreRoutes);
app.use("/api/product-recommended-stores", productRecommendedStoreRoutes);
app.use("/api/quick-pick", quickPickRoutes);
app.use("/api/quick-pick-group", quickPickGroupRoutes);
app.use("/api/quick-pick-group-product", quickPickGroupProductRoutes);
app.use("/api/saving-zone", savingZoneRoutes);
app.use("/api/saving-zone-group", savingZoneGroupRoutes);
app.use("/api/saving-zone-group-product", savingZoneGroupProductRoutes);
app.use("/api/stores", storeRoutes);
app.use("/api/sub-stores", subStoreRoutes);
app.use("/api/you-may-like-products", YouMayLikeProductRoutes);
app.use("/api/banner", addBannerRoutes);
app.use("/api/banner-groups", addBannerGroupRoutes);
app.use("/api/banner-group-products", addBannerGroupProductRoutes);
app.use("/api/unique-sections", uniqueSectionRoutes);
app.use("/api/unique-sections-products", uniqueSectionProductRoutes);
app.use("/api/user", profileRoutes);
app.use("/api/return-orders", returnOrderRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/refund", refundRoutes);
app.use("/api/debug", debugRoutes);
app.use("/api/quick-fix", quickFixRoutes);
app.use("/api/tracking", trackingRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/bulk-orders", bulkOrderRoutes);
app.use("/api/bulk-products", bulkProductRoutes);
app.use("/api/product-variants", productVariantsRoutes);
app.use("/api/location", locationRoutes);
app.use("/api/variants", variantRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/video-cards", videoCardRoutes);
app.use("/api/shop-by-stores", shopByStoreRoutes);
app.use("/api/product-sections", productSectionRoutes);
app.use("/api/promo-banner", promoBannerRoutes);
app.use("/api/store-section-mappings", storeSectionMappingRoutes);

// Health check route
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// Debug helper: show mounted routes (development only)
app.get("/__routes", (req, res) => {
  try {
    const routes = [];
    app._router.stack.forEach((middleware) => {
      if (middleware.route) {
        // routes registered directly on the app
        routes.push(middleware.route.path);
      } else if (middleware.name === "router") {
        // router middleware
        middleware.handle.stack.forEach(function (handler) {
          const route = handler.route;
          route && routes.push(route.path);
        });
      }
    });
    res.json({ success: true, routes });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Validate critical environment variables
const requiredEnvVars = [
  "JWT_SECRET",
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "RAZORPAY_KEY_ID",
  "RAZORPAY_KEY_SECRET",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];

const missingEnvVars = requiredEnvVars.filter(
  (varName) => !process.env[varName]
);

if (missingEnvVars.length > 0) {
  console.error(
    "❌ Missing required environment variables:",
    missingEnvVars.join(", ")
  );
  console.error("⚠️  Server may not function correctly!");
} else {
  console.log("✅ All required environment variables are set");
}

// Export the app for Vercel
export default app;

// Only listen if not in production (for local development)
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(
      `💳 Razorpay Mode: ${
        process.env.RAZORPAY_KEY_ID?.startsWith("rzp_test_") ? "TEST" : "LIVE"
      }`
    );
  });
}
