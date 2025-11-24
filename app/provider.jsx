"use client";

import React, { useEffect } from "react";
import Navbar from "./_components/Navbar";
import Footer from "./_components/Footer";
import { useUser } from "@clerk/nextjs";



const Provider = ({ children }) => {
  const { user } = useUser();


  useEffect(() => {
    if (user) {
      createNewUser({
        email: user?.primaryEmailAddress?.emailAddress,
        imageUrl: user?.imageUrl,
        name: user?.fullName ?? user?.firstName ?? "",
      });
    }
  }, [user]);


  async function createNewUser({ email, imageUrl, name }) {
    try {
      console.log("Creating user in MongoDB", { email, imageUrl, name });
      
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          name,
          imageUrl,
        }),
      });

      const result = await response.json();
      
      if (response.ok) {
        console.log('User saved to MongoDB:', result);
      } else {
        console.error('Failed to save user:', result.error);
      }
    } catch (error) {
      console.error("Error creating user:", error);
    }
  }

  return (
    <div>
      <Navbar />
      {children}
      <Footer />
    </div>
  );
};

export default Provider;
