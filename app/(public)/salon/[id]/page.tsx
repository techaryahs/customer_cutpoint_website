/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Star } from 'lucide-react';
import BookingFlowInline, {
  type BookingService,
} from '@/app/features/booking/shared/BookingFlowInline';

/* =========================
   BACKEND TYPES
========================= */

type SalonService = {
  serviceId: string;
  name: string;
  category?: string;
  price: string;
  duration: string;
  description?: string;
  image?: string;
  isActive?: boolean;
};

type SalonSubscription = {
  plan?: string;
  status?: string;
  amount?: number;
  expiresAt?: number;
};

type Salon = {
  id: string;
  name: string;
  address?: string;
  branch?: string;
  description?: string;
  image?: string;
  rating?: number;
  services?: SalonService[] | Record<string, SalonService>;
  subscription?: SalonSubscription;
};

/* =========================
   CONSTANTS
========================= */

const LOCATION_STORAGE_KEY = 'cutpoint_location';
const BACKEND_URL = 'http://localhost:3001';

/* =========================
   HELPERS
========================= */

function normalizeServices(
  services?: Salon['services']
): SalonService[] {
  if (Array.isArray(services)) return services;
  if (services && typeof services === 'object')
    return Object.values(services);
  return [];
}

function isSalonAvailableInLocation(
  selectedLocation: string,
  salonLocationText: string
): boolean {
  if (!selectedLocation || !salonLocationText) return true;
  return salonLocationText
    .toLowerCase()
    .includes(selectedLocation.toLowerCase());
}

/* =========================
   PAGE
========================= */

