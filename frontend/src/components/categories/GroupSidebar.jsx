import React from "react";
import Image from "next/image";

const GroupSidebar = ({ groups, selectedGroups, onGroupToggle }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border sticky top-6">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900">Categories</h3>
        <p className="text-sm text-gray-600 mt-1">Choose a category</p>
      </div>

      {/* Groups List */}
      <div className="p-4 space-y-3">
        {groups.map((group) => (
          <div
            key={group.id}
            onClick={() => onGroupToggle(group.id)}
            className={`group cursor-pointer rounded-lg border-2 transition-all duration-200 ${
              selectedGroups.includes(group.id)
                ? "border-[#fd5b00] bg-orange-50 shadow-sm"
                : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
            }`}
          >
            <div className="flex items-center p-3 space-x-3">
              {/* Group Image */}
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    src={`/prod${(group.id % 12) + 1}.png`}
                    alt={group.name}
                    width={48}
                    height={48}
                    className="object-cover w-full h-full"
                    onError={(e) => {
                      e.target.src = "/prod1.png";
                    }}
                  />
                </div>
              </div>

              {/* Group Info */}
              <div className="flex-1 min-w-0">
                <h4
                  className={`text-sm font-medium truncate ${
                    selectedGroups.includes(group.id)
                      ? "text-[#fd5b00]"
                      : "text-gray-900 group-hover:text-gray-800"
                  }`}
                >
                  {group.name}
                </h4>
                <p className="text-xs text-gray-500">{group.count} items</p>
              </div>

              {/* Selection Indicator */}
              <div
                className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                  selectedGroups.includes(group.id)
                    ? "border-[#fd5b00] bg-[#fd5b00]"
                    : "border-gray-300 group-hover:border-gray-400"
                }`}
              >
                {selectedGroups.includes(group.id) && (
                  <svg
                    className="w-3 h-3 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      {selectedGroups.length > 0 && (
        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              {selectedGroups.length} selected
            </span>
            <button
              onClick={() => selectedGroups.forEach((id) => onGroupToggle(id))}
              className="text-[#fd5b00] hover:text-[#f7941d] font-medium"
            >
              Clear all
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupSidebar;
