"use client";

import React, { useEffect, useState, useContext } from "react";
import Navbar from "./_components/Navbar";
import Footer from "./_components/Footer";
import { useUser } from "@clerk/nextjs";
import { UserDetailContext } from "../context/UserDetailContext";



const Provider = ({ children }) => {
  const { user } = useUser();
  const [userDetail, setUserDetail] = useState(null);


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
        setUserDetail(result.user);
      } else {
        console.error('Failed to save user:', result.error);
      }
    } catch (error) {
      console.error("Error creating user:", error);
    }
  }

  return (
    <UserDetailContext.Provider value={{userDetail,setUserDetail}}>
    <div>
      <Navbar />
      {children}
      <Footer />
    </div>
    </UserDetailContext.Provider>
  );
};

export default Provider;

export const useUserDetail = () => {
  return useContext(UserDetailContext);
}
