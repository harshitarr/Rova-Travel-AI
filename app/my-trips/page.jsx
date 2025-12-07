"use client";
import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Trash2, Eye, Calendar, MapPin, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TripDetailsModal from './_components/TripDetailsModal';
import DeleteConfirmModal from './_components/DeleteConfirmModal';

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
        <div className="mb-8 animate-fadeIn">
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
            <div key={date} className="mb-12 animate-slideUp">
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
  const getDynamicImage = (destination) => {
    // Map common destinations to specific beautiful images
    const destinationImages = {
      // India
      'coimbatore': 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&h=600&fit=crop&q=80',
      'chennai': 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&h=600&fit=crop&q=80',
      'mumbai': 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=800&h=600&fit=crop&q=80',
      'delhi': 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&h=600&fit=crop&q=80',
      'bangalore': 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=800&h=600&fit=crop&q=80',
      'goa': 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&h=600&fit=crop&q=80',
      'jaipur': 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&h=600&fit=crop&q=80',
      'kerala': 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&h=600&fit=crop&q=80',
      // International
      'paris': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&h=600&fit=crop&q=80',
      'london': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&h=600&fit=crop&q=80',
      'new york': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&h=600&fit=crop&q=80',
      'tokyo': 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=600&fit=crop&q=80',
      'dubai': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&h=600&fit=crop&q=80',
      'singapore': 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&h=600&fit=crop&q=80',
      'bali': 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&h=600&fit=crop&q=80',
      'maldives': 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&h=600&fit=crop&q=80',
    };

    const destinationLower = destination?.toLowerCase() || '';
    
    // Check if we have a specific image for this destination
    for (const [key, imageUrl] of Object.entries(destinationImages)) {
      if (destinationLower.includes(key)) {
        return imageUrl;
      }
    }
    
    // Fallback to generic travel images
    return 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=600&fit=crop&q=80';
  };

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
      className="bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-500 overflow-hidden group transform hover:-translate-y-2"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Image Section */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-pink-200 to-purple-200">
        <img
          src={getDynamicImage(trip.destination)}
          alt={trip.destination || 'Trip'}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&h=600&fit=crop&q=80';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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
