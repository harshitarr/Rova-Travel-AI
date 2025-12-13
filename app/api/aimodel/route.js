import { NextResponse } from "next/server";
import { currentUser, auth } from "@clerk/nextjs/server";
import connectDB from "@/lib/mongodb";
import User from "@/lib/models/User";
import Groq from "groq-sdk"; // <-- NEW: Import Groq SDK


const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

// --- CONSTANTS (JSON Schema and Prompts) ---

// Temporary mock responses for testing (Kept for fallback/testing)
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
        resp: "Perfect! I have all the information I need. Let me create an amazing trip plan for you!",
        ui: "final"
    }
];

// FINAL_PROMPT: Optimized to enforce JSON and optimize description size for long trips
const FINAL_PROMPT = `You are a strict JSON generator for travel plans. Your ONLY output must be a single valid JSON object matching the schema below—NO markdown, NO code blocks, NO extra text, NO explanations, and NO truncation. If you run out of real places, invent plausible or related spots, or repeat/restyle activities, but NEVER leave any day or activity missing or empty. If you cannot find a real place, use a generic but plausible name (e.g., "Local Park", "City Museum").

If the user requests N days, you MUST return a complete itinerary for ALL N days, with each day containing at least one activity. Do NOT skip, summarize, or truncate any day. For trips longer than 7 days, keep 'place_details' concise (max 20 words).

ABSOLUTELY FORBIDDEN: markdown, code blocks, explanations, apologies, or any text outside the JSON object.

Output Schema:
{
  "trip_plan": {
    "destination": "string",
    "duration": "string",
    "origin": "string",
    "budget": "string",
    "groupSize": "string",
    "interests": "string or array",
    "hotels": [
      {
        "hotel_name": "string",
        "hotel_address": "string",
        "price_per_night": "string",
        "hotel_image_url": "string",
        "geo_coordinates": { "latitude": "number", "longitude": "number" },
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
            "geo_coordinates": { "latitude": "number", "longitude": "number" },
            "place_address": "string",
            "ticket_pricing": "string",
            "time_travel_each_location": "string",
            "best_time_to_visit": "string"
          }
        ]
      }
    ]
  }
}
`;

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

// --- SUPPORTING FUNCTIONS (Your Original Logic) ---

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
        resp: "Perfect! I have all the information I need. Let me create an amazing trip plan for you!",
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
function cleanAndParseResponse(responseText, isFinal = false) {
    let cleanedResponse = responseText.trim();

    // Remove markdown code block wrapper if present
    if (cleanedResponse.startsWith('```json')) {
        cleanedResponse = cleanedResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    try {
        const response = JSON.parse(cleanedResponse);

        if (isFinal) {
            // For final response, the entire JSON is the response data
            return {
                success: true,
                data: response
            };
        }

        return {
            success: true,
            data: {
                resp: response.resp || responseText,
                ui: response.ui || "general"
            }
        };
    } catch (parseError) {
        console.log("JSON parse failed, raw response:", responseText);
        
        // Attempt to recover a conversational response text if JSON is broken
        let extractedText = cleanedResponse;
        if (extractedText.includes('"resp"')) {
            const respMatch = extractedText.match(/"resp":\s*"([^"]+)"/);
            if (respMatch) {
                extractedText = respMatch[1];
            }
        }

        // Only return success: false for the conversational steps
        return {
            success: false,
            data: {
                resp: extractedText || "I'm having trouble with the response format. Can you repeat your last input?",
                ui: "general"
            }
        };
    }
}

