/* eslint-disable @next/next/no-img-element */
'use client';

import { ArrowLeft, MapPin, Star, Heart } from 'lucide-react';
import { useRouter } from '@/app/routing';
import { Venue } from '@/types/venue';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslations } from 'next-intl';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface VenueHeaderProps {
  venue: Venue;
}

export default function VenueHeader({ venue }: VenueHeaderProps) {
  const router = useRouter();
  const t = useTranslations('VenueHeader');
  const [isFavorite, setIsFavorite] = useState(false);
  const [loadingFav, setLoadingFav] = useState(false);

  useEffect(() => {
    const checkFav = async () => {
      const token = localStorage.getItem('salon_token');
      const userData = localStorage.getItem('salon_user');
      if (!token || !userData) return;
      try {
        const user = JSON.parse(userData);
        const baseUrl = `${BACKEND_URL}${BACKEND_URL.endsWith('/api') ? '' : '/api'}`;
        const res = await axios.get(`${baseUrl}/customer/favorites/${user.uid}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsFavorite(res.data.some((f: any) => f.id === venue.id));
      } catch (err) {
        console.error("Check favorite error", err);
      }
    };
    checkFav();
  }, [venue.id]);

  const toggleFavorite = async () => {
    const token = localStorage.getItem('salon_token');
    const userData = localStorage.getItem('salon_user');

    if (!token || !userData) {
      alert(t('login_required_fav'));
      return;
    }

    setLoadingFav(true);
    try {
      const user = JSON.parse(userData);
      const baseUrl = `${BACKEND_URL}${BACKEND_URL.endsWith('/api') ? '' : '/api'}`;
      const res = await axios.post(`${baseUrl}/customer/favorites/toggle`,
        { type: venue.type, placeId: venue.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsFavorite(res.data.isFavorite);
    } catch (err) {
      console.error("Toggle favorite error", err);
    } finally {
      setLoadingFav(false);
    }
  };

  return (
    <section className="bg-white border border-borderSoft rounded-[2rem] shadow-soft overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-cocoa/50 hover:text-cocoa transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> {t('back')}
          </button>

          <button
            onClick={toggleFavorite}
            disabled={loadingFav}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all duration-300 group/heart shadow-sm ${isFavorite
              ? 'bg-red-50 border-red-100 text-red-600'
              : 'bg-white border-borderSoft text-cocoa/40 hover:border-red-200 hover:text-red-500'
              }`}
          >
            <Heart className={`w-3.5 h-3.5 transition-transform group-hover/heart:scale-110 ${isFavorite ? 'fill-current' : ''}`} />
            <span className="text-[9px] font-black uppercase tracking-widest">{t(isFavorite ? 'saved' : 'save')}</span>
          </button>
        </div>

        <div className="mt-4 flex flex-col md:flex-row md:items-end justify-between gap-5">
          <div className="space-y-1">
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-cocoa tracking-tight">
              {venue.name}
            </h1>
            <p className="flex items-center gap-2 text-xs text-taupe font-medium opacity-70">
              <MapPin className="w-3.5 h-3.5 text-goldDark" /> {venue.address}
            </p>
          </div>

          <div className="flex items-center gap-3 bg-linen/50 px-3 py-1.5 rounded-xl border border-borderSoft/50 w-fit">
            <div className="flex items-center gap-1 bg-green-600 text-white px-2 py-0.5 rounded-lg text-xs font-black">
              {venue.rating ? venue.rating.toFixed(1) : '5.0'}
              <Star className="w-3 h-3 fill-current" />
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest text-cocoa/40">
              {t('top_rated')}
            </span>
          </div>
        </div>
      </div>

      {venue.image && (
        <div className="relative h-[18rem] w-full px-6 pb-6">
          <img
            src={venue.image}
            alt={venue.name}
            className="w-full h-full object-cover rounded-[1.5rem] shadow-xl"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-cocoa/20 to-transparent rounded-[1.5rem] mx-6 mb-6" />
        </div>
      )}
    </section>
  );
}
