"use client"
import { Textarea } from '@/components/ui/textarea'
import React from 'react'
import { Button } from '@/components/ui/button'
import { Send, Globe2, Plane, Landmark, Sparkles, Map, Leaf, TrendingUp, Compass, ChevronRight, Zap } from 'lucide-react'
import { Globe } from "@/components/ui/globe"

// --- Suggestions Data ---
const suggestions = [
    {
        title: 'Plan a Europe backpacking trip',
        icon: Globe2
    },
    {
        title: 'Find cheap flights to Bali',
        icon: Plane
    },
    {
        title: 'Best historical sites in Rome',
        icon: Landmark
    },
    {
        title: 'Weekend getaway in the mountains',
        icon: Sparkles
    },
]

// --- Feature Data for Globe Section ---
const features = [
    {
        title: 'Custom Itineraries',
        icon: Map,
        description: 'Instant, personalized daily plans tailored to your interests and pace.'
    },
    {
        title: 'Sustainable Travel Tips',
        icon: Leaf,
        description: 'Eco-friendly recommendations for transportation and local experiences.'
    },
]

const Hero = () => {
    return (
        <div className='mt-24 w-full flex justify-center'>
            {/* Content Container - Centered and Max Width */}
            <div className='max-w-5xl w-full text-center space-y-6 flex flex-col items-center px-4'>

                {/* Header */}
                <h1 className='text-3xl md:text-5xl font-bold'>
                    Hey, I'm your personal <span className='text-rose-400'>Trip Planner</span>
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
                            className="bg-rose-400 hover:bg-rose-500 absolute bottom-6 right-6 h-10 w-10 transition-transform duration-300 hover:scale-105"
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
                                className='flex items-center gap-2 border border-rose-200 rounded-full px-4 py-2 cursor-pointer
                                    text-gray-700 bg-rose-50 hover:bg-rose-400 hover:text-white
                                    transition-all duration-300 text-sm md:text-base w-fit shadow-md'
                            >
                                <Icon className='text-blue-400 h-5 w-5' />
                                <h2>{suggestion.title}</h2>
                            </div>
                        );
                    })}
                </div>

                <hr className='w-full max-w-4xl border-t border-gray-100 mt-8 mb-4' />

                {/* Globe Section Container */}
                <div className='w-full pt-8 flex justify-center'>
                    <div className='relative w-full max-w-4xl h-[520px] bg-white rounded-3xl shadow-2xl overflow-hidden
                                    flex items-start p-10 border-4 border-rose-100 transition-all duration-500 hover:border-rose-400
                                    ring-4 ring-rose-50/50 hover:ring-rose-200/70'> 

                        {/* Subtle Animated Grainy Background Overlay */}
                        <div className='absolute inset-0 z-0 grainy-bg'></div>

                        {/* 'Powered by AI' Badge */}
                        <div className='absolute top-4 right-4 z-40 flex items-center bg-rose-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md'>
                            <Zap className='h-3 w-3 mr-1' />
                            Powered by AI
                        </div>

                        {/* Globe Text Overlay & Side Feature Text */}
                        <div className='absolute left-10 text-left z-30 space-y-7 animate-fadeInUp' style={{ top: '80px' }}>
                            
                            {/* Globe Title */}
                            <h2 className='text-5xl md:text-6xl font-extrabold ' style={{
                                backgroundImage: 'linear-gradient(to right, #f43f5e, #e87998)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                textShadow: '0 4px 10px rgba(244, 63, 94, 0.2)'
                            }}>
                                World View
                            </h2>

                            {/* Call to Action Text */}
                            <div className='text-gray-800 text-lg font-semibold max-w-xs'>
                                <p className='text-3xl font-bold'>Ready to Go?</p>
                                <p className='text-base text-gray-600 mt-2'>
                                    Let us analyze millions of routes and data points to build your perfect trip itinerary instantly.
                                </p>
                            </div>

                            {/* Feature List Box */}
                            <div className='space-y-3 mt-4'>
                                {features.map((feature, index) => {
                                    const Icon = feature.icon;
                                    return (
                                        <div
                                            key={index}
                                            className='flex items-start gap-4 p-4 rounded-xl bg-white shadow-lg border border-rose-100/70
                                                       transition-transform duration-300 hover:scale-[1.02] hover:shadow-rose-100/90'
                                        >
                                            <div className='p-2 rounded-full bg-rose-100'>
                                                <Icon className='h-5 w-5 text-rose-400' />
                                            </div>
                                            <div>
                                                <h4 className='font-bold text-gray-900'>{feature.title}</h4>
                                                <p className='text-gray-500 text-xs mt-0.5'>{feature.description}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Start Planning Button */}
                            <Button 
                                className="mt-8 bg-rose-500 hover:bg-rose-600 transition-all duration-300 shadow-2xl shadow-rose-300/60 text-lg font-bold py-3 px-6 h-auto"
                            >
                                Launch Travel Portal
                                <ChevronRight className='h-5 w-5 ml-2'/>
                            </Button>
                        </div>

                        <div className='absolute right-[-70px] bottom-[-70px] w-[600px] h-[600px] flex items-end justify-end z-20'>
                            <Globe />
                        </div>

                    </div>
                </div>

            </div>
        </div>
    )
}

export default Hero
