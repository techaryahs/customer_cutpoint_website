"use client";

import React from "react";
import { Scissors, Home, ArrowLeft } from "lucide-react";
import { Link } from "@/app/routing";

export default function NotFound() {
    return (
        <div className="min-h-[90vh] w-full flex items-center justify-center bg-[#FDFBF7] p-6 relative overflow-hidden">
            {/* Premium Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[120px] mix-blend-multiply" />
                <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-[#4a3728]/5 rounded-full blur-[120px] mix-blend-multiply" />
            </div>

            <div className="relative z-10 w-full max-w-2xl flex flex-col items-center text-center">
                {/* 1. Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/50 backdrop-blur-md border border-gold/10 rounded-full mb-12 shadow-sm">
                    <span className="w-1.5 h-1.5 bg-gold rounded-full animate-ping" />
                    <span className="text-[10px] font-black text-[#4a3728]/60 tracking-[0.4em] uppercase">Page Not Found</span>
                </div>

                {/* 2. Error Code (404) */}
                <div className="relative mb-12">
                    <h1 className="text-[clamp(120px,25vw,200px)] font-serif font-black leading-none tracking-tighter select-none flex items-center justify-center text-[#4a3728]">
                        <span className="opacity-10 transform -translate-x-4">4</span>
                        <div className="relative inline-flex items-center justify-center mx-[-0.05em] w-[0.8em] h-[0.8em]">
                            <div className="absolute inset-0 border-[6px] border-gold/20 rounded-full animate-pulse" />
                            <div className="p-4 bg-white rounded-full shadow-2xl shadow-gold/10 border border-gold/5">
                                <Scissors className="w-16 h-16 text-gold animate-spin-slow" strokeWidth={1} />
                            </div>
                        </div>
                        <span className="opacity-10 transform translate-x-4">4</span>
                    </h1>
                </div>

                {/* 3. Text Message Area */}
                <div className="space-y-6 mb-16">
                    <h2 className="text-4xl md:text-5xl font-serif text-[#4a3728]">
                        Lost in <span className="italic font-normal">Sanctuary?</span>
                    </h2>
                    <p className="text-[#8a766a] text-lg max-w-md mx-auto font-light leading-relaxed italic">
                        "True beauty is never lost, it just takes a different path. Let's find your way back to tranquility."
                    </p>
                </div>

                {/* 4. Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
                    <Link
                        href="/"
                        className="group relative bg-[#4a3728] text-white font-bold px-10 py-5 rounded-2xl shadow-2xl shadow-[#4a3728]/20 transition-all duration-500 hover:bg-[#3d2e22] hover:-translate-y-1 flex items-center justify-center gap-3 w-full sm:w-auto"
                    >
                        <Home className="w-5 h-5 transition-transform group-hover:scale-110" />
                        <span className="text-xs uppercase tracking-[0.3em] font-black">Return Home</span>
                    </Link>

                    <button
                        onClick={() => window.history.back()}
                        className="group border border-borderSoft bg-white/50 backdrop-blur-md text-[#4a3728] font-bold px-10 py-5 rounded-2xl transition-all duration-500 hover:bg-white hover:border-gold/30 flex items-center justify-center gap-3 w-full sm:w-auto"
                    >
                        <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                        <span className="text-xs uppercase tracking-[0.3em] font-black">Go Back</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
