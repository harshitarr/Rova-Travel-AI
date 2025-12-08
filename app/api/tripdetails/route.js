import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/lib/models/User';
import mongoose from 'mongoose';

export async function POST(request) {
  try {
    const payload = await request.json();

    // Accept clerkId OR email. If clerkId is missing, attempt to resolve via Clerk session or email lookup.
    if (!payload) {
      return NextResponse.json({ error: 'Missing request payload' }, { status: 400 });
    }

    await connectToDatabase();

    // Resolve clerkId from payload, clerk session, or email
    let clerkId = payload.clerkId;
    if (!clerkId) {
      try {
        const sessionUser = await currentUser();
        clerkId = sessionUser?.id;
        if (sessionUser?.primaryEmailAddress?.emailAddress && !payload.email) {
          // populate payload.email for possible lookup/logging
          payload.email = sessionUser.primaryEmailAddress.emailAddress;
        }
      } catch (e) {
        // ignore - currentUser may fail in some environments
        console.warn('Could not resolve clerk session user:', e?.message || e);
      }
    }

    // If still no clerkId but email provided, try to find user by email and use their clerkId
    let user = null;
    if (clerkId) {
      user = await User.findOne({ clerkId });
    }

    if (!user && payload.email) {
      user = await User.findOne({ email: payload.email });
      if (user && !clerkId) clerkId = user.clerkId;
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Generate tripId if not provided
    const tripId = payload.tripId || new mongoose.Types.ObjectId().toString();

    // Normalize interests to array
    let interests = payload.interests || [];
    if (typeof interests === 'string') {
      interests = interests.split(',').map(s => s.trim()).filter(Boolean);
    }

    // Create trip object
    const trip = {
      tripId,
      title: payload.title || '',
      destination: payload.destination || '',
      startDate: payload.startDate ? new Date(payload.startDate) : undefined,
      endDate: payload.endDate ? new Date(payload.endDate) : undefined,
      budget: payload.budget || '',
      groupSize: payload.groupSize || '',
      interests,
      trip_plan: payload.trip_plan || {},
      itinerary: payload.itinerary || [],
      notes: payload.notes || '',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Add trip to user's trips array
    user.trips.push(trip);
    await user.save(); // This will trigger the pre-save middleware to update numberOfTrips

    console.log(`Trip ${tripId} added to user ${clerkId}. Total trips: ${user.numberOfTrips}`);

    return NextResponse.json({ message: 'Trip created', trip }, { status: 201 });
  } catch (error) {
    console.error('Error creating trip detail:', error);
    console.error(error && error.stack);

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const clerkId = url.searchParams.get('clerkId');
    const tripId = url.searchParams.get('tripId');

    if (!clerkId) {
      return NextResponse.json({ error: 'Missing required param: clerkId' }, { status: 400 });
    }

    await connectToDatabase();

    // Find user and get their trips
    const user = await User.findOne({ clerkId }).lean();
    if (!user) {
      return NextResponse.json({ trips: [] }, { status: 200 });
    }

    let trips = user.trips || [];

    // Filter by tripId if provided
    if (tripId) {
      trips = trips.filter(trip => trip.tripId === tripId);
    }

    // Sort by createdAt descending (newest first)
    trips.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    console.log(`Retrieved ${trips.length} trips for user ${clerkId}`);

    return NextResponse.json({ trips }, { status: 200 });
  } catch (error) {
    console.error('Error fetching trip details:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const payload = await request.json();
    const { clerkId, tripId } = payload;

    if (!clerkId || !tripId) {
      return NextResponse.json({ error: 'Missing required fields: clerkId and tripId' }, { status: 400 });
    }

    await connectToDatabase();

    // Find user and remove the trip from their trips array
    const user = await User.findOne({ clerkId });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Find the trip to check creation date
    const tripToDelete = user.trips.find(trip => trip.tripId === tripId);
    if (!tripToDelete) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    // Check if trip was created today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tripCreatedDate = new Date(tripToDelete.createdAt);
    tripCreatedDate.setHours(0, 0, 0, 0);

    if (tripCreatedDate.getTime() === today.getTime()) {
      return NextResponse.json({ 
        error: 'Cannot delete trips created today. Please wait until tomorrow to prevent credit point malpractice.' 
      }, { status: 403 });
    }

    // Filter out the trip to delete
    const initialLength = user.trips.length;
    user.trips = user.trips.filter(trip => trip.tripId !== tripId);

    if (user.trips.length === initialLength) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    await user.save(); // This will trigger the pre-save middleware to update numberOfTrips

    console.log(`Trip ${tripId} deleted from user ${clerkId}. Remaining trips: ${user.numberOfTrips}`);

    return NextResponse.json({ message: 'Trip deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting trip:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
