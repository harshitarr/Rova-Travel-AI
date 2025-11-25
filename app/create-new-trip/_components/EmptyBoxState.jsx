import React from 'react'
import { Lightbulb, MapPin, AirplaneTakeoff } from 'lucide-react';
import { suggestions } from '../../_components/constants';

const EmptyBoxState = ({ onSelectOption }) => {
  return (
    <div className='mt-7'>
        <h2 className='font-bold text-3xl text-center'>Start Planning Your <span className='text-[#F472B6]'> Trip </span> using <span className='text-[#F472B6]'>Rova</span></h2>
        <p className='text-center text-sm text-gray-400 mt-4'>Discover personalized travel itineraries, find the best destinations, and plan your dream vacation effortlessly with the power of AI.</p>
        <div className='grid grid-cols-2 gap-4 mt-7'>
            {suggestions.map((suggestion, index) => {
                const Icon = suggestion.icon;
                return (
                    <div
                        key={index}
                        className={`flex items-center justify-center gap-2 border ${suggestion.borderColor} rounded-xl p-3 cursor-pointer  text-gray-700 ${suggestion.bgColor} ${suggestion.hoverColor} hover:text-white transition-all duration-300 text-sm md:text-base shadow-md`}
                        onClick={()=>onSelectOption(suggestion.title)}
                    
                    >
                        <Icon className={`${suggestion.iconColor} h-5 w-5`} />
                        <h2 className="text-center">{suggestion.title}</h2>
                    </div>
                );
            })}
        </div>
    </div> 
  )
}

export default EmptyBoxState