"use client";

import React, { useState } from "react";
import { useTranslations } from 'next-intl';

export default function Newsletter() {
    const t = useTranslations('Home.Newsletter');
    const [email, setEmail] = useState("");
    const [isSubscribed, setIsSubscribed] = useState(false);

    const handleSubscribe = (e: React.FormEvent) => {
        e.preventDefault();
        if (email) {
            setIsSubscribed(true);
            setEmail("");
        }
    };

    return (
        <section className="bg-[#FAF7F4] py-32 text-center">
            <div className="max-w-4xl mx-auto px-6">
                <h2 className="text-4xl md:text-5xl font-serif text-[#4a3728] mb-6">{t('title')}</h2>
                <p className="text-[#7a6a5e] mb-12 font-light italic text-lg">{t('description')}</p>
                {isSubscribed ? (
                    <div className="max-w-md mx-auto p-6 bg-white border border-[#b3936a]/30 rounded-[2rem] shadow-xl animate-in fade-in zoom-in duration-700">
                        <p className="text-[#b3936a] font-serif text-xl italic">{t('success_msg')}</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubscribe} className="max-w-lg mx-auto flex bg-white shadow-[0_20px_50px_rgba(0,0,0,0.06)] rounded-3xl overflow-hidden border border-gray-100 p-2">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder={t('placeholder')}
                            className="flex-1 px-8 py-4 outline-none text-[#4a3728] placeholder:text-[#7a6a5e]/40 bg-transparent"
                        />
                        <button type="submit" className="bg-[#4a3728] text-white px-10 rounded-2xl font-bold hover:bg-[#5c4a44] transition-all active:scale-95 shadow-lg">
                            {t('subscribe_btn')}
                        </button>
                    </form>
                )}
            </div>
        </section>
    );
}
