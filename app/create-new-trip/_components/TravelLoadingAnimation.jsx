import React from 'react';

const TravelLoadingAnimation = ({ isGenerating = true, onViewTrip }) => {

  if (isGenerating) {
    return (
      <div className="flex flex-col items-center p-6 bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl border border-pink-200 shadow-lg mt-3 max-w-sm mx-auto">
        <div className="text-2xl mb-3">✈️</div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Planning your dream trip...</h3>
        <p className="text-sm text-gray-600 mb-4 text-center">Gathering best destinations, activities, and travel details for you</p>
        
        {/* Travel Loading Animation */}
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-3 h-3 bg-[#F472B6] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-3 h-3 bg-[#F472B6] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-3 h-3 bg-[#F472B6] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
        
        {/* Plane Animation */}
        <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#F472B6] to-[#EC4899] rounded-full animate-pulse" style={{ width: '60%' }}></div>
          <div className="absolute top-1/2 transform -translate-y-1/2 text-xs animate-pulse" style={{ left: '55%' }}>🛫</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-6 bg-white rounded-2xl border border-gray-200 shadow-lg mt-3 max-w-sm mx-auto">
      {/* Success Circle with Checkmark */}
      <div className="w-16 h-16 bg-gradient-to-br from-[#F472B6] to-[#EC4899] rounded-full flex items-center justify-center mb-4 animate-bounce">
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      
      <h3 className="text-lg font-semibold text-gray-800 mb-2">Trip Planning Complete!</h3>
      <p className="text-sm text-gray-600 mb-6 text-center">Your personalized travel itinerary is ready</p>
      
      {/* View Trip Button */}
      <button 
        onClick={onViewTrip}
        className="bg-gradient-to-r from-[#F472B6] to-[#EC4899] hover:from-[#EC4899] hover:to-[#DB2777] text-white px-8 py-3 rounded-full font-medium transition-all duration-200 transform hover:scale-105 shadow-lg"
      >
        View Trip
      </button>
    </div>
  );
};

export default TravelLoadingAnimation;