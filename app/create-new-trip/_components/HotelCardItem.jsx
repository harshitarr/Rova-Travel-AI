"use client";
import React from 'react'
import { Button } from '@/components/ui/button'
import { ExternalLink, Plane } from 'lucide-react'
import Link from 'next/link'

const HotelCardItem = ({ hotel }) => {
    return (
        <div className="border-2 border-[#F472B6] rounded-xl p-4">
            <div className="flex flex-col gap-3">
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
                <h2 className="font-semibold text-lg">{hotel?.hotel_name}</h2>
                <h3 className="text-gray-500 text-xs line-clamp-2">{hotel?.hotel_address}</h3>
                <div className="flex justify-between items-center">
                    <p className="flex items-center gap-2 text-green-600 text-sm">{hotel?.price_per_night}</p>
                    <p className="flex items-center gap-2 text-yellow-500 text-sm">⭐ {hotel?.rating}</p>
                </div>
                {/* <p className="line-clamp-2 text-gray-500 text-xs">{hotel?.description}</p> */}
                <Button asChild className='bg-[#F472B6] text-white hover:bg-pink-500 cursor-pointer'>
                    <Link 
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hotel?.hotel_name || '')}`} 
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

export default HotelCardItem