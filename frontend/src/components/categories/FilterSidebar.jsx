import React from "react";

const FilterSidebar = ({
  groups,
  selectedGroups,
  onGroupToggle,
  priceRange,
  tempPriceRange,
  setTempPriceRange,
  onApplyPriceFilter,
  sortOption,
  setSortOption,
  onClearAllFilters,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-6 sticky top-6">
      {/* Filter Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        <button
          onClick={onClearAllFilters}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Clear All
        </button>
      </div>

      {/* Active Filters Display */}
      {(selectedGroups.length > 0 ||
        priceRange.min > 0 ||
        priceRange.max < 1000) && (
        <div className="mb-6 p-3 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-2">
            Active Filters
          </h4>
          <div className="flex flex-wrap gap-2">
            {selectedGroups.map((groupId) => {
              const group = groups.find((g) => g.id === groupId);
              return group ? (
                <span
                  key={groupId}
                  className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                >
                  {group.name}
                  <button
                    onClick={() => onGroupToggle(groupId)}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ) : null;
            })}
            {(priceRange.min > 0 || priceRange.max < 1000) && (
              <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                ₹{priceRange.min} - ₹{priceRange.max}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Groups Filter */}
      <div className="mb-8">
        <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
          <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
          Product Groups
        </h4>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {groups.map((group) => (
            <label
              key={group.id}
              className="flex items-center cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors border border-transparent hover:border-gray-200"
            >
              <input
                type="checkbox"
                checked={selectedGroups.includes(group.id)}
                onChange={() => onGroupToggle(group.id)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <span className="ml-3 text-sm text-gray-700 flex-1 font-medium">
                {group.name}
              </span>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full font-medium">
                {group.count}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      <div className="mb-8">
        <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
          <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
          Price Range
        </h4>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-2 font-medium">
                Min Price
              </label>
              <input
                type="number"
                value={tempPriceRange.min}
                onChange={(e) =>
                  setTempPriceRange((prev) => ({
                    ...prev,
                    min: parseInt(e.target.value) || 0,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="₹0"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-2 font-medium">
                Max Price
              </label>
              <input
                type="number"
                value={tempPriceRange.max}
                onChange={(e) =>
                  setTempPriceRange((prev) => ({
                    ...prev,
                    max: parseInt(e.target.value) || 1000,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="₹1000"
              />
            </div>
          </div>

          {/* Price Range Display */}
          <div className="text-center text-sm text-gray-600 py-2">
            ₹{tempPriceRange.min} - ₹{tempPriceRange.max}
          </div>

          <button
            onClick={onApplyPriceFilter}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2.5 px-4 rounded-lg text-sm font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            Apply Price Filter
          </button>
        </div>
      </div>

      {/* Quick Price Filters */}
      <div className="mb-8">
        <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
          <span className="w-2 h-2 bg-purple-600 rounded-full mr-2"></span>
          Quick Filters
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Under ₹50", min: 0, max: 49 },
            { label: "₹50-₹100", min: 50, max: 100 },
            { label: "₹100-₹200", min: 100, max: 200 },
            { label: "Above ₹200", min: 200, max: 1000 },
          ].map((range, index) => (
            <button
              key={index}
              onClick={() => {
                setTempPriceRange({ min: range.min, max: range.max });
                setTimeout(onApplyPriceFilter, 100);
              }}
              className="text-xs p-2 border border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sort Options */}
      <div>
        <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
          <span className="w-2 h-2 bg-orange-600 rounded-full mr-2"></span>
          Sort By
        </h4>
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="none">Default</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="rating">Customer Rating</option>
          <option value="name">Name: A to Z</option>
          <option value="popularity">Most Popular</option>
        </select>
      </div>

      {/* Filter Summary */}
      <div className="mt-6 p-3 bg-gray-50 rounded-lg">
        <div className="text-xs text-gray-600 text-center">
          {selectedGroups.length > 0 && (
            <div>
              {selectedGroups.length} group
              {selectedGroups.length > 1 ? "s" : ""} selected
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;
