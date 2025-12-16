"use client";
import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Trash2, Eye, Calendar, MapPin, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TripDetailsModal from './_components/TripDetailsModal';
import DeleteConfirmModal from './_components/DeleteConfirmModal';
import { Plane } from 'lucide-react';

const MyTripsPage = () => {
  const { user } = useUser();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [tripToDelete, setTripToDelete] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchTrips();
    }
  }, [user]);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/tripdetails?clerkId=${user.id}`);
      const data = await response.json();
      if (data.trips) {
        setTrips(data.trips);
      }
    } catch (error) {
      console.error('Error fetching trips:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewTrip = (trip) => {
    setSelectedTrip(trip);
    setIsDetailsModalOpen(true);
  };

  const handleDeleteClick = (trip) => {
    // Check if trip was created today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tripCreatedDate = new Date(trip.createdAt);
    tripCreatedDate.setHours(0, 0, 0, 0);

    if (tripCreatedDate.getTime() === today.getTime()) {
      alert('You cannot delete trips created today. Please wait until tomorrow to prevent credit point malpractice.');
      return;
    }

    setTripToDelete(trip);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const response = await fetch('/api/tripdetails', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clerkId: user.id,
          tripId: tripToDelete.tripId
        })
      });

      if (response.ok) {
        // Remove trip from local state
        setTrips(trips.filter(t => t.tripId !== tripToDelete.tripId));
        setIsDeleteModalOpen(false);
        setTripToDelete(null);
      }
    } catch (error) {
      console.error('Error deleting trip:', error);
    }
  };

  // Group trips by date
  const groupTripsByDate = (trips) => {
    const grouped = {};
    trips.forEach(trip => {
      const date = new Date(trip.createdAt);
      const dateKey = date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(trip);
    });
    return grouped;
  };

  const groupedTrips = groupTripsByDate(trips);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">My Trips</h1>
          <p className="text-gray-600">Explore your travel adventures</p>
        </div>

        {/* Trips Grid */}
        {Object.keys(groupedTrips).length === 0 ? (
          <div className="text-center py-16">
            <MapPin className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No trips yet</h3>
            <p className="text-gray-500">Start planning your first adventure!</p>
          </div>
        ) : (
          Object.entries(groupedTrips).map(([date, dateTrips]) => (
            <div key={date} className="mb-12">
              {/* Date Header */}
              <div className="flex items-center gap-3 mb-4">
                <Calendar className="w-5 h-5 text-pink-500" />
                <h2 className="text-xl font-semibold text-gray-700">{date}</h2>
              </div>

              {/* Trip Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {dateTrips.map((trip, index) => (
                  <TripCard
                    key={trip.tripId}
                    trip={trip}
                    index={index}
                    onView={() => handleViewTrip(trip)}
                    onDelete={() => handleDeleteClick(trip)}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modals */}
      <TripDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        trip={selectedTrip}
      />
      
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        tripName={tripToDelete?.destination || 'this trip'}
      />
    </div>
  );
};

// Trip Card Component
const TripCard = ({ trip, index, onView, onDelete }) => {
  // No image logic, only animated sparkles and icon+name

  // Check if trip was created today
  const isCreatedToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tripCreatedDate = new Date(trip.createdAt);
    tripCreatedDate.setHours(0, 0, 0, 0);
    return tripCreatedDate.getTime() === today.getTime();
  };

  const cannotDelete = isCreatedToday();

  return (
    <div 
      className="bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-500 overflow-hidden group transform hover:-translate-y-2 border-2 border-[#F472B6]"
    >
      {/* Animated Sparkles and Icon+Destination Nam */}
      <div className="relative flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-white rounded-xl shadow h-40 overflow-hidden">
        {/* Animated sparkles */}
        <div className="absolute inset-0">
          <div className="absolute top-4 left-4 w-1 h-1 bg-pink-400 rounded-full animate-ping" style={{animationDuration: '2s'}}></div>
          <div className="absolute top-8 right-8 w-1.5 h-1.5 bg-purple-400 rounded-full animate-ping" style={{animationDuration: '3s', animationDelay: '0.5s'}}></div>
          <div className="absolute bottom-6 left-12 w-1 h-1 bg-pink-300 rounded-full animate-ping" style={{animationDuration: '2.5s', animationDelay: '1s'}}></div>
          <div className="absolute bottom-10 right-6 w-1 h-1 bg-purple-300 rounded-full animate-ping" style={{animationDuration: '3s', animationDelay: '1.5s'}}></div>
          <div className="absolute top-1/2 left-6 w-1 h-1 bg-pink-400 rounded-full animate-ping" style={{animationDuration: '2s', animationDelay: '0.3s'}}></div>
          <div className="absolute top-1/3 right-10 w-1.5 h-1.5 bg-purple-400 rounded-full animate-ping" style={{animationDuration: '2.8s', animationDelay: '0.8s'}}></div>
        </div>
        {/* Logo content */}
        <div className="relative z-10 flex flex-col items-center gap-2">
         <Plane size={48} className='text-[#F472B6] animate-pulse' style={{animationDuration: '3s'}}/>
          <h2 className="text-2xl font-extrabold tracking-tight text-gray-800">
            {trip.destination || trip.title || 'Trip'}
          </h2>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5">
        <div className="mb-4">
          <div className="flex items-start gap-2 mb-2">
            <MapPin className="w-5 h-5 text-pink-500 mt-1 flex-shrink-0" />
            <h3 className="text-lg font-bold text-gray-800 line-clamp-2">
              {trip.destination || trip.title || 'Untitled Trip'}
            </h3>
          </div>
          {trip.budget && (
            <p className="text-sm text-gray-600 ml-7">Budget: {trip.budget}</p>
          )}
          {trip.groupSize && (
            <p className="text-sm text-gray-600 ml-7">Group: {trip.groupSize}</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={onView}
            className="flex-1 bg-[#F472B6] hover:bg-pink-500 text-white transition-all duration-300 transform hover:scale-105 active:scale-95"
          >
            <Eye className="w-4 h-4 mr-2" />
            View
          </Button>
          <Button
            onClick={onDelete}
            disabled={cannotDelete}
            className={`flex-1 transition-all duration-300 ${
              cannotDelete 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50' 
                : 'bg-red-500 hover:bg-red-600 text-white transform hover:scale-105 active:scale-95'
            }`}
            title={cannotDelete ? 'Cannot delete trips created today' : 'Delete trip'}
          >
            Delete
            <Trash2 className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MyTripsPage;
