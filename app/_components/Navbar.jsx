"use client";
import React, { useState, useEffect } from 'react';
import { Plane, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';
import { menuOptions } from './constants';
import { useUser, UserButton, SignInButton } from '@clerk/nextjs';
import { Package, Sparkles, Ticket } from 'lucide-react';



const Navbar = () => {
    
    const [isMounted, setIsMounted] = useState(false);
    const [credits, setCredits] = useState(null);
    const { user } = useUser();
    const currentPath = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    
    useEffect(() => {
        
        setIsMounted(true);
        setIsMenuOpen(false);
    }, [currentPath]); 

    // Fetch user credits
    useEffect(() => {
        const fetchCredits = async () => {
            if (user) {
                try {
                    const response = await fetch('/api/credits');
                    const data = await response.json();
                    console.log('Navbar credits fetch:', data);
                    if (data.success) {
                        setCredits(data.remaining);
                    }
                } catch (error) {
                    console.error('Error fetching credits:', error);
                }
            }
        };
        fetchCredits();
        
        // Refresh credits every 30 seconds to keep it updated
        const interval = setInterval(fetchCredits, 30000);
        return () => clearInterval(interval);
    }, [user]);
    
    const animationClass = isMounted
        ? 'opacity-100 translate-y-0'
        : 'opacity-0 -translate-y-4';

    return (
        <nav 
            className={`sticky top-0 z-50 bg-white shadow-md transition-all duration-700 ease-out ${animationClass}`}
        >
            <div className='flex justify-between items-center px-4 md:px-8 py-3'>

                {/* Logo and Branding */}
                <Link href="/" className="flex items-center gap-2">
                    <Plane size={32} className='text-[#F472B6] w-10 h-10 transform transition-transform duration-500 hover:rotate-12'/>
                    <h2 className="text-2xl font-extrabold tracking-tight text-gray-800">Rova AI</h2>
                </Link>

                {/* Desktop Menu Options */}
                <div className='hidden md:flex gap-8 items-center'>
                    {menuOptions.map((menu, index) => {
                        // Check if the current path matches the menu item's path
                        const isActive = currentPath === menu.path;
                        return (
                            <Link href={menu.path} key={index} className='group'>
                                <div className={`relative transition-all duration-300 ${isActive ? 'text-[#F472B6] font-semibold' : 'text-gray-500 hover:text-pink-500'}`}>
                                    <h2 className='text-lg cursor-pointer transform transition-transform duration-300 hover:scale-105'>
                                        {menu.name}
                                    </h2>
                                    {/* Active link indicator line */}
                                    <div
                                        className={`absolute bottom-0 left-0 h-0.5 bg-[#F472B6] transition-all duration-300 ${isActive ? 'w-full' : 'w-0 group-hover:w-1/2'}`}
                                    ></div>
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {/* Desktop Get Started Button / User Button */}
                {!user ? (
                    <SignInButton>
                        <Button className='hidden md:block bg-[#F472B6] hover:bg-pink-400 transform transition-transform duration-300 hover:scale-[1.02] active:scale-95 shadow-lg hover:shadow-xl'>
                            Get Started
                        </Button>
                    </SignInButton>
                ) : (
                    <div className="hidden md:flex items-center gap-3">
                        <Link href="/create-new-trip">
                         <Button 
                            className=' bg-white border border-pink-500 hover:bg-pink-300 hover:text-white text-[#F472B6] px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer'
                            onClick={() => console.log('My Trips clicked')}
                        >
                            <Sparkles size={16}/>
                           Generate Plan
                        </Button>
                        </Link>
                        <Link href="/my-trips">
                        <Button 
                            className='bg-[#F472B6] hover:bg-pink-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer'
                        >
                            <Package size={16} />
                            My Trips
                        </Button>
                        </Link>
                        {credits !== null && (
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-50 border border-blue-200 text-sm font-medium text-blue-700">
                                <Ticket className="w-4 h-4" />
                                <span>{credits}/5</span>
                            </div>
                        )}
                        <UserButton />
                    </div>
                )}

                {/* Mobile Menu Button (Hamburger) */}
                <button
                    className='md:hidden p-2 text-gray-500 hover:text-pink-500 transition-colors duration-300'
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label="Toggle menu"
                >
                    {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                </button>

            </div>

            {/* Mobile Menu Options */}
            <div
                className={`md:hidden overflow-hidden transition-all duration-500 ease-in-out ${isMenuOpen ? 'max-h-96 opacity-100 py-2' : 'max-h-0 opacity-0'}`}
            >
                <div className='flex flex-col items-start px-4'>
                    {menuOptions.map((menu, index) => {
                           const isActive = currentPath === menu.path;
                        return (
                            <Link
                                href={menu.path}
                                key={index}
                                className={`w-full py-3 border-b text-center border-gray-100 transition-all duration-300 ${isActive ? 'text-[#F472B6] font-bold bg-rose-50' : 'text-gray-700 hover:bg-gray-50'}`}
                                onClick={() => setIsMenuOpen(false)} // Close menu on click
                            >
                                <h2 className='text-lg'>
                                    {menu.name}
                                </h2>
                            </Link>
                        );
                    })}
                    {!user ? (
                        <SignInButton>
                            <Button className='w-full mt-4 mb-2 bg-[#F472B6] hover:bg-pink-500'>
                                Get Started
                            </Button>
                        </SignInButton>
                    ) : (
                        <div className="w-full mt-4 mb-2 flex flex-col items-center gap-3">
                            <Link href="/create-new-trip" className="w-full">
                            <Button 
                                className='w-full bg-white border border-pink-500 hover:bg-pink-300 hover:text-white text-[#F472B6] px-4 py-2 rounded-lg flex items-center justify-center gap-2 cursor-pointer'
                                onClick={() => console.log('Generate Plan clicked')}
                            >
                                <Sparkles size={16}/>
                                Generate Plan
                            </Button>
                            </Link>
                            <Link href="/my-trips" className="w-full">
                            <Button 
                                className='w-full bg-[#F472B6] hover:bg-pink-500 text-white flex items-center justify-center gap-2 cursor-pointer'
                            >
                                <Package size={16} />
                                My Trips
                            </Button>
                            </Link>
                            {credits !== null && (
                                <div className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-md bg-blue-50 border border-blue-200 text-sm font-medium text-blue-700">
                                    <Ticket className="w-4 h-4" />
                                    <span>{credits}/5 Credits</span>
                                </div>
                            )}
                            <UserButton />
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;