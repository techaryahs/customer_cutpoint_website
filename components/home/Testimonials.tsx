"use client";

import React from "react";
import Image from "next/image";
import { useTranslations } from 'next-intl';
import { Star } from "lucide-react";

export default function Testimonials() {
    const t = useTranslations('Home.Testimonials');
    const reviews = [
        { name: "Ananya Sharma", role: "Verified Member", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80", text: "The ease of finding a high-end spa in Mumbai through Glow Biz was incredible. The service I booked was truly world-class." },
        { name: "Rohan Mehra", role: "Verified Member", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80", text: "Finally a platform that understands luxury. The curated list of salons in Delhi is exceptional. Highly recommend for busy professionals." },
        { name: "Sanya Malhotra", role: "Verified Member", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80", text: "I love the seamless booking experience. No more long wait times or phone calls. Just pure relaxation from the moment I open the app." },
    ];

    return (
        <section className="bg-white py-32 overflow-hidden">
            <div className="max-w-6xl mx-auto px-6">
                <div className="text-center mb-20">
                    <p className="text-[#a6865d] text-xs uppercase tracking-[0.4em] mb-4 font-bold">{t('eyebrow')}</p>
                    <h2 className="font-serif text-4xl md:text-5xl text-[#5c4a44]">{t('title')}</h2>
                </div>
                <div className="grid md:grid-cols-3 gap-16">
                    {reviews.map((review) => (
                        <div key={review.name} className="flex flex-col items-center text-center group">
                            <div className="flex justify-center gap-1.5 mb-8">
                                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="#a6865d" className="text-[#a6865d]" />)}
                            </div>
                            <p className="font-serif text-xl text-[#5c4a44] italic leading-relaxed mb-10 px-4">“{review.text}”</p>
                            <div className="mt-auto flex flex-col items-center">
                                <div className="relative w-20 h-20 rounded-full mb-5 overflow-hidden border-4 border-white shadow-lg group-hover:border-[#a6865d]/40 transition-all duration-500">
                                    <Image src={review.image} alt={review.name} fill sizes="80px" className="object-cover" />
                                </div>
                                <h4 className="font-bold text-[#5c4a44] text-lg">{review.name}</h4>
                                <p className="text-[#a6865d] text-[10px] uppercase tracking-[0.2em] mt-2 font-bold">{review.role}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
