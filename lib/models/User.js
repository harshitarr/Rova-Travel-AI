// models/user.js

import mongoose from "mongoose";

// Embedded trip schema - stores all trip details within user document
const tripSchema = new mongoose.Schema({
  tripId: { type: String, required: true },
  title: { type: String, required: false },
  destination: { type: String, required: false },
  startDate: { type: Date },
  endDate: { type: Date },
  budget: { type: String, required: false },
  groupSize: { type: String, required: false },
  interests: { type: [String], default: [] },
  trip_plan: { type: mongoose.Schema.Types.Mixed, default: {} },
  itinerary: { type: Array, default: [] },
  notes: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { _id: false });

// Mongoose schema definition (equivalent to Convex schema.js)
const userSchema = new mongoose.Schema({
  clerkId: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  imageUrl: { type: String, required: false, default: '' },
  email: { type: String, required: true, unique: true },
  // Subscription stored as an object to include plan and expiry information.
  // Example: { plan: 'monthy' | 'yearly' | null, expiresAt: Date|null, premium: true|false }
  subscription: {
    plan: { type: String, required: false, default: null },
    expiresAt: { type: Date, required: false, default: null },
    premium: { type: Boolean, required: false, default: false }
  },
  trips: [tripSchema], // Array of embedded trip documents
  numberOfTrips: { type: Number, default: 0 }
}, { timestamps: true });

// Middleware to auto-update numberOfTrips when trips array changes
// and to normalize subscription shape so it's always an object.
userSchema.pre('save', async function() {
  this.numberOfTrips = (this.trips && this.trips.length) || 0;

  // Ensure subscription is always an object with expected keys
  if (!this.subscription || typeof this.subscription !== 'object') {
    this.subscription = { plan: null, expiresAt: null, premium: false };
  } else {
    if (!('plan' in this.subscription)) this.subscription.plan = null;
    if (!('expiresAt' in this.subscription)) this.subscription.expiresAt = null;
    if (!('premium' in this.subscription)) this.subscription.premium = Boolean(this.subscription.premium || false);
  }
});

// Create or reuse the User model
const User = mongoose.models.User || mongoose.model("User", userSchema);

// Function similar to Convex mutation CreateNewUser
export async function createNewUser({ name, email, imageUrl, clerkId }) {
  if (!clerkId) {
    throw new Error('clerkId is required');
  }

  // Check if user already exists by clerkId or email
  const user = await User.findOne({ $or: [{ clerkId }, { email }] });

  if (!user) {
    // If not, create new user with an empty subscription object
    const newUser = new User({
      clerkId,
      name: name || 'User',
      email,
      imageUrl: imageUrl || '',
      subscription: { plan: null, expiresAt: null, premium: false },
    });

    try {
      await newUser.save();
      return newUser;
    } catch (saveErr) {
      console.error('createNewUser - failed to save new user:', saveErr);
      // Re-throw the original error so callers can inspect error.code (e.g., 11000 for duplicate key)
      throw saveErr;
    }
  }

  // Update existing user if found
  user.name = name;
  user.email = email;
  user.imageUrl = imageUrl || user.imageUrl || '';
  if (!user.clerkId) user.clerkId = clerkId;
  try {
    await user.save();
    return user;
  } catch (updateErr) {
    console.error('createNewUser - failed to update existing user:', updateErr);
    throw updateErr;
  }
}

export default User;