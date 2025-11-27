import React, { useRef } from 'react'
import {SelectTravelesList} from '../../_components/constants';

const GroupSizeUi = ({onSelectedOption}) => {
  const clickTimeoutRef = useRef(null);

  const handleClick = (item) => {
    if (clickTimeoutRef.current) {
      // Double click detected
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
      onSelectedOption(item.title+" : Around "+item.people, true); // true for double tap
    } else {
      // Single click - wait to see if there's a second click
      clickTimeoutRef.current = setTimeout(() => {
        onSelectedOption(item.title+" : Around "+item.people, false); // false for single tap
        clickTimeoutRef.current = null;
      }, 300); // 300ms delay to detect double click
    }
  };

  return (
    <div className='grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-2 sm:gap-3 md:gap-4 items-center mt-1'>
        {SelectTravelesList.map((item,index)=>(
            <div key={index} className='p-2 sm:p-3 md:p-4 border rounded-xl md:rounded-2xl bg-white hover:border-pink-400 cursor-pointer text-center min-h-20 sm:min-h-24 md:min-h-28 flex flex-col justify-center transition-all duration-200'
            onClick={()=>handleClick(item)}
            >
                <div className="text-xl sm:text-2xl md:text-3xl mb-1 sm:mb-2">{item.icon}</div>
                <div className="text-xs sm:text-sm md:text-base font-medium leading-tight">{item.title}</div>
                <div className="text-xs sm:text-xs md:text-sm text-gray-500 leading-tight mt-0.5">{item.desc}</div>
            </div>
        ))}
    </div>
  )
}

export default GroupSizeUi