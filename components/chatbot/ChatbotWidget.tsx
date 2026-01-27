"use client";

import { useState } from "react";
import { Bot } from "lucide-react";
import ChatbotPopup from "./ChatbotPopup";

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);

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
