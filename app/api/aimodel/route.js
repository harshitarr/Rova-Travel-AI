import { NextResponse } from "next/server";

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

// Google AI (Gemini) integration function
async function createTripPlan(messages) {
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
            content: `You are an AI Trip Planner Agent. Help users plan amazing trips through interactive conversation.

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

Example response: {"resp": "Perfect! A group trip sounds exciting. What's your budget range for this adventure - budget-friendly, mid-range, or luxury?", "ui": "budget"}`
          },
          ...messages
        ],
        temperature: 0.8,
        max_tokens: 1000
      });

      const responseText = completion.choices[0].message.content;
      
      // Clean and parse the response - handle markdown code blocks
      let cleanedResponse = responseText.trim();
      
      // Remove markdown code block wrapper if present
      if (cleanedResponse.startsWith('```json')) {
        cleanedResponse = cleanedResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      // Try to parse as JSON
      try {
        const response = JSON.parse(cleanedResponse);
        // Ensure response has required fields
        return {
          resp: response.resp || responseText,
          ui: response.ui || "general"
        };
      } catch (parseError) {
        console.log("JSON parse failed, raw response:", responseText);
        
        // If JSON parsing fails, extract text and create structured response
        // Try to extract meaningful content
        let extractedText = cleanedResponse;
        if (extractedText.includes('"resp"')) {
          // Try to extract just the resp value
          const respMatch = extractedText.match(/"resp":\s*"([^"]+)"/);
          if (respMatch) {
            extractedText = respMatch[1];
          }
        }
        
        return {
          resp: extractedText || "I'm here to help you plan your trip! Where would you like to start?",
          ui: "general"
        };
      }
    } else {
      // Fallback mock responses for testing without API key
      const messageCount = messages.length;
      const responseIndex = Math.min(messageCount - 1, mockResponses.length - 1);
      
      return mockResponses[responseIndex];
    }

  } catch (err) {
    console.error("Trip Planner Error:", err);
    
    // Check the specific error type
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
}

// API Route Handler
export async function POST(req) {
  try {
    const { messages } = await req.json();
    
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { success: false, error: "Messages array is required" },
        { status: 400 }
      );
    }

    const result = await createTripPlan(messages);

    return NextResponse.json(
      { 
        success: true, 
        resp: result.resp, 
        ui: result.ui,
        message: result.resp
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("API Route Error:", error);
    return NextResponse.json(
      { 
        success: true, 
        resp: "I'm here to help plan your trip! What destination are you thinking about?",
        ui: "fallback",
        message: "I'm here to help plan your trip! What destination are you thinking about?"
      },
      { status: 200 }
    );
  }
}
