'use client';
import { useState } from 'react';
import EnhancedProductCard from './EnhancedProductCard';
import PincodeChecker from './PincodeChecker';
import PriceCalculator from './PriceCalculator';

const EcommerceExample = () => {
  const [cart, setCart] = useState([]);
  const [userPincode, setUserPincode] = useState('');
  const [userState, setUserState] = useState('Delhi');

  // Sample products
  const sampleProducts = [
    {
      id: 1,
      name: 'Aashirvaad Atta - Whole Wheat',
      brand: 'Aashirvaad',
      price: 530.5,
      mrp: 592,
      image_url: '/prod1.png',
      delivery_time: '5 mins',
      rating: 4.3,
      stock_quantity: 10
    },
    {
      id: 2,
      name: 'Tata Salt - Vacuum Evaporated Iodised',
      brand: 'Tata',
      price: 55,
      mrp: 65,
      image_url: '/prod2.png',
      delivery_time: '5 mins',
      rating: 4.5,
      stock_quantity: 25
    }
  ];

  const handleAddToCart = (productData) => {
    const existingItemIndex = cart.findIndex(item => 
      item.id === productData.id && 
      item.selectedVariant?.id === productData.selectedVariant?.id
    );

    if (existingItemIndex >= 0) {
      const updatedCart = [...cart];
      if (productData.quantity === 0) {
        updatedCart.splice(existingItemIndex, 1);
      } else {
        updatedCart[existingItemIndex] = {
          ...updatedCart[existingItemIndex],
          quantity: productData.quantity
        };
      }
      setCart(updatedCart);
    } else if (productData.quantity > 0) {
      setCart([...cart, productData]);
    }
  };

  const getCartQuantity = (productId, variantId = null) => {
    const item = cart.find(item => 
      item.id === productId && 
      item.selectedVariant?.id === variantId
    );
    return item ? item.quantity : 0;
  };

  const handlePincodeChange = (pincodeData) => {
    setUserPincode(pincodeData.pincode);
    setUserState(pincodeData.state);
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Professional E-commerce Features</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Products Section */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sampleProducts.map(product => (
              <EnhancedProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
                cartQuantity={getCartQuantity(product.id)}
              />
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Pincode Checker */}
          <PincodeChecker onPincodeChange={handlePincodeChange} />
          
          {/* Price Calculator */}
          <PriceCalculator 
            items={cart}
            pincode={userPincode}
            userState={userState}
          />

          {/* Cart Summary */}
          {cart.length > 0 && (
            <div className="bg-white border rounded-lg p-4">
              <h3 className="font-semibold mb-3">Cart Items ({cart.length})</h3>
              <div className="space-y-2">
                {cart.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <div>
                      <div className="font-medium">{item.name}</div>
                      {item.selectedVariant && (
                        <div className="text-gray-600">{item.selectedVariant.variant_value}</div>
                      )}
                    </div>
                    <div className="text-right">
                      <div>₹{(item.selectedVariant?.price || item.price) * item.quantity}</div>
                      <div className="text-gray-600">Qty: {item.quantity}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EcommerceExample;