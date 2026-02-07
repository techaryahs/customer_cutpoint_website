'use client';

import SettingsPhaseOne from './SettingsPhaseOne';
import SettingsPhaseTwo from './SettingsPhaseTwo';
import { Settings, User } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function SettingsPage() {

  const [userName, setUserName] = useState('Your Account'); // Fallback text

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const token = localStorage.getItem("salon_token");
        if (!token) return;

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/dashboard`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        const data = await res.json();
        
        if (data?.profile?.name) {
          // Takes only the first name if you want it clean, or just data.profile.name
          const firstName = data.profile.name.split(' ')[0];
          setUserName(firstName);
        }
      } catch (error) {
        console.error("🔴 Error fetching name for label:", error);
      }
    };

    fetchUserName();
  }, []);
  
  return (
    <section className="min-h-screen bg-gradient-to-br from-cream via-white to-cream/50 dark:from-charcoal dark:via-charcoal-light dark:to-charcoal">
      {/* Header Section - Z Pattern Start (Top Left to Right) */}
      <div className="max-w-7xl mx-auto px-6 pt-8 pb-6">
        <div className="flex items-start justify-between mb-8">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gold to-gold/80 flex items-center justify-center shadow-lg">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-charcoal dark:text-cream">Settings</h1>
                <p className="text-sm text-charcoal/60 dark:text-cream/60">Manage your preferences and account</p>
              </div>
            </div>
          </div>

          {/* User Badge - Top Right */}
          <div className="hidden md:flex items-center gap-3 bg-white dark:bg-cocoa px-4 py-3 rounded-2xl shadow-soft border border-gold/10">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold/20 to-gold/10 flex items-center justify-center">
              <User className="w-5 h-5 text-gold" />
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-gold tracking-wide uppercase">
      {userName}
    </p>
              <p className="text-xs text-charcoal/50 dark:text-cream/50">Premium Member</p>
            </div>
          </div>
        </div>

        {/* Divider with Accent */}
        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-charcoal/10 dark:border-cream/10"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-gradient-to-br from-cream via-white to-cream/50 dark:from-charcoal dark:via-charcoal-light dark:to-charcoal px-4">
              <div className="w-2 h-2 rounded-full bg-gold"></div>
            </span>
          </div>
        </div>
      </div>

      {/* Main Content - Z Pattern Flow */}
      <div className="max-w-7xl mx-auto px-6 pb-12">
        {/* Grid Layout for Z/F Pattern */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Primary Settings (Phase One) */}
          <div className="lg:col-span-2 space-y-6">
            <SettingsPhaseOne />
          </div>

          {/* Right Column - Secondary Settings (Phase Two) */}
          <div className="lg:col-span-1 space-y-6">
            <SettingsPhaseTwo />
          </div>
        </div>

        {/* Footer Section - Z Pattern End (Bottom) */}
        <div className="mt-12 pt-8 border-t border-charcoal/10 dark:border-cream/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-charcoal/50 dark:text-cream/50">
            <p>© 2024 Salon App. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-gold transition-colors">Privacy</a>
              <a href="#" className="hover:text-gold transition-colors">Terms</a>
              <a href="#" className="hover:text-gold transition-colors">Support</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}