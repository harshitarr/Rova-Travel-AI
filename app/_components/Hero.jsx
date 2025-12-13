"use client"
import { Textarea } from '@/components/ui/textarea'
import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Send, Globe2, Plane, Landmark, Sparkles, Map, Leaf, TrendingUp, Compass, ChevronRight, Zap } from 'lucide-react'
import { suggestions, features } from './constants';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

const Hero = () => {
    const [isMounted, setIsMounted] = useState(false);
    const [typedText, setTypedText] = useState('');
    const [currentSuggestionIndex, setCurrentSuggestionIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);
    const [typingSpeed, setTypingSpeed] = useState(100);

    const {user} = useUser();
    const router=useRouter();

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Typing effect
    useEffect(() => {
        const suggestionTexts = suggestions.map(s => s.title);
        const currentText = suggestionTexts[currentSuggestionIndex];

        const handleTyping = () => {
            if (!isDeleting) {
                // Typing
                if (typedText.length < currentText.length) {
                    setTypedText(currentText.substring(0, typedText.length + 1));
                    setTypingSpeed(60);
                } else {
                    // Pause before deleting
                    setTimeout(() => setIsDeleting(true), 1500);
                }
            } else {
                // Deleting
                if (typedText.length > 0) {
                    setTypedText(currentText.substring(0, typedText.length - 1));
                    setTypingSpeed(30);
                } else {
                    // Move to next suggestion
                    setIsDeleting(false);
                    setCurrentSuggestionIndex((prev) => (prev + 1) % suggestionTexts.length);
                    setTypingSpeed(300); // Pause before typing next
                }
            }
        };

        const timer = setTimeout(handleTyping, typingSpeed);
        return () => clearTimeout(timer);
    }, [typedText, isDeleting, currentSuggestionIndex, typingSpeed]);

    const onSend = () => {
        if(!user){

            router.push('/sign-in');    
            return;
        }

        //Navigate to trip planning page or trigger trip planning action
        router.push('/create-new-trip');
    }

    const animationClass = isMounted
        ? 'opacity-100 translate-y-0'
        : 'opacity-0 translate-y-8';

    return (
        <div className={`mt-24 w-full flex justify-center transition-all duration-1000 ease-out ${animationClass}`}>
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
                        <div className="w-full h-28 flex items-start p-3">
                            <span className="text-lg md:text-xl font-medium text-[#F472B6]">
                                {typedText}
                                <span className="inline-block w-0.5 h-6 bg-[#F472B6] ml-1 animate-pulse"></span>
                            </span>
                        </div>
                        <Button
                            size={'icon'}
                            className="bg-[#F472B6] hover:bg-pink-500 absolute bottom-6 right-6 h-10 w-10 transition-transform duration-300 hover:scale-105 cursor-pointer"
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
                                className={`flex items-center gap-2 border ${suggestion.borderColor} rounded-full px-4 py-2 cursor-pointer text-gray-700 ${suggestion.bgColor} ${suggestion.hoverColor} hover:text-white transition-all duration-300 text-sm md:text-base w-fit shadow-md transform hover:scale-105 hover:-translate-y-1`}
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
