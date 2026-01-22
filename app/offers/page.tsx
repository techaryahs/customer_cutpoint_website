'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Tag, Clock, Search, MapPin, Map as MapIcon, Calendar, ArrowRight, Loader2, Filter, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function OffersDiscoveryPage() {
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [validDays, setValidDays] = useState<number | 'all'>('all');
  
  const loc = typeof window !== 'undefined' ? localStorage.getItem('cutpoint_location') || 'Mumbai' : 'Mumbai';

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/offers`, { cache: 'no-store' });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setOffers(data || []);
    } catch (err) {
      console.error(err);
      setOffers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const filteredOffers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const now = new Date();
    
    return offers.filter(offer => {
      // 1. Search Filter (Title, Description, Salon Name)
      const matchesSearch = !q || 
        offer.title.toLowerCase().includes(q) || 
        offer.description.toLowerCase().includes(q) ||
        offer.salonName.toLowerCase().includes(q);
      
      if (!matchesSearch) return false;

      // 2. Location Filter (Partial match with salon address/branch)
      if (loc && loc !== 'all') {
        const fullAddr = `${offer.branch} ${offer.salonAddress}`.toLowerCase();
        if (!fullAddr.includes(loc.toLowerCase())) return false;
      }

      // 3. Date Validity Filter
      if (validDays !== 'all') {
        const until = new Date(offer.validUntil);
        const diffTime = until.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays < 0 || diffDays > validDays) return false;
      } else {
        // Just ensure it's not expired
        const until = new Date(offer.validUntil);
        if (until < now) return false;
      }

      return true;
    });
  }, [offers, searchQuery, loc, validDays]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-4">
        <Loader2 className="w-12 h-12 text-goldDark animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-taupe/40">Curating the best deals for you...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* HERO SECTION */}
        <section className="mb-12 relative">
          <div className="bg-cocoa p-10 md:p-16 rounded-[3rem] overflow-hidden relative shadow-2xl">
            {/* Abstract Background Elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-gold/10 rounded-full blur-[100px] -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-sand/5 rounded-full blur-[80px] -ml-20 -mb-20" />
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div className="max-w-xl space-y-4">
                <div className="inline-flex items-center gap-2 bg-gold/20 px-4 py-1.5 rounded-full border border-gold/30">
                  <Tag className="w-3.5 h-3.5 text-gold" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-goldDark">Exclusive Rewards</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-serif font-bold text-sand tracking-tight leading-tight">
                  Limited Time <span className="text-goldDark">Flash Deals</span>
                </h1>
                <p className="text-sand/70 text-base md:text-lg font-medium leading-relaxed">
                  Discover premium grooming experiences at unbeatable prices. Handpicked offers from top salons in your area.
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex items-center gap-4">
                <div className="w-12 h-12 bg-goldDark/20 rounded-xl flex items-center justify-center">
                   <MapPin className="text-goldDark w-6 h-6" />
                </div>
                <div>
                   <p className="text-[10px] font-black text-sand/40 uppercase tracking-widest">Active Region</p>
                   <p className="text-lg font-serif font-bold text-sand">{loc}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FILTERS & SEARCH */}
        <section className="mb-12 flex flex-col lg:flex-row gap-6 items-center justify-between sticky top-28 z-40 bg-[#FAF9F6]/80 backdrop-blur-xl p-4 rounded-[2rem] border border-borderSoft shadow-soft">
          <div className="relative w-full lg:max-w-md">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-taupe/40" size={20} />
            <input 
              type="text" 
              placeholder="Search by salon or service..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border-none rounded-2xl py-5 pl-16 pr-6 text-sm font-medium shadow-inner outline-none focus:ring-2 ring-gold/20"
            />
          </div>

          <div className="flex items-center gap-3 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-borderSoft shadow-sm shrink-0">
               <Calendar className="w-4 h-4 text-goldDark" />
               <span className="text-[10px] font-black uppercase tracking-widest text-taupe/60">Validity</span>
            </div>
            {[
              { label: 'All', value: 'all' },
              { label: 'Next 2 Days', value: 2 },
              { label: 'This Week', value: 7 },
              { label: 'This Month', value: 30 },
            ].map((btn) => (
              <button 
                key={btn.label}
                onClick={() => setValidDays(btn.value as any)}
                className={`px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 ${
                  validDays === btn.value as any 
                    ? 'bg-cocoa text-sand shadow-lg' 
                    : 'bg-white text-taupe border border-borderSoft hover:border-gold/30'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </section>

        {/* OFFERS LIST */}
        <AnimatePresence mode="wait">
          {filteredOffers.length > 0 ? (
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filteredOffers.map((offer) => (
                <OfferCard key={offer.offerId} offer={offer} />
              ))}
            </motion.div>
          ) : (
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               className="flex flex-col items-center justify-center p-20 bg-white rounded-[4rem] border border-borderSoft shadow-soft text-center"
            >
               <div className="w-24 h-24 bg-linen rounded-[2.5rem] flex items-center justify-center mb-8 rotate-12">
                  <Ticket className="w-12 h-12 text-taupe/20" />
               </div>
               <h3 className="text-3xl font-serif font-bold text-cocoa mb-4">No matching offers found</h3>
               <p className="text-taupe font-medium max-w-sm mb-10 opacity-60">
                 We couldn't find any offers matching your criteria in {loc}. Check back soon or try adjusting your filters.
               </p>
               <button 
                onClick={() => { setSearchQuery(''); setValidDays('all'); }}
                className="bg-cocoa text-sand px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-goldDark transition-all"
               >
                 Reset Filters
               </button>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}

function OfferCard({ offer }: { offer: any }) {
  const isAllServices = offer.serviceId === 'all';
  const expiresDate = new Date(offer.validUntil);
  const now = new Date();
  const diffTime = expiresDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return (
    <motion.div 
      whileHover={{ y: -8 }}
      className="bg-white rounded-[3rem] overflow-hidden border border-borderSoft shadow-soft hover:shadow-2xl hover:border-gold/30 transition-all duration-500 flex flex-col h-full"
    >
      {/* CARD TOP (IMAGE & BADGE) */}
      <div className="relative h-48">
        <img 
          src={offer.image || offer.salonImage || "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1200"} 
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
          alt={offer.title} 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-cocoa/40 to-transparent" />
        
        {/* Discount Badge */}
        <div className="absolute top-4 left-4">
          <div className="bg-red-600 text-white px-4 py-2 rounded-xl shadow-lg border border-red-500/20">
             <p className="text-xs font-black uppercase tracking-widest leading-none mb-1">Save</p>
             <p className="text-2xl font-serif font-black">{offer.discount}%</p>
          </div>
        </div>

        {/* Validity Ribbon */}
        <div className="absolute bottom-4 left-4 right-4">
           <div className="bg-white/90 backdrop-blur-md px-4 py-2.5 rounded-2xl flex items-center justify-between shadow-soft border border-white/20">
              <div className="flex items-center gap-2">
                 <Clock className={`w-3.5 h-3.5 ${diffDays <= 2 ? 'text-red-500' : 'text-goldDark'}`} />
                 <span className="text-[10px] font-black uppercase tracking-widest text-cocoa">
                   {diffDays <= 0 ? 'Expiring Today' : `${diffDays} Days Left`}
                 </span>
              </div>
              <div className="h-4 w-[1px] bg-cocoa/10" />
              <span className="text-[10px] font-black text-taupe/40 uppercase tracking-widest">Until {offer.validUntil}</span>
           </div>
        </div>
      </div>

      {/* CARD BODY */}
      <div className="p-8 flex-grow flex flex-col justify-between">
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 text-[9px] font-black text-goldDark uppercase tracking-widest mb-1.5">
               <Zap className="w-3 h-3 fill-current" /> {isAllServices ? 'Storewide Deal' : 'Service Special'}
            </div>
            <h3 className="text-2xl font-serif font-bold text-cocoa leading-tight">{offer.title}</h3>
          </div>
          
          <p className="text-sm text-taupe font-medium opacity-70 leading-relaxed line-clamp-2">
            {offer.description} 
          </p>

          <div className="flex flex-wrap gap-2">
            <span className="bg-linen px-3 py-1.5 rounded-xl text-[9px] font-bold text-cocoa border border-cocoa/5">
              Available at {offer.salonName}
            </span>
          </div>
        </div>

        <div className="pt-8 mt-4 border-t border-linen flex items-center justify-between gap-4">
           <div>
             <p className="text-[8px] font-black text-taupe/40 uppercase tracking-[0.2em] mb-0.5">Location</p>
             <p className="text-[10px] font-bold text-cocoa flex items-center gap-1">
               <MapPin className="w-3 h-3 text-gold" /> {offer.branch}
             </p>
           </div>

           <Link href={offer.type === 'salon' ? `/salon/${offer.placeId}` : `/spa/${offer.placeId}`}>
             <button className="bg-cocoa text-sand px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-goldDark transition-all shadow-xl shadow-cocoa/10">
               Claim <ArrowRight size={14} />
             </button>
           </Link>
        </div>
      </div>
    </motion.div>
  );
}

function Ticket({ className, size }: { className?: string, size?: number }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size || 24} 
      height={size || 24} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/>
      <path d="M13 5v2"/>
      <path d="M13 17v2"/>
      <path d="M13 11v2"/>
    </svg>
  );
}