'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Filter } from 'lucide-react';
import SalonCard from '@/components/salon/SalonCard';

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

/* =========================
   CONSTANTS
========================= */

const BACKEND_URL = 'http://localhost:3001';

/* =========================
   PAGE
========================= */

export default function SearchPage() {
  const searchParams = useSearchParams();

  const category = (searchParams.get('cat') ?? 'all').toLowerCase();
  const query = searchParams.get('q') ?? '';
  const loc =
    searchParams.get('loc') ??
    (typeof window !== 'undefined'
      ? localStorage.getItem('cutpoint_location')
      : null) ??
    'Mumbai';

  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);

  /* =========================
     FETCH FROM BACKEND
  ========================= */

  useEffect(() => {
    const fetchPlaces = async () => {
      setLoading(true);
      console.log('🚀 Fetching places...');

      try {
        const params = new URLSearchParams({
          loc,
          q: query,
        });

        const url = `${BACKEND_URL}/api/customer/businesses?${params}`;
        console.log('➡️ API URL:', url);

        const res = await fetch(url, { cache: 'no-store' });

        console.log('📡 Response status:', res.status);

        if (!res.ok) {
          throw new Error('Failed to fetch businesses');
        }

        const data = await res.json();

        console.log('📦 Raw API Response:', data);
        console.log('🏪 Salons array:', data?.salons);

        const salons: Place[] = Array.isArray(data?.salons)
          ? data.salons.map((s: any) => ({
            ...s,
            type: 'salon',
          }))
          : [];

        const spas: Place[] = Array.isArray(data?.spas)
          ? data.spas.map((s: any) => ({
            ...s,
            type: 'spa',
          }))
          : [];
        console.log('✅ Parsed places:', salons);

        setPlaces([...salons, ...spas]);
      } catch (err) {
        console.error('❌ Search fetch failed:', err);
        setPlaces([]);
      } finally {
        setLoading(false);
        console.log('✅ Fetch completed');
      }
    };

    fetchPlaces();
  }, [loc, query]);

  /* =========================
     FRONTEND FILTERING
  ========================= */

  const normalizedQuery = query.trim().toLowerCase();
  const normalizedLoc = loc.trim().toLowerCase();

  const filteredPlaces = useMemo(() => {
    return places.filter((place) => {
      // category filter
      if (category !== 'all' && place.type !== category) {
        return false;
      }


      // location filter
      if (normalizedLoc) {
        const matchesLoc =
          `${place.branch ?? ''} ${place.address ?? ''}`
            .toLowerCase()
            .includes(normalizedLoc);


        if (!matchesLoc) return false;
      }

      // query filter (name OR service name)
      if (normalizedQuery) {
        const nameMatch = place.name
          ?.toLowerCase()
          .includes(normalizedQuery);

        const serviceMatch = (place.services || []).some((s) =>
          s.name?.toLowerCase().includes(normalizedQuery)
        );

        if (!nameMatch && !serviceMatch) return false;
      }

      return true;
    });
  }, [places, category, normalizedLoc, normalizedQuery]);

  const totalResults = filteredPlaces.length;

  /* =========================
     UI
  ========================= */

  return (
    <div className="min-h-screen bg-linen pt-24">
      {/* HEADER */}
      <div className="bg-white border-b border-borderSoft sticky top-20 z-40 px-4 py-3 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <p className="text-sm font-medium text-cocoa">
            {loading
              ? 'Searching…'
              : `Showing ${totalResults} results in `}
            {!loading && <span className="font-bold">{loc}</span>}
          </p>

          <button className="flex items-center gap-2 text-sm font-bold text-cocoa border border-borderSoft px-4 py-2 rounded-lg hover:border-gold transition-colors">
            <Filter className="w-4 h-4" /> Filters
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-20 text-taupe">
            Loading results…
          </div>
        ) : (
          <>
            <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
              {filteredPlaces.map((place) => {
                const kind: 'salon' | 'spa' =
                  place.type ?? 'salon';

                return (
                  <SalonCard
                    key={place.id}
                    kind={kind}
                    item={place}
                  />
                );
              })}
            </div>

            {totalResults === 0 && (
              <div className="text-center py-20">
                <p className="text-taupe text-lg">
                  No results found matching your criteria.
                </p>
                <button
                  onClick={() =>
                  (window.location.href = `/search?cat=${category}&loc=${encodeURIComponent(loc)}`)
                  }
                  className="mt-4 text-goldDark underline font-medium"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
