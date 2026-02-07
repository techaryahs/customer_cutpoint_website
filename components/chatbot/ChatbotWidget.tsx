"use client";

import { useState, useEffect } from "react";
import { Bot } from "lucide-react";
import ChatbotPopup from "./ChatbotPopup";

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  
  useEffect(() => {
    // This is the "Ear" that listens for the click from the settings page
    const handleTrigger = () => {
      console.log("Signal received! Opening chat..."); // Check your F12 console for this
      setOpen(true);
    };

    window.addEventListener("open-glowbiz-chat", handleTrigger);
    return () => window.removeEventListener("open-glowbiz-chat", handleTrigger);
  }, []);

  return (
    <>
      {/* 🤖 FLOATING CHATBOT ICON */}
      <button
        aria-label="Open Chatbot"
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-6 z-50"
      >
        <div className="flex items-center justify-center w-14 h-14 rounded-full bg-cocoa text-white shadow-xl hover:scale-105 transition-transform cursor-pointer">
          <Bot size={24} />
        </div>
      </button>

      {/* 💬 CHATBOT POPUP */}
      {open && <ChatbotPopup onClose={() => setOpen(false)} />}
    </>
  );
}
