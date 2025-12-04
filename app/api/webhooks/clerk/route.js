import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import TripDetail from '@/lib/models/TripDetail';

export async function POST(request) {
  try {
    const payload = await request.json();
    const eventType = payload.type;
    const userData = payload.data;

    console.log(`🔔 Webhook received: ${eventType}`);

    await connectDB();

    if (eventType === 'user.created') {
      const newUser = new User({
        clerkId: userData.id,
        email: userData.email_addresses[0]?.email_address,
        name: `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || 'User',
        imageUrl: userData.image_url || '',
      });
      await newUser.save();
      console.log(`✅ User created: ${userData.id}`);
    }

    if (eventType === 'user.updated') {
      await User.findOneAndUpdate(
        { clerkId: userData.id },
        {
          email: userData.email_addresses[0]?.email_address,
          name: `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || 'User',
          imageUrl: userData.image_url || '',
        },
        { new: true, upsert: true }
      );
      console.log(`✅ User updated: ${userData.id}`);
    }

    if (eventType === 'user.deleted') {
      console.log(`🗑️ Deleting user: ${userData.id}`);
      await TripDetail.deleteMany({ clerkId: userData.id });
      await User.findOneAndDelete({ clerkId: userData.id });
      console.log(`✅ User deleted: ${userData.id}`);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('❌ Webhook error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
