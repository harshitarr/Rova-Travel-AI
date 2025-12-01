import React from 'react'
import ChatBox from './_components/ChatBox';
import Itinerary from './_components/Itinerary';

const CreateNewTrip = () => {
  return (
    <div className='flex flex-col lg:flex-row gap-5 px-4 md:px-6 lg:p-10'>

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