"use client";

import React from 'react'
import Navbar from './_components/Navbar'
import Hero from './_components/Hero'

const Provider = ({ children }) => {
  return (
    <div>
      <Navbar />
      <Hero />
      {children}
    </div>
  )
}

export default Provider
