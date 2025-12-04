import { currentUser, auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import TripDetail from "@/lib/models/TripDetail";

// Function to count trips created today from MongoDB
async function getTripsCreatedToday(clerkId) {
  try {
    await connectDB();
    
    // Get start and end of today in UTC
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    
    const count = await TripDetail.countDocuments({
      clerkId,
      createdAt: {
        $gte: startOfToday,
        $lte: endOfToday
      }
    });
    
    console.log(`Credits API - MongoDB: User ${clerkId} has created ${count} trips today`);
    return count;
  } catch (error) {
    console.error("Error counting trips from MongoDB:", error);
    return 0;
  }
}

export async function GET(req) {
  try {
    // Get the authenticated user from Clerk
    const user = await currentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const clerkId = user?.id;
    
    if (!clerkId) {
      return NextResponse.json(
        { success: false, error: "User ID not found" },
        { status: 400 }
      );
    }
    
    // Check if user has premium subscription
    const { has } = await auth();
    const hasPremiumAccess = has({ plan: 'monthy' });
    
    if (hasPremiumAccess) {
      // Premium user - unlimited trips
      console.log(`Credits API: User ${clerkId} has PREMIUM access - unlimited trips`);
      return NextResponse.json({
        success: true,
        isPremium: true,
        remaining: -1, // -1 indicates unlimited
        total: -1,
      });
    }
    
    // Free user - check MongoDB for actual trip count today
    const tripsCreatedToday = await getTripsCreatedToday(clerkId);
    const remaining = Math.max(0, 5 - tripsCreatedToday);
    
    console.log(`Credits API Summary:`)
    console.log(`- User: ${clerkId}`);
    console.log(`- Trips created today: ${tripsCreatedToday}`);
    console.log(`- Remaining credits: ${remaining}/5`);

    return NextResponse.json({
      success: true,
      isPremium: false,
      remaining: remaining,
      total: 5,
      tripsToday: tripsCreatedToday,
    });
  } catch (error) {
    console.error("Error checking credits:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch credits" },
      { status: 500 }
    );
  }
}
