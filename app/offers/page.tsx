'use client';

import { Tag, Clock } from 'lucide-react';

const DEALS = [
  { id: 1, title: "Flat 50% Off Hair Spa", salon: "Luxe Salon", price: 999, original: 2000, expires: "2h left", image: "https://images.unsplash.com/photo-1560869713-7d0a29430803?q=80&w=1000" },
  { id: 2, title: "Bridal Package Combo", salon: "Tattva Wellness", price: 15000, original: 25000, expires: "1 day left", image: "https://images.unsplash.com/photo-1596462502278-27bfdd403348?q=80&w=1000" },
];

export default function DealsPage() {
  return (
    <div className="min-h-screen bg-linen px-4 py-8">
      <div className="max-w-7xl mx-auto">
        
        {/* HERO BANNER */}
        <div className="bg-cocoa rounded-3xl p-8 mb-10 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gold/10 rounded-full blur-3xl" />
          <h1 className="text-3xl md:text-5xl font-serif text-sand font-bold mb-4 relative z-10">Flash Deals</h1>
          <p className="text-sand/80 text-lg relative z-10">Exclusive offers valid for limited time.</p>
        </div>

        {/* DEALS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {DEALS.map((deal) => (
            <div key={deal.id} className="bg-white rounded-2xl shadow-sm border border-white hover:border-gold/50 overflow-hidden group cursor-pointer transition-all">
              <div className="relative h-56">
                <img src={deal.image} className="w-full h-full object-cover" />
                <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {deal.expires}
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-cocoa mb-1">{deal.title}</h3>
                <p className="text-sm text-taupe mb-4">at {deal.salon}</p>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-lg font-bold text-cocoa">₹{deal.price}</span>
                    <span className="text-sm text-gray-400 line-through ml-2">₹{deal.original}</span>
                  </div>
                  <button className="bg-gold text-cocoa px-4 py-2 rounded-lg text-sm font-bold hover:bg-goldDark hover:text-white transition-colors">
                    Claim Deal
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}