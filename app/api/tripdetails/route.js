import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/lib/models/User';
import mongoose from 'mongoose';

export async function POST(request) {
  try {
    const payload = await request.json();

    if (!payload || !payload.clerkId) {
      return NextResponse.json({ error: 'Missing required field: clerkId' }, { status: 400 });
    }

    await connectToDatabase();

    // Find the user
    const user = await User.findOne({ clerkId: payload.clerkId });
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

    console.log(`Trip ${tripId} added to user ${payload.clerkId}. Total trips: ${user.numberOfTrips}`);

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
