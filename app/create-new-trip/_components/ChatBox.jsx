"use client";
import React, { useState, useCallback, useRef, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useTripDetail, useUserDetail } from "@/app/provider";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import axios from "axios";
import EmptyBoxState from "./EmptyBoxState";
import GroupSizeUi from "./GroupSizeUi";
import BudgetUi from "./BudgetUi";
import DurationUi from "./DurationUi";
import TravelInterest from "./TravelInterest";
import TravelLoadingAnimation from "./TravelLoadingAnimation";


const ChatBox = () => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesRef = useRef([]);
  const chatContainerRef = useRef(null);
  const [isFinal,setIsFinal]=useState(false);
  const [tripCompleted, setTripCompleted] = useState(false);
  const { user } = useUser();
  const {tripDetailInfo,setTripDetailInfo}=useTripDetail();

  // Keep ref in sync with state
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // STABLE onSend function
  const onSend = useCallback(async () => {
    if (!userInput?.trim() || isLoading) return;

    const newMsg = {
      role: "user",
      content: userInput,
    };

    setMessages((prev) => [...prev, newMsg]);
    const currentUserInput = userInput.toLowerCase();
    setUserInput("");
    setIsLoading(true);

    try {
      // Detect user selection patterns and send appropriate userSelection
      let userSelection = null;

      // First try to parse explicit trip params like "from X to Y for N days"
      const fromToMatch = userInput.match(/from\s+(.+?)\s+to\s+(.+?)(?:\s+for|\s*$)/i);
      const durationMatch = userInput.match(/(\d+)\s*(day|days|week|weeks)/i);
      const parsedOrigin = fromToMatch ? fromToMatch[1].trim() : null;
      const parsedDestination = fromToMatch ? fromToMatch[2].trim() : null;
      const parsedDuration = durationMatch ? `${durationMatch[1]} ${durationMatch[2]}` : null;

      // If we have some parsed trip info, determine which additional fields are missing
      if (parsedOrigin || parsedDestination || parsedDuration) {
        const existing = (tripDetailInfo && tripDetailInfo.trip_plan) ? tripDetailInfo.trip_plan : {};
        const missing = [];
        if (!existing.budget) missing.push('budget');
        if (!existing.groupSize) missing.push('groupsize');
        if (!existing.interests) missing.push('interests');

        userSelection = {
          origin: parsedOrigin || undefined,
          destination: parsedDestination || undefined,
          duration: parsedDuration || undefined,
          missing,
        };
      } else {
        // Fallback pattern checks
        // Check for initial trip creation prompts
        if (currentUserInput.includes("create new trip") || currentUserInput.includes("new trip") ||
            currentUserInput.includes("plan a trip") || currentUserInput.includes("trip planning") ||
            currentUserInput.includes("inspire me where to go") || currentUserInput.includes("adventure destinations") ||
            currentUserInput.includes("discover historical gems") || currentUserInput.includes("historical gems")) {
          // Don't set userSelection for initial prompts - let API handle the conversation start
          userSelection = null;
        }
        // Check for budget patterns
        else if (currentUserInput.includes("budget") || currentUserInput.includes("cheap") || 
            currentUserInput.includes("luxury") || currentUserInput.includes("moderate") ||
            currentUserInput.includes("mid-range") || currentUserInput.includes("average")) {
          userSelection = { budget: userInput };
        }
        // Check for group size patterns
        else if (currentUserInput.includes("couple") || currentUserInput.includes("solo") || 
                 currentUserInput.includes("family") || currentUserInput.includes("friends") ||
                 currentUserInput.includes("people") || currentUserInput.includes("person")) {
          userSelection = { groupsize: userInput };
        }
        // Check for duration patterns
        else if (currentUserInput.includes("day") || currentUserInput.includes("week") || 
                 /\d+\s*(day|days|week|weeks)/.test(currentUserInput)) {
          userSelection = { duration: userInput };
        }
        // Check for interest patterns
        else if (currentUserInput.includes("adventure") || currentUserInput.includes("culture") || 
                 currentUserInput.includes("food") || currentUserInput.includes("relaxation") ||
                 currentUserInput.includes("beach") || currentUserInput.includes("nightlife") ||
                 currentUserInput.includes("sightseeing") || currentUserInput.includes("shopping")) {
          userSelection = { interests: userInput };
        }
      }

      // Use ref to get current messages without dependency
      const result = await axios.post("/api/aimodel", {
        messages: [...messagesRef.current, newMsg],
        userSelection: userSelection
      });

      if (result.data.success) {
        const responseMessage = {
          role: "assistant",
          content: result.data.resp || result.data.message || "I'm here to help!",
          ui: result.data.ui || null,
        };
        
        console.log("Adding message with UI:", responseMessage);
        
        setMessages((prev) => [
          ...prev,
          responseMessage
        ]);
      } else {
        throw new Error(result.data.error || "Failed to get response");
      }

      console.log(result.data);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I encountered an error. Please try again or check your internet connection.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [userInput, isLoading]);

  // STABLE handlers for UI components
  const handleBudgetSelect = useCallback((budget, isDoubleTap = false) => {
    console.log("Budget Selected:", budget, "Double tap:", isDoubleTap);
    
    if (!isDoubleTap) {
      // Single tap - populate textarea
      setUserInput(budget);
      return;
    }

    // Double tap - send directly
    const newMsg = {
      role: "user",
      content: `Selected budget: ${budget}`,
    };

    setMessages((prev) => [...prev, newMsg]);
    setIsLoading(true);

    // Simulate API call for budget selection
    setTimeout(async () => {
      try {
        const result = await axios.post("/api/aimodel", {
          messages: [],
          userSelection: { budget },
          isFinal: isFinal
        });

        if (result.data.success) {
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: result.data.resp || result.data.message,
              ui: result?.data?.ui,
            },
          ]);
        }
        console.log(result.data);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsLoading(false);
      }
    }, 1000);
  }, []);

  const handleGroupSizeSelect = useCallback((groupsize, isDoubleTap = false) => {
    console.log("Group Size Selected:", groupsize, "Double tap:", isDoubleTap);
    
    if (!isDoubleTap) {
      // Single tap - populate textarea
      setUserInput(groupsize);
      return;
    }

    // Double tap - send directly
    const newMsg = {
      role: "user", 
      content: `Selected group size: ${groupsize}`,
    };

    setMessages((prev) => [...prev, newMsg]);
    setIsLoading(true);

    // Simulate API call for group size selection
    setTimeout(async () => {
      try {
        const result = await axios.post("/api/aimodel", {
          messages: [],
          userSelection: { groupsize },
          isFinal: isFinal
        });

        if (result.data.success) {
          const responseMessage = {
            role: "assistant",
            content: result.data.resp || result.data.message || "Great! Let's continue planning.",
            ui: result.data.ui || null,
          };
          
          console.log("Group size selection response:", responseMessage);
          
          setMessages((prev) => [
            ...prev,
            responseMessage
          ]);
        }
        console.log(result.data);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsLoading(false);
      }
    }, 1000);
  }, []);

  const handleDurationSelect = useCallback((duration, isDoubleTap = false) => {
    console.log("Duration Selected:", duration, "Double tap:", isDoubleTap);
    
    if (!isDoubleTap) {
      // Single tap - populate textarea
      setUserInput(duration);
      return;
    }

    // Double tap - send directly
    const newMsg = {
      role: "user",
      content: `Selected duration: ${duration}`,
    };

    setMessages((prev) => [...prev, newMsg]);
    setIsLoading(true);

    // Simulate API call for duration selection
    setTimeout(async () => {
      try {
        const result = await axios.post("/api/aimodel", {
          messages: [],
          userSelection: { duration },
          isFinal:isFinal
        });

        if (result.data.success) {
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: result.data.resp || result.data.message,
              ui: result?.data?.ui,
            },
          ]);
        }
        console.log(result.data);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsLoading(false);
      }
    }, 1000);
  }, []);

  const handleInterestSelect = useCallback((interests, isDoubleTap = false) => {
    console.log("Interests Selected:", interests, "Double tap:", isDoubleTap);
    
    const interestText = Array.isArray(interests) ? interests.join(", ") : interests;
    
    if (!isDoubleTap) {
      // Single tap - populate textarea
      setUserInput(interestText);
      return;
    }

    // Double tap - send directly
    const newMsg = {
      role: "user",
      content: `Selected interests: ${interestText}`,
    };

    setMessages((prev) => [...prev, newMsg]);
    setIsLoading(true);

    // Simulate API call for interests selection
    setTimeout(async () => {
      try {
        const result = await axios.post("/api/aimodel", {
          messages: [],
          userSelection: { interests },
          isFinal: isFinal
        });

        if (result.data.success) {
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: result.data.resp || result.data.message,
              ui: result?.data?.ui,
            },
          ]);
        }
        console.log(result.data);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsLoading(false);
      }
    }, 1000);
  }, []);

  const handleEmptySelect = useCallback(
    (v) => {
      setUserInput(v);
      onSend();
    },
    [onSend]
  );

  const handleViewTrip = useCallback(() => {
    console.log("View Trip clicked - navigate to trip details");
  }, []);

  // -----------------------------
  // Render dynamic UI sent by assistant (Memoized components)
  // -----------------------------
  const BudgetComponent = useCallback(() => <BudgetUi onSelectedOption={handleBudgetSelect} />, [handleBudgetSelect]);
  const GroupSizeComponent = useCallback(() => <GroupSizeUi onSelectedOption={handleGroupSizeSelect} />, [handleGroupSizeSelect]);
  const DurationComponent = useCallback(() => <DurationUi onSelectedOption={handleDurationSelect} />, [handleDurationSelect]);
  const InterestComponent = useCallback(() => <TravelInterest onSelectedOption={handleInterestSelect} />, [handleInterestSelect]);
  const TravelLoadingComponent = useCallback(() => <TravelLoadingAnimation isGenerating={isLoading || (isFinal && !tripCompleted)} onViewTrip={handleViewTrip} />, [isLoading, isFinal, tripCompleted, handleViewTrip]);

  const RenderGenerativeUi = useCallback(
    (ui) => {
      const uiComponents = {
        budget: BudgetComponent,
        groupSize: GroupSizeComponent,
        duration: DurationComponent,
        interests: InterestComponent,
        final: TravelLoadingComponent
      };

      const Component = uiComponents[ui];
      return Component ? <Component /> : null;
    },
    [BudgetComponent, GroupSizeComponent, DurationComponent, InterestComponent, TravelLoadingComponent]
  );


  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg?.ui === "final" && !isFinal && !isLoading) {
      setIsFinal(true);
      
      // Trigger final trip plan generation
      setTimeout(async () => {
        try {
          setIsLoading(true);
          const result = await axios.post("/api/aimodel", {
            messages: messagesRef.current,
            isFinal: true
          });

          if (result.data.success) {
            // Don't set ui: "final" again to prevent infinite loop
            // Try to parse the response and avoid showing raw JSON in the chat
            const respText = result.data.resp || result.data.message || "Your trip plan is ready!";
            let displayMessage = respText;
            try {
              let parsed = null;
              try {
                parsed = JSON.parse(respText);
              } catch (e) {
                const start = respText.indexOf('{');
                const end = respText.lastIndexOf('}');
                if (start !== -1 && end !== -1 && end > start) {
                  const jsonSubstring = respText.slice(start, end + 1);
                  try {
                    parsed = JSON.parse(jsonSubstring);
                  } catch (e2) {
                    // leave parsed as null
                  }
                }
              }

              const tripPlanObj = parsed && (parsed.trip_plan || parsed.trip_plan === undefined ? parsed.trip_plan : parsed) || null;
              if (tripPlanObj) {
                // Build a pleasant multi-line summary: destination, duration, top hotels, and per-day bullets
                const dest = tripPlanObj.destination || tripPlanObj.title || '';
                const dur = tripPlanObj.duration || '';
                const hotels = Array.isArray(tripPlanObj.hotels) ? tripPlanObj.hotels : [];
                const hotelNames = hotels.slice(0, 3).map(h => h.hotel_name || h.name || '').filter(Boolean);

                const itinerary = Array.isArray(tripPlanObj.itinerary) ? tripPlanObj.itinerary : [];
                const dayLines = itinerary.map((d, i) => {
                  const dayNum = d.day ?? (i + 1);
                  const short = d.day_plan || (d.activities && d.activities[0] && (d.activities[0].place_name || d.activities[0].place_details)) || '';
                  const shortTrim = short ? (short.length > 120 ? short.slice(0, 117) + '...' : short) : '';
                  return `Day ${dayNum}: ${shortTrim}`;
                });

                const hotelLine = hotelNames.length ? `Top hotels: ${hotelNames.join(', ')}` : '';
                const daysText = dayLines.length ? dayLines.join('\n') : '';

                const lines = [];
                lines.push(`Your trip plan to ${dest}${dur ? ` (${dur})` : ''} is ready.`);
                if (hotelLine) lines.push(hotelLine);
                if (daysText) lines.push('\nItinerary:\n' + daysText);
                lines.push('\nHave a nice trip — see you on the next one!');

                displayMessage = lines.join('\n\n');
              }
            } catch (e) {
              // fallback to raw response if parsing fails
              displayMessage = respText;
            }

            setMessages((prev) => [
              ...prev,
              {
                role: "assistant",
                content: displayMessage,
              },
            ]);
            // Mark trip as completed
            setTripCompleted(true);

            // Try to parse and save the trip_plan to the backend
            (async () => {
              try {
                let parsed = null;
                const respText = result.data.resp;

                // Try direct JSON parse
                try {
                  parsed = JSON.parse(respText);
                } catch (e) {
                  // If AI returned something like "{...}" wrapped in text, try to extract JSON
                  const start = respText.indexOf('{');
                  const end = respText.lastIndexOf('}');
                  if (start !== -1 && end !== -1 && end > start) {
                    const jsonSubstring = respText.slice(start, end + 1);
                    try {
                      parsed = JSON.parse(jsonSubstring);
                    } catch (e2) {
                      console.warn('Failed to parse extracted JSON from AI response', e2);
                    }
                  }
                }

                // If parsed object contains trip_plan at top-level or under key 'trip_plan'
                const tripPlanObj = parsed && (parsed.trip_plan || parsed.trip_plan === undefined ? parsed.trip_plan : parsed) || null;

                if (tripPlanObj) {
                  const savePayload = {
                    clerkId: user?.id || (user?.userId ?? null),
                    title: tripPlanObj.destination || tripPlanObj.title || 'Trip',
                    destination: tripPlanObj.destination || '',
                    budget: tripPlanObj.budget || '',
                    groupSize: tripPlanObj.groupSize || '',
                    interests: tripPlanObj.interests || [],
                    trip_plan: tripPlanObj,
                  };

                  console.log('Saving trip to backend with payload:', savePayload);

                  try {
                    const saveResp = await axios.post('/api/tripdetails', savePayload);
                    console.log('Save response:', saveResp.data);
                    const saved = saveResp?.data?.trip || saveResp?.data || null;
                    if (saved && typeof setTripDetailInfo === 'function') {
                      setTripDetailInfo(saved);
                      console.log('Trip saved to TripDetail context:', saved);
                    }
                  } catch (saveErr) {
                    console.error('Error saving trip to backend:', saveErr.response?.data || saveErr.message || saveErr);
                  }
                } else {
                  console.warn('Could not parse trip_plan from AI response; not saving.');
                }
              } catch (err) {
                console.error('Unexpected error while saving trip:', err);
              }
            })();
          }
        } catch (error) {
          console.error("Error generating final trip plan:", error);
        } finally {
          setIsLoading(false);
        }
      }, 1000);
    }
  }, [messages, isFinal, isLoading]);
  // MAIN RENDER
  return (
    <div className="h-[85vh] lg:w-[550px] w-full lg:min-w-[550px] flex-shrink-0 flex flex-col border rounded-2xl p-5">
      {messages?.length === 0 && (
        <EmptyBoxState onSelectOption={handleEmptySelect} />
      )}

      <section 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto px-4 py-2 space-y-3 scroll-smooth"
      >
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[90%] lg:max-w-[70%] px-4 py-3 rounded-2xl shadow-sm ${
                message.role === "user"
                  ? "bg-[#F472B6] text-white rounded-br-md"
                  : "bg-white text-gray-800 border border-gray-200 rounded-bl-md"
              }`}
            >
              <div className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</div>

              {/* UI Components - Only render for assistant messages with valid UI */}
              {message.role === "assistant" && message.ui && 
               message.ui !== "general" && message.ui !== "source" && message.ui !== "destination" && (
                <div className="mt-3">
                  {RenderGenerativeUi(message.ui)}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[90%] lg:max-w-[70%] px-4 py-3 rounded-2xl rounded-bl-md bg-white border border-gray-200 shadow-sm">
              <div className="flex items-center space-x-2">
                <span className="text-gray-500 text-sm">typing</span>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-[#F472B6] rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-[#F472B6] rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-[#F472B6] rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* USER INPUT */}
      <section className="p-4 bg-white border-t border-gray-200">
        <div className="w-full max-w-full mx-auto">
          <div className="flex items-end gap-3 bg-gray-50 rounded-3xl px-4 py-3 border border-gray-300">
            <Textarea
              placeholder="Message Rova AI..."
              className="flex-1 bg-transparent border-none focus-visible:ring-0 shadow-none resize-none text-base min-h-10 max-h-32 p-0 placeholder:text-gray-500"
              onChange={(e) => setUserInput(e.target.value)}
              value={userInput}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  onSend();
                }
              }}
            />

            <Button
              size="icon"
              className="bg-[#F472B6] hover:bg-[#EC4899] h-10 w-10 rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              onClick={onSend}
              disabled={!userInput?.trim() || isLoading}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ChatBox;
