"use client";
import React, { useState, useEffect } from 'react';
import { Plane, Menu, X, Box } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';
import { menuOptions } from './constants';
import { useUser, UserButton, SignInButton } from '@clerk/nextjs';
import { Sparkles, Ticket, Crown } from 'lucide-react';



const Navbar = () => {
    
    const [isMounted, setIsMounted] = useState(false);
    const [creditsInfo, setCreditsInfo] = useState(null);
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
                    // Send credentials to include Clerk session cookie
                    const response = await fetch('/api/credits', { credentials: 'include' });
                    const data = await response.json();
                    console.log('Navbar credits fetch:', data);
                    if (data.success) {
                        setCreditsInfo(data);
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
            <div className='flex items-center justify-between md:grid md:grid-cols-3 md:items-center px-4 md:px-8 py-3'>

                {/* Logo and Branding */}
                <div className='col-start-1 flex items-center gap-2'>
                    <Link href="/" className="flex items-center gap-2">
                        <Plane className='text-[#F472B6] w-8 h-8 md:w-10 md:h-10 transform transition-transform duration-500 hover:rotate-12'/>
                        <h2 className="text-lg md:text-2xl font-extrabold tracking-tight text-gray-800">Rova AI</h2>
                    </Link>
                </div>

                {/* Desktop Menu Options - Centered */}
                <div className='hidden md:flex md:col-start-2 md:justify-center md:items-center md:gap-10 md:mx-auto'>
                    {menuOptions.map((menu, index) => {
                        // Check if the current path matches the menu item's path
                        const isActive = currentPath === menu.path;
                        return (
                            <Link href={menu.path} key={index} className='group'>
                                <div className={`relative transition-all duration-300 ${isActive ? 'text-[#F472B6] font-semibold' : 'text-gray-500 hover:text-pink-500'}`}>
                                    <h2 className='text-sm lg:text-lg cursor-pointer transform transition-transform duration-300 hover:scale-105'>
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
                <div className="col-start-3 flex items-center justify-end gap-4">
                    {/* Desktop / md+ full actions */}
                    {!user ? (
                        <div className='hidden md:flex items-center'>
                            <SignInButton>
                                <Button className='bg-[#F472B6] hover:bg-pink-400 transform transition-transform duration-300 hover:scale-[1.02] active:scale-95 shadow-lg hover:shadow-xl'>
                                    Get Started
                                </Button>
                            </SignInButton>
                        </div>
                    ) : (
                        <div className='hidden md:flex items-center gap-3'>
                            <Link href="/create-new-trip">
                                <Button 
                                    className=' bg-white border border-pink-500 hover:bg-pink-300 hover:text-white text-[#F472B6] px-3 py-2 rounded-lg flex items-center gap-2 cursor-pointer'
                                >
                                    <Sparkles size={16}/>
                                    <span className='hidden lg:inline'>Generate Plan</span>
                                </Button>
                            </Link>
                            <Link href="/my-trips">
                                <Button 
                                    className='bg-[#F472B6] hover:bg-pink-500 text-white px-3 py-2 rounded-lg flex items-center gap-2 cursor-pointer'
                                ><Box size={16}/>
                                    <span className='hidden lg:inline'>My Trips</span>
                                </Button>
                            </Link>
                            {creditsInfo && (
                                creditsInfo.unlimited ? (
                                    <div className="flex items-center gap-1 px-3 py-1 rounded-md bg-yellow-50 border border-yellow-200 text-sm font-semibold text-yellow-800 mr-2">
                                        <Crown className="w-4 h-4 text-yellow-600" />
                                        <span>Premium</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center gap-1 px-3 py-1.5 min-w-[56px] rounded-md bg-blue-50 border border-blue-200 text-sm font-medium text-blue-700 mr-2">
                                        <Ticket className="w-4 h-4 text-blue-600" />
                                        <span className="text-sm font-semibold">{creditsInfo.remaining}/5</span>
                                    </div>
                                )
                            )}
                            <UserButton />
                        </div>
                    )}

                    {/* Mobile compact actions (visible on small screens) */}
                    <div className="flex md:hidden items-center gap-2">
                        {user && (
                            <>
                                <Link href="/create-new-trip" aria-label="Generate plan" className="p-2 rounded-md hover:bg-gray-100">
                                    <Sparkles size={18} className="text-pink-500" />
                                </Link>
                                {/* My Trips icon removed on mobile compact view */}
                                {creditsInfo && (
                                    creditsInfo.unlimited ? (
                                        <div className="flex items-center px-2 py-1 rounded-md bg-yellow-50 border border-yellow-200 text-sm font-semibold text-yellow-800">
                                            <Crown className="w-4 h-4 text-yellow-600" />
                                        </div>
                                    ) : (
                                        <div className="flex items-center px-2 py-1 rounded-md bg-blue-50 border border-blue-200 text-sm font-medium text-blue-700">
                                            <Ticket className="w-4 h-4 text-blue-600" />
                                            <span className="ml-1 text-xs font-semibold">{creditsInfo.remaining}</span>
                                        </div>
                                    )
                                )}
                            </>
                        )}
                        {/* Mobile menu toggle */}
                        <button
                            className='p-2 text-gray-500 hover:text-pink-500 transition-colors duration-300'
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            aria-label="Toggle menu"
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Desktop: ensure the hamburger isn't duplicated */}
                <div className='hidden md:block' />

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
                            ><Box size={16}/>
                                My Trips
                            </Button>
                            </Link>
                            {creditsInfo && (
                                creditsInfo.unlimited ? (
                                    <div className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-yellow-50 border border-yellow-200 text-sm font-semibold text-yellow-800">
                                        <Crown className="w-4 h-4 text-yellow-600" />
                                        <span>Premium</span>
                                    </div>
                                ) : (
                                    <div className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-md bg-blue-50 border border-blue-200 text-sm font-medium text-blue-700">
                                        <Ticket className="w-4 h-4 text-blue-600" />
                                        <span className="text-sm font-semibold">{creditsInfo.remaining}/5</span>
                                    </div>
                                )
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