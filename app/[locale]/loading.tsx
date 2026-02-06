"use client";

import { Scissors } from "lucide-react";

export default function Loading() {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#FDFBF7]">
            {/* Background decorative elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gold/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gold/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#4a3728]/5 rounded-full blur-3xl" />
            </div>

            <div className="relative flex flex-col items-center gap-10 z-10">
                {/* Animated logo/icon container */}
                <div className="relative">
                    <div className="absolute inset-0 w-32 h-32 rounded-full border-2 border-gold/20 animate-spin-slow" />
                    <div className="absolute inset-2 w-28 h-28 rounded-full border border-gold/40 animate-pulse" />

                    <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-white via-[#FDFBF7] to-white flex items-center justify-center shadow-xl border border-gold/10 backdrop-blur-sm">
                        <div className="animate-[spin_3s_ease-in-out_infinite]">
                            <Scissors className="w-12 h-12 text-[#4a3728]" strokeWidth={1} />
                        </div>
                    </div>

                    <div className="absolute inset-0 animate-spin-slow">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-2 h-2 bg-gold rounded-full" />
                    </div>
                </div>

                {/* Brand name */}
                <div className="text-center space-y-3">
                    <h2 className="font-serif text-4xl text-[#4a3728] tracking-widest italic">
                        GlowBiz
                    </h2>
                    <div className="flex items-center gap-4 justify-center">
                        <span className="w-12 h-px bg-gradient-to-r from-transparent to-gold/30" />
                        <span className="text-gold text-[10px] tracking-[0.4em] uppercase font-bold">Luxury Sanctuary</span>
                        <span className="w-12 h-px bg-gradient-to-l from-transparent to-gold/30" />
                    </div>
                </div>

                {/* Loading indicator */}
                <div className="flex flex-col items-center gap-6">
                    <div className="relative w-56 h-px bg-gold/20 rounded-full overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold to-transparent bg-[length:200%_100%] animate-shimmer" />
                    </div>
                    <p className="text-[#8a766a] text-xs tracking-[0.2em] uppercase font-bold animate-pulse">
                        Revealing Beauty...
                    </p>
                </div>
            </div>
        </div>
    );
}
