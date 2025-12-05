import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import connectDB from "@/lib/mongodb";
import User from "@/lib/models/User";

// Temporary mock responses for testing
const mockResponses = [
  {
    resp: "Hello! I'm your AI trip planner. Let's start planning your perfect trip! Where are you planning to travel from?",
    ui: "source"
  },
  {
    resp: "Great! Now, what's your dream destination? Which city or country would you like to visit?",
    ui: "destination"
  },
  {
    resp: "Awesome choice! Who will be joining you on this trip? Are you traveling solo, as a couple, with family, or with friends?",
    ui: "groupSize"
  },
  {
    resp: "Perfect! What's your budget range for this trip? Would you prefer budget-friendly, mid-range, or luxury options?",
    ui: "budget"
  },
  {
    resp: "Excellent! How many days are you planning for this trip?",
    ui: "duration"
  },
  {
    resp: "Almost there! What are your main interests for this trip? For example: adventure activities, cultural experiences, food tours, relaxation, nightlife, or sightseeing?",
    ui: "interests"
  },
  {
    resp: "Perfect! I have all the information I need. Let me create an amazing trip plan for you! 🌟",
    ui: "final"
  }
];

const FINAL_PROMPT = `Generate a COMPLETE Travel Plan with all given details. Provide Hotels options list with HotelName,
Hotel address, Price, hotel image url, geo coordinates, rating, descriptions and suggest a FULL itinerary with placeName, Place Details, Place Image Url,
Geo Coordinates, Place address, ticket Pricing, Time travel each of the location, with EACH DAY plan for the ENTIRE duration and best time to visit in JSON format.

IMPORTANT: Generate itinerary for ALL days specified in the duration. If user requested 3 days, provide activities for Day 1, Day 2, AND Day 3. Do not truncate or skip days.

Output Schema:
{
"trip_plan": {
"destination": "string",
"duration": "string",
"origin": "string",
"budget": "string",
"groupSize": "string",
"interests": "string",
"hotels": [
{
"hotel_name": "string",
"hotel_address": "string",
"price_per_night": "string",
"hotel_image_url": "string",
"geo_coordinates": {
"latitude": "number",
"longitude": "number"
},
"rating": "number",
"description": "string"
}
],
"itinerary": [
{
"day": "number",
"day_plan": "string",
"best_time_to_visit_day": "string",
"activities": [
{
"place_name": "string",
"place_details": "string",
"place_image_url": "string",
"geo_coordinates": {
"latitude": "number",
"longitude": "number"
},
"place_address": "string",
"ticket_pricing": "string",
"time_travel_each_location": "string",
"best_time_to_visit": "string"
}
]
}
]
}
}`;

const PROMPT = `You are an AI Trip Planner Agent. Help users plan amazing trips through interactive conversation.

Ask ONE question at a time in this order:
1. Starting location (where are you traveling from?)
2. Destination (where would you like to go?)  
3. Group size (Solo, Couple, Family, Friends)
4. Budget range (Budget-friendly, Mid-range, Luxury)
5. Trip duration (how many days?)
6. Travel interests (adventure, culture, food, relaxation, etc.)

Keep responses conversational and natural. Avoid using escape characters like \\n in responses. Write responses as natural flowing sentences.
If user provides multiple details at once, acknowledge them briefly and ask for the next missing piece.

IMPORTANT: You must respond with ONLY a valid JSON object in this exact format:
{"resp": "Your friendly conversational response without line breaks or escape characters", "ui": "current_step"}

Do not use markdown code blocks, do not add any explanation before or after the JSON.

UI step options: "source", "destination", "groupSize", "budget", "duration", "interests", "final"

When you have all information, set ui to "final" and create a complete trip summary.

Example response: {"resp": "Perfect! A group trip sounds exciting. What's your budget range for this adventure - budget-friendly, mid-range, or luxury?", "ui": "budget"}`;

// Reusable configuration for user selection flow
const SELECTION_FLOW = {
  groupsize: {
    resp: "Perfect! What's your budget range for this trip? Would you prefer budget-friendly, mid-range, or luxury options?",
    ui: "budget"
  },
  budget: {
    resp: "Excellent! How many days are you planning for this trip?",
    ui: "duration"
  },
  duration: {
    resp: "Almost there! What are your main interests for this trip? For example: adventure activities, cultural experiences, food tours, relaxation, nightlife, or sightseeing?",
    ui: "interests"
  },
  interests: {
    resp: "Perfect! I have all the information I need. Let me create an amazing trip plan for you! 🌟",
    ui: "final"
  },
  default: {
    resp: "Let's continue planning your trip! Who will be joining you?",
    ui: "groupSize"
  }
};

