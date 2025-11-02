"use client";
import React, { useState, useContext } from 'react';
import Image from 'next/image';
import { FiHeart } from 'react-icons/fi';
import EatoHeader from '@/components/eato/EatoHeader';
import { CartContext } from '@/Context/CartContext';
import { toast } from 'react-toastify';

const EatoPage = () => {
  const { addToCart, removeFromCart, deleteFromCart, getItemQuantity } = useContext(CartContext);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [addedItemName, setAddedItemName] = useState('');

  const handleAddToCart = (item) => {
    const cartItem = {
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      quantity: 1
    };
    addToCart(cartItem);
    setAddedItemName(item.name);
    setShowSuccessPopup(true);
    setTimeout(() => setShowSuccessPopup(false), 2000);
  };

  const handleQuantityChange = (item, change) => {
    if (change > 0) {
      addToCart({ ...item, quantity: 1 });
    } else {
      const currentQuantity = getItemQuantity(item.id);
      if (currentQuantity > 1) {
        removeFromCart(item);
      } else {
        deleteFromCart(item);
      }
    }
  };

  const foodItems = [
    {
      id: 1,
      name: "Veg Pulao",
      description: "Delight in the vibrant medley of vegetables and aromatic basmati rice in Veg Pulao. This...",
      price: 180.00,
      originalPrice: 270.00,
      image: "/Veg Pulao.webp",
      rating: 4.5,
      unit: "1 Plate",
      saved: 90
    },
    {
      id: 2,
      name: "Veg Sweet Corn Soup",
      description: "Veg Sweet Corn Soup is a classic comfort dish featuring sweet corn kernels in a savor...",
      price: 125.00,
      originalPrice: 150.00,
      image: "/Veg Sweet Corn Soup.webp",
      rating: 4.2,
      unit: "1 Bowl",
      saved: 25
    },
    {
      id: 3,
      name: "Veg Seekh Kabab",
      description: "Savor the taste of Veg Seekh Kabab, a delectable blend of finely minced...",
      price: 185.00,
      originalPrice: 220.00,
      image: "/Veg Seekh Kabab.webp",
      rating: 4.7,
      unit: "4 Pieces",
      saved: 35
    },
    {
      id: 4,
      name: "Veg Singapoor Fried Rice",
      description: "Embark on a culinary journey with Veg Singapore Fried Rice. This flavorful dish...",
      price: 210.00,
      originalPrice: 280.00,
      image: "/Veg Singapoor Fried Rice.webp",
      rating: 4.3,
      unit: "1 Plate",
      saved: 70
    },
    {
      id: 5,
      name: "Veg Schezwan Noodles",
      description: "Indulge in the fiery flavors of Veg Schezwan Noodles. A tantalizing blend of colorful...",
      price: 210.00,
      originalPrice: 260.00,
      image: "/Veg Schezwan Noodles.webp",
      rating: 4.6,
      unit: "1 Plate",
      saved: 50
    },
    {
      id: 6,
      name: "Veg Makhanwala",
      description: "",
      price: 120.00,
      originalPrice: 160.00,
      image: "/veg makhanwala.webp",
      rating: 4.4,
      unit: "1 Bowl",
      saved: 40
    }
  ];

  const categories = [
    { name: "Indian Rice Dishes", image: "/Indian Rice Dishes.webp" },
    { name: "Tandoori Starters", image: "/Tandoori Starters.webp" },
    { name: "Chinese Starters", image: "/Chinese Starters.webp" },
    { name: "Daily Saver Combos", image: "/Daily Saver Combos.webp" },
    { name: "Special Soups", image: "/Special Soups.webp" },
    { name: "Quick Bite Burgers", image: "/Quick Bite Burgers.webp" },
    { name: "Delight Full Ice Creams", image: "/Delight Full Ice Creams.webp" },
    { name: "Fresh Fruit Juice", image: "/Fresh Fruit Juice.webp" },
    { name: "Veg Pulao", image: "/Veg Pulao.webp" },
    { name: "Paneer Tikka", image: "/Paneer Tikka.webp" }
  ];

  const starterItems = [
    {
      name: "Paneer Tikka",
      description: "Paneer Tikka is a vegetarian delight featuring marinated paneer (Indian cottage cheese)...",
      price: 260.00,
      image: "/Paneer Tikka.webp"
    },
    {
      name: "Paneer Malai Tikka",
      description: "Savor the rich and creamy texture of Paneer Malai Tikka. Marinated in a luscious malai...",
      price: 280.00,
      image: "/Paneer Malai Tikka.webp"
    },
    {
      name: "Paneer Achari Tikka",
      description: "Indulge in the rich flavors of Paneer Achari Tikka, where succulent paneer cubes are...",
      price: 240.00,
      image: "/Paneer Achari Tikka.webp"
    }
  ];

  const featuredDishes = [
    { name: "Manchow Soup", image: "/Manchow Soup.webp" },
    { name: "Chicken Noodles", image: "/Chicken Noodles.webp" },
    { name: "Chicken Biryani", image: "/Chicken Biryani.webp" },
    { name: "Blueberry Ice Creams", image: "/Blueberry Ice Creams.webp" },
    { name: "Veg Pulao", image: "/Veg Pulao.webp" },
    { name: "Paneer Tikka", image: "/Paneer Tikka.webp" },
    { name: "Veg Schezwan Noodles", image: "/Veg Schezwan Noodles.webp" }
  ];

  return (
    <div className="min-h-screen bg-white">
      <EatoHeader />
      {/* Hero Banner */}
      <div className="relative w-full h-[250px] md:h-[400px] lg:h-[500px] overflow-hidden">
        <Image 
          src="/Order Fresh Now.webp" 
          alt="Fresh Food" 
          fill 
          className="object-cover object-center" 
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent">
          <div className="container mx-auto px-4 h-full flex items-center">
            <div className="text-white max-w-xs md:max-w-lg">
              <h1 className="text-lg md:text-4xl lg:text-5xl font-bold mb-2 md:mb-4 leading-tight">
                Be the First to Taste the<br className="hidden md:block" />
                <span className="md:hidden">Be the First to Taste the </span>
                Freshest Flavors Today
              </h1>
              <p className="text-sm md:text-xl text-orange-400 font-semibold mb-1 md:mb-2">
                Anytime, Anywhere
              </p>
              <p className="text-gray-200 text-xs md:text-lg mb-3 md:mb-6">
                Indulge in fresh, bold tastes now!
              </p>
              <button className="absolute bottom-4 left-4 md:relative md:bottom-auto md:left-auto bg-orange-600 text-white px-4 md:px-8 py-2 md:py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors text-sm md:text-base">
                Order Fresh Now →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Dishes */}
      <div className="py-8 bg-yellow-50">
        <div className="container mx-auto px-4">
          <div className="hidden md:grid md:grid-cols-7 gap-3">
            {featuredDishes.map((dish, index) => (
              <div key={index} className="text-center">
                <div className="relative w-full h-28 mb-2">
                  <Image src={dish.image} alt={dish.name} fill className="object-cover rounded-lg" />
                </div>
                <h3 className="font-semibold text-xs">
                  {dish.name.split(' ').map((word, i) => (
                    <span key={i} className={i === 1 ? 'text-orange-600' : 'text-gray-800'}>
                      {word}{i < dish.name.split(' ').length - 1 ? ' ' : ''}
                    </span>
                  ))}
                </h3>
              </div>
            ))}
          </div>
          <div className="md:hidden overflow-x-auto">
            <div className="flex gap-4 pb-2" style={{width: 'max-content'}}>
              {featuredDishes.map((dish, index) => (
                <div key={index} className="text-center flex-shrink-0" style={{width: '120px'}}>
                  <div className="relative w-full h-24 mb-2">
                    <Image src={dish.image} alt={dish.name} fill className="object-cover rounded-lg" />
                  </div>
                  <h3 className="font-semibold text-xs">
                    {dish.name.split(' ').map((word, i) => (
                      <span key={i} className={i === 1 ? 'text-orange-600' : 'text-gray-800'}>
                        {word}{i < dish.name.split(' ').length - 1 ? ' ' : ''}
                      </span>
                    ))}
                  </h3>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top Rated Foods */}
      <div className="py-4">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">Delight in our top-rated foods</h2>
            <span className="text-gray-400">→</span>
          </div>
          
          {/* Desktop View - 2 rows with 5 items each */}
          <div className="hidden md:block">
            <div className="grid grid-cols-5 gap-4 mb-4">
              {foodItems.slice(0, 5).map((item) => (
                <div key={item.id} className="bg-white rounded-lg shadow-sm border p-3">
                  <div className="relative">
                    <Image src={item.image} alt={item.name} width={200} height={140} className="w-full h-32 object-cover rounded-lg mb-3" />
                    <button className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-sm">
                      <FiHeart className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-yellow-500 text-xs">⭐</span>
                    <span className="text-xs text-gray-600">{item.rating}</span>
                    <span className="text-xs text-gray-400">• {item.unit}</span>
                  </div>
                  <h3 className="font-semibold text-sm mb-2">{item.name}</h3>
                  <p className="text-gray-600 text-xs mb-3 line-clamp-2">{item.description}</p>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-sm">₹{item.price.toFixed(2)}</span>
                      <span className="text-gray-400 line-through text-xs">₹{item.originalPrice.toFixed(2)}</span>
                    </div>
                    <div className="text-xs text-green-600 font-medium mb-1">Saved ₹{item.saved}</div>
                    {getItemQuantity(item.id) > 0 ? (
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleQuantityChange(item, -1)}
                          className="bg-gray-300 text-gray-700 w-6 h-6 rounded-full font-bold text-xs hover:bg-gray-400"
                        >
                          -
                        </button>
                        <span className="text-xs font-semibold">{getItemQuantity(item.id)}</span>
                        <button 
                          onClick={() => handleQuantityChange(item, 1)}
                          className="bg-orange-600 text-white w-6 h-6 rounded-full font-bold text-xs hover:bg-orange-700"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => handleAddToCart(item)}
                        className="bg-orange-600 text-white px-3 py-1.5 rounded-lg font-medium hover:bg-orange-700 text-xs"
                      >
                        Add
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-5 gap-4">
              {foodItems.slice(0, 1).map((item) => (
                <div key={`second-${item.id}`} className="bg-white rounded-lg shadow-sm border p-3">
                  <div className="relative">
                    <Image src={item.image} alt={item.name} width={200} height={140} className="w-full h-32 object-cover rounded-lg mb-3" />
                    <button className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-sm">
                      <FiHeart className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-yellow-500 text-xs">⭐</span>
                    <span className="text-xs text-gray-600">{item.rating}</span>
                    <span className="text-xs text-gray-400">• {item.unit}</span>
                  </div>
                  <h3 className="font-semibold text-sm mb-2">{item.name}</h3>
                  <p className="text-gray-600 text-xs mb-3 line-clamp-2">{item.description}</p>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-sm">₹{item.price.toFixed(2)}</span>
                      <span className="text-gray-400 line-through text-xs">₹{item.originalPrice.toFixed(2)}</span>
                    </div>
                    <div className="text-xs text-green-600 font-medium mb-1">Saved ₹{item.saved}</div>
                    <button 
                      onClick={() => handleAddToCart(item)}
                      className="bg-orange-600 text-white px-3 py-1.5 rounded-lg font-medium hover:bg-orange-700 text-xs"
                    >
                      Add
                    </button>
                  </div>
                </div>
              ))}
              {foodItems.slice(1, 5).map((item) => (
                <div key={`second-${item.id}`} className="bg-white rounded-lg shadow-sm border p-3">
                  <div className="relative">
                    <Image src={item.image} alt={item.name} width={200} height={140} className="w-full h-32 object-cover rounded-lg mb-3" />
                    <button className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-sm">
                      <FiHeart className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-yellow-500 text-xs">⭐</span>
                    <span className="text-xs text-gray-600">{item.rating}</span>
                    <span className="text-xs text-gray-400">• {item.unit}</span>
                  </div>
                  <h3 className="font-semibold text-sm mb-2">{item.name}</h3>
                  <p className="text-gray-600 text-xs mb-3 line-clamp-2">{item.description}</p>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-sm">₹{item.price.toFixed(2)}</span>
                      <span className="text-gray-400 line-through text-xs">₹{item.originalPrice.toFixed(2)}</span>
                    </div>
                    <div className="text-xs text-green-600 font-medium mb-1">Saved ₹{item.saved}</div>
                    {getItemQuantity(item.id) > 0 ? (
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleQuantityChange(item, -1)}
                          className="bg-gray-300 text-gray-700 w-6 h-6 rounded-full font-bold text-xs hover:bg-gray-400"
                        >
                          -
                        </button>
                        <span className="text-xs font-semibold">{getItemQuantity(item.id)}</span>
                        <button 
                          onClick={() => handleQuantityChange(item, 1)}
                          className="bg-orange-600 text-white w-6 h-6 rounded-full font-bold text-xs hover:bg-orange-700"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => handleAddToCart(item)}
                        className="bg-orange-600 text-white px-3 py-1.5 rounded-lg font-medium hover:bg-orange-700 text-xs"
                      >
                        Add
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile View - 2 horizontal scrolling rows */}
          <div className="md:hidden">
            {/* First Row */}
            <div className="overflow-x-auto mb-4">
              <div className="flex gap-2 pb-2" style={{width: 'max-content'}}>
                {foodItems.slice(0, 5).map((item) => (
                  <div key={item.id} className="bg-white rounded-lg shadow-sm border p-2 flex-shrink-0" style={{width: '130px'}}>
                    <div className="relative">
                      <Image src={item.image} alt={item.name} width={110} height={80} className="w-full h-20 object-cover rounded-lg mb-1" />
                      <button className="absolute top-1 right-1 w-6 h-6 bg-white rounded-full shadow-sm flex items-center justify-center">
                        <FiHeart className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="flex items-center gap-0.5 mb-1">
                      <span className="text-yellow-500" style={{fontSize: '10px'}}>⭐</span>
                      <span className="text-gray-600" style={{fontSize: '10px'}}>{item.rating}</span>
                      <span className="text-gray-400" style={{fontSize: '9px'}}>• {item.unit}</span>
                    </div>
                    <h3 className="font-semibold mb-1" style={{fontSize: '11px', lineHeight: '1.2'}}>{item.name}</h3>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1">
                        <span className="font-bold" style={{fontSize: '11px'}}>₹{item.price.toFixed(2)}</span>
                        <span className="text-gray-400 line-through" style={{fontSize: '9px'}}>₹{item.originalPrice.toFixed(2)}</span>
                      </div>
                      <div className="text-green-600 font-medium" style={{fontSize: '9px'}}>Saved ₹{item.saved}</div>
                      <button 
                        onClick={() => handleAddToCart(item)}
                        className="bg-orange-600 text-white px-2 py-1 rounded font-medium hover:bg-orange-700" style={{fontSize: '10px'}}
                      >
                        Add
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Second Row */}
            <div className="overflow-x-auto">
              <div className="flex gap-2 pb-2" style={{width: 'max-content'}}>
                {[foodItems[0], ...foodItems.slice(1, 5)].map((item, index) => (
                  <div key={`row2-${item.id}-${index}`} className="bg-white rounded-lg shadow-sm border p-2 flex-shrink-0" style={{width: '130px'}}>
                    <div className="relative">
                      <Image src={item.image} alt={item.name} width={110} height={80} className="w-full h-20 object-cover rounded-lg mb-1" />
                      <button className="absolute top-1 right-1 w-6 h-6 bg-white rounded-full shadow-sm flex items-center justify-center">
                        <FiHeart className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="flex items-center gap-0.5 mb-1">
                      <span className="text-yellow-500" style={{fontSize: '10px'}}>⭐</span>
                      <span className="text-gray-600" style={{fontSize: '10px'}}>{item.rating}</span>
                      <span className="text-gray-400" style={{fontSize: '9px'}}>• {item.unit}</span>
                    </div>
                    <h3 className="font-semibold mb-1" style={{fontSize: '11px', lineHeight: '1.2'}}>{item.name}</h3>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1">
                        <span className="font-bold" style={{fontSize: '11px'}}>₹{item.price.toFixed(2)}</span>
                        <span className="text-gray-400 line-through" style={{fontSize: '9px'}}>₹{item.originalPrice.toFixed(2)}</span>
                      </div>
                      <div className="text-green-600 font-medium" style={{fontSize: '9px'}}>Saved ₹{item.saved}</div>
                      <button 
                        onClick={() => handleAddToCart(item)}
                        className="bg-orange-600 text-white px-2 py-1 rounded font-medium hover:bg-orange-700" style={{fontSize: '10px'}}
                      >
                        Add
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="py-8 bg-gradient-to-r from-orange-400 to-yellow-400">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 text-center">Explore By Categories</h2>
          
          {/* Desktop View - 2 rows with 5 items each */}
          <div className="hidden md:block">
            <div className="grid grid-cols-5 gap-4 mb-4">
              {categories.slice(0, 5).map((category, index) => (
                <div key={index} className="bg-white rounded-lg p-4 text-center shadow-sm">
                  <div className="relative w-full h-16 mb-2">
                    <Image src={category.image} alt={category.name} fill className="object-cover rounded" />
                  </div>
                  <h3 className="text-xs md:text-sm font-semibold">
                    {category.name.split(' ').map((word, i) => (
                      <span key={i} className={i === 1 || i === 2 ? 'text-orange-600' : 'text-gray-800'}>
                        {word}{i < category.name.split(' ').length - 1 ? ' ' : ''}
                      </span>
                    ))}
                  </h3>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-5 gap-4">
              {categories.slice(5, 10).map((category, index) => (
                <div key={index + 5} className="bg-white rounded-lg p-4 text-center shadow-sm">
                  <div className="relative w-full h-16 mb-2">
                    <Image src={category.image} alt={category.name} fill className="object-cover rounded" />
                  </div>
                  <h3 className="text-xs md:text-sm font-semibold">
                    {category.name.split(' ').map((word, i) => (
                      <span key={i} className={i === 1 || i === 2 ? 'text-orange-600' : 'text-gray-800'}>
                        {word}{i < category.name.split(' ').length - 1 ? ' ' : ''}
                      </span>
                    ))}
                  </h3>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile View - 2 horizontal scrolling rows */}
          <div className="md:hidden">
            {/* First Row */}
            <div className="overflow-x-auto mb-4">
              <div className="flex gap-4 pb-2" style={{width: 'max-content'}}>
                {categories.slice(0, 5).map((category, index) => (
                  <div key={index} className="bg-white rounded-lg p-3 text-center shadow-sm flex-shrink-0" style={{width: '140px'}}>
                    <div className="relative w-full h-14 mb-2">
                      <Image src={category.image} alt={category.name} fill className="object-cover rounded" />
                    </div>
                    <h3 className="text-xs font-semibold">
                      {category.name.split(' ').map((word, i) => (
                        <span key={i} className={i === 1 || i === 2 ? 'text-orange-600' : 'text-gray-800'}>
                          {word}{i < category.name.split(' ').length - 1 ? ' ' : ''}
                        </span>
                      ))}
                    </h3>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Second Row */}
            <div className="overflow-x-auto">
              <div className="flex gap-4 pb-2" style={{width: 'max-content'}}>
                {categories.slice(5, 10).map((category, index) => (
                  <div key={index + 5} className="bg-white rounded-lg p-3 text-center shadow-sm flex-shrink-0" style={{width: '140px'}}>
                    <div className="relative w-full h-14 mb-2">
                      <Image src={category.image} alt={category.name} fill className="object-cover rounded" />
                    </div>
                    <h3 className="text-xs font-semibold">
                      {category.name.split(' ').map((word, i) => (
                        <span key={i} className={i === 1 || i === 2 ? 'text-orange-600' : 'text-gray-800'}>
                          {word}{i < category.name.split(' ').length - 1 ? ' ' : ''}
                        </span>
                      ))}
                    </h3>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Promotional Banners */}
      <div className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative rounded-2xl overflow-hidden h-64">
              <Image src="/Try It Today.webp" alt="Salad" fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent">
                <div className="absolute top-6 left-6">
                  <h3 className="text-xl md:text-2xl font-bold text-red-600 mb-4">
                    Wholesome Salads for<br />Every Craving
                  </h3>
                </div>
                <button className="absolute bottom-6 left-6 bg-green-800 text-white px-6 py-3 rounded-lg font-semibold">
                  Try It Today
                </button>
              </div>
            </div>
            <div className="relative rounded-2xl overflow-hidden h-64">
              <Image src="/Taste the Flavor.webp" alt="Paneer Curry" fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent">
                <div className="absolute top-6 left-6">
                  <h3 className="text-xl md:text-2xl font-bold text-purple-800 mb-4">
                    Indulge in the Rich Taste<br />of Paneer Curry
                  </h3>
                </div>
                <button className="absolute bottom-6 left-6 bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold">
                  Taste the Flavor
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* New Launched Section */}
      <div className="py-6">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">New Launched</h2>
            <span className="text-gray-400">→</span>
          </div>
          
          {/* Desktop View */}
          <div className="hidden md:grid md:grid-cols-7 gap-3">
            {[1,2,3,4,5,6,7].map((item) => (
              <div key={item} className="bg-white rounded-lg shadow-sm border p-2">
                <div className="relative w-full h-24 mb-2">
                  <Image src="/Veg Pulao.webp" alt="New Item" fill sizes="150px" className="object-cover rounded-lg" />
                  <button className="absolute top-1 right-1 p-1 bg-white rounded-full shadow-sm">
                    <FiHeart className="w-2 h-2" />
                  </button>
                </div>
                <div className="flex items-center gap-1 mb-1">
                  <span className="text-yellow-500 text-xs">⭐</span>
                  <span className="text-xs text-gray-600">4.5</span>
                  <span className="text-xs text-gray-400">• 1 Plate</span>
                </div>
                <h3 className="font-semibold text-xs mb-1">New Item {item}</h3>
                <div className="flex items-center gap-1 mb-1">
                  <span className="font-bold text-xs">₹180.00</span>
                  <span className="text-gray-400 line-through text-xs">₹220.00</span>
                </div>
                <div className="text-xs text-green-600 font-medium mb-1">Saved ₹40</div>
                {getItemQuantity(item) > 0 ? (
                  <div className="flex items-center gap-1 justify-center">
                    <button 
                      onClick={() => handleQuantityChange({id: item, name: `New Item ${item}`, price: 180, image: '/Veg Pulao.webp'}, -1)}
                      className="bg-gray-300 text-gray-700 w-5 h-5 rounded-full font-bold text-xs hover:bg-gray-400"
                    >
                      -
                    </button>
                    <span className="text-xs font-semibold">{getItemQuantity(item)}</span>
                    <button 
                      onClick={() => handleQuantityChange({id: item, name: `New Item ${item}`, price: 180, image: '/Veg Pulao.webp'}, 1)}
                      className="bg-orange-600 text-white w-5 h-5 rounded-full font-bold text-xs hover:bg-orange-700"
                    >
                      +
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => handleAddToCart({id: item, name: `New Item ${item}`, price: 180, image: '/Veg Pulao.webp'})}
                    className="bg-orange-600 text-white px-2 py-1 rounded font-medium hover:bg-orange-700 text-xs w-full"
                  >
                    Add
                  </button>
                )}
              </div>
            ))}
          </div>
          
          {/* Mobile View */}
          <div className="md:hidden overflow-x-auto">
            <div className="flex gap-3 pb-2" style={{width: 'max-content'}}>
              {[1,2,3,4,5,6,7].map((item) => (
                <div key={item} className="bg-white rounded-lg shadow-sm border p-2 flex-shrink-0" style={{width: '120px'}}>
                  <div className="relative w-full h-20 mb-1">
                    <Image src="/Veg Pulao.webp" alt="New Item" fill sizes="120px" className="object-cover rounded-lg" />
                    <button className="absolute top-1 right-1 w-5 h-5 bg-white rounded-full shadow-sm flex items-center justify-center">
                      <FiHeart className="w-2 h-2" />
                    </button>
                  </div>
                  <div className="flex items-center gap-0.5 mb-1">
                    <span className="text-yellow-500" style={{fontSize: '9px'}}>⭐</span>
                    <span className="text-gray-600" style={{fontSize: '9px'}}>4.5</span>
                    <span className="text-gray-400" style={{fontSize: '8px'}}>• 1 Plate</span>
                  </div>
                  <h3 className="font-semibold text-xs mb-1">New Item {item}</h3>
                  <div className="flex items-center gap-1 mb-1">
                    <span className="font-bold text-xs">₹180</span>
                    <span className="text-gray-400 line-through" style={{fontSize: '9px'}}>₹220</span>
                  </div>
                  <div className="text-green-600 font-medium" style={{fontSize: '8px'}}>Saved ₹40</div>
                  {getItemQuantity(item) > 0 ? (
                    <div className="flex items-center gap-1 justify-center">
                      <button 
                        onClick={() => handleQuantityChange({id: item, name: `New Item ${item}`, price: 180, image: '/Veg Pulao.webp'}, -1)}
                        className="bg-gray-300 text-gray-700 w-4 h-4 rounded-full font-bold" style={{fontSize: '8px'}}
                      >
                        -
                      </button>
                      <span className="font-semibold" style={{fontSize: '9px'}}>{getItemQuantity(item)}</span>
                      <button 
                        onClick={() => handleQuantityChange({id: item, name: `New Item ${item}`, price: 180, image: '/Veg Pulao.webp'}, 1)}
                        className="bg-orange-600 text-white w-4 h-4 rounded-full font-bold" style={{fontSize: '8px'}}
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => handleAddToCart({id: item, name: `New Item ${item}`, price: 180, image: '/Veg Pulao.webp'})}
                      className="bg-orange-600 text-white px-2 py-1 rounded font-medium hover:bg-orange-700 text-xs w-full"
                    >
                      Add
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Best Selling Section */}
      <div className="py-6">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">Best Selling</h2>
            <span className="text-gray-400">→</span>
          </div>
          
          {/* Desktop View */}
          <div className="hidden md:grid md:grid-cols-7 gap-3">
            {[1,2,3,4,5,6,7].map((item) => (
              <div key={item} className="bg-white rounded-lg shadow-sm border p-2">
                <div className="relative w-full h-24 mb-2">
                  <Image src="/Veg Schezwan Noodles.webp" alt="Best Seller" fill sizes="150px" className="object-cover rounded-lg" />
                  <button className="absolute top-1 right-1 p-1 bg-white rounded-full shadow-sm">
                    <FiHeart className="w-2 h-2" />
                  </button>
                </div>
                <div className="flex items-center gap-1 mb-1">
                  <span className="text-yellow-500 text-xs">⭐</span>
                  <span className="text-xs text-gray-600">4.6</span>
                  <span className="text-xs text-gray-400">• 1 Plate</span>
                </div>
                <h3 className="font-semibold text-xs mb-1">Best Seller {item}</h3>
                <div className="flex items-center gap-1 mb-1">
                  <span className="font-bold text-xs">₹210.00</span>
                  <span className="text-gray-400 line-through text-xs">₹260.00</span>
                </div>
                <div className="text-xs text-green-600 font-medium mb-1">Saved ₹50</div>
                {getItemQuantity(item + 100) > 0 ? (
                  <div className="flex items-center gap-1 justify-center">
                    <button 
                      onClick={() => handleQuantityChange({id: item + 100, name: `Best Seller ${item}`, price: 210, image: '/Veg Schezwan Noodles.webp'}, -1)}
                      className="bg-gray-300 text-gray-700 w-5 h-5 rounded-full font-bold text-xs hover:bg-gray-400"
                    >
                      -
                    </button>
                    <span className="text-xs font-semibold">{getItemQuantity(item + 100)}</span>
                    <button 
                      onClick={() => handleQuantityChange({id: item + 100, name: `Best Seller ${item}`, price: 210, image: '/Veg Schezwan Noodles.webp'}, 1)}
                      className="bg-orange-600 text-white w-5 h-5 rounded-full font-bold text-xs hover:bg-orange-700"
                    >
                      +
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => handleAddToCart({id: item + 100, name: `Best Seller ${item}`, price: 210, image: '/Veg Schezwan Noodles.webp'})}
                    className="bg-orange-600 text-white px-2 py-1 rounded font-medium hover:bg-orange-700 text-xs w-full"
                  >
                    Add
                  </button>
                )}
              </div>
            ))}
          </div>
          
          {/* Mobile View */}
          <div className="md:hidden overflow-x-auto">
            <div className="flex gap-3 pb-2" style={{width: 'max-content'}}>
              {[1,2,3,4,5,6,7].map((item) => (
                <div key={item} className="bg-white rounded-lg shadow-sm border p-2 flex-shrink-0" style={{width: '120px'}}>
                  <div className="relative w-full h-20 mb-1">
                    <Image src="/Veg Schezwan Noodles.webp" alt="Best Seller" fill sizes="120px" className="object-cover rounded-lg" />
                    <button className="absolute top-1 right-1 w-5 h-5 bg-white rounded-full shadow-sm flex items-center justify-center">
                      <FiHeart className="w-2 h-2" />
                    </button>
                  </div>
                  <div className="flex items-center gap-0.5 mb-1">
                    <span className="text-yellow-500" style={{fontSize: '9px'}}>⭐</span>
                    <span className="text-gray-600" style={{fontSize: '9px'}}>4.6</span>
                    <span className="text-gray-400" style={{fontSize: '8px'}}>• 1 Plate</span>
                  </div>
                  <h3 className="font-semibold text-xs mb-1">Best Seller {item}</h3>
                  <div className="flex items-center gap-1 mb-1">
                    <span className="font-bold text-xs">₹210</span>
                    <span className="text-gray-400 line-through" style={{fontSize: '9px'}}>₹260</span>
                  </div>
                  <div className="text-green-600 font-medium" style={{fontSize: '8px'}}>Saved ₹50</div>
                  {getItemQuantity(item + 100) > 0 ? (
                    <div className="flex items-center gap-1 justify-center">
                      <button 
                        onClick={() => handleQuantityChange({id: item + 100, name: `Best Seller ${item}`, price: 210, image: '/Veg Schezwan Noodles.webp'}, -1)}
                        className="bg-gray-300 text-gray-700 w-4 h-4 rounded-full font-bold" style={{fontSize: '8px'}}
                      >
                        -
                      </button>
                      <span className="font-semibold" style={{fontSize: '9px'}}>{getItemQuantity(item + 100)}</span>
                      <button 
                        onClick={() => handleQuantityChange({id: item + 100, name: `Best Seller ${item}`, price: 210, image: '/Veg Schezwan Noodles.webp'}, 1)}
                        className="bg-orange-600 text-white w-4 h-4 rounded-full font-bold" style={{fontSize: '8px'}}
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => handleAddToCart({id: item + 100, name: `Best Seller ${item}`, price: 210, image: '/Veg Schezwan Noodles.webp'})}
                      className="bg-orange-600 text-white px-2 py-1 rounded font-medium hover:bg-orange-700 text-xs w-full"
                    >
                      Add
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Breakfast & Snacks Section */}
      <div className="py-6">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">Breakfast & Snacks</h2>
            <span className="text-gray-400">→</span>
          </div>
          
          {/* Desktop View */}
          <div className="hidden md:grid md:grid-cols-7 gap-3">
            {[1,2,3,4,5,6,7].map((item) => (
              <div key={item} className="bg-white rounded-lg shadow-sm border p-2">
                <div className="relative w-full h-24 mb-2">
                  <Image src="/Veg Seekh Kabab.webp" alt="Breakfast Item" fill sizes="150px" className="object-cover rounded-lg" />
                  <button className="absolute top-1 right-1 p-1 bg-white rounded-full shadow-sm">
                    <FiHeart className="w-2 h-2" />
                  </button>
                </div>
                <div className="flex items-center gap-1 mb-1">
                  <span className="text-yellow-500 text-xs">⭐</span>
                  <span className="text-xs text-gray-600">4.7</span>
                  <span className="text-xs text-gray-400">• 4 Pieces</span>
                </div>
                <h3 className="font-semibold text-xs mb-1">Breakfast {item}</h3>
                <div className="flex items-center gap-1 mb-1">
                  <span className="font-bold text-xs">₹185.00</span>
                  <span className="text-gray-400 line-through text-xs">₹220.00</span>
                </div>
                <div className="text-xs text-green-600 font-medium mb-1">Saved ₹35</div>
                {getItemQuantity(item + 300) > 0 ? (
                  <div className="flex items-center gap-1 justify-center">
                    <button 
                      onClick={() => handleQuantityChange({id: item + 300, name: `Breakfast ${item}`, price: 185, image: '/Veg Seekh Kabab.webp'}, -1)}
                      className="bg-gray-300 text-gray-700 w-5 h-5 rounded-full font-bold text-xs hover:bg-gray-400"
                    >
                      -
                    </button>
                    <span className="text-xs font-semibold">{getItemQuantity(item + 300)}</span>
                    <button 
                      onClick={() => handleQuantityChange({id: item + 300, name: `Breakfast ${item}`, price: 185, image: '/Veg Seekh Kabab.webp'}, 1)}
                      className="bg-orange-600 text-white w-5 h-5 rounded-full font-bold text-xs hover:bg-orange-700"
                    >
                      +
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => handleAddToCart({id: item + 300, name: `Breakfast ${item}`, price: 185, image: '/Veg Seekh Kabab.webp'})}
                    className="bg-orange-600 text-white px-2 py-1 rounded font-medium hover:bg-orange-700 text-xs w-full"
                  >
                    Add
                  </button>
                )}
              </div>
            ))}
          </div>
          
          {/* Mobile View */}
          <div className="md:hidden overflow-x-auto">
            <div className="flex gap-3 pb-2" style={{width: 'max-content'}}>
              {[1,2,3,4,5,6,7].map((item) => (
                <div key={item} className="bg-white rounded-lg shadow-sm border p-2 flex-shrink-0" style={{width: '120px'}}>
                  <div className="relative w-full h-20 mb-1">
                    <Image src="/Veg Seekh Kabab.webp" alt="Breakfast Item" fill sizes="120px" className="object-cover rounded-lg" />
                    <button className="absolute top-1 right-1 w-5 h-5 bg-white rounded-full shadow-sm flex items-center justify-center">
                      <FiHeart className="w-2 h-2" />
                    </button>
                  </div>
                  <div className="flex items-center gap-0.5 mb-1">
                    <span className="text-yellow-500" style={{fontSize: '9px'}}>⭐</span>
                    <span className="text-gray-600" style={{fontSize: '9px'}}>4.7</span>
                    <span className="text-gray-400" style={{fontSize: '8px'}}>• 4 Pieces</span>
                  </div>
                  <h3 className="font-semibold text-xs mb-1">Breakfast {item}</h3>
                  <div className="flex items-center gap-1 mb-1">
                    <span className="font-bold text-xs">₹185</span>
                    <span className="text-gray-400 line-through" style={{fontSize: '9px'}}>₹220</span>
                  </div>
                  <div className="text-green-600 font-medium" style={{fontSize: '8px'}}>Saved ₹35</div>
                  {getItemQuantity(item + 300) > 0 ? (
                    <div className="flex items-center gap-1 justify-center">
                      <button 
                        onClick={() => handleQuantityChange({id: item + 300, name: `Breakfast ${item}`, price: 185, image: '/Veg Seekh Kabab.webp'}, -1)}
                        className="bg-gray-300 text-gray-700 w-4 h-4 rounded-full font-bold" style={{fontSize: '8px'}}
                      >
                        -
                      </button>
                      <span className="font-semibold" style={{fontSize: '9px'}}>{getItemQuantity(item + 300)}</span>
                      <button 
                        onClick={() => handleQuantityChange({id: item + 300, name: `Breakfast ${item}`, price: 185, image: '/Veg Seekh Kabab.webp'}, 1)}
                        className="bg-orange-600 text-white w-4 h-4 rounded-full font-bold" style={{fontSize: '8px'}}
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => handleAddToCart({id: item + 300, name: `Breakfast ${item}`, price: 185, image: '/Veg Seekh Kabab.webp'})}
                      className="bg-orange-600 text-white px-2 py-1 rounded font-medium hover:bg-orange-700 text-xs w-full"
                    >
                      Add
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
          
        </div>
      </div>

    
         {/* Chai, Coffee & Beverages Section */}
      <div className="py-6">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">Chai, Coffee & Beverages</h2>
            <span className="text-gray-400">→</span>
          </div>
          <div className="hidden md:grid md:grid-cols-7 gap-3">
            {[1,2,3,4,5,6,7].map((item) => (
              <div key={item} className="bg-white rounded-lg shadow-sm border p-2">
                <div className="relative w-full h-24 mb-2">
                  <Image src="/Veg Sweet Corn Soup.webp" alt="Beverage" fill sizes="150px" className="object-cover rounded-lg" />
                  <button className="absolute top-1 right-1 p-1 bg-white rounded-full shadow-sm">
                    <FiHeart className="w-2 h-2" />
                  </button>
                </div>
                <div className="flex items-center gap-1 mb-1">
                  <span className="text-yellow-500 text-xs">⭐</span>
                  <span className="text-xs text-gray-600">4.2</span>
                  <span className="text-xs text-gray-400">• 1 Bowl</span>
                </div>
                <h3 className="font-semibold text-xs mb-1">Beverage {item}</h3>
                <div className="flex items-center gap-1 mb-1">
                  <span className="font-bold text-xs">₹125.00</span>
                  <span className="text-gray-400 line-through text-xs">₹150.00</span>
                </div>
                <div className="text-xs text-green-600 font-medium mb-1">Saved ₹25</div>
                {getItemQuantity(item + 400) > 0 ? (
                  <div className="flex items-center gap-1 justify-center">
                    <button 
                      onClick={() => handleQuantityChange({id: item + 400, name: `Beverage ${item}`, price: 125, image: '/Veg Sweet Corn Soup.webp'}, -1)}
                      className="bg-gray-300 text-gray-700 w-5 h-5 rounded-full font-bold text-xs hover:bg-gray-400"
                    >
                      -
                    </button>
                    <span className="text-xs font-semibold">{getItemQuantity(item + 400)}</span>
                    <button 
                      onClick={() => handleQuantityChange({id: item + 400, name: `Beverage ${item}`, price: 125, image: '/Veg Sweet Corn Soup.webp'}, 1)}
                      className="bg-orange-600 text-white w-5 h-5 rounded-full font-bold text-xs hover:bg-orange-700"
                    >
                      +
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => handleAddToCart({id: item + 400, name: `Beverage ${item}`, price: 125, image: '/Veg Sweet Corn Soup.webp'})}
                    className="bg-orange-600 text-white px-2 py-1 rounded font-medium hover:bg-orange-700 text-xs w-full"
                  >
                    Add
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className="md:hidden overflow-x-auto">
            <div className="flex gap-3 pb-2" style={{width: 'max-content'}}>
              {[1,2,3,4,5,6,7].map((item) => (
                <div key={item} className="bg-white rounded-lg shadow-sm border p-2 flex-shrink-0" style={{width: '120px'}}>
                  <div className="relative w-full h-20 mb-1">
                    <Image src="/Veg Sweet Corn Soup.webp" alt="Beverage" fill sizes="120px" className="object-cover rounded-lg" />
                    <button className="absolute top-1 right-1 w-5 h-5 bg-white rounded-full shadow-sm flex items-center justify-center">
                      <FiHeart className="w-2 h-2" />
                    </button>
                  </div>
                  <div className="flex items-center gap-0.5 mb-1">
                    <span className="text-yellow-500" style={{fontSize: '9px'}}>⭐</span>
                    <span className="text-gray-600" style={{fontSize: '9px'}}>4.2</span>
                    <span className="text-gray-400" style={{fontSize: '8px'}}>• 1 Bowl</span>
                  </div>
                  <h3 className="font-semibold text-xs mb-1">Beverage {item}</h3>
                  <div className="flex items-center gap-1 mb-1">
                    <span className="font-bold text-xs">₹125</span>
                    <span className="text-gray-400 line-through" style={{fontSize: '9px'}}>₹150</span>
                  </div>
                  <div className="text-green-600 font-medium" style={{fontSize: '8px'}}>Saved ₹25</div>
                  {getItemQuantity(item + 400) > 0 ? (
                    <div className="flex items-center gap-1 justify-center">
                      <button 
                        onClick={() => handleQuantityChange({id: item + 400, name: `Beverage ${item}`, price: 125, image: '/Veg Sweet Corn Soup.webp'}, -1)}
                        className="bg-gray-300 text-gray-700 w-4 h-4 rounded-full font-bold" style={{fontSize: '8px'}}
                      >
                        -
                      </button>
                      <span className="font-semibold" style={{fontSize: '9px'}}>{getItemQuantity(item + 400)}</span>
                      <button 
                        onClick={() => handleQuantityChange({id: item + 400, name: `Beverage ${item}`, price: 125, image: '/Veg Sweet Corn Soup.webp'}, 1)}
                        className="bg-orange-600 text-white w-4 h-4 rounded-full font-bold" style={{fontSize: '8px'}}
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => handleAddToCart({id: item + 400, name: `Beverage ${item}`, price: 125, image: '/Veg Sweet Corn Soup.webp'})}
                      className="bg-orange-600 text-white px-2 py-1 rounded font-medium hover:bg-orange-700 text-xs w-full"
                    >
                      Add
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Meal Section */}
      <div className="py-6">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">Meal</h2>
            <span className="text-gray-400">→</span>
          </div>
          <div className="hidden md:grid md:grid-cols-7 gap-3">
            {[1,2,3,4,5,6,7].map((item) => (
              <div key={item} className="bg-white rounded-lg shadow-sm border p-2">
                <div className="relative w-full h-24 mb-2">
                  <Image src="/Veg Singapoor Fried Rice.webp" alt="Meal" fill sizes="150px" className="object-cover rounded-lg" />
                  <button className="absolute top-1 right-1 p-1 bg-white rounded-full shadow-sm">
                    <FiHeart className="w-2 h-2" />
                  </button>
                </div>
                <div className="flex items-center gap-1 mb-1">
                  <span className="text-yellow-500 text-xs">⭐</span>
                  <span className="text-xs text-gray-600">4.3</span>
                  <span className="text-xs text-gray-400">• 1 Plate</span>
                </div>
                <h3 className="font-semibold text-xs mb-1">Meal {item}</h3>
                <div className="flex items-center gap-1 mb-1">
                  <span className="font-bold text-xs">₹210.00</span>
                  <span className="text-gray-400 line-through text-xs">₹280.00</span>
                </div>
                <div className="text-xs text-green-600 font-medium mb-1">Saved ₹70</div>
                {getItemQuantity(item + 500) > 0 ? (
                  <div className="flex items-center gap-1 justify-center">
                    <button 
                      onClick={() => handleQuantityChange({id: item + 500, name: `Meal ${item}`, price: 210, image: '/Veg Singapoor Fried Rice.webp'}, -1)}
                      className="bg-gray-300 text-gray-700 w-5 h-5 rounded-full font-bold text-xs hover:bg-gray-400"
                    >
                      -
                    </button>
                    <span className="text-xs font-semibold">{getItemQuantity(item + 500)}</span>
                    <button 
                      onClick={() => handleQuantityChange({id: item + 500, name: `Meal ${item}`, price: 210, image: '/Veg Singapoor Fried Rice.webp'}, 1)}
                      className="bg-orange-600 text-white w-5 h-5 rounded-full font-bold text-xs hover:bg-orange-700"
                    >
                      +
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => handleAddToCart({id: item + 500, name: `Meal ${item}`, price: 210, image: '/Veg Singapoor Fried Rice.webp'})}
                    className="bg-orange-600 text-white px-2 py-1 rounded font-medium hover:bg-orange-700 text-xs w-full"
                  >
                    Add
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className="md:hidden overflow-x-auto">
            <div className="flex gap-3 pb-2" style={{width: 'max-content'}}>
              {[1,2,3,4,5,6,7].map((item) => (
                <div key={item} className="bg-white rounded-lg shadow-sm border p-2 flex-shrink-0" style={{width: '120px'}}>
                  <div className="relative w-full h-20 mb-1">
                    <Image src="/Veg Singapoor Fried Rice.webp" alt="Meal" fill sizes="120px" className="object-cover rounded-lg" />
                    <button className="absolute top-1 right-1 w-5 h-5 bg-white rounded-full shadow-sm flex items-center justify-center">
                      <FiHeart className="w-2 h-2" />
                    </button>
                  </div>
                  <div className="flex items-center gap-0.5 mb-1">
                    <span className="text-yellow-500" style={{fontSize: '9px'}}>⭐</span>
                    <span className="text-gray-600" style={{fontSize: '9px'}}>4.3</span>
                    <span className="text-gray-400" style={{fontSize: '8px'}}>• 1 Plate</span>
                  </div>
                  <h3 className="font-semibold text-xs mb-1">Meal {item}</h3>
                  <div className="flex items-center gap-1 mb-1">
                    <span className="font-bold text-xs">₹210</span>
                    <span className="text-gray-400 line-through" style={{fontSize: '9px'}}>₹280</span>
                  </div>
                  <div className="text-green-600 font-medium" style={{fontSize: '8px'}}>Saved ₹70</div>
                  {getItemQuantity(item + 500) > 0 ? (
                    <div className="flex items-center gap-1 justify-center">
                      <button 
                        onClick={() => handleQuantityChange({id: item + 500, name: `Meal ${item}`, price: 210, image: '/Veg Singapoor Fried Rice.webp'}, -1)}
                        className="bg-gray-300 text-gray-700 w-4 h-4 rounded-full font-bold" style={{fontSize: '8px'}}
                      >
                        -
                      </button>
                      <span className="font-semibold" style={{fontSize: '9px'}}>{getItemQuantity(item + 500)}</span>
                      <button 
                        onClick={() => handleQuantityChange({id: item + 500, name: `Meal ${item}`, price: 210, image: '/Veg Singapoor Fried Rice.webp'}, 1)}
                        className="bg-orange-600 text-white w-4 h-4 rounded-full font-bold" style={{fontSize: '8px'}}
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => handleAddToCart({id: item + 500, name: `Meal ${item}`, price: 210, image: '/Veg Singapoor Fried Rice.webp'})}
                      className="bg-orange-600 text-white px-2 py-1 rounded font-medium hover:bg-orange-700 text-xs w-full"
                    >
                      Add
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 99 Bazar Section */}
      <div className="py-6">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">99 Bazar</h2>
            <span className="text-gray-400">→</span>
          </div>
          <div className="hidden md:grid md:grid-cols-7 gap-3">
            {[1,2,3,4,5,6,7].map((item) => (
              <div key={item} className="bg-white rounded-lg shadow-sm border p-2">
                <div className="relative w-full h-24 mb-2">
                  <Image src="/veg makhanwala.webp" alt="99 Bazar" fill sizes="150px" className="object-cover rounded-lg" />
                  <button className="absolute top-1 right-1 p-1 bg-white rounded-full shadow-sm">
                    <FiHeart className="w-2 h-2" />
                  </button>
                </div>
                <div className="flex items-center gap-1 mb-1">
                  <span className="text-yellow-500 text-xs">⭐</span>
                  <span className="text-xs text-gray-600">4.4</span>
                  <span className="text-xs text-gray-400">• 1 Bowl</span>
                </div>
                <h3 className="font-semibold text-xs mb-1">Bazar {item}</h3>
                <div className="flex items-center gap-1 mb-1">
                  <span className="font-bold text-xs">₹99.00</span>
                  <span className="text-gray-400 line-through text-xs">₹139.00</span>
                </div>
                <div className="text-xs text-green-600 font-medium mb-1">Saved ₹40</div>
                {getItemQuantity(item + 600) > 0 ? (
                  <div className="flex items-center gap-1 justify-center">
                    <button 
                      onClick={() => handleQuantityChange({id: item + 600, name: `Bazar ${item}`, price: 99, image: '/veg makhanwala.webp'}, -1)}
                      className="bg-gray-300 text-gray-700 w-5 h-5 rounded-full font-bold text-xs hover:bg-gray-400"
                    >
                      -
                    </button>
                    <span className="text-xs font-semibold">{getItemQuantity(item + 600)}</span>
                    <button 
                      onClick={() => handleQuantityChange({id: item + 600, name: `Bazar ${item}`, price: 99, image: '/veg makhanwala.webp'}, 1)}
                      className="bg-orange-600 text-white w-5 h-5 rounded-full font-bold text-xs hover:bg-orange-700"
                    >
                      +
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => handleAddToCart({id: item + 600, name: `Bazar ${item}`, price: 99, image: '/veg makhanwala.webp'})}
                    className="bg-orange-600 text-white px-2 py-1 rounded font-medium hover:bg-orange-700 text-xs w-full"
                  >
                    Add
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className="md:hidden overflow-x-auto">
            <div className="flex gap-3 pb-2" style={{width: 'max-content'}}>
              {[1,2,3,4,5,6,7].map((item) => (
                <div key={item} className="bg-white rounded-lg shadow-sm border p-2 flex-shrink-0" style={{width: '120px'}}>
                  <div className="relative w-full h-20 mb-1">
                    <Image src="/veg makhanwala.webp" alt="99 Bazar" fill sizes="120px" className="object-cover rounded-lg" />
                    <button className="absolute top-1 right-1 w-5 h-5 bg-white rounded-full shadow-sm flex items-center justify-center">
                      <FiHeart className="w-2 h-2" />
                    </button>
                  </div>
                  <div className="flex items-center gap-0.5 mb-1">
                    <span className="text-yellow-500" style={{fontSize: '9px'}}>⭐</span>
                    <span className="text-gray-600" style={{fontSize: '9px'}}>4.4</span>
                    <span className="text-gray-400" style={{fontSize: '8px'}}>• 1 Bowl</span>
                  </div>
                  <h3 className="font-semibold text-xs mb-1">Bazar {item}</h3>
                  <div className="flex items-center gap-1 mb-1">
                    <span className="font-bold text-xs">₹99</span>
                    <span className="text-gray-400 line-through" style={{fontSize: '9px'}}>₹139</span>
                  </div>
                  <div className="text-green-600 font-medium" style={{fontSize: '8px'}}>Saved ₹40</div>
                  {getItemQuantity(item + 600) > 0 ? (
                    <div className="flex items-center gap-1 justify-center">
                      <button 
                        onClick={() => handleQuantityChange({id: item + 600, name: `Bazar ${item}`, price: 99, image: '/veg makhanwala.webp'}, -1)}
                        className="bg-gray-300 text-gray-700 w-4 h-4 rounded-full font-bold" style={{fontSize: '8px'}}
                      >
                        -
                      </button>
                      <span className="font-semibold" style={{fontSize: '9px'}}>{getItemQuantity(item + 600)}</span>
                      <button 
                        onClick={() => handleQuantityChange({id: item + 600, name: `Bazar ${item}`, price: 99, image: '/veg makhanwala.webp'}, 1)}
                        className="bg-orange-600 text-white w-4 h-4 rounded-full font-bold" style={{fontSize: '8px'}}
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => handleAddToCart({id: item + 600, name: `Bazar ${item}`, price: 99, image: '/veg makhanwala.webp'})}
                      className="bg-orange-600 text-white px-2 py-1 rounded font-medium hover:bg-orange-700 text-xs w-full"
                    >
                      Add
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Deserts Section */}
      <div className="py-6">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">Deserts</h2>
            <span className="text-gray-400">→</span>
          </div>
          <div className="hidden md:grid md:grid-cols-7 gap-3">
            {[1,2,3,4,5,6,7].map((item) => (
              <div key={item} className="bg-white rounded-lg shadow-sm border p-2">
                <div className="relative w-full h-24 mb-2">
                  <Image src="/Blueberry Ice Creams.webp" alt="Desert" fill sizes="150px" className="object-cover rounded-lg" />
                  <button className="absolute top-1 right-1 p-1 bg-white rounded-full shadow-sm">
                    <FiHeart className="w-2 h-2" />
                  </button>
                </div>
                <div className="flex items-center gap-1 mb-1">
                  <span className="text-yellow-500 text-xs">⭐</span>
                  <span className="text-xs text-gray-600">4.8</span>
                  <span className="text-xs text-gray-400">• 1 Cup</span>
                </div>
                <h3 className="font-semibold text-xs mb-1">Desert {item}</h3>
                <div className="flex items-center gap-1 mb-1">
                  <span className="font-bold text-xs">₹150.00</span>
                  <span className="text-gray-400 line-through text-xs">₹200.00</span>
                </div>
                <div className="text-xs text-green-600 font-medium mb-1">Saved ₹50</div>
                {getItemQuantity(item + 700) > 0 ? (
                  <div className="flex items-center gap-1 justify-center">
                    <button 
                      onClick={() => handleQuantityChange({id: item + 700, name: `Desert ${item}`, price: 150, image: '/Blueberry Ice Creams.webp'}, -1)}
                      className="bg-gray-300 text-gray-700 w-5 h-5 rounded-full font-bold text-xs hover:bg-gray-400"
                    >
                      -
                    </button>
                    <span className="text-xs font-semibold">{getItemQuantity(item + 700)}</span>
                    <button 
                      onClick={() => handleQuantityChange({id: item + 700, name: `Desert ${item}`, price: 150, image: '/Blueberry Ice Creams.webp'}, 1)}
                      className="bg-orange-600 text-white w-5 h-5 rounded-full font-bold text-xs hover:bg-orange-700"
                    >
                      +
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => handleAddToCart({id: item + 700, name: `Desert ${item}`, price: 150, image: '/Blueberry Ice Creams.webp'})}
                    className="bg-orange-600 text-white px-2 py-1 rounded font-medium hover:bg-orange-700 text-xs w-full"
                  >
                    Add
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className="md:hidden overflow-x-auto">
            <div className="flex gap-3 pb-2" style={{width: 'max-content'}}>
              {[1,2,3,4,5,6,7].map((item) => (
                <div key={item} className="bg-white rounded-lg shadow-sm border p-2 flex-shrink-0" style={{width: '120px'}}>
                  <div className="relative w-full h-20 mb-1">
                    <Image src="/Blueberry Ice Creams.webp" alt="Desert" fill sizes="120px" className="object-cover rounded-lg" />
                    <button className="absolute top-1 right-1 w-5 h-5 bg-white rounded-full shadow-sm flex items-center justify-center">
                      <FiHeart className="w-2 h-2" />
                    </button>
                  </div>
                  <div className="flex items-center gap-0.5 mb-1">
                    <span className="text-yellow-500" style={{fontSize: '9px'}}>⭐</span>
                    <span className="text-gray-600" style={{fontSize: '9px'}}>4.8</span>
                    <span className="text-gray-400" style={{fontSize: '8px'}}>• 1 Cup</span>
                  </div>
                  <h3 className="font-semibold text-xs mb-1">Desert {item}</h3>
                  <div className="flex items-center gap-1 mb-1">
                    <span className="font-bold text-xs">₹150</span>
                    <span className="text-gray-400 line-through" style={{fontSize: '9px'}}>₹200</span>
                  </div>
                  <div className="text-green-600 font-medium" style={{fontSize: '8px'}}>Saved ₹50</div>
                  {getItemQuantity(item + 700) > 0 ? (
                    <div className="flex items-center gap-1 justify-center">
                      <button 
                        onClick={() => handleQuantityChange({id: item + 700, name: `Desert ${item}`, price: 150, image: '/Blueberry Ice Creams.webp'}, -1)}
                        className="bg-gray-300 text-gray-700 w-4 h-4 rounded-full font-bold" style={{fontSize: '8px'}}
                      >
                        -
                      </button>
                      <span className="font-semibold" style={{fontSize: '9px'}}>{getItemQuantity(item + 700)}</span>
                      <button 
                        onClick={() => handleQuantityChange({id: item + 700, name: `Desert ${item}`, price: 150, image: '/Blueberry Ice Creams.webp'}, 1)}
                        className="bg-orange-600 text-white w-4 h-4 rounded-full font-bold" style={{fontSize: '8px'}}
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => handleAddToCart({id: item + 700, name: `Desert ${item}`, price: 150, image: '/Blueberry Ice Creams.webp'})}
                      className="bg-orange-600 text-white px-2 py-1 rounded font-medium hover:bg-orange-700 text-xs w-full"
                    >
                      Add
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Low Calorie Diet Section */}
      <div className="py-6">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">Low Calorie Diet</h2>
            <span className="text-gray-400">→</span>
          </div>
          <div className="hidden md:grid md:grid-cols-7 gap-3">
            {[1,2,3,4,5,6,7].map((item) => (
              <div key={item} className="bg-white rounded-lg shadow-sm border p-2">
                <div className="relative w-full h-24 mb-2">
                  <Image src="/Veg Pulao.webp" alt="Diet Item" fill sizes="150px" className="object-cover rounded-lg" />
                  <button className="absolute top-1 right-1 p-1 bg-white rounded-full shadow-sm">
                    <FiHeart className="w-2 h-2" />
                  </button>
                </div>
                <div className="flex items-center gap-1 mb-1">
                  <span className="text-yellow-500 text-xs">⭐</span>
                  <span className="text-xs text-gray-600">4.1</span>
                  <span className="text-xs text-gray-400">• 1 Bowl</span>
                </div>
                <h3 className="font-semibold text-xs mb-1">Diet {item}</h3>
                <div className="flex items-center gap-1 mb-1">
                  <span className="font-bold text-xs">₹120.00</span>
                  <span className="text-gray-400 line-through text-xs">₹160.00</span>
                </div>
                <div className="text-xs text-green-600 font-medium mb-1">Saved ₹40</div>
                {getItemQuantity(item + 800) > 0 ? (
                  <div className="flex items-center gap-1 justify-center">
                    <button 
                      onClick={() => handleQuantityChange({id: item + 800, name: `Diet ${item}`, price: 120, image: '/Veg Pulao.webp'}, -1)}
                      className="bg-gray-300 text-gray-700 w-5 h-5 rounded-full font-bold text-xs hover:bg-gray-400"
                    >
                      -
                    </button>
                    <span className="text-xs font-semibold">{getItemQuantity(item + 800)}</span>
                    <button 
                      onClick={() => handleQuantityChange({id: item + 800, name: `Diet ${item}`, price: 120, image: '/Veg Pulao.webp'}, 1)}
                      className="bg-orange-600 text-white w-5 h-5 rounded-full font-bold text-xs hover:bg-orange-700"
                    >
                      +
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => handleAddToCart({id: item + 800, name: `Diet ${item}`, price: 120, image: '/Veg Pulao.webp'})}
                    className="bg-orange-600 text-white px-2 py-1 rounded font-medium hover:bg-orange-700 text-xs w-full"
                  >
                    Add
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className="md:hidden overflow-x-auto">
            <div className="flex gap-3 pb-2" style={{width: 'max-content'}}>
              {[1,2,3,4,5,6,7].map((item) => (
                <div key={item} className="bg-white rounded-lg shadow-sm border p-2 flex-shrink-0" style={{width: '120px'}}>
                  <div className="relative w-full h-20 mb-1">
                    <Image src="/Veg Pulao.webp" alt="Diet Item" fill sizes="120px" className="object-cover rounded-lg" />
                    <button className="absolute top-1 right-1 w-5 h-5 bg-white rounded-full shadow-sm flex items-center justify-center">
                      <FiHeart className="w-2 h-2" />
                    </button>
                  </div>
                  <div className="flex items-center gap-0.5 mb-1">
                    <span className="text-yellow-500" style={{fontSize: '9px'}}>⭐</span>
                    <span className="text-gray-600" style={{fontSize: '9px'}}>4.1</span>
                    <span className="text-gray-400" style={{fontSize: '8px'}}>• 1 Bowl</span>
                  </div>
                  <h3 className="font-semibold text-xs mb-1">Diet {item}</h3>
                  <div className="flex items-center gap-1 mb-1">
                    <span className="font-bold text-xs">₹120</span>
                    <span className="text-gray-400 line-through" style={{fontSize: '9px'}}>₹160</span>
                  </div>
                  <div className="text-green-600 font-medium" style={{fontSize: '8px'}}>Saved ₹40</div>
                  {getItemQuantity(item + 800) > 0 ? (
                    <div className="flex items-center gap-1 justify-center">
                      <button 
                        onClick={() => handleQuantityChange({id: item + 800, name: `Diet ${item}`, price: 120, image: '/Veg Pulao.webp'}, -1)}
                        className="bg-gray-300 text-gray-700 w-4 h-4 rounded-full font-bold" style={{fontSize: '8px'}}
                      >
                        -
                      </button>
                      <span className="font-semibold" style={{fontSize: '9px'}}>{getItemQuantity(item + 800)}</span>
                      <button 
                        onClick={() => handleQuantityChange({id: item + 800, name: `Diet ${item}`, price: 120, image: '/Veg Pulao.webp'}, 1)}
                        className="bg-orange-600 text-white w-4 h-4 rounded-full font-bold" style={{fontSize: '8px'}}
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => handleAddToCart({id: item + 800, name: `Diet ${item}`, price: 120, image: '/Veg Pulao.webp'})}
                      className="bg-orange-600 text-white px-2 py-1 rounded font-medium hover:bg-orange-700 text-xs w-full"
                    >
                      Add
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
         
           {/* Additional Two Banners */}
      <div className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative rounded-2xl overflow-hidden h-64">
              <Image src="/Order Fresh Now.webp" alt="Fresh Ingredients" fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent">
                <div className="absolute top-6 left-6">
                  <h3 className="text-xl md:text-2xl font-bold text-orange-600 mb-4">
                    Fresh Ingredients<br />Every Day
                  </h3>
                </div>
                <button className="absolute bottom-6 left-6 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold">
                  Order Fresh
                </button>
              </div>
            </div>
            <div className="relative rounded-2xl overflow-hidden h-64">
              <Image src="/Veg Pulao.webp" alt="Special Offers" fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent">
                <div className="absolute top-6 left-6">
                  <h3 className="text-xl md:text-2xl font-bold text-green-600 mb-4">
                    Special Offers<br />Limited Time
                  </h3>
                </div>
                <button className="absolute bottom-6 left-6 bg-red-600 text-white px-6 py-3 rounded-lg font-semibold">
                  Grab Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-bounce">
          <div className="flex items-center gap-2">
            <span className="text-lg">✓</span>
            <span className="font-medium">{addedItemName} added to cart!</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default EatoPage;