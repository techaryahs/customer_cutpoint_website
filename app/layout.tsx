import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ChatbotWidget from "@/components/chatbot/ChatbotWidget";
import { MessageCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Salon & Spa Management",
  description: "Premium salon & spa booking and management platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light">
      <body className="bg-linen text-cocoa antialiased">
        <div className="min-h-screen flex flex-col relative">

          {/* 🤖 CHATBOT (ICON + POPUP HANDLED INTERNALLY) */}
          <ChatbotWidget />

          {/* 🔥 WHATSAPP FLOATING BUTTON */}
          <a
            href="https://wa.me/919819112999?text=Hello%20I%20want%20to%20book%20a%20salon%20service"
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 z-50"
          >
            <div className="flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] text-white shadow-xl hover:scale-105 transition-transform cursor-pointer">
              <MessageCircle size={24} />
            </div>
          </a>

          <Header />
          <main className="flex-1">{children}</main>
          <Footer />

        </div>
      </body>
    </html>
  );
}
