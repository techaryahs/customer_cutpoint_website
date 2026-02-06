"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from 'next-intl';
import { MapPin, LocateFixed, Star } from "lucide-react";
import Image from "next/image";
import { Link } from "@/app/routing";
import { useJsApiLoader, GoogleMap, Marker } from '@react-google-maps/api';

// Static imports for above-the-fold content
import Hero from "@/components/home/Hero";
import Services from "@/components/home/Services";
import HorizontalBusinessSection from "@/components/home/HorizontalBusinessSection";

// Dynamic imports for below-the-fold content
const HowItWorks = dynamic(() => import("@/components/home/HowItWorks"), {
  loading: () => <div className="h-96 w-full animate-pulse bg-linen/10" />,
  ssr: true
});
const Testimonials = dynamic(() => import("@/components/home/Testimonials"), {
  loading: () => <div className="h-96 w-full animate-pulse bg-linen/10" />,
  ssr: true
});
const Newsletter = dynamic(() => import("@/components/home/Newsletter"), {
  loading: () => <div className="h-64 w-full animate-pulse bg-linen/10" />,
  ssr: true
});

const mapContainerStyle = {
  width: '100%',
  height: '400px',
};

type Place = {
  id: string;
  name: string;
  image?: string;
  rating?: number;
  address?: string;
  branch?: string;
  type?: "salon" | "spa";
  latitude?: number;
  longitude?: number;
  distance?: number;
};

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function HomePage() {
  const t = useTranslations('Home.Sections');
  const [places, setPlaces] = useState<Place[]>([]);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [radius, setRadius] = useState(10);
  const [isLocating, setIsLocating] = useState(false);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_MAP_API || '',
  });

  const getGeolocation = () => {
    setIsLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setIsLocating(false);
        },
        (error) => {
          console.error("Error getting geolocation:", error);
          setIsLocating(false);
        }
      );
    } else {
      setIsLocating(false);
    }
  };

  useEffect(() => {
    const fetchHomeBusinesses = async () => {
      try {
        let url = `${BACKEND_URL}${BACKEND_URL.endsWith('/api') ? '' : '/api'}/customer/businesses`;

        const params = new URLSearchParams();
        if (userCoords) {
          params.append('lat', userCoords.lat.toString());
          params.append('lng', userCoords.lng.toString());
          params.append('radius', radius.toString());
        } else {
          const loc = typeof window !== "undefined"
            ? localStorage.getItem("glowbiz_location") ?? "Mumbai"
            : "Mumbai";
          params.append('loc', loc);
        }

        const res = await fetch(`${url}?${params.toString()}`, { cache: "no-store" });

        const data = await res.json();

        const rawSalons = Array.isArray(data?.salons) ? data.salons : [];
        const rawSpas = Array.isArray(data?.spas) ? data.spas : [];

        const businessMap = new Map();
        [...rawSalons, ...rawSpas].forEach(item => {
          if (item?.id) businessMap.set(item.id, item);
        });

        const allBusinesses = Array.from(businessMap.values());

        const normalized: Place[] = allBusinesses.map((item: any) => ({
          ...item,
          image: item.image
            ? item.image.startsWith("http")
              ? item.image
              : `${BACKEND_URL.replace(/\/api$/, '').replace(/\/$/, '')}/${item.image.replace(/^\//, '')}`
            : "/placeholder.jpg",
        }));

        setPlaces(normalized);
      } catch (err) {
        console.error("HomePage fetch failed", err);
        setPlaces([]);
      }
    };

    fetchHomeBusinesses();
  }, [userCoords, radius]);

  const spas = places.filter((p) => p.type === "spa").slice(0, 5);
  const salons = places.filter((p) => p.type === "salon").slice(0, 5);

  return (
    <main className="overflow-x-hidden selection:bg-[#b3936a]/20 selection:text-[#4a3728]">
      <Hero />
    

      {/* 📍 NEARBY DISCOVERY SECTION */}
      <section className="bg-[#fcfaf8] py-24 border-y border-[#a6865d]/5">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <MapPin size={18} className="text-[#a6865d]" />
                <span className="text-[#a6865d] text-xs uppercase tracking-[0.3em] font-bold">Discovery</span>
              </div>
              <h2 className="font-serif text-4xl text-[#5c4a44]">Nearby <span className="italic">Salons & Spas</span></h2>
            </div>

            <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-[#a6865d]/10 shadow-sm">
              <button
                onClick={getGeolocation}
                disabled={isLocating}
                className="p-2 text-[#a6865d] hover:bg-[#a6865d]/5 rounded-xl transition-colors disabled:opacity-50"
                title="Update current location"
              >
                <LocateFixed size={20} className={isLocating ? "animate-spin" : ""} />
              </button>

              <div className="h-6 w-px bg-[#a6865d]/10" />

              <div className="flex gap-1">
                {[1, 10, 100].map((r) => (
                  <button
                    key={r}
                    onClick={() => setRadius(r)}
                    className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${radius === r
                      ? "bg-[#4a3728] text-white shadow-md shadow-[#4a3728]/20"
                      : "text-[#8a766a] hover:bg-[#a6865d]/5"
                      }`}
                  >
                    {r}km
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 rounded-[2.5rem] overflow-hidden border border-[#a6865d]/10 bg-white shadow-xl shadow-[#a6865d]/5 h-[400px]">
              {isLoaded ? (
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={userCoords || { lat: 19.076, lng: 72.8777 }}
                  zoom={userCoords ? 13 : 11}
                  options={{
                    disableDefaultUI: true,
                    zoomControl: true,
                    styles: [
                      { "featureType": "landscape", "elementType": "geometry.fill", "stylers": [{ "color": "#fdfaf7" }] },
                      { "featureType": "water", "elementType": "geometry.fill", "stylers": [{ "color": "#e8eef1" }] }
                    ]
                  }}
                >
                  {userCoords && (
                    <Marker
                      position={userCoords}
                      icon={{ url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png" }}
                    />
                  )}
                  {places.map((p) => (
                    <Marker
                      key={p.id}
                      position={{ lat: p.latitude || 0, lng: p.longitude || 0 }}
                      title={p.name}
                    />
                  ))}
                </GoogleMap>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-linen/20">
                  <span className="text-[#a6865d] animate-pulse italic">Revealing map...</span>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-4 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
              {places.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-white rounded-3xl border border-dashed border-[#a6865d]/20">
                  <MapPin size={32} className="text-[#a6865d]/20 mb-4" />
                  <p className="text-[#8a766a] text-sm">No sanctuaries found within {radius}km.</p>
                </div>
              ) : (
                places.map((p) => (
                  <Link
                    href={`/salon/${p.id}`}
                    key={p.id}
                    className="group bg-white p-4 rounded-3xl border border-[#a6865d]/5 hover:border-[#a6865d]/20 hover:shadow-lg transition-all flex gap-4"
                  >
                    <div className="relative w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0">
                      <Image src={p.image || "/placeholder.jpg"} alt={p.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div className="flex flex-col justify-center">
                      <h4 className="font-serif text-lg text-[#5c4a44] group-hover:text-[#a6865d] transition-colors line-clamp-1">{p.name}</h4>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Star size={12} fill="#a6865d" className="text-[#a6865d]" />
                          <span className="text-xs font-bold text-[#5c4a44]">{p.rating || "5.0"}</span>
                        </div>
                        {p.distance !== undefined && (
                          <div className="flex items-center gap-1 text-[#a6865d]">
                            <MapPin size={10} />
                            <span className="text-[10px] font-medium">{p.distance.toFixed(1)} km</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </section>
 
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
      <Services />
      <HowItWorks />
      <Testimonials />
      <Newsletter />
    </main>
  );
}

