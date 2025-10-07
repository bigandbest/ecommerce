// src/pages/Checkout/AddressSelectionPage.jsx
import React, { useEffect, useState } from 'react';
import { useLocationContext } from '../../contexts/LocationContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import AddressForm from '../../components/AddressForm'; // Assuming this is the path
import { addUserAddress, getUserAddresses } from '../../utils/supabaseApi'; // We need these now

const AddressSelectionPage = () => {
  const { currentUser } = useAuth();
  const { mapSelection, orderAddress, setOrderAddress, addresses, setAddresses } = useLocationContext();
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false); // NEW: State to toggle the form
  const [formLoading, setFormLoading] = useState(false); // NEW: Loading state for the form submission
  const navigate = useNavigate();

  // Fetch or update addresses
  const loadAddresses = async () => {
    if (!currentUser?.id) return;
    const result = await getUserAddresses(currentUser.id);
    if (result.success) {
      setAddresses(result.addresses || []);
      // Set default address if not already set
      if (!orderAddress && result.addresses.length > 0) {
        const defaultAddress = result.addresses.find(a => a.is_default) || result.addresses[0];
        setOrderAddress(defaultAddress);
      }
    }
    setLoading(false);
  };

  // Fetch addresses on mount
  useEffect(() => {
    loadAddresses();
  }, [currentUser]);

  const handleSelectAddress = (address) => {
    setOrderAddress(address);
    console.log('Address selected:', address);
  };
  
  // NEW: Handle adding a new address from the inline form
  const handleAddNewAddress = async (formData) => {
    setFormLoading(true);
    const result = await addUserAddress(currentUser.id, formData);
    if (result.success) {
      setShowAddForm(false); // Hide the form
      await loadAddresses(); // Reload the address list
    } else {
      alert("Error adding address: " + result.error);
    }
    setFormLoading(false);
  };
  
  // NEW: Navigate to the next step
  const handleContinueToPayment = () => {
    if (!orderAddress) {
      alert("Please select or add a delivery address.");
      return;
    }
    console.log('Navigating to payment with address:', orderAddress);
    navigate('/checkout/payment'); // Navigate to the new payment page
  };

  if (loading) return <div className="text-center p-10">Loading Addresses...</div>;

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6 text-center">Select Delivery Address</h1>

      {mapSelection && (
        <div className="mb-6">
          <h2 className="font-semibold text-lg mb-2">GPS Location Reference</h2>
          <div className="border p-4 rounded-md bg-gray-100 text-gray-700">
            <p>📍 {mapSelection.formatted_address}</p>
          </div>
        </div>
      )}

      {addresses.length > 0 ? (
        addresses.map(addr => (
          <div key={addr.id} className={`border p-4 rounded-md mb-2 cursor-pointer hover:border-blue-500 ${orderAddress?.id === addr.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`} onClick={() => handleSelectAddress(addr)}>
            <div className="flex items-center">
              <input
                type="radio"
                id={`addr-${addr.id}`}
                name="deliveryAddress"
                checked={orderAddress?.id === addr.id}
                readOnly
                className="mr-3 h-4 w-4"
              />
              <label htmlFor={`addr-${addr.id}`} className="w-full">
                <p className="font-bold">{addr.address_name}</p>
                <p>{addr.street_address}, {addr.city}, {addr.state} - {addr.postal_code}</p>
              </label>
            </div>
          </div>
        ))
      ) : (
        !showAddForm && ( // Only show this if there are no addresses AND the form isn't open
          <div className="text-center border-2 border-dashed p-8 rounded-md">
            <p className="text-gray-600 mb-4">You have no saved addresses.</p>
          </div>
        )
      )}

      {/* NEW: Inline Add Address Form */}
      <div className="mt-6">
        {showAddForm ? (
          <AddressForm
            onSubmit={handleAddNewAddress}
            onCancel={() => setShowAddForm(false)}
            loading={formLoading}
          />
        ) : (
          <button onClick={() => setShowAddForm(true)} className="w-full text-blue-600 border border-blue-600 py-2 px-4 rounded hover:bg-blue-50">
            + Add a New Address
          </button>
        )}
      </div>
      
      {/* NEW: Continue Button */}
      <div className="border-t pt-6 mt-6">
        <button
          onClick={handleContinueToPayment}
          disabled={!orderAddress}
          className="w-full bg-green-600 text-white py-3 px-8 rounded-md hover:bg-green-700 transition duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {orderAddress ? 'Continue to Payment' : 'Please Select an Address'}
        </button>
      </div>
    </div>
  );
};

export default AddressSelectionPage;