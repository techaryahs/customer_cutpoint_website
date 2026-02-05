"use client";

import { useEffect, useRef, useState } from "react";
import { X, MapPin, Star } from "lucide-react";

/* ================= TYPES ================= */

type Message = {
  sender: "user" | "bot";
  text: string;
};

type Salon = {
  name: string;
  city?: string;
  address?: string;
  rating?: number;
};

type Service = {
  name: string;
  price?: number;
  duration?: number;
};

export default function ChatbotPopup({ onClose }: { onClose: () => void }) {
  const chatRef = useRef<HTMLDivElement>(null);

  /* ================= STATE ================= */

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [quickActions, setQuickActions] = useState<string[]>([]);

  const [salons, setSalons] = useState<Salon[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  const [sessionId] = useState("session-" + Date.now());
  const [currentSalon, setCurrentSalon] = useState<string | null>(null);
  const [awaitingCity, setAwaitingCity] = useState(false);

  /* ================= AUTO SCROLL ================= */

  useEffect(() => {
    chatRef.current?.scrollTo({
      top: chatRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, salons, services]);

  /* ================= INIT ================= */

  useEffect(() => {
    setMessages([
      {
        sender: "bot",
        text:
          "👋 Hi! I'm GlowBiz Concierge ✨\n\nI can help you find the perfect salon!",
      },
    ]);

    setQuickActions([
      "Show salons near me",
      "Show all salons",
      "Beauty tips",
    ]);
  }, []);

  /* ================= SEND TO BACKEND ================= */

  const sendToBackend = async (text: string, salonOverride?: string) => {
    setSalons([]);
    setServices([]);

    setMessages((prev) => [...prev, { sender: "bot", text: "Typing..." }]);

    try {
      const payload: any = {
        message: text,
        session_id: sessionId,
        salon_name: salonOverride ?? currentSalon,
        location: null,
      };

      if (awaitingCity && /^[a-zA-Z ]+$/.test(text)) {
        payload.location = text;
      }

      const res = await fetch(
        "https://glow-bizz-ai-assistant-customer.onrender.com/api/chat",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      setMessages((prev) => prev.filter((m) => m.text !== "Typing..."));

      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          { sender: "bot", text: "❌ Connection error. Please try again." },
        ]);
        return;
      }

      const data = await res.json();

      if (data.reply_text?.trim()) {
        setMessages((prev) => [...prev, { sender: "bot", text: data.reply_text }]);
      } else {
        if (data.type === "salon_list") {
          setMessages((prev) => [
            ...prev,
            { sender: "bot", text: "Here are the best salons for you:" },
          ]);
        }
        if (data.type === "service_list") {
          setMessages((prev) => [
            ...prev,
            { sender: "bot", text: "These services are available:" },
          ]);
        }
      }

      setAwaitingCity(data.type === "ask_location");

      setQuickActions(Array.isArray(data.suggestions) ? data.suggestions : []);

      if (data.type === "salon_list" && Array.isArray(data.salons)) {
        setSalons(data.salons);
      }

      if (data.type === "service_list" && Array.isArray(data.services)) {
        setServices(data.services);
      }
    } catch {
      setMessages((prev) => prev.filter((m) => m.text !== "Typing..."));
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "❌ Server error. Please try again." },
      ]);
    }
  };

  /* ================= USER SEND ================= */

  const handleSend = (text?: string, salonOverride?: string) => {
    const message = text ?? input;
    if (!message.trim()) return;

    setMessages((prev) => [...prev, { sender: "user", text: message }]);
    setInput("");
    sendToBackend(message, salonOverride);
  };

  /* ================= UI ================= */

  return (
    <div className="fixed bottom-24 right-6 z-50 w-[360px] h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col animate-slide-up">
      {/* HEADER */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div>
          <h3 className="font-semibold text-cocoa">✨ GlowBizz Concierge</h3>
          <p className="text-xs text-gray-500">Your salon & spa assistant</p>
        </div>
        <button onClick={onClose}>
          <X size={18} />
        </button>
      </div>

      {/* CHAT */}
      <div ref={chatRef} className="flex-1 p-4 overflow-y-auto space-y-3 text-sm">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`p-3 rounded-lg max-w-[85%] whitespace-pre-line ${
              msg.sender === "user"
                ? "ml-auto bg-cocoa text-white"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {msg.text}
          </div>
        ))}

        {/* SALON CARDS */}
        {salons.length > 0 && (
          <div className="space-y-3">
            {salons.map((salon, i) => {
              const selected = currentSalon === salon.name;
              return (
                <div
                  key={i}
                  className={`rounded-xl p-4 bg-white shadow-sm border ${
                    selected ? "ring-2 ring-cocoa" : ""
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-sm">{salon.name}</h4>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <MapPin size={12} />
                        {salon.city || salon.address}
                      </p>
                    </div>
                    {salon.rating && (
                      <div className="flex items-center gap-1 text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                        <Star size={12} />
                        {salon.rating.toFixed(1)}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setCurrentSalon(salon.name);
                      handleSend("View services", salon.name);
                    }}
                    className="mt-3 w-full bg-cocoa text-white text-xs py-2 rounded-lg hover:opacity-90"
                  >
                    View services
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* SERVICE CARDS */}
        {services.length > 0 && (
          <div className="space-y-3">
            {services.map((service, i) => (
              <div key={i} className="rounded-xl p-4 bg-white shadow-sm border">
                <h4 className="font-medium text-sm">{service.name}</h4>
                <div className="text-xs text-gray-500 mt-1">
                  {service.price && <>💰 ₹{service.price} </>}
                  {service.duration && <>⏱️ {service.duration} min</>}
                </div>
                <button
                  onClick={() => handleSend("Book appointment")}
                  className="mt-3 w-full bg-cocoa text-white text-xs py-2 rounded-lg"
                >
                  Book now
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* QUICK ACTIONS */}
      {quickActions.length > 0 && (
        <div className="px-3 pb-2 flex flex-wrap gap-2">
          {quickActions.map((action) => (
            <button
              key={action}
              onClick={() => handleSend(action)}
              className="text-xs px-3 py-1 rounded-full border hover:bg-gray-100"
            >
              {action}
            </button>
          ))}
        </div>
      )}

      {/* INPUT */}
      <div className="p-3 border-t flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask about salons, services, bookings…"
          className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none"
        />
        <button
          onClick={() => handleSend()}
          className="px-4 py-2 bg-cocoa text-white rounded-lg text-sm"
        >
          ➤
        </button>
      </div>
    </div>
  );
}
