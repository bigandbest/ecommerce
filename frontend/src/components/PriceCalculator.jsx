'use client';
import { useState, useEffect } from 'react';
import { Calculator, Truck, Receipt } from 'lucide-react';

const PriceCalculator = ({ items = [], pincode, userState = 'Delhi' }) => {
  const [calculation, setCalculation] = useState({
    subtotal: 0,
    shippingCharge: 0,
    taxAmount: 0,
    total: 0,
    savings: 0
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (items.length > 0) {
      calculatePrices();
    }
  }, [items, pincode, userState]);

  const calculatePrices = async () => {
    setLoading(true);
    
    try {
      // Calculate subtotal and savings
      const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const mrpTotal = items.reduce((sum, item) => sum + (item.mrp * item.quantity), 0);
      const savings = mrpTotal - subtotal;
      const totalWeight = items.reduce((sum, item) => sum + ((item.weight || 0.5) * item.quantity), 0);

      let shippingCharge = 0;
      let taxAmount = 0;

      // Calculate shipping if pincode is available
      if (pincode) {
        try {
          const shippingResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/location/shipping/calculate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              pincode,
              weight: totalWeight,
              orderValue: subtotal
            })
          });
          const shippingData = await shippingResponse.json();
          if (shippingData.success) {
            shippingCharge = shippingData.data.shippingCharge;
          }
        } catch (error) {
          console.error('Shipping calculation error:', error);
        }
      }

      // Calculate tax
      try {
        const taxResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/location/tax/calculate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            state: userState,
            amount: subtotal
          })
        });
        const taxData = await taxResponse.json();
        if (taxData.success) {
          taxAmount = taxData.data.taxAmount;
        }
      } catch (error) {
        console.error('Tax calculation error:', error);
      }

      const total = subtotal + shippingCharge + taxAmount;

      setCalculation({
        subtotal,
        shippingCharge,
        taxAmount,
        total,
        savings
      });
    } catch (error) {
      console.error('Price calculation error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <Calculator className="w-5 h-5 text-green-600" />
        <h3 className="font-semibold text-gray-800">Price Details</h3>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal ({items.length} items)</span>
            <span>₹{calculation.subtotal.toFixed(2)}</span>
          </div>

          {calculation.shippingCharge > 0 ? (
            <div className="flex justify-between text-gray-600">
              <div className="flex items-center gap-1">
                <Truck className="w-4 h-4" />
                <span>Shipping Charges</span>
              </div>
              <span>₹{calculation.shippingCharge.toFixed(2)}</span>
            </div>
          ) : (
            <div className="flex justify-between text-green-600">
              <div className="flex items-center gap-1">
                <Truck className="w-4 h-4" />
                <span>Shipping</span>
              </div>
              <span>FREE</span>
            </div>
          )}

          {calculation.taxAmount > 0 && (
            <div className="flex justify-between text-gray-600">
              <div className="flex items-center gap-1">
                <Receipt className="w-4 h-4" />
                <span>GST (18%)</span>
              </div>
              <span>₹{calculation.taxAmount.toFixed(2)}</span>
            </div>
          )}

          {calculation.savings > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Total Savings</span>
              <span>-₹{calculation.savings.toFixed(2)}</span>
            </div>
          )}

          <hr className="border-gray-200" />

          <div className="flex justify-between text-lg font-semibold text-gray-800">
            <span>Total Amount</span>
            <span>₹{calculation.total.toFixed(2)}</span>
          </div>

          {calculation.savings > 0 && (
            <div className="text-sm text-green-600 text-center">
              🎉 You saved ₹{calculation.savings.toFixed(2)} on this order!
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PriceCalculator;