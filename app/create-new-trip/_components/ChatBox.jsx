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

  const currentStep = STEPS[stepIndex];
  const chatRef = useRef(null);

  // Auto-scroll
  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages, isLoading]);

  // Initialize assistant prompt for first step
  useEffect(() => {
    setMessages([
      { role: "assistant", content: STEPS[0].label, ui: STEPS[0].key }
    ]);
  }, []);

  // Advance step helper
  const goToNextStep = useCallback((providedValue) => {
    // store providedValue as user message
    if (providedValue !== undefined && providedValue !== null) {
      setMessages(prev => [...prev, { role: "user", content: providedValue }]);
    }

    const nextIndex = Math.min(stepIndex + 1, STEPS.length - 1);
    setStepIndex(nextIndex);

    // push assistant prompt for next step (unless next is final which will be handled by generate)
    const nextStep = STEPS[nextIndex];
    if (nextStep && nextStep.type !== "final") {
      setMessages(prev => [...prev, { role: "assistant", content: nextStep.label, ui: nextStep.key }]);
    }
  }, [stepIndex]);

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

      // Call aimodel with the conversation so far; server will return final trip data
      const resp = await axios.post('/api/aimodel', { messages, isFinal: true });
      if (!resp?.data) throw new Error('No response from AI');

      const { success, resp: aiResp, ui } = resp.data;

      let parsed = null;
      // AI may return a JSON string or messy text; try parsing robustly
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
        // if aiResp itself is an object-like string maybe server returned with message wrapper
        try {
          const msgObj = typeof aiResp === 'string' ? JSON.parse(aiResp) : aiResp;
          if (msgObj && msgObj.trip_plan) tripPlan = msgObj.trip_plan;
        } catch (_) { /* ignore */ }
      }

      // If still no tripPlan, attempt to use resp.message or fallback
      if (!tripPlan) {
        // keep the AI response as assistant message and stop
        setMessages(prev => [...prev, { role: 'assistant', content: aiResp || 'Trip generated', ui: ui || 'final' }]);
        setFinalizing(false);
        setIsLoading(false);
        return;
      }

      // Normalize arrays
      if (!Array.isArray(tripPlan.itinerary)) tripPlan.itinerary = tripPlan.itinerary ? [tripPlan.itinerary] : [];
      if (!Array.isArray(tripPlan.iterations)) tripPlan.iterations = tripPlan.iterations ? tripPlan.iterations : [];
      if (!Array.isArray(tripPlan.timeline)) tripPlan.timeline = tripPlan.timeline ? tripPlan.timeline : [];
      if (!Array.isArray(tripPlan.interests)) tripPlan.interests = tripPlan.interests ? tripPlan.interests : [];

      // Build save payload
      const payload = {
        clerkId: user?.id || null,
        title: tripPlan.destination || 'Trip',
        destination: tripPlan.destination || '',
        budget: tripPlan.budget || '',
        groupSize: tripPlan.groupSize || '',
        interests: tripPlan.interests || [],
        trip_plan: tripPlan,
        itinerary: tripPlan.itinerary || []
      };

      // Save to backend
      try {
        const saveResp = await axios.post('/api/tripdetails', payload);
        const saved = saveResp?.data?.trip || saveResp?.data || null;
        if (saved && typeof setTripDetailInfo === 'function') {
          setTripDetailInfo(saved);
        }
      } catch (saveErr) {
        // Log full details to help debugging: status, data, message
        const status = saveErr?.response?.status;
        const data = saveErr?.response?.data;
        console.error('Error saving trip:', { status, data, message: saveErr?.message });
        // Surface a user-facing assistant message so user sees failure
        setMessages(prev => [...prev, { role: 'assistant', content: 'Failed to save trip. Please try again.' }]);
      }

      // Append assistant final summary message
      setMessages(prev => [...prev, { role: 'assistant', content: 'Your trip plan is ready!', ui: 'final' }]);

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
          {/* show input preview + manual send */}
          {userInput && (
            <div className="mt-3">
              <div className="text-sm text-gray-700 mb-2">Preview:</div>
              <Textarea value={userInput} onChange={(e)=>setUserInput(e.target.value)} />
              <div className="flex mt-2 justify-end">
                <Button size="sm" onClick={handleSend} disabled={!userInput.trim() || isLoading}>Send</Button>
              </div>
            </div>
          )}
        </div>
      );
    }

    if (currentStep.type === 'final') {
      return (
        <div className="mt-4">
          <TravelLoadingAnimation isGenerating={finalizing || isLoading} onViewTrip={()=>{}} />
          <div className="flex mt-3 justify-end">
            <Button size="sm" onClick={generateFinal} disabled={finalizing || isLoading}>Generate Trip</Button>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-[85vh] lg:w-[550px] w-full lg:min-w-[550px] flex-shrink-0 flex flex-col border rounded-2xl p-5">
      {messages?.length === 0 && (
        <EmptyBoxState onSelectOption={(v)=>{ setUserInput(v); }} />
      )}

      <section ref={chatRef} className="flex-1 overflow-y-auto px-4 py-2 space-y-3 scroll-smooth">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}> 
            <div className={`max-w-[90%] lg:max-w-[70%] px-4 py-3 rounded-2xl shadow-sm ${m.role === 'user' ? 'bg-[#F472B6] text-white' : 'bg-white text-gray-800 border border-gray-200'}`}>
              <div className="whitespace-pre-wrap text-sm">{m.content}</div>
            </div>
          </div>
        ))}

        {/* Active assistant prompt + UI */}
        <div className="mt-2">
          <div className="text-sm text-gray-600 font-medium">{currentStep?.label}</div>
          {renderStepUI()}
        </div>
      </section>

      <section className="p-4 bg-white border-t border-gray-200">
        <div className="w-full max-w-full mx-auto">
          <div className="flex items-center gap-3">
            <Textarea
              placeholder="Type your answer here..."
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
