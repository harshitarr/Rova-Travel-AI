"use client";
import React, { useState } from 'react';
import { X, MapIcon, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Timeline } from '@/components/ui/timeline';
import HotelCardItem from '@/app/create-new-trip/_components/HotelCardItem';
import PlaceCardItem from '@/app/create-new-trip/_components/PlaceCardItem';
import TripMap from './TripMap';

const TripDetailsModal = ({ isOpen, onClose, trip }) => {
  const [activeTab, setActiveTab] = useState('places');
  
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

    ...itineraryDays.map((day, dayIndex) => {
      const hasActivities = Array.isArray(day.activities) && day.activities.length > 0;
      const rawBest = (day.best_time_to_visit_day || day.best_time_to_visit || '')?.toString() || '';
      const bestNormalized = rawBest.trim().toLowerCase();
      const isBestNA = !rawBest || bestNormalized === 'n/a' || bestNormalized === 'na' || bestNormalized === 'anytime';

      return {
        title: `Day ${day.day ?? dayIndex + 1}`,
        content: (
          <div>
            {/* If there are no activities or best time is explicitly N/A, show a Leisure Day box */}
            {(!hasActivities || isBestNA) ? (
              <div className="my-4">
                <div className="relative overflow-hidden rounded-lg border-l-4 border-pink-500 bg-pink-50/60 p-6">
                  {/* Decorative sparkles */}
                  <svg className="absolute -top-6 -right-6 opacity-20 w-48 h-48 pointer-events-none" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                    <g transform="translate(10,10)">
                      <circle cx="10" cy="10" r="2" fill="#F472B6" />
                      <circle cx="40" cy="20" r="1.5" fill="#A855F7" />
                      <circle cx="70" cy="8" r="1.2" fill="#F472B6" />
                      <circle cx="80" cy="40" r="2" fill="#A855F7" />
                      <circle cx="20" cy="55" r="1.4" fill="#F472B6" />
                    </g>
                  </svg>

                  <div className="relative z-10">
                    <div className="text-lg font-semibold text-gray-800">Leisure Day</div>
                    <div className="mt-1 text-sm text-neutral-600">Free time — enjoy a relaxed day or explore at your own pace.</div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <p className="mb-2 text-sm">
                  <span className="text-[#F472B6] font-semibold">Best Time:</span>{' '}
                  <span className="text-neutral-600">{day.best_time_to_visit_day || day.best_time_to_visit || 'Anytime'}</span>
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {day.activities.map((activity, index) => (
                    <PlaceCardItem activity={activity} key={index} />
                  ))}
                </div>
              </>
            )}
          </div>
        )
      };
    })
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[90vh] overflow-hidden animate-slideUp my-auto"
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
          
          {/* Tabs */}
          <div className="flex gap-3 pt-12">
            <button
              onClick={() => setActiveTab('places')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all duration-300 ${
                activeTab === 'places'
                  ? 'bg-white text-pink-500 shadow-lg'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <List className="w-4 h-4" />
              Places
            </button>
            <button
              onClick={() => setActiveTab('map')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all duration-300 ${
                activeTab === 'map'
                  ? 'bg-white text-purple-500 shadow-lg'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <MapIcon className="w-4 h-4" />
              Map
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)] custom-scrollbar bg-white">
          {activeTab === 'places' ? (
            data.length > 1 ? (
              <Timeline data={data} tripData={trip} />
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No detailed itinerary available for this trip.</p>
              </div>
            )
          ) : (
            <div className="p-6">
              <TripMap hotels={hotels} itinerary={itineraryDays} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TripDetailsModal;
