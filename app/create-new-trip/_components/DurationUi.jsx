import React, { useState } from 'react'
import { Button } from '@/components/ui/button';

const DurationUi = ({onSelectedOption}) => {
  const [days, setDays] = useState(3);

  const incrementDays = () => {
    if (days < 30) setDays(days + 1);
  };

  const decrementDays = () => {
    if (days > 1) setDays(days - 1);
  };

  const handleConfirm = () => {
    onSelectedOption(`${days} Day${days > 1 ? 's' : ''}`);
  };

  return (
    <div className='flex flex-col items-center p-4 bg-white rounded-xl border border-gray-200 shadow-sm mt-2 max-w-sm mx-auto'>
      <h3 className="text-base font-medium text-gray-800 mb-4 text-center">
        How many days do you want to travel?
      </h3>
      
      {/* Counter Section */}
      <div className="flex items-center justify-center gap-4 mb-6">
        {/* Minus Button */}
        <button
          onClick={decrementDays}
          className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full transition-colors duration-200 text-gray-600 font-bold text-lg"
          disabled={days <= 1}
        >
          −
        </button>
        
        {/* Days Display */}
        <div className="text-xl font-semibold text-gray-800 min-w-[80px] text-center">
          {days} Day{days > 1 ? 's' : ''}
        </div>
        
        {/* Plus Button */}
        <button
          onClick={incrementDays}
          className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full transition-colors duration-200 text-gray-600 font-bold text-lg"
          disabled={days >= 30}
        >
          +
        </button>
      </div>
      
      {/* Confirm Button */}
      <Button
        onClick={handleConfirm}
        className="bg-[#F472B6] hover:bg-[#EC4899] text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
      >
        Confirm
      </Button>
    </div>
  )
}

export default DurationUi