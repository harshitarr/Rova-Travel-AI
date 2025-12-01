"use client";
import React, { useEffect } from 'react'
import axios from 'axios'
import { Button } from '@/components/ui/button'
import { ExternalLink } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

const HotelCardItem = ({ hotel }) => {

    useEffect(() => {
        if (hotel?.hotel_name) GetGooglePlaceDetail();
    }, [hotel?.hotel_name]);

    const GetGooglePlaceDetail = async () => {
        try {
            const result = await axios.post('/api/google-place-detail', { placeName: hotel?.hotel_name });
            console.log('Google Place Detail:', result?.data);
        } catch (err) {
            console.error('GetGooglePlaceDetail error:', err);
        }
    }
    return (
        <div>
            <div className="flex flex-col gap-3">
                <div className="overflow-hidden rounded-xl shadow">
                    {hotel?.hotel_image_url && hotel.hotel_image_url.startsWith('http') ? (
                        <img src={hotel.hotel_image_url} alt={hotel?.hotel_name} className="w-full h-40 object-cover" loading="lazy" />
                    ) : (
                        <Image src={hotel?.hotel_image_url || '/placeholder.jpg'} alt={hotel?.hotel_name} width={800} height={240} className="w-full h-40 object-cover" />
                    )}
                </div>
                <h2 className="font-semibold text-lg">{hotel?.hotel_name}</h2>
                <h3 className="text-gray-500 text-xs line-clamp-2">{hotel?.hotel_address}</h3>
                <div className="flex justify-between items-center">
                    <p className="flex items-center gap-2 text-green-600 text-sm">{hotel?.price_per_night}</p>
                    <p className="flex items-center gap-2 text-yellow-500 text-sm">⭐ {hotel?.rating}</p>
                </div>
                {/* <p className="line-clamp-2 text-gray-500 text-xs">{hotel?.description}</p> */}
                <Button asChild className='bg-[#F472B6] text-white hover:bg-pink-500 cursor-pointer'>
                    <Link href={"https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(hotel?.hotel_name)} target="_blank" rel="noopener noreferrer">View <ExternalLink /></Link>
                </Button>
            </div>
        </div>
    )
}

export default HotelCardItem