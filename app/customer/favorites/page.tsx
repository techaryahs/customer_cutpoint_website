'use client';

const favorites = [
  {
    id: 'SAL001',
    name: 'Luxury Touch Salon',
    location: 'Bandra West, Mumbai',
    rating: 4.8,
    image:
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 'SAL002',
    name: 'You Do You Hair Studio',
    location: 'Indiranagar, Bangalore',
    rating: 4.6,
    image:
      'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 'SAL003',
    name: 'Glow Beauty Lounge',
    location: 'Koregaon Park, Pune',
    rating: 4.7,
    image:
      'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1200&auto=format&fit=crop',
  },
];

export default function CustomerFavoritesPage() {
  return (
    <section className="max-w-6xl">
      {/* PAGE HEADER */}
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-3xl font-semibold text-[#4a3728]">
          Favorites
        </h1>

        <button className="px-6 py-3 rounded-xl bg-[#4a3728] text-white font-semibold hover:opacity-90">
          Explore salons
        </button>
      </div>

      {/* FAVORITES GRID */}
      {favorites.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {favorites.map((salon) => (
            <div
              key={salon.id}
              className="bg-white rounded-3xl border border-gray-200 overflow-hidden hover:shadow-xl transition"
            >
              {/* IMAGE */}
              <div className="h-44 w-full overflow-hidden">
                <img
                  src={salon.image}
                  alt={salon.name}
                  className="h-full w-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* CONTENT */}
              <div className="p-6">
                <h3 className="text-xl font-semibold text-[#4a3728] mb-1">
                  {salon.name}
                </h3>
                <p className="text-sm text-[#7a6a5e] mb-4">
                  {salon.location}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-green-700 bg-green-100 px-3 py-1 rounded-full">
                    ★ {salon.rating}
                  </span>

                  <button className="text-sm font-semibold text-[#4a3728] hover:underline">
                    Book now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* EMPTY STATE */
        <div className="bg-white p-16 rounded-3xl border border-gray-200 text-center">
          <p className="text-[#7a6a5e] mb-6 text-lg">
            You haven’t added any salons to favorites yet
          </p>
          <button className="px-6 py-3 rounded-xl bg-[#4a3728] text-white font-semibold">
            Explore salons
          </button>
        </div>
      )}
    </section>
  );
}
