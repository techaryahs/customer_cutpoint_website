"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export default function PrivacyPolicy() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#3d2b24] flex items-center justify-center p-6">
      {/* Container matches the "Contact Us" width and dark cocoa background */}
      <div className="max-w-4xl w-full space-y-8">
        
        {/* Header with Back Button and Icon */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => router.back()}
            className="flex items-center text-[#e1b144] hover:text-[#d4af37] transition-all font-medium"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Settings
          </button>
          <ShieldCheck className="w-8 h-8 text-[#e1b144]" />
        </div>

        {/* Title matches "Contact Us" styling */}
        <h1 className="text-3xl font-bold text-[#e1b144]">Privacy Policy</h1>
        
        {/* Content Area with refined typography */}
        <div className="space-y-8 text-white/80 text-base leading-relaxed">
          <section className="bg-[#4a372d] p-6 rounded-2xl border border-white/5 shadow-lg">
            <h2 className="text-[#e1b144] font-bold text-xl mb-3">1. Data Collection</h2>
            <p>We collect information you provide directly to us when you book a salon service, create an account, or contact our support team via the Glow Biz platform.</p>
          </section>

          <section className="bg-[#4a372d] p-6 rounded-2xl border border-white/5 shadow-lg">
            <h2 className="text-[#e1b144] font-bold text-xl mb-3">2. Use of Information</h2>
            <p>Your data is used specifically to manage appointments, process secure payments through your wallet, and personalize your beauty and wellness recommendations.</p>
          </section>

          <section className="bg-[#4a372d] p-6 rounded-2xl border border-white/5 shadow-lg">
            <h2 className="text-[#e1b144] font-bold text-xl mb-3">3. Data Security</h2>
            <p>We implement high-level encryption and security protocols to ensure your personal information remains confidential and protected from unauthorized access.</p>
          </section>

          <section className="bg-[#4a372d] p-6 rounded-2xl border border-white/5 shadow-lg">
            <h2 className="text-[#e1b144] font-bold text-xl mb-3">4. Your Rights</h2>
            <p>You have the right to access, update, or request the deletion of your account and personal data at any time through your Profile settings.</p>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-white/10 text-center text-white/40 text-xs">
          <p>© 2026 Glow Biz Salon App. All rights reserved.</p>
          <p className="mt-1">Last updated: February 06, 2026</p>
        </div>
      </div>
    </div>
  );
}