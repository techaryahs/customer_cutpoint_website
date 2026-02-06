"use client";

import React from "react";
import Image from "next/image";
import { Link } from "@/app/routing";
import { useTranslations } from 'next-intl';
import { ChevronRight } from "lucide-react";

export default function Services() {
    const t = useTranslations('Home.Services');
    const services = [
        {
            id: "massage-therapy",
            title: t('massage_therapy.title'),
            desc: t('massage_therapy.desc'),
            img: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=800",
        },
        {
            id: "hair-styling",
            title: t('hair_styling.title'),
            desc: t('hair_styling.desc'),
            img: "https://images.unsplash.com/photo-1560869713-7d0a29430803?q=80&w=800",
        },
        {
            id: "beauty-facials",
            title: t('beauty_facials.title'),
            desc: t('beauty_facials.desc'),
            img: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=800",
        },
        {
            id: "couple-spa",
            title: t('couple_spa.title'),
            desc: t('couple_spa.desc'),
            img: "/couple.jpg",
        },
    ];

    return (
        <section className="bg-white pb-32">
            <div className="max-w-6xl mx-auto px-6">
                <div className="relative -mt-6 z-10 mb-20 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="flex items-center gap-3">
                            <span className="h-px w-10 bg-[#a6865d]/40" />
                            <span className="text-[#a6865d] text-xl">❧</span>
                            <span className="h-px w-10 bg-[#a6865d]/40" />
                        </div>
                    </div>
                    <h2 className="font-serif text-4xl md:text-5xl text-[#5c4a44]">
                        {t('title')} <span className="italic">{t('title_italic')}</span> {t('subtitle')}
                    </h2>
                </div>

                <div className="grid md:grid-cols-2 gap-12">
                    {services.map((service) => (
                        <Link
                            key={service.id}
                            href={`/salon/${service.id}`}
                            className="group block"
                        >
                            <div className="relative rounded-[2.5rem] overflow-hidden bg-white border border-[#a6865d]/10 shadow-[0_10px_40px_rgba(0,0,0,0.04)] hover:shadow-[0_30px_70px_rgba(166,134,93,0.2)] transition-all duration-700 hover:-translate-y-2">

                                <div className="relative aspect-[16/10] overflow-hidden">
                                    <Image
                                        src={service.img}
                                        alt={service.title}
                                        fill
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                        className="object-cover transition-transform duration-1000 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 group-hover:opacity-30 transition-opacity duration-700" />
                                </div>

                                <div className="relative p-10 flex justify-between items-center">
                                    <div>
                                        <h3 className="font-serif text-2xl text-[#5c4a44] mb-3">
                                            {service.title}
                                        </h3>
                                        <p className="text-[#8a766a] text-sm font-light leading-relaxed max-w-[280px]">
                                            {service.desc}
                                        </p>
                                    </div>

                                    <div className="h-14 w-14 rounded-full flex items-center justify-center border border-[#a6865d]/20 text-[#a6865d] group-hover:text-white group-hover:bg-[#a6865d] transition-all duration-500">
                                        <ChevronRight size={24} strokeWidth={1.5} />
                                    </div>
                                </div>

                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
