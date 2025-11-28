"use client";
import React, { useState, useCallback, useRef, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import axios from "axios";
import EmptyBoxState from "./EmptyBoxState";
import GroupSizeUi from "./GroupSizeUi";
import BudgetUi from "./BudgetUi";
import DurationUi from "./DurationUi";
import TravelInterest from "./TravelInterest";

const ChatBox = () => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesRef = useRef([]);
  const chatContainerRef = useRef(null);

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

  // -----------------------------
  // STABLE onSend function
  // -----------------------------
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

  // -----------------------------
  // STABLE handlers for UI components
  // -----------------------------
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
          userSelection: { budget }
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
          userSelection: { groupsize }
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
          userSelection: { duration }
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
          userSelection: { interests }
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

  // -----------------------------
  // Render dynamic UI sent by assistant (Memoized components)
  // -----------------------------
  const BudgetComponent = useCallback(() => <BudgetUi onSelectedOption={handleBudgetSelect} />, [handleBudgetSelect]);
  const GroupSizeComponent = useCallback(() => <GroupSizeUi onSelectedOption={handleGroupSizeSelect} />, [handleGroupSizeSelect]);
  const DurationComponent = useCallback(() => <DurationUi onSelectedOption={handleDurationSelect} />, [handleDurationSelect]);
  const InterestComponent = useCallback(() => <TravelInterest onSelectedOption={handleInterestSelect} />, [handleInterestSelect]);

  const RenderGenerativeUi = useCallback(
    (ui) => {
      if (!ui || ui === "" || ui === "general" || ui === "final" || ui === "source" || ui === "destination") {
        return null;
      }
      
      try {
        switch (ui) {
          case "budget":
            return <BudgetComponent />;
          case "groupSize":
            return <GroupSizeComponent />;
          case "duration":
            return <DurationComponent />;
          case "interests":
            return <InterestComponent />;
          default:
            return null;
        }
      } catch (error) {
        console.error("Error rendering UI component:", error);
        return null;
      }
    },
    [BudgetComponent, GroupSizeComponent, DurationComponent, InterestComponent]
  );

  // -----------------------------
  // MAIN RENDER
  // -----------------------------
  return (
    <div className="h-[85vh] flex flex-col">
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
              className={`max-w-[70%] px-4 py-3 rounded-2xl shadow-sm ${
                message.role === "user"
                  ? "bg-[#F472B6] text-white rounded-br-md"
                  : "bg-white text-gray-800 border border-gray-200 rounded-bl-md"
              }`}
            >
              <p className="text-sm leading-relaxed">{message.content}</p>

              {/* UI Components - Only render for assistant messages with valid UI */}
              {message.role === "assistant" && message.ui && 
               message.ui !== "general" && message.ui !== "final" && 
               message.ui !== "source" && message.ui !== "destination" && (
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
            <div className="max-w-[70%] px-4 py-3 rounded-2xl rounded-bl-md bg-white border border-gray-200 shadow-sm">
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
        <div className="w-full max-w-4xl mx-auto">
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
