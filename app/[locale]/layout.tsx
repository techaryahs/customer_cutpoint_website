import type { Metadata } from "next";
import "../globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ChatbotWidget from "@/components/chatbot/ChatbotWidget";
import { MessageCircle } from "lucide-react";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { routing } from '@/app/routing';
import { notFound } from 'next/navigation';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  title: "Salon & Spa Management",
  description: "Premium salon & spa booking and management platform",
};

import { Suspense } from "react";

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html lang={locale} className="light">
      <body className="bg-linen text-cocoa antialiased">
        <NextIntlClientProvider messages={messages}>
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

            <Suspense fallback={<div className="h-16" />}>
              <Header />
            </Suspense>
            <main className="flex-1">{children}</main>
            <Footer />

          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

