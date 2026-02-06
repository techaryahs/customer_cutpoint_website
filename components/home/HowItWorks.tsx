"use client";

import React from "react";
import { useTranslations } from 'next-intl';
import { Search, Calendar, Sparkles } from "lucide-react";

export default function HowItWorks() {
    const t = useTranslations('Home.HowItWorks');
    const steps = [
        { Icon: Search, title: t('find_sanctuary.title'), desc: t('find_sanctuary.desc') },
        { Icon: Calendar, title: t('effortless_booking.title'), desc: t('effortless_booking.desc') },
        { Icon: Sparkles, title: t('experience_bliss.title'), desc: t('experience_bliss.desc') },
    ];

    return (
        <section className="bg-[#fdfaf7] py-32 border-t border-[#a6865d]/10">
            <div className="max-w-6xl mx-auto px-6">
                <div className="text-center mb-20">
                    <p className="text-[#a6865d] text-xs uppercase tracking-[0.4em] mb-4 font-bold">{t('eyebrow')}</p>
                    <h2 className="font-serif text-4xl md:text-5xl text-[#5c4a44]">{t('title')}</h2>
                </div>
                <div className="grid md:grid-cols-3 gap-16">
                    {steps.map((step, idx) => (
                        <div key={step.title} className="relative flex flex-col items-center text-center group">
                            <span className="absolute -top-10 text-[10rem] font-serif text-[#a6865d]/5 select-none leading-none group-hover:text-[#a6865d]/10 transition-colors">0{idx + 1}</span>
                            <div className="w-24 h-24 rounded-[2rem] bg-white shadow-xl shadow-[#a6865d]/5 flex items-center justify-center mb-8 relative z-10 border border-[#a6865d]/10 group-hover:scale-110 transition-transform">
                                <step.Icon size={36} className="text-[#a6865d]" />
                            </div>
                            <h3 className="font-serif text-2xl text-[#5c4a44] mb-4 relative z-10">{step.title}</h3>
                            <p className="text-[#8a766a] text-base font-light leading-relaxed px-6">{step.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
