'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Star } from 'lucide-react';

/* =========================
   TYPES (MATCH BACKEND)
========================= */

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

/* =========================
   CONSTANTS
========================= */

const BACKEND_URL = 'http://localhost:3001';

/* =========================
   HELPERS
========================= */

function getPriceTierFromServices(services?: Service[]): string {
  if (!Array.isArray(services) || services.length === 0) return '₹';

  const prices = services
    .map((s) => Number(s.price))
    .filter((p) => Number.isFinite(p) && p > 0);

  if (!prices.length) return '₹';

  const avg =
    prices.reduce((sum, price) => sum + price, 0) / prices.length;

  if (avg >= 2500) return '₹₹₹₹';
  if (avg >= 1200) return '₹₹₹';
  if (avg >= 600) return '₹₹';
  return '₹';
}

/* =========================
   COMPONENT
========================= */

export default function SalonCard({ kind, item }: SalonCardProps) {
  const router = useRouter();

  const priceTier = useMemo(
    () => getPriceTierFromServices(item.services),
    [item.services]
  );

  const locationLabel = [item.branch, item.address]
    .filter(Boolean)
    .join(', ');

  const navigate = () => {
    if (!item.id) return;
    router.push(kind === 'spa' ? `/spa/${item.id}` : `/salon/${item.id}`);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={navigate}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') navigate();
      }}
      className="group break-inside-avoid bg-white rounded-2xl border border-borderSoft
                 overflow-hidden hover:shadow-card hover:border-gold/30
                 transition-all duration-300 cursor-pointer"
    >
      {/* IMAGE */}
      <div className="relative h-52 bg-sand overflow-hidden">
        {item.image ? (
          <img
            src={
              item.image.startsWith('http')
                ? item.image
                : `${BACKEND_URL}${item.image}`
            }
            alt={item.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-taupe">
            No image available
          </div>
        )}

        {/* TYPE */}
        <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm
                         px-2.5 py-1 rounded-md text-[10px]
                         font-bold uppercase tracking-wider text-cocoa shadow-sm">
          {kind}
        </span>

        {/* RATING */}
        <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm
                         px-2 py-1 rounded-md flex items-center gap-1 shadow-sm">
          <Star className="w-3 h-3 text-green-600 fill-current" />
          <span className="text-xs font-bold text-green-800">
            {typeof item.rating === 'number'
              ? item.rating.toFixed(1)
              : '—'}
          </span>
        </span>
      </div>

      {/* CONTENT */}
      <div className="p-5">
        <div className="flex justify-between items-start gap-3 mb-2">
          <h3 className="text-lg font-serif font-bold text-cocoa
                         group-hover:text-goldDark transition-colors leading-tight">
            {item.name}
          </h3>

          <span className="text-xs font-bold text-cocoa/60 whitespace-nowrap">
            {priceTier}
          </span>
        </div>

        <p className="text-sm text-taupe flex items-center gap-1.5 mb-4">
          <MapPin className="w-3.5 h-3.5 text-goldDark" />
          <span className="truncate">
            {locationLabel || 'Location unavailable'}
          </span>
        </p>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            navigate();
          }}
          className="w-full bg-gradient-to-r from-gold to-goldDark
                     text-white py-2.5 rounded-xl font-bold
                     hover:brightness-110 transition-all shadow-soft"
        >
          Book Now
        </button>
      </div>
    </div>
  );
}
