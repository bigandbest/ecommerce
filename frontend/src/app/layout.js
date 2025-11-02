// app/layout.js or app/RootLayout.jsx

import { Outfit } from "next/font/google";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";
import "react-toastify/dist/ReactToastify.css";

// Import error suppression utility
import "@/utils/errorSuppress";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata = {
  title: "BIGBESTMART - Everyday Essentials",
  description: "BIGBESTMART - Your trusted marketplace for everyday essentials",
  icons: {
    icon: "/fevicon.png",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "BIGBESTMART",
    "format-detection": "telephone=no",
    "msapplication-TileColor": "#FF6B00",
    "theme-color": "#FF6B00",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      suppressHydrationWarning={true}
    >
      <head>
        <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
      </head>
      <body
        className={`${outfit.variable} font-outfit antialiased min-h-screen flex flex-col bg-white text-gray-900 overflow-x-hidden`}
        suppressHydrationWarning={true}
      >
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
