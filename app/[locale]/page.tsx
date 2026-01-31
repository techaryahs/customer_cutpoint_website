"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Link, useRouter } from "@/app/routing";
import { useTranslations } from 'next-intl';
import {
  ChevronRight,
  Search,
  Calendar,
  Sparkles,
  Star,
} from "lucide-react";
import HorizontalBusinessSection from "@/components/home/HorizontalBusinessSection";

/* =========================
   TYPES (MATCH BACKEND)
========================= */

type Place = {
  id: string;
  name: string;
  image?: string;
  rating?: number;
  address?: string;
  branch?: string;
  type?: "salon" | "spa";
};

const BACKEND_URL = "http://localhost:3001";


/* ===========================
    HERO SECTION
=========================== */
function Hero() {
  const router = useRouter();
  const t = useTranslations('Home.Hero');

  const handleBooking = () => {
  const location =
    typeof window !== 'undefined'
      ? localStorage.getItem('cutpoint_location') || 'Mumbai'
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

/* ===========================
    SERVICES SECTION
=========================== */
function Services() {
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


/* ===========================
    HOW IT WORKS SECTION
=========================== */
function HowItWorks() {
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

/* ===========================
    TESTIMONIALS SECTION
=========================== */
function Testimonials() {
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

/* ===========================
    NEWSLETTER SECTION
=========================== */
function Newsletter() {
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


/* ===========================
    FINAL HOME PAGE
=========================== */
// export default function HomePage() {
//   const [places, setPlaces] = useState<Place[]>([]);

//   useEffect(() => {
//     const fetchHomeBusinesses = async () => {
//       try {
//         const loc =
//           typeof window !== 'undefined'
//             ? localStorage.getItem('cutpoint_location') ?? 'Mumbai'
//             : 'Mumbai';

//         const res = await fetch(
//           `${BACKEND_URL}/api/customer/businesses?loc=${loc}`,
//           { cache: 'no-store' }
//         );

//         const data = await res.json();
//         setPlaces(Array.isArray(data?.salons) ? data.salons : []);
//       } catch (err) {
//         console.error('HomePage fetch failed', err);
//         setPlaces([]);
//       }
//     };

//     fetchHomeBusinesses();
//   }, []);

//   // ✅ filter + limit
//   const spas = places.filter(p => p.type === 'spa').slice(0, 5);
//   const salons = places.filter(p => p.type === 'salon').slice(0, 5);

//   return (
//     <main className="overflow-x-hidden selection:bg-[#b3936a]/20 selection:text-[#4a3728]">
//       <Hero />
//       <Services />

//       {/* 🧖 SPA SECTION */}
//       {spas.length > 0 && (
//         <HorizontalBusinessSection
//           title="Luxury Spas Near You"
//           items={spas}
//           viewAllHref="/search?cat=spa"
//         />
//       )}

//       {/* 💇 SALON SECTION */}
//       {salons.length > 0 && (
//         <HorizontalBusinessSection
//           title="Premium Salons Near You"
//           items={salons}
//           viewAllHref="/search?cat=hair"
//         />
//       )}

//       <HowItWorks />
//       <Testimonials />
//       <Newsletter />
//     </main>
//   );
// }

export default function HomePage() {
  const t = useTranslations('Home.Sections');
  const [places, setPlaces] = useState<Place[]>([]);

useEffect(() => {
  const fetchHomeBusinesses = async () => {
    try {
      const loc =
        typeof window !== "undefined"
          ? localStorage.getItem("cutpoint_location") ?? "Mumbai"
          : "Mumbai";

      const res = await fetch(
        `${BACKEND_URL}/api/customer/businesses?loc=${loc}`,
        { cache: "no-store" }
      );

      const data = await res.json();

      // ✅ MERGE SALONS + SPAS (CRITICAL FIX)
      const allBusinesses = [
        ...(Array.isArray(data?.salons) ? data.salons : []),
        ...(Array.isArray(data?.spas) ? data.spas : []),
      ];

      // ✅ NORMALIZE IMAGES
      const normalized: Place[] = allBusinesses.map((item: any) => ({
        ...item,
        image: item.image
          ? item.image.startsWith("http")
            ? item.image
            : `${BACKEND_URL}${item.image}`
          : "/placeholder.jpg",
      }));

      setPlaces(normalized);
    } catch (err) {
      console.error("HomePage fetch failed", err);
      setPlaces([]);
    }
  };

  fetchHomeBusinesses();
}, []);


  // ✅ FILTER BY TYPE
  const spas = places.filter((p) => p.type === "spa").slice(0, 5);
  const salons = places.filter((p) => p.type === "salon").slice(0, 5);

  return (
    <main className="overflow-x-hidden">
      <Hero />

      {/* 💇 SALON SECTION */}
      {salons.length > 0 && (
        <HorizontalBusinessSection
          title={t('salons_near_you')}
          items={salons}
          viewAllHref="/search?cat=hair"
        />
      )}
            {/* 🧖 SPA SECTION */}
      {spas.length > 0 && (
        <HorizontalBusinessSection
          title={t('spas_near_you')}
          items={spas}
          viewAllHref="/search?cat=spa"
        />
      )}

      <HowItWorks />
      <Testimonials />
      <Newsletter />
    </main>
  );
}