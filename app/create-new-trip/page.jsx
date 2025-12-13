"use client"
import React, { useState, useEffect, useRef } from 'react'
import ChatBox from './_components/ChatBox';
import Itinerary from './_components/Itinerary';

import { useTripDetail } from '@/app/provider';

const CreateNewTrip = () => {
  const [isMounted, setIsMounted] = useState(false);
  const itineraryRef = useRef(null);
  const { tripDetailInfo } = useTripDetail();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Scroll to itinerary when trip is created (mobile/medium only)
  useEffect(() => {
    if (tripDetailInfo && itineraryRef.current) {
      if (window.innerWidth < 1024) {
        setTimeout(() => {
          itineraryRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 200);
      }
    }
  }, [tripDetailInfo]);

  const animationClass = isMounted
    ? 'opacity-100 translate-y-0'
    : 'opacity-0 translate-y-8';

  return (
    <div className={`flex flex-col lg:flex-row gap-5 px-4 md:px-6 lg:p-10 transition-all duration-1000 ease-out ${animationClass}`}>

      <div className='flex justify-center lg:justify-start lg:flex-shrink-0'>
          <ChatBox />
      </div>

      <div ref={itineraryRef} className='flex-1 relative w-full h-[85vh] overflow-auto'>
       <Itinerary/>
      </div>

    </div>
  )
}

export default CreateNewTrip