import React from 'react';

// A reusable component for the placeholder link items
const SkeletonLink = () => (
  <div className="flex items-center justify-between p-4 ">
    <div className="flex items-center">
      <div className="w-6 h-6 mr-4 bg-gray-200 rounded-md"></div>
      <div className="w-32 h-5 bg-gray-200 rounded"></div>
    </div>
    <div className="w-5 h-5 bg-gray-200 rounded"></div>
  </div>
);

const SkeletonAccountPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 md:hidden animate-pulse mt-[-55px]" >
      <div className="p-4 space-y-5">
        
        {/* Skeleton Profile Header */}
        <div className="p-4 bg-white rounded-xl shadow-sm">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
            <div>
              <div className="h-6 w-40 mb-2 bg-gray-200 rounded"></div>
              <div className="h-4 w-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>

        {/* Skeleton Actions Section */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-200">
            <SkeletonLink />
            <SkeletonLink />
            <SkeletonLink />
            <SkeletonLink />
          </div>
        </div>
        
        {/* Skeleton Other Links Section */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-200">
             <SkeletonLink />
             <SkeletonLink />
             <SkeletonLink />
          </div>
        </div>

      </div>
    </div>
  );
};

export default SkeletonAccountPage;