"use client";
import React from 'react';
import { X, MapPin, Calendar, Users, DollarSign, Heart, Hotel, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TripDetailsModal = ({ isOpen, onClose, trip }) => {
  if (!isOpen || !trip) return null;

  const tripPlan = trip.trip_plan || {};
  const hotels = tripPlan.hotels || [];
  const itinerary = tripPlan.itinerary || [];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/20 transition-all duration-300"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="flex items-start gap-3">
            <MapPin className="w-8 h-8 mt-1" />
            <div>
              <h2 className="text-3xl font-bold mb-2">{trip.destination || trip.title || 'Trip Details'}</h2>
              <p className="text-pink-100">Your complete travel itinerary</p>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-6 custom-scrollbar">
          {/* Trip Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <InfoCard icon={<Calendar />} label="Duration" value={tripPlan.duration || 'N/A'} />
            <InfoCard icon={<DollarSign />} label="Budget" value={trip.budget || 'N/A'} />
            <InfoCard icon={<Users />} label="Group Size" value={trip.groupSize || 'N/A'} />
            <InfoCard icon={<Heart />} label="Interests" value={trip.interests?.join(', ') || 'N/A'} />
          </div>

          {/* Hotels Section */}
          {hotels.length > 0 && (
            <div className="mb-8 animate-slideUp" style={{ animationDelay: '100ms' }}>
              <div className="flex items-center gap-2 mb-4">
                <Hotel className="w-6 h-6 text-pink-500" />
                <h3 className="text-2xl font-bold text-gray-800">Hotels</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {hotels.map((hotel, index) => (
                  <HotelCard key={index} hotel={hotel} index={index} />
                ))}
              </div>
            </div>
          )}

          {/* Itinerary Section */}
          {itinerary.length > 0 && (
            <div className="animate-slideUp" style={{ animationDelay: '200ms' }}>
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-6 h-6 text-pink-500" />
                <h3 className="text-2xl font-bold text-gray-800">Itinerary</h3>
              </div>
              <div className="space-y-6">
                {itinerary.map((day, index) => (
                  <DayCard key={index} day={day} index={index} />
                ))}
              </div>
            </div>
          )}

          {/* No Data Message */}
          {hotels.length === 0 && itinerary.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No detailed itinerary available for this trip.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-4 bg-gray-50 flex justify-end">
          <Button
            onClick={onClose}
            className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white px-8"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

// Info Card Component
const InfoCard = ({ icon, label, value }) => (
  <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg p-4 border border-pink-100">
    <div className="flex items-center gap-2 text-pink-600 mb-2">
      {icon}
      <span className="text-xs font-medium text-gray-600">{label}</span>
    </div>
    <p className="text-sm font-semibold text-gray-800 truncate">{value}</p>
  </div>
);

// Hotel Card Component
const HotelCard = ({ hotel, index }) => (
  <div 
    className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 animate-slideUp"
    style={{ animationDelay: `${index * 50}ms` }}
  >
    {hotel.hotel_image_url && (
      <img
        src={hotel.hotel_image_url}
        alt={hotel.hotel_name}
        className="w-full h-32 object-cover"
        onError={(e) => {
          e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop';
        }}
      />
    )}
    <div className="p-4">
      <h4 className="font-bold text-gray-800 mb-2">{hotel.hotel_name}</h4>
      <p className="text-sm text-gray-600 mb-2">{hotel.hotel_address}</p>
      {hotel.price_per_night && (
        <p className="text-pink-600 font-semibold">{hotel.price_per_night}/night</p>
      )}
      {hotel.rating && (
        <div className="flex items-center gap-1 mt-2">
          <span className="text-yellow-500">⭐</span>
          <span className="text-sm font-medium">{hotel.rating}</span>
        </div>
      )}
    </div>
  </div>
);

// Day Card Component
const DayCard = ({ day, index }) => (
  <div 
    className="bg-gradient-to-br from-white to-pink-50 border-2 border-pink-200 rounded-xl p-5 hover:shadow-lg transition-all duration-300 animate-slideUp"
    style={{ animationDelay: `${index * 100}ms` }}
  >
    <div className="flex items-center gap-3 mb-4">
      <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold">
        {day.day}
      </div>
      <div>
        <h4 className="font-bold text-gray-800 text-lg">Day {day.day}</h4>
        {day.best_time_to_visit_day && (
          <p className="text-sm text-gray-600">{day.best_time_to_visit_day}</p>
        )}
      </div>
    </div>
    
    {day.day_plan && (
      <p className="text-gray-700 mb-4 leading-relaxed">{day.day_plan}</p>
    )}

    {day.activities && day.activities.length > 0 && (
      <div className="space-y-3 mt-4">
        {day.activities.map((activity, actIndex) => (
          <div key={actIndex} className="bg-white rounded-lg p-4 border border-pink-100">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-pink-500 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <h5 className="font-semibold text-gray-800 mb-1">{activity.place_name}</h5>
                {activity.place_details && (
                  <p className="text-sm text-gray-600 mb-2">{activity.place_details}</p>
                )}
                <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                  {activity.time_travel_each_location && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{activity.time_travel_each_location}</span>
                    </div>
                  )}
                  {activity.ticket_pricing && (
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      <span>{activity.ticket_pricing}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

export default TripDetailsModal;
