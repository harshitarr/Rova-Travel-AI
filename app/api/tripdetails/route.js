import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/lib/models/User';
import mongoose from 'mongoose';
// Ensure this file exports 'groq' as per previous instructions
import { groq } from "@/configs/openai"; 

export async function POST(request) {
  try {
    const payload = await request.json();

    if (!payload) {
      return NextResponse.json({ error: 'Missing request payload' }, { status: 400 });
    }

    await connectToDatabase();

    // 1. Resolve User (Clerk ID / Email)
    let clerkId = payload.clerkId;
    if (!clerkId) {
      try {
        const sessionUser = await currentUser();
        clerkId = sessionUser?.id;
        if (sessionUser?.primaryEmailAddress?.emailAddress && !payload.email) {
          payload.email = sessionUser.primaryEmailAddress.emailAddress;
        }
      } catch (e) {
        console.warn('Could not resolve clerk session user:', e?.message || e);
      }
    }

    let user = null;
    if (clerkId) {
      user = await User.findOne({ clerkId });
    }

    if (!user && payload.email) {
      user = await User.findOne({ email: payload.email });
      if (user && !clerkId) clerkId = user.clerkId;
    }

    // 2. Create Placeholder User if missing
    if (!user) {
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

    // 3. Prepare Trip Data
    const tripId = payload.tripId || new mongoose.Types.ObjectId().toString();

    let interests = payload.interests || [];
    if (typeof interests === 'string') {
      interests = interests.split(',').map(s => s.trim()).filter(Boolean);
    }

    // --- Robust Trip Plan Parsing ---
    let trip_plan = payload.trip_plan || {};
    let itinerary = payload.itinerary || [];
    let parseError = null;

    if ((!trip_plan || Object.keys(trip_plan).length === 0) && payload.trip_plan_raw) {
      try {
        const raw = typeof payload.trip_plan_raw === 'string' ? payload.trip_plan_raw : JSON.stringify(payload.trip_plan_raw);
        const parsed = JSON.parse(raw);
        trip_plan = parsed.trip_plan || parsed;
        itinerary = trip_plan.itinerary || itinerary;
      } catch (e) {
        parseError = e;
        console.error('Failed to parse trip_plan_raw:', e?.message || e);
      }
    }

    if (!Array.isArray(itinerary) && trip_plan && Array.isArray(trip_plan.itinerary)) {
      itinerary = trip_plan.itinerary;
    }

    // 4. Calculate Days logic
    let requestedDays = 0;
    if (trip_plan && typeof trip_plan.duration === 'string') {
      const match = trip_plan.duration.match(/(\d+)/);
      if (match) requestedDays = parseInt(match[1]);
    }

    const itineraryDays = Array.isArray(trip_plan.itinerary) ? trip_plan.itinerary.length : 0;

    // --- HELPER: Fetch Missing Days using Groq ---
    async function fetchMissingDays(startDay, endDay, tripPlanBase) {
      const prompt = `
        You are a travel itinerary extender. 
        Generate valid JSON for ONLY days ${startDay} to ${endDay} to complete the trip.
        Do NOT repeat day 1 to ${startDay - 1}.
        
        Base trip details: ${JSON.stringify(tripPlanBase).substring(0, 1000)}... (truncated context).
        
        Output Schema:
        {
          "itinerary": [
            {
              "day": number,
              "day_plan": "string",
              "best_time_to_visit_day": "string",
              "activities": [ ...same schema as standard activities... ]
            }
          ]
        }
      `;

      try {
        // Use Groq client imported from configs
        const completion = await groq.chat.completions.create({
          model: "llama3-70b-8192", // Fast, large context
          messages: [
            { role: "system", content: "You are a JSON generator. Output strictly valid JSON." },
            { role: "user", content: prompt }
          ],
          temperature: 0.3,
          max_tokens: 4000,
          response_format: { type: "json_object" } // Force JSON
        });

        const responseText = completion.choices[0]?.message?.content || "{}";
        const parsed = JSON.parse(responseText);
        
        // Handle variations in AI output structure
        if (parsed.itinerary && Array.isArray(parsed.itinerary)) {
          return parsed.itinerary;
        } else if (parsed.trip_plan && Array.isArray(parsed.trip_plan.itinerary)) {
          return parsed.trip_plan.itinerary;
        }
      } catch (e) {
        console.error('Failed to fetch missing days via Groq:', e?.message || e);
      }
      return [];
    }

    // 5. Auto-complete missing days if necessary
    if (
      !parseError &&
      trip_plan && Array.isArray(trip_plan.itinerary) &&
      requestedDays > 0 && itineraryDays > 0 && itineraryDays < requestedDays
    ) {
      console.log(`Itinerary incomplete (Got ${itineraryDays}, wanted ${requestedDays}). Fetching missing days...`);
      const lastDay = itineraryDays;
      const missingStart = lastDay + 1;
      const missingEnd = requestedDays;
      
      const basePlan = { ...trip_plan };
      delete basePlan.itinerary; // Don't send full existing itinerary to save tokens
      
      const missingItinerary = await fetchMissingDays(missingStart, missingEnd, basePlan);
      
      if (Array.isArray(missingItinerary) && missingItinerary.length > 0) {
        // Correct the day numbers if AI messed them up
        const correctedMissing = missingItinerary.map((day, idx) => ({
            ...day,
            day: missingStart + idx
        }));
        
        trip_plan.itinerary = [...trip_plan.itinerary, ...correctedMissing];
        itinerary = trip_plan.itinerary;
      }
    }

    // 6. Validation
    const finalItineraryDays = Array.isArray(trip_plan.itinerary) ? trip_plan.itinerary.length : 0;
    if (parseError || !trip_plan || typeof trip_plan !== 'object') {
      return NextResponse.json({
        error: 'Trip plan is invalid or could not be parsed.',
        details: parseError ? parseError.message : null,
        requestedDays,
        itineraryDays: finalItineraryDays
      }, { status: 400 });
    }

    // 7. Final Fallback (Fill with strings if AI failed)
    if (!Array.isArray(trip_plan.itinerary)) {
      trip_plan.itinerary = [];
    }

    if (requestedDays > 0 && trip_plan.itinerary.length < requestedDays) {
      const filled = [...trip_plan.itinerary];
      for (let d = filled.length + 1; d <= requestedDays; d++) {
        let day_plan = '';
        if (d % 3 === 1) day_plan = 'Relaxation and local exploration';
        else if (d % 3 === 2) day_plan = 'Shopping and souvenirs';
        else day_plan = 'Departure preparation or leisure time';
        
        filled.push({
          day: d,
          day_plan,
          best_time_to_visit_day: 'Anytime',
          activities: []
        });
      }
      trip_plan.itinerary = filled;
      itinerary = filled;
    }

    // 8. Save to MongoDB
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

    user.trips.push(trip);
    await user.save();

    console.log(`Trip ${tripId} added to user ${clerkId}. Total trips: ${user.numberOfTrips}`);

    return NextResponse.json({ message: 'Trip created', trip }, { status: 201 });

  } catch (error) {
    console.error('Error creating trip detail:', error);
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

    const user = await User.findOne({ clerkId }).lean();
    if (!user) {
      return NextResponse.json({ trips: [] }, { status: 200 });
    }

    let trips = user.trips || [];

    if (tripId) {
      trips = trips.filter(trip => trip.tripId === tripId);
    }

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

    const user = await User.findOne({ clerkId });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const tripToDelete = user.trips.find(trip => trip.tripId === tripId);
    if (!tripToDelete) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    // Check if trip was created today (Credit Malpractice Protection)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tripCreatedDate = new Date(tripToDelete.createdAt);
    tripCreatedDate.setHours(0, 0, 0, 0);

    if (tripCreatedDate.getTime() === today.getTime()) {
      return NextResponse.json({ 
        error: 'Cannot delete trips created today. Please wait until tomorrow to prevent credit point malpractice.' 
      }, { status: 403 });
    }

    const initialLength = user.trips.length;
    user.trips = user.trips.filter(trip => trip.tripId !== tripId);

    if (user.trips.length === initialLength) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    await user.save();

    console.log(`Trip ${tripId} deleted from user ${clerkId}. Remaining trips: ${user.numberOfTrips}`);

    return NextResponse.json({ message: 'Trip deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting trip:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}