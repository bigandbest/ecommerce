import Image from "next/image";

export default function EventElevate() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 xl:px-12 py-6 sm:py-8">
      <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-6 sm:mb-8 text-center">
        Event Elevate
      </h2>

      <div className="max-w-6xl mx-auto">
        {/* Mobile: Single column, Tablet+: 2 columns, Desktop: 3 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 h-auto sm:h-64 md:h-72 lg:h-80">
          {/* Left side - Featured card */}
          <div className="bg-gradient-to-br from-purple-400 to-orange-400 rounded-lg sm:rounded-xl overflow-hidden relative shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] sm:col-span-1 lg:col-span-1">
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div className="text-center">
                {/* Simplified mobile design */}
                <div className="flex justify-center space-x-1 sm:space-x-2 mb-3 sm:mb-4">
                  <div className="w-1.5 h-12 sm:w-2 sm:h-16 bg-red-500 rounded-full"></div>
                  <div className="w-1.5 h-12 sm:w-2 sm:h-16 bg-orange-500 rounded-full"></div>
                  <div className="w-1.5 h-12 sm:w-2 sm:h-16 bg-yellow-500 rounded-full"></div>
                  <div className="w-1.5 h-12 sm:w-2 sm:h-16 bg-green-500 rounded-full"></div>
                  <div className="w-1.5 h-12 sm:w-2 sm:h-16 bg-blue-500 rounded-full"></div>
                  <div className="w-1.5 h-12 sm:w-2 sm:h-16 bg-purple-500 rounded-full"></div>
                </div>
                <h3 className="text-white font-bold text-sm sm:text-base mb-1">
                  Premium Collection
                </h3>
                <p className="text-white/90 text-xs sm:text-sm">
                  Exclusive Event Supplies
                </p>
                <div className="mt-2 sm:mt-3">
                  <span className="bg-white/20 text-white px-2 py-1 rounded-full text-xs font-medium">
                    Featured
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Grid of smaller cards */}
          <div className="sm:col-span-1 lg:col-span-2 grid grid-cols-2 gap-2 sm:gap-3">
            {/* Card 1 */}
            <div className="bg-gradient-to-br from-pink-400 to-purple-500 rounded-lg sm:rounded-xl p-3 sm:p-4 flex flex-col justify-between relative overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] cursor-pointer">
              <div className="absolute right-1.5 top-1.5 sm:right-2 sm:top-2">
                <div className="flex space-x-0.5 sm:space-x-1">
                  <div className="w-0.5 h-8 sm:w-1 sm:h-12 bg-green-600 rounded-full"></div>
                  <div className="w-0.5 h-8 sm:w-1 sm:h-12 bg-blue-600 rounded-full"></div>
                  <div className="w-0.5 h-8 sm:w-1 sm:h-12 bg-red-600 rounded-full"></div>
                </div>
              </div>
              <div>
                <h3 className="text-white font-bold text-xs sm:text-sm mb-1">
                  Art Supplies
                </h3>
                <p className="text-white/90 text-xs">Creative Tools</p>
                <div className="mt-1 sm:mt-2">
                  <span className="bg-blue-600 text-white px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-xs font-medium">
                    New
                  </span>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-gradient-to-br from-orange-400 to-red-500 rounded-lg sm:rounded-xl p-3 sm:p-4 flex flex-col justify-between relative overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] cursor-pointer">
              <div className="absolute right-1.5 top-1.5 sm:right-2 sm:top-2">
                <div className="flex space-x-0.5 sm:space-x-1">
                  <div className="w-0.5 h-8 sm:w-1 sm:h-12 bg-green-600 rounded-full"></div>
                  <div className="w-0.5 h-8 sm:w-1 sm:h-12 bg-blue-600 rounded-full"></div>
                  <div className="w-0.5 h-8 sm:w-1 sm:h-12 bg-red-600 rounded-full"></div>
                </div>
              </div>
              <div>
                <h3 className="text-white font-bold text-xs sm:text-sm mb-1">
                  Party Decor
                </h3>
                <p className="text-white/90 text-xs">Event Essentials</p>
                <div className="mt-1 sm:mt-2">
                  <span className="bg-blue-600 text-white px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-xs font-medium">
                    Hot
                  </span>
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-gradient-to-br from-green-400 to-teal-500 rounded-lg sm:rounded-xl p-3 sm:p-4 flex flex-col justify-between relative overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] cursor-pointer">
              <div className="absolute right-1.5 top-1.5 sm:right-2 sm:top-2">
                <div className="flex space-x-0.5 sm:space-x-1">
                  <div className="w-0.5 h-8 sm:w-1 sm:h-12 bg-green-600 rounded-full"></div>
                  <div className="w-0.5 h-8 sm:w-1 sm:h-12 bg-blue-600 rounded-full"></div>
                  <div className="w-0.5 h-8 sm:w-1 sm:h-12 bg-red-600 rounded-full"></div>
                </div>
              </div>
              <div>
                <h3 className="text-white font-bold text-xs sm:text-sm mb-1">
                  Stationery
                </h3>
                <p className="text-white/90 text-xs">Office Supplies</p>
                <div className="mt-1 sm:mt-2">
                  <span className="bg-blue-600 text-white px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-xs font-medium">
                    Sale
                  </span>
                </div>
              </div>
            </div>

            {/* Card 4 */}
            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg sm:rounded-xl p-3 sm:p-4 flex flex-col justify-between relative overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] cursor-pointer">
              <div className="absolute right-1.5 top-1.5 sm:right-2 sm:top-2">
                <div className="flex space-x-0.5 sm:space-x-1">
                  <div className="w-0.5 h-8 sm:w-1 sm:h-12 bg-green-600 rounded-full"></div>
                  <div className="w-0.5 h-8 sm:w-1 sm:h-12 bg-blue-600 rounded-full"></div>
                  <div className="w-0.5 h-8 sm:w-1 sm:h-12 bg-red-600 rounded-full"></div>
                </div>
              </div>
              <div>
                <h3 className="text-white font-bold text-xs sm:text-sm mb-1">
                  Craft Kits
                </h3>
                <p className="text-white/90 text-xs">DIY Projects</p>
                <div className="mt-1 sm:mt-2">
                  <span className="bg-blue-600 text-white px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-xs font-medium">
                    New
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile swipe hint */}
        <div className="flex justify-center mt-4 sm:hidden">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>👆</span>
            <span>Tap to explore events</span>
            <span>👆</span>
          </div>
        </div>
      </div>
    </div>
  );
}
