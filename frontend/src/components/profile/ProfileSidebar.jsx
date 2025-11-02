"use client";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

function ProfileSidebar({ activeSection, setActiveSection }) {
  const { logout } = useAuth();

  const menuItems = [
    { id: "account-details", label: "Account Details", isHighlighted: true },
    { id: "orders", label: "Orders" },
    { id: "return-requests", label: "Return Requests" },
    { id: "addresses", label: "Addresses" },
    { id: "wallet", label: "My Wallet" },
    { id: "bulk-request", label: "Bulk Request" },
    { id: "help-support", label: "Help & Support" },
    { id: "loyalty", label: "Loyalty" },
  ];

  const router = useRouter();

  const handleLogout = async () => {
    try {
      const result = await logout();
      if (result && result.success) {
        toast.success("Logged out successfully");
        router.push("/pages/login");
      } else {
        toast.error(result?.error || "Logout failed");
      }
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Error logging out");
    }
  };

  return (
    <div className="w-full lg:w-96 bg-gradient-to-b from-[#1E3473] to-[#2A4A8B] text-white flex flex-col h-full shadow-2xl">
      {/* Header */}
      <div className="p-4 lg:p-6 border-b border-white/10">
        <h1 className="text-xl lg:text-2xl font-bold tracking-wide">
          My Profile
        </h1>
      </div>

      {/* Menu Items */}
      <div className="flex-1 p-4 lg:p-6">
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 font-medium text-sm lg:text-base ${
                activeSection === item.id
                  ? "bg-[#FF6B00] text-white shadow-lg transform scale-105"
                  : item.isHighlighted
                  ? "text-[#F7941D] bg-white/5 hover:bg-white/10"
                  : "text-white/90 hover:bg-white/10 hover:text-white"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Divider */}
      <div className="px-4 lg:px-6">
        <div className="border-t border-white/20 shadow-sm"></div>
      </div>

      {/* Logout */}
      <div className="p-4 lg:p-6">
        <button
          onClick={handleLogout}
          className="w-full text-left px-4 py-3 text-white/90 hover:bg-red-500/20 hover:text-red-200 rounded-xl transition-all duration-300 font-medium text-sm lg:text-base border border-white/10 hover:border-red-300/30"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default ProfileSidebar;
