"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Header from "@/components/global/Header";
import Footer from "@/components/global/Footer";
import { CartProvider } from "@/Context/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { WalletProvider } from "@/contexts/WalletContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ToastContainer } from "react-toastify";

export default function ClientLayout({ children }) {
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();
  
  // Hide main header on Eato page
  const hideHeader = pathname === '/pages/eato';

  useEffect(() => {
    setIsMounted(true);
    
    // Load Razorpay script on client-side only
    if (typeof window !== 'undefined' && !window.Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  if (!isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FD5B00]"></div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <AuthProvider>
        <WalletProvider>
          <CartProvider>
            {!hideHeader && <Header />}
            <main className="flex-1">{children}</main>
            <Footer />
            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
            />
          </CartProvider>
        </WalletProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}