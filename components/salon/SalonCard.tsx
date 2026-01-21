'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Star, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

type Service = {
  serviceId?: string;
  name?: string;
  price?: number;
  duration?: string;
  gender?: string;
};

type BaseListing = {
  id: string;
  name: string;
  address?: string;
  branch?: string;
  image?: string;
  rating?: number;
  services?: Service[];
};

type SalonCardProps = {
  kind: 'salon' | 'spa';
  item: BaseListing;
};

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function getPriceTierFromServices(services?: Service[]): string {
  if (!Array.isArray(services) || services.length === 0) return '₹';
  const prices = services.map((s) => Number(s.price)).filter((p) => Number.isFinite(p) && p > 0);
  if (!prices.length) return '₹';
  const avg = prices.reduce((sum, price) => sum + price, 0) / prices.length;
  if (avg >= 2500) return '₹₹₹₹';
  if (avg >= 1200) return '₹₹₹';
  if (avg >= 600) return '₹₹';
  return '₹';
}

export default function SalonCard({ kind, item }: SalonCardProps) {
  const router = useRouter();

  const priceTier = useMemo(() => getPriceTierFromServices(item.services), [item.services]);
  const locationLabel = [item.branch, item.address].filter(Boolean).join(', ');

  const navigate = () => {
    if (!item.id) return;
    router.push(kind === 'spa' ? `/spa/${item.id}` : `/salon/${item.id}`);
  };

  return (
    <motion.div
      whileHover={{ y: -6 }}
      onClick={navigate}
      className="group bg-white rounded-[1.5rem] border border-borderSoft overflow-hidden hover:shadow-xl hover:border-gold/30 transition-all duration-500 cursor-pointer"
    >
      {/* IMAGE CONTAINER */}
      <div className="relative h-48 overflow-hidden">
        {item.image ? (
          <img
            src={item.image.startsWith('http') ? item.image : `${BACKEND_URL}${item.image}`}
            alt={item.name}
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-linen flex items-center justify-center text-[9px] font-black uppercase tracking-widest text-taupe/40">
            No Image
          </div>
        )}

        {/* GLASS OVERLAYS */}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="bg-white/80 backdrop-blur-md px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest text-cocoa shadow-lg border border-white/20">
            {kind}
          </span>
        </div>

        <div className="absolute top-3 right-3 h-fit">
          <div className="bg-white/80 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1 shadow-lg border border-white/20">
            <Star className="w-2.5 h-2.5 text-green-600 fill-green-600" />
            <span className="text-[10px] font-black text-green-900">
              {typeof item.rating === 'number' ? item.rating.toFixed(1) : '5.0'}
            </span>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-5">
        <div className="flex justify-between items-start gap-4 mb-2">
          <h3 className="text-lg font-serif font-bold text-cocoa group-hover:text-goldDark transition-colors leading-tight">
            {item.name}
          </h3>
          <span className="text-[9px] font-black text-taupe/40 tracking-widest mt-0.5">
            {priceTier}
          </span>
        </div>

        <p className="text-xs text-taupe font-medium flex items-start gap-1.5 mb-4 opacity-70">
          <MapPin className="w-3.5 h-3.5 text-goldDark shrink-0 mt-0.5" />
          <span className="line-clamp-1 leading-snug">
            {locationLabel || 'Location unavailable'}
          </span>
        </p>

        <div className="pt-4 border-t border-linen flex items-center justify-between">
          <div className="flex flex-col">
             <span className="text-[8px] font-black text-taupe/30 uppercase tracking-widest">Starting from</span>
             <span className="text-base font-serif font-bold text-cocoa">₹299</span>
          </div>
          <button
            type="button"
            className="flex items-center gap-1.5 bg-cocoa text-white px-4 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-goldDark transition-all shadow-xl active:scale-95"
          >
            Explore <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