// Reusable UI detection patterns
const UI_DETECTION_PATTERNS = {
  groupSize: {
    keywords: ["how many people", "who will be", "solo", "couple", "family", "friends"],
    ui: "groupSize"
  },
  budget: {
    keywords: ["budget", "luxury", "mid-range"],
    ui: "budget"
  },
  duration: {
    keywords: ["how many days", "days"],
    ui: "duration"
  },
  interests: {
    keywords: ["interests", "adventure", "culture"],
    ui: "interests"
  }
};

// Reusable response formatter
function createApiResponse(resp, ui, success = true) {
  return {
    success,
    resp,
    ui,
    message: resp
  };
}

// Reusable response cleaner and parser
function cleanAndParseResponse(responseText) {
  let cleanedResponse = responseText.trim();
  
  // Remove markdown code block wrapper if present
  if (cleanedResponse.startsWith('```json')) {
    cleanedResponse = cleanedResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleanedResponse.startsWith('```')) {
    cleanedResponse = cleanedResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  
  try {
    const response = JSON.parse(cleanedResponse);
    return {
      success: true,
      data: {
        resp: response.resp || responseText,
        ui: response.ui || "general"
      }
    };
  } catch (parseError) {
    console.log("JSON parse failed, raw response:", responseText);
    
    let extractedText = cleanedResponse;
    if (extractedText.includes('"resp"')) {
      const respMatch = extractedText.match(/"resp":\s*"([^"]+)"/);
      if (respMatch) {
        extractedText = respMatch[1];
      }
    }
    
    return {
      success: false,
      data: {
        resp: extractedText || "I'm here to help you plan your trip! Where would you like to start?",
        ui: "general"
      }
    };
  }
}

// Reusable error handler
function handleApiError(err) {
  console.error("Trip Planner Error:", err);
  
  if (err.message?.includes('401') || err.message?.includes('unauthorized')) {
    return {
      resp: "There's an issue with the API key configuration. Please check your Google AI API key.",
      ui: "error"
    };
  } else if (err.message?.includes('quota') || err.message?.includes('rate limit')) {
    return {
      resp: "API quota exceeded. Please try again later or check your Google AI billing.",
      ui: "error"
    };
  } else {
    return {
      resp: "I'm experiencing technical difficulties. Let me use my built-in knowledge to help plan your trip! Where would you like to go?",
      ui: "fallback"
    };
  }
}

// Reusable UI detection logic
function detectUIFromContext(result, messages) {
  if (result.ui !== "general") return result;
  
  const allMessages = messages.map(m => m.content?.toLowerCase() || "").join(" ");
  
  for (const [key, pattern] of Object.entries(UI_DETECTION_PATTERNS)) {
    const hasKeyword = pattern.keywords.some(keyword => 
      allMessages.includes(keyword) || result.resp.toLowerCase().includes(keyword)
    );
    
    if (hasKeyword) {
      result.ui = pattern.ui;
      break;
    }
  }
  
  return result;
}

// Reusable user selection handler
function handleUserSelection(userSelection) {
  console.log("User selection received:", userSelection);
  
  const selectionKey = Object.keys(userSelection)[0];
  console.log("Selection key:", selectionKey);
  
  const response = SELECTION_FLOW[selectionKey] || SELECTION_FLOW.default;
  console.log("Selected response from SELECTION_FLOW:", response);
  
  console.log("API responding with:", response);
  
  return response;
}

// Dynamic token calculator based on trip requirements
function calculateTokens(messages, isFinal = false) {
  if (!isFinal) {
    // For regular conversation, use minimal tokens
    return 1000;
  }
  
  // Extract duration from conversation for final trip planning
  const conversationText = messages.map(m => m.content || "").join(" ").toLowerCase();
  
  // Try to extract number of days from conversation
  let days = 3; // default
  const dayMatches = conversationText.match(/(\d+)\s*days?/);
  const weekMatches = conversationText.match(/(\d+)\s*weeks?/);
  
  if (dayMatches) {
    days = parseInt(dayMatches[1]);
  } else if (weekMatches) {
    days = parseInt(weekMatches[1]) * 7;
  }
  
  // Dynamic token calculation based on trip complexity
  const baseTokens = 1500; // Base for hotels + metadata
  const tokensPerDay = 800; // Estimated tokens per day of itinerary
  const complexityMultiplier = days > 7 ? 0.9 : 1.0; // Slightly less detail for very long trips
  
  const calculatedTokens = Math.ceil((baseTokens + (days * tokensPerDay)) * complexityMultiplier);
  
  // Set reasonable bounds
  const minTokens = 2000;
  const maxTokens = 12000; // Prevent excessive token usage
  
  const finalTokens = Math.max(minTokens, Math.min(maxTokens, calculatedTokens));
  
  console.log(`Dynamic tokens: ${days} days = ${finalTokens} tokens`);
  return finalTokens;
}

