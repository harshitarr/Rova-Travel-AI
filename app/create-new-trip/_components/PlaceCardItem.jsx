"use client";
import React from 'react'
import { Button } from '@/components/ui/button'
import { ExternalLink, Ticket, Timer } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

function PlaceCardItem({ activity, index }) {
  return (
    <div>
      <div className="flex flex-col gap-2">
        <div className="overflow-hidden rounded-xl shadow relative">
          {activity?.place_image_url && activity.place_image_url.startsWith('http') ? (
            <img src={activity.place_image_url} alt={activity?.place_name} className="w-full h-40 object-cover rounded-xl" loading="lazy" />
          ) : (
            <Image src={activity?.place_image_url || '/placeholder.jpg'} alt={activity?.place_name} width={800} height={240} className="w-full h-40 object-cover rounded-xl" />
          )}
        </div>
        <h2 className="font-semibold text-lg">{activity?.place_name}</h2>
        <p className="text-xs text-gray-500 line-clamp-2">{activity?.place_details || activity?.place_address}</p>
        <h2 className='flex gap-2 text-sm text-green-600 line-clamp-1'><Ticket/>{activity?.ticket_pricing}</h2>
        <p className='flex gap-2 text-sm text-blue-400 line-clamp-1'><Timer/>Best Time : {activity?.best_time_to_visit}</p>
        <Button asChild className='bg-[#F472B6] text-white hover:bg-pink-500 cursor-pointer'>
          <Link href={"https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(activity?.place_name)} target="_blank" rel="noopener noreferrer">View <ExternalLink /></Link>
        </Button>

      </div>
    </div>
  )
}

export default PlaceCardItem