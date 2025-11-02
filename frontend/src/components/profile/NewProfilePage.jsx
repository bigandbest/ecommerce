"use client";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import ProfileSidebar from "./ProfileSidebar";
import ProfileDetails from "./ProfileDetails";
import OrdersSection from "./OrdersSection";
import AddressesSection from "./AddressesSection";

function NewProfilePage() {
  const [activeSection, setActiveSection] = useState("account-details");

  const renderContent = () => {
    switch (activeSection) {
      case "account-details":
        return <ProfileDetails />;
      case "orders":
        return <OrdersSection />;
      case "return-requests":
        return (
          <div className="flex-1 bg-white p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Return Requests</h2>
            <p className="text-gray-600">Return requests section coming soon...</p>
          </div>
        );
      case "addresses":
        return <AddressesSection />;
      case "bulk-request":
        return (
          <div className="flex-1 bg-white p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Bulk Request</h2>
            <p className="text-gray-600">Bulk request section coming soon...</p>
          </div>
        );
      case "help-support":
        return (
          <div className="flex-1 bg-white p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Help & Support</h2>
            <p className="text-gray-600">Help & support section coming soon...</p>
          </div>
        );
      case "loyalty":
        return (
          <div className="flex-1 bg-white p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Loyalty</h2>
            <p className="text-gray-600">Loyalty section coming soon...</p>
          </div>
        );
      default:
        return <ProfileDetails />;
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-[#F9F4ED] via-gray-50 to-white py-4 lg:py-8">
        <div className="w-full px-4 lg:px-8">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden h-[500px] lg:h-[600px] flex flex-col lg:flex-row border border-gray-100">
            {/* Sidebar */}
            <ProfileSidebar 
              activeSection={activeSection} 
              setActiveSection={setActiveSection} 
            />
            
            {/* Main Content */}
            {renderContent()}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default NewProfilePage;