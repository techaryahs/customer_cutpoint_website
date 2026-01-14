'use client';

import { useMemo, useState } from 'react';
import { MapPin, Star } from 'lucide-react';

/* =========================
   BACKEND-SAFE TYPES
========================= */

export type BackendSalonService = {
  serviceId: string;
  name: string;
  category: string;
  price: number | string;
  duration: string;
  description: string;
  image: string;
  isActive?: boolean;
  createdAt?: number;
  updatedAt?: number;
  deletedAt?: number;
};

export type BackendSalonSubscription = {
  plan: 'basic' | 'premium';
  status: 'active' | 'inactive' | 'expired';
  amount: number;
  expiresAt: number;
  purchasedAt?: number;
  paymentId?: string;
  updatedAt?: number;
};

export type BackendSalon = {
  id: string;
  name: string;
  address: string;
  branch: string;
  description: string;
  image: string;
  rating: number;
  phone: string;
  pincode: string;
  gender: 'Unisex' | 'Male' | 'Female';
  services: BackendSalonService[] | Record<string, BackendSalonService>;
  subscription: BackendSalonSubscription;
};

/* =========================
   CONSTANTS
========================= */

const BACKEND_URL = 'http://localhost:3001';

/* =========================
   HELPERS
========================= */

function formatExpires(ts: number): string {
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Normalize services:
 * - Supports ARRAY (current system)
 * - Supports OBJECT (legacy system)
 */
function normalizeServices(
  services: BackendSalon['services']
): BackendSalonService[] {
  if (Array.isArray(services)) return services;
  if (services && typeof services === 'object') {
    return Object.values(services);
  }
  return [];
}

function groupActiveServices(services: BackendSalonService[]) {
  const active = services.filter((s) => s.isActive !== false);

  return active.reduce<Record<string, BackendSalonService[]>>((acc, s) => {
    const key = s.category || 'Services';
    acc[key] ??= [];
    acc[key].push(s);
    return acc;
  }, {});
}

/* =========================
   COMPONENT
========================= */

type Props = {
  salon: BackendSalon;
  isOpenNow: boolean;
};

export default function SalonDetailTabs({ salon, isOpenNow }: Props) {
  const [activeTab, setActiveTab] =
    useState<'services' | 'about' | 'membership'>('services');

  /* =========================
     NORMALIZATION (CRITICAL)
  ========================= */

  const servicesArray = useMemo(
    () => normalizeServices(salon.services),
    [salon.services]
  );

  const grouped = useMemo(
    () => groupActiveServices(servicesArray),
    [servicesArray]
  );

  const categories = useMemo(
    () => Object.keys(grouped).sort(),
    [grouped]
  );

  const scrollTo = (id: 'services' | 'about' | 'membership') => {
    setActiveTab(id);
    document.getElementById(id)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 pb-14">
      {/* HEADER */}
      <div className="mt-6 bg-white border border-borderSoft rounded-2xl shadow-soft p-5 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-cocoa truncate">
              {salon.name}
            </h1>
            <p className="text-sm text-taupe flex items-center gap-2 mt-1">
              <MapPin className="w-4 h-4 text-goldDark" />
              <span className="truncate">{salon.address}</span>
            </p>
          </div>

          <div className="bg-linen border border-borderSoft rounded-xl px-3 py-2 flex items-center gap-2">
            <span className="bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1">
              {salon.rating.toFixed(1)}{' '}
              <Star className="w-3 h-3 fill-current" />
            </span>
            <span className="text-xs font-bold text-cocoa/70">
              {isOpenNow ? 'Open' : 'Closed'}
            </span>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="sticky top-20 z-30 mt-6">
        <div className="bg-white/95 backdrop-blur-md border border-borderSoft rounded-2xl shadow-sm px-2 py-2">
          <div className="grid grid-cols-3 gap-2">
            {(['services', 'about', 'membership'] as const).map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => scrollTo(id)}
                className={`py-2.5 rounded-xl text-sm font-bold transition-colors ${
                  activeTab === id
                    ? 'bg-cocoa text-white'
                    : 'text-cocoa hover:bg-sand/40'
                }`}
              >
                {id.charAt(0).toUpperCase() + id.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* SERVICES */}
      <section id="services" className="scroll-mt-32 mt-6">
        <div className="bg-white border border-borderSoft rounded-2xl shadow-soft p-5 md:p-6">
          <h2 className="text-xl font-serif font-bold text-cocoa">
            Services
          </h2>

          <div className="mt-5 space-y-8">
            {categories.map((category) => (
              <div key={category}>
                <h3 className="text-sm font-bold text-taupe uppercase tracking-wider">
                  {category}
                </h3>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {grouped[category].map((service) => (
                    <div
                      key={service.serviceId}
                      className="bg-linen border border-borderSoft rounded-2xl flex gap-4 p-4"
                    >
                      <div className="w-24 h-24 rounded-xl overflow-hidden bg-sand flex-shrink-0">
                        <img
                          src={
                            service.image?.startsWith('http')
                              ? service.image
                              : `${BACKEND_URL}${service.image}`
                          }
                          alt={service.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-cocoa truncate">
                              {service.name}
                            </p>
                            <p className="text-xs text-taupe mt-1 line-clamp-2">
                              {service.description}
                            </p>
                          </div>

                          <button
                            type="button"
                            className="px-3 py-1.5 rounded-lg bg-white border border-borderSoft text-cocoa font-bold text-xs hover:border-gold transition-colors"
                          >
                            Add
                          </button>
                        </div>

                        <div className="mt-3 flex justify-between items-center">
                          <span className="text-xs font-bold text-cocoa/70">
                            {service.duration} min
                          </span>
                          <span className="text-sm font-serif font-bold text-goldDark">
                            ₹{service.price}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {categories.length === 0 && (
              <p className="text-sm text-taupe">
                No active services available.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="scroll-mt-32 mt-6">
        <div className="bg-white border border-borderSoft rounded-2xl shadow-soft p-5 md:p-6">
          <h2 className="text-xl font-serif font-bold text-cocoa">
            About
          </h2>
          <p className="text-sm text-taupe mt-3">
            {salon.description}
          </p>
        </div>
      </section>

      {/* MEMBERSHIP */}
      <section id="membership" className="scroll-mt-32 mt-6">
        <div className="bg-white border border-borderSoft rounded-2xl shadow-soft p-5 md:p-6">
          <h2 className="text-xl font-serif font-bold text-cocoa">
            Membership
          </h2>

          <div className="mt-5 bg-linen border border-borderSoft rounded-2xl p-5">
            <div className="flex justify-between items-center gap-4">
              <div>
                <p className="text-sm font-bold text-cocoa capitalize">
                  {salon.subscription.plan} Plan
                </p>
                <p className="text-xs text-taupe capitalize">
                  {salon.subscription.status}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-serif font-bold text-goldDark">
                  ₹{salon.subscription.amount}
                </p>
                <p className="text-xs text-taupe">
                  Expires{' '}
                  {formatExpires(salon.subscription.expiresAt)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