// Google AI (Gemini) integration function
async function createTripPlan(messages, isFinal = false) {
  try {
    // Check if Google AI is configured
    const hasGoogleAI = process.env.OPENAI_API_KEY && 
                       process.env.OPENAI_API_KEY !== 'your_openai_api_key_here' &&
                       process.env.OPENAI_BASE_URL;
    
    if (hasGoogleAI) {
      // Import OpenAI client (configured for Google AI endpoint)
      const { openai } = await import("@/configs/openai");
      
      const completion = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || "gemini-2.0-flash",
        messages: [
          {
            role: "system",
            content: isFinal ? FINAL_PROMPT : PROMPT
          },
          ...messages
        ],
        temperature: 0.8,
        max_tokens: calculateTokens(messages, isFinal)
      });

      const responseText = completion.choices[0].message.content;
      const parseResult = cleanAndParseResponse(responseText);
      
      return parseResult.data;
    } else {
      // Fallback mock responses for testing without API key
      const messageCount = messages.length;
      const responseIndex = Math.min(messageCount - 1, mockResponses.length - 1);
      
      return mockResponses[responseIndex];
    }

  } catch (err) {
    return handleApiError(err);
  }
}

// Function to count trips created today from MongoDB
async function getTripsCreatedToday(clerkId) {
  try {
    await connectDB();
    
    // Get start and end of today in UTC
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    
    // Find user and count trips created today from their trips array
    const user = await User.findOne({ clerkId });
    if (!user || !user.trips) {
      return 0;
    }
    
    const count = user.trips.filter(trip => {
      const tripDate = new Date(trip.createdAt);
      return tripDate >= startOfToday && tripDate <= endOfToday;
    }).length;
    
    console.log(`MongoDB: User ${clerkId} has created ${count} trips today (${startOfToday.toISOString()} to ${endOfToday.toISOString()})`);
    return count;
  } catch (error) {
    console.error("Error counting trips from MongoDB:", error);
    return 0;
  }
}

// API Route Handler
export async function POST(req) {
  try {
    const { messages, userSelection, isFinal } = await req.json();
    const user = await currentUser();
    
    // MongoDB-only credit verification - 5 trips per day (resets at midnight)
    const userId = user?.primaryEmailAddress?.emailAddress ?? user?.id ?? 'anonymous';
    const clerkId = user?.id;
    
    if (!clerkId) {
      return NextResponse.json(
        { success: false, error: "User not authenticated" },
        { status: 401 }
      );
    }
    
    // Check MongoDB for actual trip count today
    const tripsCreatedToday = await getTripsCreatedToday(clerkId);
    const remainingCredits = 5 - tripsCreatedToday;
    
    console.log("===== CREDIT VERIFICATION (MongoDB Only) =====");
    console.log(`User: ${userId}`);
    console.log(`Clerk ID: ${clerkId}`);
    console.log(`Trips created today: ${tripsCreatedToday}/5`);
    console.log(`Remaining credits: ${remainingCredits}`);
    console.log(`Is final trip generation: ${isFinal}`);
    
    // Check if user has reached daily limit (5 trips per day)
    if (tripsCreatedToday >= 5) {
      console.log("❌ BLOCKED: User has already created 5 trips today");
      console.log("Credits will reset at midnight (12:00 AM)");
      console.log("============================================");
      return NextResponse.json(
        createApiResponse(
          "Sorry, you've used all your 5 free trip plans for today! 🎫 Your credits will refill tomorrow at midnight, or upgrade your plan for unlimited trips.",
          "limit"
        ),
        { status: 200 }
      );
    }
    
    console.log(`✅ ALLOWED: User can proceed (${remainingCredits} credits remaining)`);
    console.log("============================================");
    
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { success: false, error: "Messages array is required" },
        { status: 400 }
      );
    }

    // Handle user selections with specific UI flow
    if (userSelection) {
      const nextResponse = handleUserSelection(userSelection);
      return NextResponse.json(createApiResponse(nextResponse.resp, nextResponse.ui), { status: 200 });
    }

    const result = await createTripPlan(messages, isFinal);
    const finalResult = detectUIFromContext(result, messages);

    return NextResponse.json(createApiResponse(finalResult.resp, finalResult.ui), { status: 200 });
  } catch (error) {
    console.error("API Route Error:", error);
    const fallbackResponse = createApiResponse(
      "I'm here to help plan your trip! What destination are you thinking about?",
      "fallback"
    );
    return NextResponse.json(fallbackResponse, { status: 200 });
  }
}
