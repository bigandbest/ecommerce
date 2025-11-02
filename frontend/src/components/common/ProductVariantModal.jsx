"use client";
import React from "react";
import { IoClose } from "react-icons/io5";

const ProductVariantModal = ({ 
  isOpen, 
  onClose, 
  product, 
  variants, 
  selectedVariant, 
  onVariantSelect 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="flex justify-between items-center p-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gray-50 p-1.5 flex items-center justify-center">
              <img
                src={product.image || "/prod1.png"}
                alt={product.name}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm line-clamp-1">{product.name}</h3>
              <p className="text-xs text-gray-500">Choose pack size</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors"
          >
            <IoClose className="w-4 h-4" />
          </button>
        </div>

        {/* Variants List */}
        <div className="p-3 max-h-80 overflow-y-auto">
          <div className="space-y-2">
            {variants.map((variant) => {
              const discountPercent = variant.variant_old_price && variant.variant_old_price > variant.variant_price
                ? Math.round(((variant.variant_old_price - variant.variant_price) / variant.variant_old_price) * 100)
                : 0;

              const isSelected = selectedVariant?.id === variant.id;

              return (
                <div
                  key={variant.id}
                  className={`border rounded-lg p-3 transition-all cursor-pointer ${
                    isSelected 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => onVariantSelect(variant)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900 text-sm">
                          {variant.variant_weight}
                        </span>
                        {discountPercent > 0 && (
                          <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded text-xs font-medium">
                            ₹{variant.variant_old_price - variant.variant_price} OFF
                          </span>
                        )}
                        {isSelected && (
                          <span className="bg-green-600 text-white px-1.5 py-0.5 rounded text-xs font-medium">
                            Selected
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg font-bold text-gray-900">
                          ₹{variant.variant_price}
                        </span>
                        {variant.variant_old_price && variant.variant_old_price > variant.variant_price && (
                          <span className="text-sm text-gray-400 line-through">
                            ₹{variant.variant_old_price}
                          </span>
                        )}
                        {discountPercent > 0 && (
                          <span className="text-xs text-green-600 font-medium">
                            {discountPercent}% OFF
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center">
                          <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full mr-1"></span>
                          5 mins
                        </span>
                        {variant.variant_stock <= 5 && variant.variant_stock > 0 && (
                          <span className="text-orange-600 font-medium">
                            Only {variant.variant_stock} left
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onVariantSelect(variant);
                        onClose();
                      }}
                      disabled={variant.variant_stock === 0}
                      className={`px-4 py-1.5 rounded-lg font-medium text-sm transition-colors ${
                        variant.variant_stock === 0
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      }`}
                    >
                      {variant.variant_stock === 0 ? 'Out of Stock' : 'Add'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductVariantModal;