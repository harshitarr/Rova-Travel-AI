import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import TripDetail, { createTripDetail } from '@/lib/models/TripDetail';

export async function POST(request) {
  try {
    const payload = await request.json();

    if (!payload || !payload.clerkId) {
      return NextResponse.json({ error: 'Missing required field: clerkId' }, { status: 400 });
    }

    await connectToDatabase();
    // Ensure indexes exist (helps catch unique constraint issues early)
    try {
      await TripDetail.createIndexes();
      console.log('tripdetails POST: ensured indexes');
    } catch (idxErr) {
      console.warn('tripdetails POST: createIndexes error', idxErr && idxErr.message);
    }

    console.log('tripdetails POST payload:', JSON.stringify(payload).slice(0, 2000));

    const trip = await createTripDetail(payload);

    return NextResponse.json({ message: 'Trip created', trip }, { status: 201 });
  } catch (error) {
    console.error('Error creating trip detail:', error);
    console.error(error && error.stack);

    if (error.code === 11000) {
      return NextResponse.json({ error: 'Trip with this tripId already exists for this user' }, { status: 409 });
    }

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
    try {
      await TripDetail.createIndexes();
      console.log('tripdetails GET: ensured indexes');
    } catch (idxErr) {
      console.warn('tripdetails GET: createIndexes error', idxErr && idxErr.message);
    }

    console.log('tripdetails GET query params:', { clerkId, tripId });

    const query = { clerkId };
    if (tripId) query.tripId = tripId;

    const trips = await TripDetail.find(query).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ trips }, { status: 200 });
  } catch (error) {
    console.error('Error fetching trip details:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
