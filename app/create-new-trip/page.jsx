import React from 'react'
import ChatBox from './_components/ChatBox';

const CreateNewTrip = () => {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 gap-5 p-10'>

      <div>
          <ChatBox />
      </div>
      <div>
        Map and trip Plan to Display
      </div>

    </div>
  )
}

export default CreateNewTrip