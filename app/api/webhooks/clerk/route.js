import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import TripDetail from '@/lib/models/TripDetail';

export async function POST(req) {
  console.log('🔔 Webhook POST received');
  
  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json(
      { error: 'Error occurred -- no svix headers' },
      { status: 400 }
    );
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your webhook secret
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

  let evt;

  // Verify the webhook
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return NextResponse.json(
      { error: 'Error occurred during verification' },
      { status: 400 }
    );
  }

  // Handle the webhook
  const eventType = evt.type;
  const { id, email_addresses, first_name, last_name, image_url } = evt.data;

  console.log(`Webhook received: ${eventType}`, { id });

  try {
    await connectDB();

    if (eventType === 'user.created') {
      // Create new user in MongoDB
      const newUser = new User({
        clerkId: id,
        email: email_addresses[0]?.email_address,
        name: `${first_name || ''} ${last_name || ''}`.trim() || 'User',
        imageUrl: image_url || '',
      });
      await newUser.save();
      console.log(`✅ User created in MongoDB: ${id}`);
    }

    if (eventType === 'user.updated') {
      // Update user in MongoDB
      await User.findOneAndUpdate(
        { clerkId: id },
        {
          email: email_addresses[0]?.email_address,
          name: `${first_name || ''} ${last_name || ''}`.trim() || 'User',
          imageUrl: image_url || '',
        },
        { new: true, upsert: true }
      );
      console.log(`✅ User updated in MongoDB: ${id}`);
    }

    if (eventType === 'user.deleted') {
      // Delete user and all their trips from MongoDB
      console.log(`🗑️ Deleting user and all trips for: ${id}`);
      
      // Delete all trips for this user
      const tripsDeleted = await TripDetail.deleteMany({ clerkId: id });
      console.log(`✅ Deleted ${tripsDeleted.deletedCount} trips`);
      
      // Delete user record
      await User.findOneAndDelete({ clerkId: id });
      console.log(`✅ User deleted from MongoDB: ${id}`);
    }

    return NextResponse.json(
      { message: 'Webhook processed successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Error processing webhook' },
      { status: 500 }
    );
  }
}
