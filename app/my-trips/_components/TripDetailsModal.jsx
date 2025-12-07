"use client";
import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Timeline } from '@/components/ui/timeline';
import HotelCardItem from '@/app/create-new-trip/_components/HotelCardItem';
import PlaceCardItem from '@/app/create-new-trip/_components/PlaceCardItem';

const TripDetailsModal = ({ isOpen, onClose, trip }) => {
  if (!isOpen || !trip) return null;

  const tripPlan = trip.trip_plan || {};
  const hotels = tripPlan.hotels || [];
  const itineraryDays = tripPlan.itinerary || [];

  // Prepare timeline data in the same format as Itinerary component
  const data = [
    {
      title: "Recommended Hotels",
      content: (
        <div>
          <div className="grid md:grid-cols-2 gap-6">
            {hotels.length > 0 ? (
              hotels.map((hotel, index) => (
                <HotelCardItem hotel={hotel} key={index} />
              ))
            ) : (
              <p className="text-sm text-neutral-500">No recommended hotels available.</p>
            )}
          </div>
        </div>
      ),
    },

    ...itineraryDays.map((day, dayIndex) => ({
      title: `Day ${day.day ?? dayIndex + 1}`,
      content: (
        <div>
          <p className="mb-2 text-sm">
            <span className="text-[#F472B6] font-semibold">Best Time:</span>{' '}
            <span className="text-neutral-600">{day.best_time_to_visit_day || day.best_time_to_visit || 'Anytime'}</span>
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {day.activities?.length > 0 ? (
              day.activities.map((activity, index) => (
                <PlaceCardItem activity={activity} key={index} />
              ))
            ) : (
              <p className="text-sm text-neutral-500">No activities for this day.</p>
            )}
          </div>
        </div>
      )
    }))
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden animate-slideUp mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white p-4 md:p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/20 transition-all duration-300 z-10"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Timeline Content */}
        <div className="overflow-y-auto max-h-[calc(95vh-80px)] custom-scrollbar bg-white">
          {data.length > 1 ? (
            <Timeline data={data} tripData={trip} />
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No detailed itinerary available for this trip.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TripDetailsModal;
