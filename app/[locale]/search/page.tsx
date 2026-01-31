'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Filter, Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SalonCard from '@/components/salon/SalonCard';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/app/routing';

type Service = {
  serviceId?: string;
  name?: string;
  price?: number;
  duration?: string;
};

type Place = {
  id: string;
  name: string;
  address?: string;
  branch?: string;
  image?: string;
  rating?: number;
  services?: Service[];
  type?: 'salon' | 'spa';
};

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const t = useTranslations('Search');
  const router = useRouter();

  const category = (searchParams.get('cat') ?? 'all').toLowerCase();
  const query = searchParams.get('q') ?? '';
  const loc = searchParams.get('loc') ?? (typeof window !== 'undefined' ? localStorage.getItem('cutpoint_location') : null) ?? 'Mumbai';

  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlaces = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ loc, q: query });
        const res = await fetch(`${BACKEND_URL}/customer/businesses?${params}`, { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to fetch businesses');
        const data = await res.json();

        const salons: Place[] = Array.isArray(data?.salons) ? data.salons.map((s: any) => ({ ...s, type: 'salon' })) : [];
        const spas: Place[] = Array.isArray(data?.spas) ? data.spas.map((s: any) => ({ ...s, type: 'spa' })) : [];

        setPlaces([...salons, ...spas]);
      } catch (err) {
        setPlaces([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPlaces();
  }, [loc, query]);

  const filteredPlaces = useMemo(() => {
    const nQuery = query.trim().toLowerCase();
    const nLoc = loc.trim().toLowerCase();

    return places.filter((place) => {
      if (category !== 'all' && place.type !== category) return false;

      if (nLoc && nLoc !== 'all') {
        const placeFullAddress = `${place.branch ?? ''} ${place.address ?? ''}`.toLowerCase();
        const matchesLoc = placeFullAddress.includes(nLoc);
        if (!matchesLoc) return false;
      }

      if (nQuery) {
        const nameMatch = place.name?.toLowerCase().includes(nQuery);
        const serviceMatch = (place.services || []).some((s) => s.name?.toLowerCase().includes(nQuery));
        if (!nameMatch && !serviceMatch) return false;
      }

      return true;
    });
  }, [places, category, loc, query]);

  return (
    <div className="min-h-screen bg-[#FAF9F6] pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* SEARCH HEADER */}
        <header className="mb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <p className="text-[9px] font-black text-taupe/40 uppercase tracking-[0.3em] mb-2">{t('discovery')}</p>
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-cocoa leading-tight">
                {query ? t('results_for', { query }) : t('browse_experiences')}
              </h1>
              <p className="text-xs text-taupe font-medium mt-1.5 flex items-center gap-2">
                {t('showing_results', { count: filteredPlaces.length, location: loc })}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 bg-white border border-borderSoft px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest text-cocoa hover:border-gold transition-all shadow-soft">
                <Filter className="w-3.5 h-3.5" /> {t('refine')}
              </button>
            </div>
          </div>
        </header>

        {/* RESULTS GRID */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-[300px] rounded-[1.5rem] bg-white border border-borderSoft animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            <AnimatePresence mode="popLayout">
              <motion.div 
                layout
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {filteredPlaces.map((place) => (
                  <motion.div
                    key={place.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                  >
                    <SalonCard kind={place.type!} item={place} />
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>

            {filteredPlaces.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-24 bg-white rounded-[2rem] border border-dashed border-borderSoft"
              >
                <div className="w-16 h-16 bg-linen rounded-full flex items-center justify-center mx-auto mb-5">
                  <Search className="w-6 h-6 text-taupe/40" />
                </div>
                <h3 className="text-xl font-serif font-bold text-cocoa mb-2">{t('no_destinations_found')}</h3>
                <p className="text-xs text-taupe max-w-xs mx-auto mb-6 opacity-60 font-medium">
                  {t('no_results_desc', { location: loc })}
                </p>
                <button
                  onClick={() => router.push('/search')}
                  className="px-6 py-3 bg-cocoa text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-goldDark transition-all active:scale-95"
                >
                  {t('reset_filters')}
                </button>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
