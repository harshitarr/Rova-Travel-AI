"use client"
import React, { useState, useEffect } from 'react'
import ChatBox from './_components/ChatBox';
import Itinerary from './_components/Itinerary';

const CreateNewTrip = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const animationClass = isMounted
    ? 'opacity-100 translate-y-0'
    : 'opacity-0 translate-y-8';

  return (
    <div className={`flex flex-col lg:flex-row gap-5 px-4 md:px-6 lg:p-10 transition-all duration-1000 ease-out ${animationClass}`}>

      <div className='flex justify-center lg:justify-start lg:flex-shrink-0'>
          <ChatBox />
      </div>

      <div className='flex-1 relative w-full h-[85vh] overflow-auto'>
       <Itinerary/>
      </div>

    </div>
  )
}

export default CreateNewTrip