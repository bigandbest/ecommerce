'use client';
import { useState, useEffect } from 'react';
import { Plus, Minus, ShoppingCart, Clock, Star } from 'lucide-react';
import ProductVariantSelector from './ProductVariantSelector';

const EnhancedProductCard = ({ product, onAddToCart, cartQuantity = 0 }) => {
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(cartQuantity);
  const [showVariants, setShowVariants] = useState(false);

  useEffect(() => {
    setQuantity(cartQuantity);
  }, [cartQuantity]);

  const handleVariantSelect = (variant) => {
    setSelectedVariant(variant);
  };

  const handleAddToCart = () => {
    if (selectedVariant) {
      onAddToCart({
        ...product,
        selectedVariant,
        quantity: 1
      });
      setQuantity(quantity + 1);
    } else {
      onAddToCart({
        ...product,
        quantity: 1
      });
      setQuantity(quantity + 1);
    }
  };

  const handleQuantityChange = (newQuantity) => {
    setQuantity(newQuantity);
    onAddToCart({
      ...product,
      selectedVariant,
      quantity: newQuantity
    });
  };

  const currentPrice = selectedVariant?.price || product.price;
  const currentMrp = selectedVariant?.mrp || product.mrp;
  const discount = currentMrp > currentPrice ? Math.round(((currentMrp - currentPrice) / currentMrp) * 100) : 0;
  const isOutOfStock = selectedVariant ? selectedVariant.stock_quantity === 0 : product.stock_quantity === 0;

  return (
    <div className="bg-white border rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200">
      {/* Product Image */}
      <div className="relative">
        <img
          src={product.image_url || '/placeholder-product.png'}
          alt={product.name}
          className="w-full h-48 object-cover"
        />
        {discount > 0 && (
          <div className="absolute top-2 left-2 bg-green-600 text-white px-2 py-1 rounded text-xs font-semibold">
            ₹{(currentMrp - currentPrice).toFixed(0)} OFF
          </div>
        )}
        {product.delivery_time && (
          <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {product.delivery_time}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">{product.name}</h3>
        
        {/* Brand */}
        {product.brand && (
          <div className="text-sm text-gray-600 mb-2">{product.brand}</div>
        )}

        {/* Rating */}
        {product.rating && (
          <div className="flex items-center gap-1 mb-2">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm text-gray-600">{product.rating}</span>
          </div>
        )}

        {/* Variant Selector */}
        <div className="mb-3">
          <ProductVariantSelector
            productId={product.id}
            onVariantSelect={handleVariantSelect}
            selectedVariant={selectedVariant}
          />
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg font-bold text-gray-800">₹{currentPrice}</span>
          {currentMrp > currentPrice && (
            <>
              <span className="text-sm text-gray-400 line-through">₹{currentMrp}</span>
              <span className="text-sm text-green-600 font-semibold">{discount}% OFF</span>
            </>
          )}
        </div>

        {/* Stock Status */}
        {isOutOfStock ? (
          <div className="text-red-600 text-sm font-medium mb-3">Out of Stock</div>
        ) : selectedVariant && selectedVariant.stock_quantity <= 5 ? (
          <div className="text-orange-600 text-sm mb-3">
            Only {selectedVariant.stock_quantity} left!
          </div>
        ) : null}

        {/* Add to Cart / Quantity Controls */}
        <div className="flex items-center justify-between">
          {quantity === 0 ? (
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
            >
              <ShoppingCart className="w-4 h-4" />
              {isOutOfStock ? 'Out of Stock' : 'Add'}
            </button>
          ) : (
            <div className="flex-1 flex items-center justify-between bg-green-600 text-white rounded-lg">
              <button
                onClick={() => handleQuantityChange(quantity - 1)}
                className="p-2 hover:bg-green-700 rounded-l-lg"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="px-4 py-2 font-medium">{quantity}</span>
              <button
                onClick={() => handleQuantityChange(quantity + 1)}
                className="p-2 hover:bg-green-700 rounded-r-lg"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Additional Info */}
        {selectedVariant?.weight && (
          <div className="text-xs text-gray-500 mt-2">
            Weight: {selectedVariant.weight}kg
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedProductCard;