"use client"
import { Textarea } from '@/components/ui/textarea'
import React from 'react'
import { Button } from '@/components/ui/button'
import { Send, Globe2, Plane, Landmark, Sparkles, Map, Leaf, TrendingUp, Compass, ChevronRight, Zap } from 'lucide-react'
import { suggestions, features } from './constants';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

const Hero = () => {

    const {user} = useUser();
    const router=useRouter();
    const onSend = () => {
        if(!user){

            router.push('/sign-in');    
            return;
        }

        //Navigate to trip planning page or trigger trip planning action
    }
    return (
        <div className='mt-24 w-full flex justify-center'>
            {/* Content Container - Centered and Max Width */}
            <div className='max-w-5xl w-full text-center space-y-6 flex flex-col items-center px-4'>

                {/* Header */}
                <h1 className='text-3xl md:text-5xl font-bold'>
                    Hey, I'm your personal <span className='text-[#F472B6]'>Trip Planner</span>
                </h1>
                <p className='text-base md:text-lg text-gray-600'>
                    Just tell me where you want to go, and I will handle the rest!
                </p>

                {/* Input Box */}
                <div className='w-full max-w-3xl mx-auto pt-4'>
                    <div className='border border-gray-200 rounded-2xl p-4 shadow-2xl relative bg-white transition-all duration-300 hover:shadow-rose-300/50'>
                        <Textarea
                            placeholder='Lets plan your trip! Where do you want to go?'
                            className="w-full h-28 bg-transparent border-none focus-visible:ring-0 shadow-none resize-none text-base md:text-lg p-3"
                        />
                        <Button
                            size={'icon'}
                            className="bg-[#F472B6] hover:bg-pink-500 absolute bottom-6 right-6 h-10 w-10 transition-transform duration-300 hover:scale-105"
                            onClick={() =>onSend()} 
                        >
                            <Send className='h-5 w-5' />
                        </Button>
                    </div>
                </div>

                {/* Suggestion list */}
                <div className='flex flex-wrap justify-center gap-3 pt-4'>
                    {suggestions.map((suggestion, index) => {
                        const Icon = suggestion.icon;
                        return (
                            <div
                                key={index}
                                className={`flex items-center gap-2 border ${suggestion.borderColor} rounded-full px-4 py-2 cursor-pointer text-gray-700 ${suggestion.bgColor} ${suggestion.hoverColor} hover:text-white transition-all duration-300 text-sm md:text-base w-fit shadow-md`}
                            >
                                <Icon className={`${suggestion.iconColor} h-5 w-5`} />
                                <h2>{suggestion.title}</h2>
                            </div>
                        );
                    })}
                </div>

                <hr className='w-full max-w-4xl border-t border-gray-100 mt-8 mb-4' />


            </div>
        </div>
    )
}

export default Hero
