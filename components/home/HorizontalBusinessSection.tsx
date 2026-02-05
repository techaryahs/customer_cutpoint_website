'use client';

import { useRouter } from 'next/navigation';
import SalonCard from '@/components/salon/SalonCard';

type Place = {
  id: string;
  name: string;
  image?: string;
  rating?: number;
  address?: string;
  branch?: string;
  type?: 'salon' | 'spa';
};

type Props = {
  title: string;
  items: Place[];
  viewAllHref: string;
};

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export default function HorizontalBusinessSection({
  title,
  items,
  viewAllHref,
}: Props) {
  const router = useRouter();

  if (!items || items.length === 0) return null;

  return (
    <section className="bg-white py-4">
      <div className="max-w-7xl mx-auto px-6">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-10">
          <h2 className="font-serif text-3xl md:text-4xl text-[#5c4a44]">
            {title}
          </h2>

          <button
            onClick={() => router.push(viewAllHref)}
            className="text-sm font-bold text-goldDark hover:underline"
          >
            View All →
          </button>
        </div>

        {/* HORIZONTAL SCROLL */}
        <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
          {items.map((place) => {
            const normalizedImage = place.image
              ? place.image.startsWith('http')
                ? place.image
                : `${BACKEND_URL.replace(/\/api$/, '').replace(/\/$/, '')}/${place.image.replace(/^\//, '')}`
              : '/placeholder.jpg';

            return (
              <div
                key={place.id}
                className="min-w-[280px] max-w-[280px] flex-shrink-0"
              >
                <SalonCard
                  kind={place.type ?? 'salon'}
                  item={{
                    ...place,
                    image: normalizedImage,
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
