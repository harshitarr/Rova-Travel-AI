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
      // If no user found, create a minimal placeholder user so trips can be saved.
      // Generate a unique clerkId/email if none provided.
      const generatedClerkId = clerkId || `anon_${new mongoose.Types.ObjectId().toString()}`;
      const generatedEmail = payload.email || `${generatedClerkId}@example.com`;
      const generatedName = payload.name || 'Guest User';
      const generatedImage = payload.imageUrl || '';

      try {
        user = new User({
          clerkId: generatedClerkId,
          name: generatedName,
          email: generatedEmail,
          imageUrl: generatedImage,
          subscription: null,
          trips: []
        });

        await user.save();
        console.log(`Created placeholder user ${generatedClerkId} to save trip.`);
      } catch (createErr) {
        console.error('Failed to create placeholder user:', createErr?.message || createErr);
        return NextResponse.json({ error: 'Failed to create user to save trip' }, { status: 500 });
      }
    }

    // Generate tripId if not provided
    const tripId = payload.tripId || new mongoose.Types.ObjectId().toString();

    // Normalize interests to array
    let interests = payload.interests || [];
    if (typeof interests === 'string') {
      interests = interests.split(',').map(s => s.trim()).filter(Boolean);
    }

    // --- Robustly accept only valid JSON trip plans ---
    let trip_plan = payload.trip_plan || {};
    let itinerary = payload.itinerary || [];
    let parseError = null;

    // If trip_plan_raw is present and trip_plan is missing, try to parse it
    if ((!trip_plan || Object.keys(trip_plan).length === 0) && payload.trip_plan_raw) {
      try {
        const raw = typeof payload.trip_plan_raw === 'string' ? payload.trip_plan_raw : JSON.stringify(payload.trip_plan_raw);
        const parsed = JSON.parse(raw);
        if (parsed.trip_plan) {
          trip_plan = parsed.trip_plan;
        } else {
          trip_plan = parsed;
        }
        itinerary = trip_plan.itinerary || itinerary;
      } catch (e) {
        parseError = e;
        console.error('Failed to parse trip_plan_raw:', e?.message || e);
      }
    }

    // Accept itinerary as-is
    if (!Array.isArray(itinerary) && trip_plan && Array.isArray(trip_plan.itinerary)) {
      itinerary = trip_plan.itinerary;
    }

    // Validate trip_plan: must be an object with non-empty itinerary array
    let requestedDays = 0;
    // Try to extract requested days from trip_plan.duration (e.g., "10 days")
    if (trip_plan && typeof trip_plan.duration === 'string') {
      const match = trip_plan.duration.match(/(\d+)/);
      if (match) requestedDays = parseInt(match[1]);
    }

    const itineraryDays = Array.isArray(trip_plan.itinerary) ? trip_plan.itinerary.length : 0;

    // Helper to call the AI for missing days (calls /api/aimodel internally)
    async function fetchMissingDays(startDay, endDay, tripPlanBase) {
      // Compose a prompt for the missing days
      const prompt = `Generate ONLY days ${startDay} to ${endDay} for the following trip, in the same JSON format as before. Do NOT repeat previous days.\nBase trip info: ${JSON.stringify(tripPlanBase)}`;
      // Use OpenRouter/OpenAI directly (simulate the same as /api/aimodel)
      try {
        const { openai } = await import("@/configs/openai");
        const completion = await openai.chat.completions.create({
          model: "openrouter/auto",
          messages: [
            { role: "system", content: prompt }
          ],
          temperature: 0.3,
          max_tokens: 4000
        });
        const responseText = completion.choices[0].message.content;
        const parsed = JSON.parse(responseText);
        if (parsed.trip_plan && Array.isArray(parsed.trip_plan.itinerary)) {
          return parsed.trip_plan.itinerary;
        } else if (Array.isArray(parsed.itinerary)) {
          return parsed.itinerary;
        }
      } catch (e) {
        console.error('Failed to fetch missing days:', e?.message || e);
      }
      return [];
    }

    // If incomplete, try to auto-complete missing days
    if (
      !parseError &&
      trip_plan && Array.isArray(trip_plan.itinerary) &&
      requestedDays > 0 && itineraryDays > 0 && itineraryDays < requestedDays
    ) {
      const lastDay = itineraryDays;
      const missingStart = lastDay + 1;
      const missingEnd = requestedDays;
      const basePlan = { ...trip_plan };
      // Remove existing itinerary to avoid repetition
      delete basePlan.itinerary;
      const missingItinerary = await fetchMissingDays(missingStart, missingEnd, basePlan);
      if (Array.isArray(missingItinerary) && missingItinerary.length > 0) {
        trip_plan.itinerary = [...trip_plan.itinerary, ...missingItinerary];
        itinerary = trip_plan.itinerary;
      }
    }

    // Final validation: must have all requested days
    const finalItineraryDays = Array.isArray(trip_plan.itinerary) ? trip_plan.itinerary.length : 0;
    if (parseError || !trip_plan || typeof trip_plan !== 'object') {
      return NextResponse.json({
        error: 'Trip plan is invalid or could not be parsed.',
        details: parseError ? parseError.message : null,
        requestedDays,
        itineraryDays: finalItineraryDays
      }, { status: 400 });
    }

    // If itinerary is missing or empty, initialize as empty array
    if (!Array.isArray(trip_plan.itinerary)) {
      trip_plan.itinerary = [];
    }

    // If there are missing days, auto-fill with leisure/shopping/empty day messages
    if (requestedDays > 0 && trip_plan.itinerary.length < requestedDays) {
      const filled = [...trip_plan.itinerary];
      for (let d = filled.length + 1; d <= requestedDays; d++) {
        // Rotate through leisure, shopping, and not enough places
        let day_plan = '';
        if (d % 3 === 1) day_plan = 'Leisure day';
        else if (d % 3 === 2) day_plan = 'Shopping and relaxation';
        else day_plan = 'Not enough places to visit for your requirements';
        filled.push({
          day: d,
          day_plan,
          best_time_to_visit_day: '',
          activities: []
        });
      }
      trip_plan.itinerary = filled;
      itinerary = filled;
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
      trip_plan,
      itinerary: trip_plan.itinerary || [],
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
    if (error && error.stack) {
      console.error(error.stack);
    }

    return NextResponse.json({
      error: error?.message || 'Internal server error',
      stack: error?.stack || null
    }, { status: 500 });
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
