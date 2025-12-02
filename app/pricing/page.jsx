import React from 'react'
import { PricingTable } from '@clerk/nextjs'


const page = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Choose Your <span className='text-[#F472B6]'>Perfect</span> Plan
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Start planning amazing trips for free or upgrade for unlimited access and premium features
          </p>
        </div>

        {/* Pricing Table Container */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-10 border border-gray-100">
          <PricingTable />
        </div>

        {/* Features Section */}

      </div>
    </div>
  )
}

export default page
