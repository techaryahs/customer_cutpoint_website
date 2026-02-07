"use client";

import React from 'react';

export default function ContactPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#3d2b24] p-6">
      <div className="w-full max-w-md space-y-8">
        <h2 className="text-2xl font-bold text-[#e1b144] mb-8">Contact Us</h2>

        <form className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            className="w-full bg-[#4a372d] border border-gray-500 rounded-xl px-4 py-4 text-white outline-none focus:ring-2 focus:ring-[#e1b144]/50 transition-all"
          />
          <input
            type="email"
            placeholder="Email Address"
            className="w-full bg-[#4a372d] border border-gray-500 rounded-xl px-4 py-4 text-white outline-none focus:ring-2 focus:ring-[#e1b144]/50 transition-all"
          />
          <input
            type="tel"
            placeholder="Phone Number"
            className="w-full bg-[#4a372d] border border-gray-500 rounded-xl px-4 py-4 text-white outline-none focus:ring-2 focus:ring-[#e1b144]/50 transition-all"
          />
          <textarea
            rows={4}
            placeholder="Your Message"
            className="w-full bg-[#4a372d] border border-gray-500 rounded-xl px-4 py-4 text-white outline-none focus:ring-2 focus:ring-[#e1b144]/50 transition-all resize-none"
          ></textarea>

          <button
            type="submit"
            className="w-full bg-[#d4af37] hover:bg-[#c4a02d] text-[#3d2b24] font-bold py-4 rounded-2xl transition-all duration-300 shadow-lg mt-4"
          >
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
}