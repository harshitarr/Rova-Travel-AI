// models/user.js

import mongoose from "mongoose";

// Mongoose schema definition (equivalent to Convex schema.js)
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  imageUrl: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  subscription: { type: String, required: false, default: null },
});

// Create or reuse the User model
const User = mongoose.models.User || mongoose.model("User", userSchema);

// Function similar to Convex mutation CreateNewUser
export async function createNewUser({ name, email, imageUrl }) {
  // Check if user already exists
  const user = await User.findOne({ email });

  if (!user) {
    // If not, create new user with subscription null
    const newUser = new User({
      name,
      email,
      imageUrl,
      subscription: null,
    });

    await newUser.save();
    return newUser;
  }

  return user;
}

export default User;