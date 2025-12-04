import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { createNewUser } from '@/lib/models/User';

export async function POST(request) {
  try {
    const { email, name, imageUrl, clerkId } = await request.json();

    if (!email || !name || !clerkId) {
      return NextResponse.json(
        { error: 'Missing required fields (email, name, clerkId)' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Use the createNewUser function from the model
    const user = await createNewUser({
      name,
      email,
      imageUrl: imageUrl || '',
      clerkId
    });

    return NextResponse.json({
      message: user ? 'User found/updated successfully' : 'User created successfully',
      user: user
    });

  } catch (error) {
    console.error('Error creating/updating user:', error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}