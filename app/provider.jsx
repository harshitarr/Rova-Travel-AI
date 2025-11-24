
import React from 'react'
import Navbar from './_components/Navbar'

const Provider = ({ children }) => {
  return (
    <div>
      <Navbar />
      
      {children}
    </div>
  )
}

export default Provider
