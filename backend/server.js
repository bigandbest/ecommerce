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

const app = express();
const PORT = process.env.PORT || 8000;
const allowedOrigins = [
  "http://localhost:5173",
  "https://ecommerce-umber-five-95.vercel.app",
  "https://admin-eight-flax.vercel.app",
  "https://ecommerce-six-brown-12.vercel.app",
  "https://www.bigbestmart.com",
  "https://admin-eight-ruddy.vercel.app",
];

const corsOptions = {
  origin: function (origin, callback) {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      // Allow requests with no origin (like curl, etc.)
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
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

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
