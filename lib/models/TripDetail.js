import mongoose from "mongoose";

const tripDetailSchema = new mongoose.Schema(
  {
    clerkId: { type: String, required: true, index: true },
    tripId: { type: String, required: true },
    title: { type: String, required: false },
    destination: { type: String, required: false },
    startDate: { type: Date },
    endDate: { type: Date },
    // Accept strings for budget/groupSize because front-end may send ranges or labels
    budget: { type: String, required: false },
    groupSize: { type: String, required: false },
    // Interests may be sent as a single string or an array
    interests: { type: [String], default: [] },
    // Store the full AI-generated trip plan (or any nested JSON) if provided
    trip_plan: { type: mongoose.Schema.Types.Mixed, default: {} },
    itinerary: { type: Array, default: [] },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

// Ensure that a user (clerkId) cannot have two trips with the same tripId
tripDetailSchema.index({ clerkId: 1, tripId: 1 }, { unique: true });

const TripDetail = mongoose.models.TripDetail || mongoose.model("TripDetail", tripDetailSchema);

export async function createTripDetail(payload) {
  if (!payload || !payload.clerkId) {
    throw new Error("`clerkId` is required to create a trip");
  }

  if (!payload.tripId) {
    // Use an ObjectId string as a simple unique tripId when one isn't provided
    payload.tripId = new mongoose.Types.ObjectId().toString();
  }

  // Normalize common fields to avoid Mongoose cast errors
  if (payload.interests && !Array.isArray(payload.interests)) {
    // If interests is a comma-separated string or single label, convert to array
    if (typeof payload.interests === 'string') {
      payload.interests = payload.interests.split(',').map(s => s.trim()).filter(Boolean);
    } else {
      payload.interests = [String(payload.interests)];
    }
  }

  if (payload.startDate && !(payload.startDate instanceof Date)) {
    const d = new Date(payload.startDate);
    if (!isNaN(d)) payload.startDate = d;
  }

  if (payload.endDate && !(payload.endDate instanceof Date)) {
    const d2 = new Date(payload.endDate);
    if (!isNaN(d2)) payload.endDate = d2;
  }

  // Ensure budget and groupSize are strings (frontend may send labels)
  if (payload.budget && typeof payload.budget !== 'string') {
    payload.budget = String(payload.budget);
  }

  if (payload.groupSize && typeof payload.groupSize !== 'string') {
    payload.groupSize = String(payload.groupSize);
  }

  const trip = new TripDetail(payload);
  await trip.save();
  return trip;
}

export default TripDetail;
