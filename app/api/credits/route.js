import { currentUser, auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/lib/models/User";

// Function to count trips created today from MongoDB
async function getTripsCreatedToday(clerkId) {
  try {
    await connectDB();
    
    // Get start and end of today in UTC
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    
    // Find user and count trips created today from their trips array
    const user = await User.findOne({ clerkId });
    if (!user || !user.trips) {
      return 0;
    }
    
    const count = user.trips.filter(trip => {
      const tripDate = new Date(trip.createdAt);
      return tripDate >= startOfToday && tripDate <= endOfToday;
    }).length;
    
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
    
    // Use only auth-based logic per request: check plan key 'monthy' via auth().has and auth.protect
    let hasPremiumAccess = false;
    let decision = null;
    try {
      const { has } = await auth();
      hasPremiumAccess = typeof has === 'function' ? has({ plan: 'monthy' }) : false;
      if (typeof auth.protect === 'function') {
        decision = await auth.protect(req, { userId: user?.id });
      }
    } catch (err) {
      console.warn('Credits auth check failed:', err?.message || err);
    }

    console.log('Credits API - auth check:', { hasPremiumAccess, decision });

    // If Clerk reports the user has the plan, still confirm there is no expired subscription recorded
    // in our DB. If an expiry is present and in the past, treat the user as basic (do NOT modify DB).
    if (hasPremiumAccess) {
      try {
        await connectDB();
        const dbUser = await User.findOne({ clerkId });
        if (dbUser) {
          // Look for common expiry field names that might have been set by other processes
          const expiryKeys = [
            'subscriptionExpiresAt',
            'subscriptionEnd',
            'subscriptionExpiry',
            'subscription_expires_at',
            'subscription_expires',
            'subscription_end',
            'endsAt',
            'expiresAt'
          ];

          let expiry = null;
          for (const key of expiryKeys) {
            if (dbUser[key]) {
              expiry = dbUser[key];
              break;
            }
          }

          // If subscription was stored as an object (future-proof), try common nested keys
          if (!expiry && dbUser.subscription && typeof dbUser.subscription === 'object') {
            expiry = dbUser.subscription.expiresAt || dbUser.subscription.endDate || dbUser.subscription.expires;
          }

          // Log the found subscription object and expiry for debugging
          if (dbUser.subscription) {
            console.log('Credits API - DB subscription object for user:', dbUser.clerkId || clerkId, dbUser.subscription);
          }
          if (expiry) {
            console.log('Credits API - found expiry value in DB (raw):', expiry);
          } else {
            console.log('Credits API - no expiry value found in DB for user', clerkId);
          }

          if (expiry) {
            const expDate = new Date(expiry);
            const isExpired = !isNaN(expDate) && expDate < new Date();
            console.log('Credits API - parsed expiry date:', expDate, 'isExpired:', isExpired);
            if (isExpired) {
              console.log('Credits API - subscription expired in DB; treating as non-premium', { clerkId, expiry: expDate });
              // If Clerk says user is premium but DB shows expired, we'll treat as premium (sync below)
            }
          }

          // If Clerk reports premium but DB has no subscription or premium=false or expired, sync a subscription object.
          // This writes a minimal subscription object with a 30-day expiry (default for 'monthy').
          try {
            const needsSync = !dbUser.subscription || dbUser.subscription.premium !== true || (dbUser.subscription.expiresAt && new Date(dbUser.subscription.expiresAt) < new Date());
            if (needsSync) {
              const now = new Date();
              const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
              const subscriptionObj = {
                plan: 'monthy',
                expiresAt: expiresAt.toISOString(),
                premium: true
              };
              const updated = await User.findOneAndUpdate({ clerkId }, { $set: { subscription: subscriptionObj } }, { new: true, upsert: false });
              console.log('Credits API - synced subscription to DB for user', clerkId, updated?.subscription);
            }
          } catch (syncErr) {
            console.warn('Credits API - failed to sync subscription to DB:', syncErr?.message || syncErr);
          }
        }
      } catch (err) {
        console.warn('Credits API - error checking DB expiry:', err?.message || err);
      }
    }

    // Apply the exact check from the snippet: if remaining == 0 AND hasPremiumAccess => limit response
    if (decision?.reason?.remaining == 0 && hasPremiumAccess) {
      return NextResponse.json({ success: true, resp: 'No Free Credit Remaining', ui: 'limit' }, { status: 200 });
    }

    // If Clerk decision didn't provide remaining, compute trips today and derive remaining from DB
    let tripsToday = 0;
    try {
      tripsToday = await getTripsCreatedToday(clerkId);
    } catch (err) {
      console.warn('Credits API - could not compute tripsToday:', err?.message || err);
      tripsToday = 0;
    }

    // Default limit for free users
    const FREE_LIMIT = 5;

    let remaining = null;
    if (typeof decision?.reason?.remaining === 'number') {
      remaining = decision.reason.remaining;
    } else if (!hasPremiumAccess) {
      // Calculate remaining from tripsToday for non-premium users
      remaining = Math.max(0, FREE_LIMIT - tripsToday);
    } else {
      // Premium users considered unlimited
      remaining = null;
    }

    return NextResponse.json({
      success: true,
      unlimited: Boolean(hasPremiumAccess),
      subscription: hasPremiumAccess ? 'monthy' : null,
      remaining,
      tripsToday
    });
  } catch (error) {
    console.error("Error checking credits:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch credits" },
      { status: 500 }
    );
  }
}
