"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { useTripDetail } from "@/app/provider";
import axios from "axios";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import EmptyBoxState from "./EmptyBoxState";
import GroupSizeUi from "./GroupSizeUi";
import BudgetUi from "./BudgetUi";
import DurationUi from "./DurationUi";
import TravelInterest from "./TravelInterest";
import TravelLoadingAnimation from "./TravelLoadingAnimation";

// Ordered steps and mapping to UI components
const STEPS = [
  { key: "source", label: "Where are you traveling from?", type: "input" },
  { key: "destination", label: "Where would you like to go?", type: "input" },
  { key: "groupSize", label: "Who will be joining you?", type: "component", component: GroupSizeUi },
  { key: "budget", label: "What's your budget range?", type: "component", component: BudgetUi },
  { key: "duration", label: "How many days will you travel?", type: "component", component: DurationUi },
  { key: "interests", label: "What are your travel interests?", type: "component", component: TravelInterest },
  { key: "final", label: "Generate trip plan", type: "final" }
];

const ChatBox = () => {
  const { user } = useUser();
  const { tripDetailInfo, setTripDetailInfo } = useTripDetail();

  const [stepIndex, setStepIndex] = useState(0);
  const [messages, setMessages] = useState([]); // simple chat transcript
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [showTyping, setShowTyping] = useState(false);

  const currentStep = STEPS[stepIndex];
  const chatRef = useRef(null);

  // (Quick starter pills removed — UI will show the lower chat area only)


  // Auto-scroll
  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages, isLoading]);

  // When the left chat is cleared, also clear the right-side trip details
  useEffect(() => {
    if (messages.length === 0 && typeof setTripDetailInfo === 'function') {
      setTripDetailInfo(null);
    }
  }, [messages, setTripDetailInfo]);



  // Advance step helper
  const goToNextStep = useCallback((providedValue) => {
    // store providedValue as user message
    if (providedValue !== undefined && providedValue !== null) {
      setMessages(prev => [...prev, { role: "user", content: providedValue }]);
    }
    // If this is the very first user message (messages was empty), do not
    // advance the step. Instead show the assistant prompt for the current
    // step (usually `source`) so the user is explicitly asked the first
    // question after they indicate intent. Before showing any assistant
    // message, verify the user's remaining credits so we can show a limit
    // message immediately when credits are exhausted.
    if (messages.length === 0) {
      (async () => {
        try {
          const creditResp = await axios.get('/api/credits', { withCredentials: true });
          const unlimited = creditResp?.data?.unlimited === true;
          const remaining = creditResp?.data?.remaining;
          const subscription = creditResp?.data?.subscription || null;

          // If user is premium, show a small premium badge message (non-blocking)
          if (unlimited && subscription === 'premium') {
            setMessages(prev => [...prev, { role: 'assistant', content: '👑 Premium Member — unlimited trips', ui: 'premium' }]);
            // continue to show the assistant question below
          }

          if (!unlimited && typeof remaining === 'number' && remaining <= 0) {
            setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, you've used all your free trip plans for today. Your credits will refill tomorrow at midnight.", ui: 'limit' }]);
            return;
          }
        } catch (err) {
          // If credits endpoint fails, allow flow to continue (do not block UX)
          console.warn('Credits check failed:', err?.message || err);
        }

        // Show typing indicator before assistant question
        setShowTyping(true);
        setTimeout(() => {
          setShowTyping(false);
          const curStep = STEPS[stepIndex];
          if (curStep && curStep.type !== 'final') {
            setMessages(prev => [...prev, { role: 'assistant', content: curStep.label, ui: curStep.key }]);
          }
        }, 900);
      })();
      return;
    }

    const nextIndex = Math.min(stepIndex + 1, STEPS.length - 1);
    setStepIndex(nextIndex);

    // Show typing indicator before assistant question for subsequent steps
    const nextStep = STEPS[nextIndex];
    if (nextStep && nextStep.type !== "final") {
      setShowTyping(true);
      setTimeout(() => {
        setShowTyping(false);
        setMessages(prev => [...prev, { role: "assistant", content: nextStep.label, ui: nextStep.key }]);
      }, 900);
    }
  }, [stepIndex, messages]);

  // Handlers for selection components (they call with (value, isDoubleTap))
  const handleComponentSelect = useCallback((value, isDirect = false) => {
    // if direct (double tap / confirm) then submit and advance
    if (isDirect) {
      goToNextStep(value);
    } else {
      // single tap: populate input for review
      setUserInput(value);
    }
  }, [goToNextStep]);

  // quick option handler removed (pills UI removed)

  const handleSend = useCallback(async () => {
    const trimmed = (userInput || "").trim();
    if (!trimmed) return;

    // If current step is final, trigger generation
    if (currentStep?.type === "final") {
      // add final user note then generate
      setMessages(prev => [...prev, { role: "user", content: trimmed }]);
      await generateFinal();
      setUserInput("");
      return;
    }

    // Otherwise submit the current step value and advance
    goToNextStep(trimmed);
    setUserInput("");
  }, [userInput, currentStep, goToNextStep]);

  // Called when the UI reaches final; call aimodel with isFinal and then save trip
  const generateFinal = useCallback(async () => {
    try {
      setIsLoading(true);
      setFinalizing(true);
      // Check credits before attempting final generation
          try {
            const creditResp = await axios.get('/api/credits', { withCredentials: true });
        const unlimited = creditResp?.data?.unlimited === true;
        const remaining = creditResp?.data?.remaining;
        if (!unlimited && typeof remaining === 'number' && remaining <= 0) {
          setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, you've used all your free trip plans for today. Your credits will refill tomorrow at midnight.", ui: 'limit' }]);
          setFinalizing(false);
          setIsLoading(false);
          return;
        }
      } catch (err) {
        // If credits endpoint fails, continue but log it
        console.warn('Credits check failed before final generation:', err?.message || err);
      }

      // Call aimodel with the conversation so far; server will return final trip data
      const resp = await axios.post('/api/aimodel', { messages, isFinal: true }, { withCredentials: true });
      if (!resp?.data) throw new Error('No response from AI');

      const { success, resp: aiResp, ui } = resp.data;


      // Try to parse, but always send raw to backend
      let parsed = null;
      try {
        parsed = JSON.parse(aiResp);
      } catch (e) {
        // try to extract JSON substring
        const start = (aiResp || "").indexOf('{');
        const end = (aiResp || "").lastIndexOf('}');
        if (start !== -1 && end !== -1 && end > start) {
          try { parsed = JSON.parse(aiResp.slice(start, end + 1)); } catch (e2) { parsed = null; }
        }
      }

      // Prefer `trip_plan` field when available
      let tripPlan = null;
      if (parsed) {
        if (parsed.trip_plan) tripPlan = parsed.trip_plan;
        else tripPlan = parsed;
      } else {
        try {
          const msgObj = typeof aiResp === 'string' ? JSON.parse(aiResp) : aiResp;
          if (msgObj && msgObj.trip_plan) tripPlan = msgObj.trip_plan;
        } catch (_) { /* ignore */ }
      }

      // Always send raw AI output to backend, even if parsing failed
      const payload = {
        clerkId: user?.id || null,
        trip_plan_raw: aiResp,
      };
      if (tripPlan) {
        // Normalize arrays
        if (!Array.isArray(tripPlan.itinerary)) tripPlan.itinerary = tripPlan.itinerary ? [tripPlan.itinerary] : [];
        if (!Array.isArray(tripPlan.iterations)) tripPlan.iterations = tripPlan.iterations ? tripPlan.iterations : [];
        if (!Array.isArray(tripPlan.timeline)) tripPlan.timeline = tripPlan.timeline ? tripPlan.timeline : [];
        if (!Array.isArray(tripPlan.interests)) tripPlan.interests = tripPlan.interests ? tripPlan.interests : [];
        payload.title = tripPlan.destination || 'Trip';
        payload.destination = tripPlan.destination || '';
        payload.budget = tripPlan.budget || '';
        payload.groupSize = tripPlan.groupSize || '';
        payload.interests = tripPlan.interests || [];
        payload.trip_plan = tripPlan;
        payload.itinerary = tripPlan.itinerary || [];
      }

      // Save to backend
      try {
        const saveResp = await axios.post('/api/tripdetails', payload, { withCredentials: true });
        const saved = saveResp?.data?.trip || saveResp?.data || null;
        if (saved && typeof setTripDetailInfo === 'function') {
          setTripDetailInfo(saved);
          setMessages(prev => [...prev, { role: 'assistant', content: 'Your trip plan is ready!', ui: 'final' }]);
        } else if (saveResp?.data?.error) {
          // Backend returned an error (e.g., incomplete trip)
          setMessages(prev => [...prev, { role: 'assistant', content: `Trip could not be completed: ${saveResp.data.error}${saveResp.data.requestedDays ? ` (Requested: ${saveResp.data.requestedDays}, Got: ${saveResp.data.itineraryDays})` : ''}` }]);
        }
      } catch (saveErr) {
        // Log full details to help debugging: status, data, message
        let status = null;
        let data = null;
        if (saveErr?.response) {
          status = saveErr.response.status;
          data = saveErr.response.data;
        }
        console.error('Error saving trip:', { status, data, message: saveErr?.message });
        // Show backend error if available
        if (data && data.error) {
          setMessages(prev => [...prev, { role: 'assistant', content: `Trip could not be completed: ${data.error}${data.requestedDays ? ` (Requested: ${data.requestedDays}, Got: ${data.itineraryDays})` : ''}` }]);
        } else {
          setMessages(prev => [...prev, { role: 'assistant', content: 'Failed to save trip. Please try again.' }]);
        }
      }

    } catch (err) {
      console.error('generateFinal error:', err);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, could not generate trip plan right now.' }]);
    } finally {
      setFinalizing(false);
      setIsLoading(false);
    }
  }, [messages, user, setTripDetailInfo]);

  // Render the active step UI
  const renderStepUI = () => {
    if (!currentStep) return null;

    if (currentStep.type === 'input') {
      return (
        <div className="mt-3">
          <Textarea
            placeholder={currentStep.label}
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            className="min-h-[48px]"
          />
          <div className="flex mt-2 justify-end">
            <Button size="sm" onClick={handleSend} disabled={!userInput.trim() || isLoading}>
              <div className="flex items-center gap-2"><Send className="w-4 h-4" /> Send</div>
            </Button>
          </div>
        </div>
      );
    }

    if (currentStep.type === 'component') {
      const Component = currentStep.component;
      return (
        <div className="mt-3">
          <Component onSelectedOption={handleComponentSelect} />
        </div>
      );
    }

    if (currentStep.type === 'final') {
      // Centered final panel: show completion card and centered primary button
      return (
        <div className="w-full flex flex-col items-center justify-center mt-6">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-md p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-pink-300 mx-auto flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Trip Planning Complete!</h3>
            <p className="text-sm text-gray-600">Your personalized travel itinerary is ready</p>
          </div>

          <div className="mt-6">
            <button
              onClick={generateFinal}
              disabled={finalizing || isLoading}
              className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-full shadow-lg focus:outline-none disabled:opacity-60"
            >
              {finalizing || isLoading ? 'Generating...' : 'Generate Trip'}
            </button>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-[85vh] lg:w-[550px] w-full lg:min-w-[550px] flex-shrink-0 flex flex-col border rounded-2xl p-5">
      {/* top quick-option pills removed per request; keep lower chat area collapsed by default */}

      {messages?.length === 0 && (
        <EmptyBoxState onSelectOption={(v)=>{ setUserInput(v); }} />
      )}

      <section ref={chatRef} className="flex-1 overflow-y-auto px-4 py-2 space-y-3 scroll-smooth">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}> 
            <div className={`max-w-[90%] lg:max-w-[70%] px-4 py-3 rounded-2xl shadow-sm ${m.role === 'user' ? 'bg-[#F472B6] text-white' : (m.ui === 'premium' ? 'bg-yellow-50 text-yellow-900 border border-yellow-200' : 'bg-white text-gray-800 border border-gray-200')}`}>
              <div className="whitespace-pre-wrap text-sm">{m.content}</div>
            </div>
          </div>
        ))}

        {/* Active assistant prompt + UI - only show after user has started the conversation
            For source/destination we DO NOT render the top bubble or UI; user should use
            the bottom input (placeholder shows the question). */}
        {messages.length > 0 && (
          <div className="mt-2">
            {/* Typing indicator before assistant question and UI */}
            {showTyping && (
              <div className="flex items-center gap-2 mb-3">
                <span className="text-base font-medium text-black">Typing</span>
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-[#F472B6] rounded-full animate-bounce" style={{animationDelay:'0ms'}}></span>
                  <span className="w-2 h-2 bg-[#F472B6] rounded-full animate-bounce mx-1" style={{animationDelay:'150ms'}}></span>
                  <span className="w-2 h-2 bg-[#F472B6] rounded-full animate-bounce" style={{animationDelay:'300ms'}}></span>
                </span>
              </div>
            )}
            {/* If assistant already posted this step as a chat message (ui === key),
                don't render the duplicate top label. */}
            {!showTyping && currentStep && currentStep.key !== 'source' && currentStep.key !== 'destination' && !messages.some(m => m.role === 'assistant' && m.ui === currentStep.key) && (
              <div className="text-sm text-gray-600 font-medium">{currentStep.label}</div>
            )}

            {/* Always render component UI for non-source/destination steps */}
            {!showTyping && currentStep && currentStep.key !== 'source' && currentStep.key !== 'destination' && (
              renderStepUI()
            )}
          </div>
        )}
      </section>

      <section className="p-4 bg-white border-t border-gray-200">
        <div className="w-full max-w-full mx-auto">
          <div className="flex items-center gap-3">
            <Textarea
              placeholder={messages.length === 0 ? 'Type your answer here...' : (currentStep?.label || 'Type your answer here...')}
              className="flex-1 bg-transparent border-none focus-visible:ring-0 shadow-none resize-none text-base min-h-10 max-h-32 p-0 placeholder:text-gray-500"
              onChange={(e) => setUserInput(e.target.value)}
              value={userInput}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
              }}
            />

            <Button size="icon" className="bg-[#F472B6] hover:bg-[#EC4899] h-10 w-10 rounded-full" onClick={handleSend} disabled={!userInput.trim() || isLoading}>
              {isLoading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ChatBox;
