"use client";
import { useEffect, useRef } from 'react';
import { MapPin, Hotel } from 'lucide-react';

const TripMap = ({ hotels, itinerary }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!mapContainerRef.current) return;

    // Clean up previous map instance if it exists
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Clear the container's innerHTML to prevent duplicate initialization
    mapContainerRef.current.innerHTML = '';
    mapContainerRef.current._leaflet_id = null;

    // Dynamically import Leaflet
    let mounted = true;

    import('leaflet').then((L) => {
      if (!mounted || !mapContainerRef.current) return;

      try {
        // Initialize map
        const mapInstance = L.map(mapContainerRef.current, {
          center: [0, 0],
          zoom: 2,
          scrollWheelZoom: true,
          zoomControl: true,
        });

        mapInstanceRef.current = mapInstance;

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(mapInstance);

        // Collect all markers
        const markerLocations = [];
        const markers = [];

        // Add hotel markers
        hotels.forEach((hotel) => {
          if (hotel.geo_coordinates?.latitude && hotel.geo_coordinates?.longitude) {
            const { latitude, longitude } = hotel.geo_coordinates;
            const marker = L.marker([latitude, longitude], {
              icon: L.divIcon({
                className: 'custom-hotel-marker',
                html: `<div style="position: relative;">
                        <div style="background: linear-gradient(135deg, #ec4899 0%, #db2777 100%); 
                                    width: 36px; height: 36px; border-radius: 50% 50% 50% 0; 
                                    transform: rotate(-45deg); 
                                    box-shadow: 0 3px 10px rgba(236, 72, 153, 0.4);
                                    border: 3px solid white;
                                    display: flex; align-items: center; justify-content: center;">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="white" style="transform: rotate(45deg);">
                            <path d="M19 7h-1V3H6v4H5c-1.1 0-2 .9-2 2v11h18V9c0-1.1-.9-2-2-2zm-8 8H9v-2h2v2zm0-4H9V9h2v2zm4 4h-2v-2h2v2zm0-4h-2V9h2v2z"/>
                          </svg>
                        </div>
                      </div>`,
                iconSize: [36, 36],
                iconAnchor: [18, 36],
              }),
            }).addTo(mapInstance);

            marker.bindPopup(`
              <div style="padding: 12px; min-width: 220px; font-family: system-ui, -apple-system, sans-serif;">
                <div style="display: flex; align-items: start; gap: 8px; margin-bottom: 8px;">
                  <div style="background: linear-gradient(135deg, #ec4899 0%, #db2777 100%); 
                              padding: 6px; border-radius: 8px; flex-shrink: 0;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="white">
                      <path d="M19 7h-1V3H6v4H5c-1.1 0-2 .9-2 2v11h18V9c0-1.1-.9-2-2-2zm-8 8H9v-2h2v2zm0-4H9V9h2v2zm4 4h-2v-2h2v2zm0-4h-2V9h2v2z"/>
                    </svg>
                  </div>
                  <div style="flex: 1;">
                    <h3 style="font-weight: 600; color: #1f2937; margin: 0 0 4px 0; font-size: 15px;">${hotel.hotel_name || 'Hotel'}</h3>
                    <p style="font-size: 12px; color: #6b7280; margin: 0;">${hotel.hotel_address || ''}</p>
                  </div>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 8px; border-top: 1px solid #e5e7eb;">
                  <span style="font-size: 13px; color: #6b7280;">⭐ ${hotel.rating || 'N/A'}</span>
                  <span style="font-size: 14px; font-weight: 600; color: #ec4899;">${hotel.price || ''}</span>
                </div>
              </div>
            `);

            markerLocations.push([latitude, longitude]);
            markers.push(marker);
          }
        });

        // Add place markers from itinerary
        itinerary.forEach((day, dayIndex) => {
          const activities = day.activities || day.plan || [];
          activities.forEach((activity, actIndex) => {
            if (activity.geo_coordinates?.latitude && activity.geo_coordinates?.longitude) {
              const { latitude, longitude } = activity.geo_coordinates;
              
              const marker = L.marker([latitude, longitude], {
                icon: L.divIcon({
                  className: 'custom-place-marker',
                  html: `<div style="position: relative;">
                          <div style="background: linear-gradient(135deg, #a855f7 0%, #9333ea 100%); 
                                      width: 36px; height: 36px; border-radius: 50% 50% 50% 0; 
                                      transform: rotate(-45deg); 
                                      box-shadow: 0 3px 10px rgba(168, 85, 247, 0.4);
                                      border: 3px solid white;
                                      display: flex; align-items: center; justify-content: center;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" style="transform: rotate(45deg);">
                              <circle cx="12" cy="10" r="3"></circle>
                            </svg>
                          </div>
                        </div>`,
                  iconSize: [36, 36],
                  iconAnchor: [18, 36],
                }),
              }).addTo(mapInstance);

              marker.bindPopup(`
                <div style="padding: 12px; min-width: 220px; font-family: system-ui, -apple-system, sans-serif;">
                  <div style="display: flex; align-items: start; gap: 8px; margin-bottom: 8px;">
                    <div style="background: linear-gradient(135deg, #a855f7 0%, #9333ea 100%); 
                                padding: 6px; border-radius: 8px; flex-shrink: 0;">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                    </div>
                    <div style="flex: 1;">
                      <h3 style="font-weight: 600; color: #1f2937; margin: 0 0 4px 0; font-size: 15px;">${activity.place_name || activity.placeName || 'Place'}</h3>
                      <p style="font-size: 12px; color: #6b7280; margin: 0; line-height: 1.4;">${activity.place_details || activity.placeDetails || ''}</p>
                    </div>
                  </div>
                  <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 8px; border-top: 1px solid #e5e7eb;">
                    <span style="font-size: 12px; color: #6b7280;">Day ${day.day || dayIndex + 1}</span>
                    <span style="font-size: 14px; font-weight: 600; color: #a855f7;">${activity.ticket_pricing || activity.ticketPricing || ''}</span>
                  </div>
                </div>
              `);

              markerLocations.push([latitude, longitude]);
              markers.push(marker);
            } else {
              console.log(`Day ${dayIndex + 1}, Activity ${actIndex + 1}: Missing coordinates for`, activity.place_name || activity.placeName || 'Unknown place');
            }
          });
        });

        markersRef.current = markers;

        // Fit map to show all markers
        if (markerLocations.length > 0) {
          const bounds = L.latLngBounds(markerLocations);
          mapInstance.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
        }

        // Store counts for legend
        const hotelCount = hotels.filter(h => h.geo_coordinates?.latitude && h.geo_coordinates?.longitude).length;
        const placeCount = markerLocations.length - hotelCount;
        
        // Update legend with counts
        const legendElement = document.getElementById('map-legend-content');
        if (legendElement) {
          legendElement.innerHTML = `
            <h4 style="font-weight: 600; font-size: 14px; margin-bottom: 12px; color: #1f2937;">Map Legend</h4>
            <div style="display: flex; flex-direction: column; gap: 8px;">
              <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <div style="position: relative; width: 20px; height: 20px;">
                    <div style="position: absolute; inset: 0; background: linear-gradient(135deg, #ec4899 0%, #db2777 100%); border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"></div>
                  </div>
                  <span style="font-size: 13px; color: #374151; font-weight: 500;">Hotels</span>
                </div>
                <span style="background: #fce7f3; color: #be185d; font-size: 12px; font-weight: 600; padding: 2px 8px; border-radius: 12px;">${hotelCount}</span>
              </div>
              <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <div style="position: relative; width: 20px; height: 20px;">
                    <div style="position: absolute; inset: 0; background: linear-gradient(135deg, #a855f7 0%, #9333ea 100%); border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"></div>
                  </div>
                  <span style="font-size: 13px; color: #374151; font-weight: 500;">Places</span>
                </div>
                <span style="background: #f3e8ff; color: #7e22ce; font-size: 12px; font-weight: 600; padding: 2px 8px; border-radius: 12px;">${placeCount}</span>
              </div>
            </div>
          `;
        }
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    }).catch((error) => {
      console.error('Error loading Leaflet:', error);
    });

    // Cleanup function
    return () => {
      mounted = false;
      
      // Remove all markers
      markersRef.current.forEach(marker => {
        try {
          marker.remove();
        } catch (e) {
          // Ignore errors during cleanup
        }
      });
      markersRef.current = [];

      // Remove map instance
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (e) {
          // Ignore errors during cleanup
        }
        mapInstanceRef.current = null;
      }

      // Clear container
      if (mapContainerRef.current) {
        mapContainerRef.current.innerHTML = '';
        mapContainerRef.current._leaflet_id = null;
      }
    };
  }, [hotels, itinerary]);

  return (
    <>
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossOrigin=""
      />
      <div className="relative w-full h-[600px] rounded-xl overflow-hidden shadow-lg">
        <div ref={mapContainerRef} className="w-full h-full bg-gray-100"></div>
        
        {/* Legend */}
        <div className="absolute top-4 right-4 bg-white rounded-xl p-4 shadow-xl border border-gray-200 z-[1000]">
          <div id="map-legend-content">
            <h4 className="font-semibold text-sm mb-3 text-gray-800">Map Legend</h4>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="relative w-5 h-5">
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-pink-600 rounded-full border-2 border-white shadow-sm"></div>
                  </div>
                  <span className="text-xs text-gray-700 font-medium">Hotels</span>
                </div>
                <span className="bg-pink-100 text-pink-700 text-xs font-semibold px-2 py-0.5 rounded-full">0</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="relative w-5 h-5">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full border-2 border-white shadow-sm"></div>
                  </div>
                  <span className="text-xs text-gray-700 font-medium">Places</span>
                </div>
                <span className="bg-purple-100 text-purple-700 text-xs font-semibold px-2 py-0.5 rounded-full">0</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TripMap;
