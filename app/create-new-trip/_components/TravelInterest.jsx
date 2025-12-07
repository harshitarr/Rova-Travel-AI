import React, { useRef } from 'react'
import {SelectTravelInterests} from '../../_components/constants';

const TravelInterest = ({onSelectedOption}) => {
  const clickTimeoutRef = useRef(null);

  const handleClick = (item) => {
    if (clickTimeoutRef.current) {
      // Double click detected
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
      // Only pass the interest title (not the description)
      onSelectedOption(item.title, true); // true for double tap
    } else {
      // Single click - wait to see if there's a second click
      clickTimeoutRef.current = setTimeout(() => {
        // Only pass the interest title (not the description)
        onSelectedOption(item.title, false); // false for single tap
        clickTimeoutRef.current = null;
      }, 300); // 300ms delay to detect double click
    }
  };

  return (
        <div className='grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-2 sm:gap-3 md:gap-4 items-center mt-1'>
            {SelectTravelInterests.map((item,index)=>{
                const Icon = item.icon;
                return (
                <div key={index} className='p-2 sm:p-3 md:p-4 border rounded-xl md:rounded-2xl bg-white hover:border-pink-400 cursor-pointer text-center min-h-20 sm:min-h-24 md:min-h-28 flex flex-col justify-center transition-all duration-300 transform hover:scale-105 hover:shadow-lg animate-fadeIn'
                onClick={()=>handleClick(item)}
                style={{ animationDelay: `${index * 0.1}s` }}
                >
                    <div className="mb-1 sm:mb-2 flex justify-center"><Icon className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-pink-500" /></div>
                    <div className="text-xs sm:text-sm md:text-base font-medium leading-tight">{item.title}</div>
                    <div className="text-xs sm:text-xs md:text-sm text-gray-500 leading-tight mt-0.5">{item.desc}</div>
                </div>
                );
            })}
        </div>
  )
}

export default TravelInterest