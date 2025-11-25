"use client"
import React, { useState } from 'react'
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import axios from 'axios';
import EmptyBoxState from './EmptyBoxState';
import GroupSizeUi from './GroupSizeUi';
import BudgetUi from './BudgetUi';

const ChatBox = () => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const RenderGenerativeUi = (ui) => {
    if(ui === 'budget'){
      //Budget UI Component can be rendered here
      return <BudgetUi onSelectedOption={(v)=>{setUserInput(v);onSend();}} />

    }
    else if(ui === 'groupSize'){
      //groupSize UI Component can be rendered here
      return <GroupSizeUi onSelectedOption={(v)=>{setUserInput(v);onSend();}} />
    }
    return null;
  };

  const onSend = async () => {
    if (!userInput?.trim() || isLoading) return;

    const newMsg = {
      role: 'user',
      content: userInput
    };

    setMessages((prev) => [...prev, newMsg]);
    setUserInput('');
    setIsLoading(true);

    try {
      const result = await axios.post('/api/aimodel', {
        messages: [...messages, newMsg],
      });

      if (result.data.success) {
        setMessages((prev) => [...prev, {
          role: 'assistant',
          content: result.data.resp || result.data.message,
          ui:result?.data?.ui
        }]);
      } else {
        throw new Error(result.data.error || 'Failed to get response');
      }

      console.log(result.data);
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message to chat
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again or check your internet connection.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[85vh] flex flex-col">
      {messages?.length===0 && <EmptyBoxState onSelectOption={(v)=>{setUserInput(v);onSend()}} />}
      <section className='flex-1 overflow-y-auto px-4 py-2 space-y-3'>
        {/* Display Messages */}
        {messages.map((message, index) => (
          <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[70%] px-4 py-3 rounded-2xl shadow-sm ${
              message.role === 'user' 
                ? 'bg-[#F472B6] text-white rounded-br-md' 
                : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md'
            }`}>
              <p className="text-sm leading-relaxed">{message.content}</p>
              {RenderGenerativeUi(message.ui ?? '')}
            </div>
          </div>
        ))}
        
        {/* Typing indicator when AI is responding */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[70%] px-4 py-3 rounded-2xl rounded-bl-md bg-white border border-gray-200 shadow-sm">
              <div className="flex items-center space-x-2">
                <span className="text-gray-500 text-sm">typing</span>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-[#F472B6] rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-[#F472B6] rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-[#F472B6] rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
       
      {/* User input */}
      <section className="p-4 bg-white border-t border-gray-200">
        {/* Input Box */}
        <div className='w-full max-w-4xl mx-auto'>
          <div className='flex items-end gap-3 bg-gray-50 rounded-3xl px-4 py-3 border border-gray-300'>
            <Textarea
              placeholder='Message Rova AI...'
              className="flex-1 bg-transparent border-none focus-visible:ring-0 shadow-none resize-none text-base min-h-10 max-h-32 p-0 placeholder:text-gray-500"
              onChange={(event) => setUserInput(event.target.value)}
              value={userInput}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  onSend();
                }
              }}
            />
            <Button
              size={'icon'}
              className="bg-[#F472B6] hover:bg-[#EC4899] h-10 w-10 rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              onClick={onSend}
              disabled={!userInput?.trim() || isLoading}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className='h-4 w-4' />
              )}
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default ChatBox

