"use client";
import React from 'react'
import { Button } from '@/components/ui/button'
import { ExternalLink, Ticket, Timer, Plane } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

function PlaceCardItem({ activity, index }) {
  return (
    <div className="border-2 border-[#F472B6] rounded-xl p-4">
      <div className="flex flex-col gap-2">
        {/* RovaAI Logo */}
        <div className="relative flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-white border border-gray-200 rounded-xl shadow h-40 overflow-hidden">
          {/* Animated sparkles */}
          <div className="absolute inset-0">
            <div className="absolute top-4 left-4 w-1 h-1 bg-pink-400 rounded-full animate-ping" style={{animationDuration: '2s'}}></div>
            <div className="absolute top-8 right-8 w-1.5 h-1.5 bg-purple-400 rounded-full animate-ping" style={{animationDuration: '3s', animationDelay: '0.5s'}}></div>
            <div className="absolute bottom-6 left-12 w-1 h-1 bg-pink-300 rounded-full animate-ping" style={{animationDuration: '2.5s', animationDelay: '1s'}}></div>
            <div className="absolute bottom-10 right-6 w-1 h-1 bg-purple-300 rounded-full animate-ping" style={{animationDuration: '3s', animationDelay: '1.5s'}}></div>
            <div className="absolute top-1/2 left-6 w-1 h-1 bg-pink-400 rounded-full animate-ping" style={{animationDuration: '2s', animationDelay: '0.3s'}}></div>
            <div className="absolute top-1/3 right-10 w-1.5 h-1.5 bg-purple-400 rounded-full animate-ping" style={{animationDuration: '2.8s', animationDelay: '0.8s'}}></div>
          </div>
          
          {/* Logo content */}
          <div className="relative z-10 flex flex-col items-center gap-2">
            <Plane size={48} className='text-[#F472B6] animate-pulse' style={{animationDuration: '3s'}}/>
            <h2 className="text-2xl font-extrabold tracking-tight text-gray-800">Rova AI</h2>
          </div>
        </div>
        <h2 className="font-semibold text-lg">{activity?.place_name}</h2>
        <p className="text-xs text-gray-500 line-clamp-2">{activity?.place_details || activity?.place_address}</p>
        <h2 className='flex gap-2 text-sm text-green-600 line-clamp-1'><Ticket/>{activity?.ticket_pricing}</h2>
        <p className='flex gap-2 text-sm text-blue-400 line-clamp-1'><Timer/>Best Time : {activity?.best_time_to_visit}</p>
        <Button asChild className='bg-[#F472B6] text-white hover:bg-pink-500 cursor-pointer'>
          <Link 
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activity?.place_name || '')}`} 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            View
          </Link>
        </Button>

      </div>
    </div>
  )
}

export default PlaceCardItem