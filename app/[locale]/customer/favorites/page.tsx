'use client';

import { useEffect, useState } from 'react';
import { Link } from '@/app/routing';
import axios from 'axios';
import { Heart, Search, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SalonCard from '@/components/salon/SalonCard';
import { useTranslations } from 'next-intl';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function CustomerFavoritesPage() {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const t = useTranslations('Favorites');

  const fetchFavorites = async () => {
    const token = localStorage.getItem('salon_token');
    const userData = localStorage.getItem('salon_user');
    if (!token || !userData) {
      setLoading(false);
      return;
    }

    try {
      const user = JSON.parse(userData);
      const res = await axios.get(`${BACKEND_URL}/customer/favorites/${user.uid}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFavorites(res.data);
    } catch (err) {
      console.error("Fetch favorites error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-goldDark border-t-transparent rounded-full animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-taupe/40">{t('loading')}</p>
      </div>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.3em] text-gold">
            <Heart className="w-3 h-3 fill-current" /> {t('saved_exp')}
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-cocoa tracking-tight">
            {t('title')}
          </h1>
          <p className="text-sm text-taupe font-medium opacity-60">
            {t('desc')}
          </p>
        </div>

        <Link href="/search">
          <button className="flex items-center gap-3 bg-cocoa text-white px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-goldDark transition-all shadow-xl active:scale-95">
            {t('discover_more')} <Search className="w-4 h-4" />
          </button>
        </Link>
      </div>

      {/* FAVORITES GRID */}
      <AnimatePresence mode="wait">
        {favorites.length > 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {favorites.map((item) => (
              <SalonCard key={item.id} kind={item.type} item={item} />
            ))}
          </motion.div>
        ) : (
          /* EMPTY STATE */
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-12 md:p-20 rounded-[3rem] border border-borderSoft text-center shadow-soft relative overflow-hidden"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-linen rounded-full blur-3xl opacity-50 -mt-32" />
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-20 h-20 bg-linen rounded-3xl flex items-center justify-center mb-8 rotate-12">
                <Heart className="w-10 h-10 text-taupe/20" />
              </div>
              <h3 className="text-2xl font-serif font-bold text-cocoa mb-3">{t('empty_title')}</h3>
              <p className="text-sm text-taupe font-medium mb-10 opacity-70 max-w-xs mx-auto">
                {t('empty_desc')}
              </p>
              <Link href="/search">
                <button className="flex items-center gap-3 border-2 border-cocoa text-cocoa px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-cocoa hover:text-white transition-all">
                  {t('start_exploring')} <ChevronRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
