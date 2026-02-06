"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "@/app/routing";
import { useTranslations } from 'next-intl';
import { ChevronRight, Calendar } from "lucide-react";

export default function Hero() {
    const router = useRouter();
    const t = useTranslations('Home.Hero');

    const handleBooking = () => {
        const location =
            typeof window !== 'undefined'
                ? localStorage.getItem('glowbiz_location') || 'Mumbai'
                : 'Mumbai';

        router.push(`/search?cat=all&loc=${encodeURIComponent(location)}`);
    };

    return (
        <section className="relative min-h-[90vh] flex flex-col items-center pt-40 pb-48 overflow-hidden bg-white">
            {/* Background Image Layer */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1920&q=80"
                    alt="Luxury spa background"
                    fill
                    priority
                    className="object-cover opacity-40"
                />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_10%,_white_85%)]" />
            </div>

            {/* Main Heading Section */}
            <div className="relative z-10 max-w-4xl px-6 text-center">
                <h1 className="font-serif text-5xl md:text-7xl leading-tight text-[#4a3728] italic">
                    {t('headline_italic')}
                    <br />
                    <span className="not-italic font-medium">{t('headline_normal')}</span>
                </h1>
                <p className="mt-4 text-lg md:text-xl text-[#7a6a5e] font-light tracking-wide">
                    {t('description')}
                </p>
            </div>

            {/* Aesthetic Bottom Curve */}
            <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] z-10">
                <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="block w-full h-[120px] md:h-[200px] fill-white">
                    <path d="M0,120 C400,10 800,10 1200,120 L1200,120 L0,120 Z" />
                </svg>
            </div>

            {/* Booking Button Only Container */}
            <div className="absolute bottom-10 md:bottom-20 z-20 w-full max-w-lg px-6">
                <div className="rounded-[3rem] bg-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-gray-100 p-4 flex flex-col items-center">
                    <button
                        onClick={handleBooking}
                        className="w-full bg-[#4a3728] hover:bg-[#3d2e22] text-white py-6 rounded-full text-sm font-bold tracking-[0.15em] uppercase transition-all flex items-center justify-center gap-4 shadow-xl active:scale-95 group"
                    >
                        <Calendar size={20} className="text-[#b3936a] group-hover:scale-110 transition-transform" />
                        {t('book_now_btn')}
                        <ChevronRight size={18} className="opacity-40 group-hover:translate-x-1 transition-transform" />
                    </button>

                    <p className="mt-4 text-[10px] text-[#7a6a5e]/60 font-medium uppercase tracking-widest text-center">
                        {t('booking_subtext')}
                    </p>
                </div>
            </div>
        </section>
    );
}
