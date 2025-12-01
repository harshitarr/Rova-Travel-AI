"use client";
import React from 'react'
import { useTripDetail } from '@/app/provider';
import { Timeline } from "@/components/ui/timeline";
import HotelCardItem from './HotelCardItem';
import PlaceCardItem from './PlaceCardItem';
import Image from 'next/image';


// const TRIP_DATA = {
//     "clerkId": "user_35vns0q1JAaixxBMQm1d20gkUZg",
//     "tripId": "692be8bed49150acec78f680",
//     "title": "Coimbatore",
//     "destination": "Coimbatore",
//     "budget": "Luxury",
//     "groupSize": "4-10 People",
//     "interests": [
//         "Adventure"
//     ],
//     "trip_plan": {
//         "destination": "Coimbatore",
//         "duration": "3 Days",
//         "origin": "Chennai",
//         "budget": "Luxury",
//         "groupSize": "4-10 People",
//         "interests": "Adventure",
//         "hotels": [
//             {
//                 "hotel_name": "The Residency Towers Coimbatore",
//                 "hotel_address": "1076, Avinashi Road, Coimbatore, Tamil Nadu 641018, India",
//                 "price_per_night": "₹6,000 - ₹10,000",
//                 "hotel_image_url": "https://example.com/residency_towers_coimbatore.jpg",
//                 "geo_coordinates": {
//                     "latitude": 11.0045,
//                     "longitude": 77.0047
//                 },
//                 "rating": 4.5,
//                 "description": "A luxurious hotel offering excellent amenities, fine dining, and comfortable accommodations. Perfect for a relaxing stay after adventurous activities."
//             },
//             {
//                 "hotel_name": "Welcomhotel Coimbatore",
//                 "hotel_address": "1266/14, West Club Road, Race Course, Coimbatore, Tamil Nadu 641018, India",
//                 "price_per_night": "₹7,000 - ₹12,000",
//                 "hotel_image_url": "https://example.com/welcomhotel_coimbatore.jpg",
//                 "geo_coordinates": {
//                     "latitude": 11.0025,
//                     "longitude": 76.9745
//                 },
//                 "rating": 4.6,
//                 "description": "Known for its impeccable service, luxurious rooms, and proximity to the city's main attractions. Enjoy a blend of comfort and elegance."
//             },
//             {
//                 "hotel_name": "Radisson Blu Coimbatore",
//                 "hotel_address": "164/165, Avinashi Road, Peelamedu, Coimbatore, Tamil Nadu 641004, India",
//                 "price_per_night": "₹8,000 - ₹14,000",
//                 "hotel_image_url": "https://example.com/radisson_blu_coimbatore.jpg",
//                 "geo_coordinates": {
//                     "latitude": 11.0245,
//                     "longitude": 77.0145
//                 },
//                 "rating": 4.7,
//                 "description": "Offers stylish rooms, a rooftop pool, and world-class dining experiences. Ideal for travelers seeking a sophisticated stay."
//             }
//         ],
//         "itinerary": [
//             {
//                 "day": 1,
//                 "day_plan": "Arrive in Coimbatore and head straight for some thrilling outdoor activities. Start with a visit to Kovai Kondattam amusement park, followed by an adventurous trek to the top of the scenic Siruvani Waterfalls.",
//                 "best_time_to_visit_day": "Morning to Evening",
//                 "activities": [
//                     {
//                         "place_name": "Kovai Kondattam",
//                         "place_details": "An amusement park with water rides, dry rides, and entertainment suitable for all ages. Perfect for a fun-filled start to your adventure trip.",
//                         "place_image_url": "https://example.com/kovai_kondattam.jpg",
//                         "geo_coordinates": {
//                             "latitude": 11.0681,
//                             "longitude": 76.9375
//                         },
//                         "place_address": "Siruvani Main Road, Kalampalayam, Coimbatore, Tamil Nadu 641010, India",
//                         "ticket_pricing": "₹650 per person",
//                         "time_travel_each_location": "4-5 hours",
//                         "best_time_to_visit": "Morning (10:00 AM - 1:00 PM)"
//                     },
//                     {
//                         "place_name": "Siruvani Waterfalls Trek",
//                         "place_details": "A moderately challenging trek through the lush forests to the beautiful Siruvani Waterfalls. Enjoy the natural beauty and refreshing waters.",
//                         "place_image_url": "https://example.com/siruvani_waterfalls.jpg",
//                         "geo_coordinates": {
//                             "latitude": 10.8819,
//                             "longitude": 76.6406
//                         },
//                         "place_address": "Siruvani, Coimbatore, Tamil Nadu, India",
//                         "ticket_pricing": "₹100-₹200 for entry and guide charges",
//                         "time_travel_each_location": "5-6 hours including travel",
//                         "best_time_to_visit": "Afternoon (2:00 PM - 6:00 PM)"
//                     }
//                 ]
//             },
//             {
//                 "day": 2,
//                 "day_plan": "Explore the adventurous side of Coimbatore with a visit to Black Thunder theme park and a thrilling experience at the Gedee Car Museum. End the day with a relaxing dinner at a top-rated restaurant.",
//                 "best_time_to_visit_day": "Morning to Evening",
//                 "activities": [
//                     {
//                         "place_name": "Black Thunder Theme Park",
//                         "place_details": "One of the largest theme parks in South India, offering a variety of thrilling rides and water-based activities. Perfect for adventure enthusiasts.",
//                         "place_image_url": "https://example.com/black_thunder.jpg",
//                         "geo_coordinates": {
//                             "latitude": 11.2732,
//                             "longitude": 76.8893
//                         },
//                         "place_address": "Ooty Main Road, Mettupalayam, Coimbatore, Tamil Nadu 641305, India",
//                         "ticket_pricing": "₹750 - ₹900 per person",
//                         "time_travel_each_location": "6-7 hours including travel",
//                         "best_time_to_visit": "Morning (10:00 AM - 4:00 PM)"
//                     },
//                     {
//                         "place_name": "Gedee Car Museum",
//                         "place_details": "A unique museum showcasing a collection of vintage and classic cars. An engaging experience for car enthusiasts and history buffs.",
//                         "place_image_url": "https://example.com/gedee_car_museum.jpg",
//                         "geo_coordinates": {
//                             "latitude": 11.0082,
//                             "longitude": 76.9799
//                         },
//                         "place_address": "737, Avinashi Rd, Hope College, Peelamedu, Coimbatore, Tamil Nadu 641004, India",
//                         "ticket_pricing": "₹50 per person",
//                         "time_travel_each_location": "2-3 hours",
//                         "best_time_to_visit": "Afternoon (4:00 PM - 6:00 PM)"
//                     }
//                 ]
//             },
//             {
//                 "day": 3,
//                 "day_plan": "Embark on a scenic drive to the Adiyogi Shiva Statue and Isha Foundation for a spiritual and adventurous experience. Enjoy meditation and explore the serene surroundings. Conclude the day with shopping for local handicrafts and souvenirs.",
//                 "best_time_to_visit_day": "Morning to Evening",
//                 "activities": [
//                     {
//                         "place_name": "Adiyogi Shiva Statue",
//                         "place_details": "A magnificent 112-foot tall statue of Lord Shiva, located at the Isha Foundation. A breathtaking sight and a spiritual experience.",
//                         "place_image_url": "https://example.com/adiyogi_shiva_statue.jpg",
//                         "geo_coordinates": {
//                             "latitude": 10.9833,
//                             "longitude": 76.6486
//                         },
//                         "place_address": "Isha Yoga Center, Velliangiri Foothills, Ishana Vihar Post, Coimbatore, Tamil Nadu 641114, India",
//                         "ticket_pricing": "Free entry",
//                         "time_travel_each_location": "5-6 hours including travel",
//                         "best_time_to_visit": "Morning (9:00 AM - 12:00 PM)"
//                     },
//                     {
//                         "place_name": "Isha Foundation",
//                         "place_details": "A spiritual center offering yoga and meditation programs. Explore the serene surroundings and experience inner peace.",
//                         "place_image_url": "https://example.com/isha_foundation.jpg",
//                         "geo_coordinates": {
//                             "latitude": 10.9833,
//                             "longitude": 76.6486
//                         },
//                         "place_address": "Isha Yoga Center, Velliangiri Foothills, Ishana Vihar Post, Coimbatore, Tamil Nadu 641114, India",
//                         "ticket_pricing": "Varies based on programs",
//                         "time_travel_each_location": "3-4 hours",
//                         "best_time_to_visit": "Afternoon (1:00 PM - 4:00 PM)"
//                     }
//                 ]
//             }
//         ]
//     },
//     "itinerary": [],
//     "notes": "",
//     "_id": "692be8bed49150acec78f681",
//     "createdAt": "2025-11-30T06:48:30.106Z",
//     "updatedAt": "2025-11-30T06:48:30.106Z",
//     "__v": 0
// };

const Itinerary = () => {
  const { tripDetailInfo } = useTripDetail();

  const hotels = tripDetailInfo?.trip_plan?.hotels || [];
  const itineraryDays = tripDetailInfo?.trip_plan?.itinerary || [];

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
          <p className="mb-2 text-sm text-neutral-600">
            Best Time: {day.best_time_to_visit_day || day.best_time_to_visit || 'Anytime'}
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
    <div className="h-full w-full relative">
      {tripDetailInfo ? (
        <div className="h-full overflow-auto">
          <Timeline data={data} tripData={tripDetailInfo || {}} />
        </div>
      ) : (
        // Fallback UI: single responsive image that fills the right pane height
        <div className="h-full flex items-center justify-center px-4">
          <div className="w-full max-w-4xl h-full flex items-center justify-center">
            <Image
              src="/side_hero.svg"
              width={920}
              height={720}
              sizes="(max-width: 1024px) 90vw, 50vw"
              className="object-contain rounded-3xl w-full h-auto lg:h-full lg:max-h-[85vh]"
              alt="Empty itinerary"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Itinerary;
