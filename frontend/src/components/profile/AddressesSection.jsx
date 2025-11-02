"use client";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

function AddressesSection() {
  const { currentUser } = useAuth();
  const [addresses, setAddresses] = useState([
    {
      id: 1,
      type: "Home",
      name: "Satyam Singh",
      address: "abesit boy hostel, Gaziabad, 201016",
      phone: "9310433939",
      isDefault: true
    }
  ]);
  const [showAddForm, setShowAddForm] = useState(false);

  return (
    <div className="flex-1 bg-gradient-to-br from-gray-50 to-white p-6 lg:p-12">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl lg:text-3xl font-bold text-[#1E3473] tracking-wide">Addresses</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-gradient-to-r from-[#FF6B00] to-[#F7941D] hover:from-[#e65c00] hover:to-[#e6850d] text-white px-6 py-3 rounded-xl text-base font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          Add New Address
        </button>
      </div>

      {/* Addresses List */}
      <div className="space-y-6">
        {addresses.map((address) => (
          <div key={address.id} className="border-2 border-gray-100 rounded-2xl p-6 hover:shadow-xl hover:border-[#FF6B00]/30 transition-all duration-300 bg-white">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <h3 className="font-bold text-[#1E3473] text-lg">{address.type}</h3>
                {address.isDefault && (
                  <span className="bg-gradient-to-r from-green-100 to-green-200 text-green-800 text-sm px-3 py-1 rounded-full font-semibold border border-green-300">
                    Default
                  </span>
                )}
              </div>
              <div className="flex gap-3">
                <button className="hidden sm:block text-[#FF6B00] hover:text-[#e65c00] font-semibold transition-colors">
                  Edit
                </button>
                <button className="hidden sm:block text-red-600 hover:text-red-700 font-semibold transition-colors">
                  Delete
                </button>
                {/* Mobile Dropdown Icon */}
                <button className="block sm:hidden text-gray-600 hover:text-gray-800 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="text-gray-700 bg-gray-50 p-4 rounded-xl">
              <p className="font-bold text-[#1E3473] text-lg mb-2">{address.name}</p>
              <p className="text-base mb-2">{address.address}</p>
              <p className="text-base font-semibold">Phone: {address.phone}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Add Address Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl">
            <h3 className="text-2xl font-bold text-[#1E3473] mb-6">Add New Address</h3>
            
            <form className="space-y-5">
              <div>
                <label className="block text-base font-bold text-[#1E3473] mb-2">
                  Address Type
                </label>
                <select className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/20 text-base bg-white">
                  <option>Home</option>
                  <option>Office</option>
                  <option>Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-base font-bold text-[#1E3473] mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/20 text-base"
                  placeholder="Enter full name"
                />
              </div>
              
              <div>
                <label className="block text-base font-bold text-[#1E3473] mb-2">
                  Address
                </label>
                <textarea
                  rows={3}
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/20 text-base"
                  placeholder="Enter complete address"
                />
              </div>
              
              <div>
                <label className="block text-base font-bold text-[#1E3473] mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/20 text-base"
                  placeholder="Enter phone number"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="default"
                  className="mr-3 w-4 h-4"
                />
                <label htmlFor="default" className="text-base text-[#1E3473] font-medium">
                  Set as default address
                </label>
              </div>
            </form>
            
            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setShowAddForm(false)}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button className="flex-1 px-6 py-3 bg-gradient-to-r from-[#FF6B00] to-[#F7941D] hover:from-[#e65c00] hover:to-[#e6850d] text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl">
                Save Address
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AddressesSection;