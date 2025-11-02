import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Import routes - adjust paths to go up one directory
import authRoutes from "../routes/authRoute.js";
import geoAddressRoute from "../routes/geoAddressRoute.js";
import warehouseRoute from "../routes/warehouseRoute.js";
import productWarehouseRoute from "../routes/productWarehouseRoutes.js";
import productsRoute from "../routes/productRoutes.js";
import locationRoute from "../routes/locationRoutes.js";
import cartRoutes from "../routes/cartRoutes.js";
import orderRoutes from "../routes/orderRoutes.js";
import orderItemsRoutes from "../routes/orderItemsRoutes.js";
import checkCartAvailabilityRoute from "../routes/checkCartAvailabilityRoute.js";
import paymentRoutes from "../routes/paymentRoutes.js";
import notificationRoutes from "../routes/notificationRoutes.js";
import bnbRoutes from "../routes/b&bRoutes.js";
import bnbGroupRoutes from "../routes/b&bGroupRoutes.js";
import bnbGroupProductRoutes from "../routes/b&bGroupProductRoutes.js";
import bbmDostRoutes from "../routes/bbmDostRoutes.js";
import brandRoutes from "../routes/brandRoutes.js";
import brandProductsRoutes from "../routes/brandProducts.js";
import recommendedStoreRoutes from "../routes/recommendedStoreRoutes.js";
import productRecommendedStoreRoutes from "../routes/productRecommendedStoreRoutes.js";
import quickPickRoutes from "../routes/quickPickRoutes.js";
import quickPickGroupRoutes from "../routes/quickPickGroupRoutes.js";
import quickPickGroupProductRoutes from "../routes/quickPickGroupProductRoutes.js";
import savingZoneRoutes from "../routes/savingZoneRoutes.js";
import savingZoneGroupRoutes from "../routes/savingZoneGroupRoutes.js";
import savingZoneGroupProductRoutes from "../routes/savingZoneGroupProductRoutes.js";
import storeRoutes from "../routes/storeRoute.js";
import subStoreRoutes from "../routes/subStoreRoute.js";
import YouMayLikeProductRoutes from "../routes/youMayLikeRoutes.js";
import addBannerRoutes from "../routes/addBannerRoutes.js";
import addBannerGroupRoutes from "../routes/addBannerGroupRoutes.js";
import addBannerGroupProductRoutes from "../routes/addBannerGroupProductRoutes.js";
import uniqueSectionRoutes from "../routes/uniqueSectionRoutes.js";
import uniqueSectionProductRoutes from "../routes/uniqueSectionProductRoutes.js";
import profileRoutes from "../routes/profileRoutes.js";
import returnOrderRoutes from "../routes/returnOrderRoutes.js";
import walletRoutes from "../routes/walletRoutes.js";
import refundRoutes from "../routes/refundRoutes.js";
import debugRoutes from "../routes/debugRoutes.js";
import dailyDealsRoutes from "../routes/dailyDealsRoutes.js";
import dailyDealsProductRoutes from "../routes/dailyDealsProductRoutes.js";
import quickFixRoutes from "../routes/quickFixRoutes.js";
import trackingRoutes from "../routes/trackingRoutes.js";
import categoryRoutes from "../routes/categoryRoutes.js";
import bulkOrderRoutes from "../routes/bulkOrderRoutes.js";
import bulkProductRoutes from "../routes/bulkProductRoutes.js";
import productVariantsRoutes from "../routes/productVariantsRoutes.js";
import variantRoutes from "../routes/variantRoutes.js";
import inventoryRoutes from "../routes/inventoryRoutes.js";
import shopByStoreRoutes from "../routes/shopByStoreRoutes.js";
import videoCardRoutes from "../routes/videoCardRoutes.js";
import productSectionRoutes from "../routes/productSectionRoutes.js";
import promoBannerRoutes from "../routes/promoBannerRoutes.js";
import storeSectionMappingRoutes from "../routes/storeSectionMappingRoutes.js";

const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:5173",
  "http://localhost:5174",
  "https://big-best-admin.vercel.app",
  "https://big-best-admin.vercel.app/",
  "https://ecommerce-umber-five-95.vercel.app",
  "https://admin-eight-flax.vercel.app",
  "https://ecommerce-six-brown-12.vercel.app",
  "https://www.bigbestmart.com",
  "https://admin-eight-ruddy.vercel.app",
  "https://big-best-frontend.vercel.app",
];

const corsOptions = {
  origin: allowedOrigins,
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

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// Mount all routes
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
app.use("/api/bbm-dost", bbmDostRoutes);
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
app.use("/api/daily-deals", dailyDealsRoutes);
app.use("/api/daily-deals-product", dailyDealsProductRoutes);
app.use("/api/quick", quickFixRoutes);
app.use("/api/tracking", trackingRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/bulk-orders", bulkOrderRoutes);
app.use("/api/bulk-products", bulkProductRoutes);
app.use("/api/product-variants", productVariantsRoutes);
app.use("/api/variants", variantRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/shop-by-stores", shopByStoreRoutes);
app.use("/api/video-cards", videoCardRoutes);
app.use("/api/product-sections", productSectionRoutes);
app.use("/api/promo-banner", promoBannerRoutes);
app.use("/api/store-section-mappings", storeSectionMappingRoutes);

// Health check route
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "Server is healthy" });
});

// Export for Vercel
export default app;