// Reusable error handler
function handleApiError(err) {
    console.error("Trip Planner Error:", err);

    const errorMessage = err.message || JSON.stringify(err);
    if (errorMessage.includes('401') || errorMessage.includes('unauthorized') || errorMessage.includes('403')) {
        return {
            resp: "There's an issue with the Groq API key configuration or permissions. Please check your key.",
            ui: "error"
        };
    } else if (errorMessage.includes('quota') || errorMessage.includes('rate limit') || errorMessage.includes('429')) {
        return {
            resp: "API quota exceeded. Please try again later or check your Groq usage limits.",
            ui: "error"
        };
    } else if (errorMessage.includes('invalid_json')) {
        // Specifically for Groq's JSON mode failure
        return {
            resp: "The AI failed to generate a complete or valid trip plan. Please try a less complex request (fewer days).",
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
    // This function is primarily for the chat steps where Groq might skip setting the UI step
    // in the conversational JSON. Since we enforce the conversational JSON, this is a fallback.
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
    // Slightly less detail for very long trips logic is now in the FINAL_PROMPT
    const calculatedTokens = Math.ceil(baseTokens + (days * tokensPerDay));

    // Set reasonable bounds
    const minTokens = 2000;
    const maxTokens = 16384; // Llama 3 70B context is 8192, setting max_tokens to a safe high limit.
    // Setting max_tokens near the Llama 3 context size (8192) or higher for safety.
    // Llama 3 70B has 8192 context; let's cap generation at 8000.
    const finalTokens = Math.max(minTokens, Math.min(8000, calculatedTokens));

    console.log(`Dynamic tokens: ${days} days = ${finalTokens} max_completion_tokens`);
    return finalTokens;
}

// MongoDB function to count trips (Kept as is)
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


// --- GROQ INTEGRATION FUNCTION (Core Change) ---

async function createTripPlan(messages, isFinal = false) {
    try {
        // Use an appropriate Groq model. Llama 3 70B is fast and capable.
        const model = process.env.GROK_MODEL ; 

        const formattedMessages = [
            {
                role: "system",
                content: isFinal ? FINAL_PROMPT : PROMPT,
            },
            // Map messages to Groq's expected role/content structure
            ...messages.map(msg => ({
                role: msg.role === "assistant" ? "assistant" : "user",
                content: msg.content,
            })),
        ];

        const completion = await groq.chat.completions.create({
            messages: formattedMessages,
            model: model,
            temperature: isFinal ? 0.2 : 0.8, // Lower temp for final JSON to make it predictable
            max_tokens: calculateTokens(messages, isFinal),
            // CRITICAL: This enforces the output to be a valid JSON object
            response_format: { type: "json_object" }, 
        });

        const responseText = completion.choices[0]?.message?.content || "";
        const parseResult = cleanAndParseResponse(responseText, isFinal);

        if (parseResult.success) {
            return parseResult.data;
        } else {
            // This case handles a failed JSON parse, which shouldn't happen often with JSON mode
            return handleApiError({ message: "invalid_json_parse_after_api_call" });
        }
        

    } catch (err) {
        // Fallback mock responses if API fails (e.g., no key, network error)
        if (!process.env.GROQ_API_KEY) {
            const messageCount = messages.length;
            const responseIndex = Math.min(messageCount - 1, mockResponses.length - 1);
            console.log("Using Mock Responses (Groq Key missing)");
            return mockResponses[responseIndex];
        }

        return handleApiError(err);
    }
}


// --- API ROUTE HANDLER (Your Original Logic) ---

export async function POST(req) {
    try {
        const { messages, userSelection, isFinal } = await req.json();
        const user = await currentUser();

        const clerkId = user?.id;

        if (!clerkId) {
            return NextResponse.json(
                { success: false, error: "User not authenticated" },
                { status: 401 }
            );
        }

        let hasPremiumAccess = false;
        let decision = null;
        try {
            const { has } = await auth();
            hasPremiumAccess = typeof has === 'function' ? has({ plan: 'monthy' }) : false;
            
            if (typeof auth.protect === 'function') {
                // We'll trust the auth.protect logic here for remaining credits
                // decision will contain reason.remaining
                decision = await auth.protect(req, { userId: user?.id }); 
            }
        } catch (err) {
            console.warn('Auth-based premium check failed:', err?.message || err);
        }

        console.log('Auth premium check:', { hasPremiumAccess, remaining: decision?.reason?.remaining });

        // Apply the exact check you provided: if remaining == 0 AND hasPremiumAccess -> return limit
        if (decision?.reason?.remaining === 0 && hasPremiumAccess) {
             // You might want to re-evaluate this logic: decision?.reason?.remaining == 0 and hasPremiumAccess means a premium user has 0 free credits left.
             // If a user has a premium plan, they shouldn't be limited by a free credit count. 
             // Assuming this is a bug in the provided logic and you intend to check if a NON-PREMIUM user has run out of FREE credits.
             // However, for strict compliance, using your provided check:
            return NextResponse.json(createApiResponse('No Free Credit Remaining', 'limit'), { status: 200 });
        }


        let result;
        if (userSelection) {
             // Handle user selection logic if provided
             result = handleUserSelection(userSelection);
             // Must wrap the result for the final API response format
             return NextResponse.json(createApiResponse(result.resp, result.ui), { status: 200 });
        }

        // Proceed with AI generation
        result = await createTripPlan(messages, isFinal);
        
        let finalResult = result;
        if (!isFinal) {
             // Only run detection on conversational steps where the response needs a UI step
             finalResult = detectUIFromContext(result, messages);
        }

        if (isFinal) {
             // For the final step, the response is the full trip plan JSON object.
             // We return it wrapped in the expected format: { resp: JSON_STRING, ui: "final" }
             return NextResponse.json(createApiResponse(JSON.stringify(finalResult), 'final'), { status: 200 });
        }

        // For conversational steps:
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