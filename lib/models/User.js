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
  imageUrl: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  subscription: { type: String, required: false, default: null },
  trips: [tripSchema], // Array of embedded trip documents
  numberOfTrips: { type: Number, default: 0 }
}, { timestamps: true });

// Middleware to auto-update numberOfTrips when trips array changes
userSchema.pre('save', async function() {
  this.numberOfTrips = this.trips.length;
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
    // If not, create new user with subscription null
    const newUser = new User({
      clerkId,
      name,
      email,
      imageUrl,
      subscription: null,
    });

    await newUser.save();
    return newUser;
  }

  // Update existing user if found
  user.name = name;
  user.email = email;
  user.imageUrl = imageUrl;
  if (!user.clerkId) user.clerkId = clerkId;
  await user.save();

  return user;
}

export default User;