export default function SalonDetailPage() {
  const router = useRouter();
  const { id: salonId } = useParams<{ id: string }>();

  const [salon, setSalon] = useState<Salon | null>(null);
  const [loading, setLoading] = useState(true);

  const [selectedLocation, setSelectedLocation] = useState('Mumbai');
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);

  /* =========================
     FETCH SALON (CORRECT)
  ========================= */

  useEffect(() => {
    if (!salonId) return;

    const fetchSalon = async () => {
      try {
        const res = await fetch(
          `${BACKEND_URL}/api/customer/businesses`,
          { cache: 'no-store' }
        );

        if (!res.ok) throw new Error('Failed to fetch businesses');

        const data = await res.json();

        const allBusinesses: Salon[] = [
          ...(data.salons ?? []),
          ...(data.spas ?? []),
        ];

        const found = allBusinesses.find(
          (b) => b.id === salonId
        );

        setSalon(found ?? null);
      } catch (err) {
        console.error('Salon fetch failed:', err);
        setSalon(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSalon();
  }, [salonId]);

  /* =========================
     LOCATION SYNC
  ========================= */

  useEffect(() => {
    const stored = localStorage.getItem(LOCATION_STORAGE_KEY);
    if (stored) setSelectedLocation(stored);
  }, []);

  /* =========================
     DERIVED STATE
  ========================= */

  const activeServices = useMemo(() => {
    if (!salon?.services) return [];
    return normalizeServices(salon.services).filter(
      (s) => s.isActive !== false
    );
  }, [salon]);

  const salonLocationText = `${salon?.branch ?? ''} ${salon?.address ?? ''}`;
  const isLocationValid = isSalonAvailableInLocation(
    selectedLocation,
    salonLocationText
  );

  const totalPrice = useMemo(() => {
    return selectedServiceIds.reduce((sum, id) => {
      const svc = activeServices.find((s) => s.serviceId === id);
      return sum + (svc ? Number(svc.price) : 0);
    }, 0);
  }, [selectedServiceIds, activeServices]);

  const selectedServices = useMemo<BookingService[]>(() => {
    return selectedServiceIds
      .map((id) => activeServices.find((s) => s.serviceId === id))
      .filter(Boolean)
      .map((s) => ({
        serviceId: s!.serviceId,
        name: s!.name,
        price: s!.price,
        duration: s!.duration,
      }));
  }, [selectedServiceIds, activeServices]);

  const toggleService = (serviceId: string) => {
    if (!isLocationValid) return;
    setSelectedServiceIds((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const canProceed = isLocationValid && selectedServiceIds.length > 0;

  /* =========================
     STATES
  ========================= */

  if (loading) {
    return (
      <div className="min-h-screen bg-linen pt-24 text-center text-taupe">
        Loading salon…
      </div>
    );
  }

  if (!salon) {
    return (
      <div className="min-h-screen bg-linen pt-24 text-center">
        <p className="text-lg font-bold text-cocoa">
          Salon not found
        </p>
      </div>
    );
  }

  /* =========================
     RENDER
  ========================= */

  return (
    <div className="min-h-screen bg-linen pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* HEADER */}
        <section className="bg-white border border-borderSoft rounded-3xl shadow-soft overflow-hidden">
          <div className="p-6">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-sm font-bold text-cocoa/70 hover:text-cocoa"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>

            <h1 className="text-3xl font-serif font-bold mt-4 text-cocoa">
              {salon.name}
            </h1>

            <p className="flex items-center gap-2 text-sm text-taupe mt-1">
              <MapPin className="w-4 h-4 text-goldDark" />
              {salon.address || 'Address unavailable'}
            </p>

            <div className="mt-3 flex items-center gap-2">
              <span className="bg-green-600 text-white px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                {typeof salon.rating === 'number'
                  ? salon.rating.toFixed(1)
                  : '—'}
                <Star className="w-3 h-3 fill-current" />
              </span>
            </div>
          </div>

          {salon.image && (
            <img
              src={
                salon.image.startsWith('http')
                  ? salon.image
                  : `${BACKEND_URL}${salon.image}`
              }
              alt={salon.name}
              className="w-full h-80 object-cover"
            />
          )}
        </section>

        {/* SERVICES */}
        <section className="mt-8 bg-white p-6 rounded-2xl shadow-card">
          <h2 className="text-lg font-serif font-bold mb-4 text-cocoa">
            Services
          </h2>

          {activeServices.length === 0 && (
            <p className="text-sm text-taupe">
              No active services available.
            </p>
          )}

          {activeServices.map((service) => {
            const selected = selectedServiceIds.includes(service.serviceId);

            return (
              <div
                key={service.serviceId}
                className="flex gap-4 mb-4 bg-linen p-4 rounded-xl"
              >
                {service.image && (
                  <img
                    src={
                      service.image.startsWith('http')
                        ? service.image
                        : `${BACKEND_URL}${service.image}`
                    }
                    className="w-24 h-24 object-cover rounded-lg"
                    alt={service.name}
                  />
                )}

                <div className="flex-1 min-w-0">
                  <p className="font-bold text-cocoa">
                    {service.name}
                  </p>
                  <p className="text-xs text-taupe line-clamp-2">
                    {service.description || ''}
                  </p>
                  <p className="text-xs mt-1 text-cocoa/70">
                    {service.category || 'Service'} •{' '}
                    {service.duration} min
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-bold text-goldDark">
                    ₹{service.price}
                  </p>
                  <button
                    onClick={() => toggleService(service.serviceId)}
                    className={`mt-2 px-3 py-1 rounded-lg text-xs font-bold ${
                      selected
                        ? 'bg-cocoa text-white'
                        : 'border border-borderSoft text-cocoa'
                    }`}
                  >
                    {selected ? 'Remove' : 'Add'}
                  </button>
                </div>
              </div>
            );
          })}
        </section>

        {/* BOOKING */}
        {canProceed && (
          <BookingFlowInline
            venue={{
              id: salon.id,
              name: salon.name,
              type: 'salon',
            }}
            services={selectedServices}
            totalPrice={totalPrice}
          />
        )}
      </div>
    </div>
  );
}
