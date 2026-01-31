'use client';

import { useSearchParams } from 'next/navigation';
import { Star, MapPin, Clock, Filter, ChevronDown, Heart } from 'lucide-react';
import Link from 'next/link';

const SALONS = [
  {
    id: 'luxe-1',
    name: "Luxe Salon & Spa",
    rating: 4.8,
    reviews: 1240,
    location: "Bandra West",
    distance: "0.8 km",
    image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1000&auto=format&fit=crop",
    category: "hair",
    price: "₹₹₹",
    nextSlot: "Today, 5:00 PM",
    tags: ["Unisex", "Premium"]
  },
  {
    id: 'urban-2',
    name: "Urban Company Spa",
    rating: 4.5,
    reviews: 85,
    location: "Andheri East",
    distance: "2.4 km",
    image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=1000",
    category: "spa",
    price: "₹₹",
    nextSlot: "Tomorrow, 10:00 AM",
    tags: ["Massage", "Budget"]
  },
  {
    id: 'tattva-3',
    name: "Tattva Wellness",
    rating: 4.9,
    reviews: 2100,
    location: "Juhu",
    distance: "3.1 km",
    image: "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?q=80&w=1000",
    category: "spa",
    price: "₹₹₹₹",
    nextSlot: "Today, 6:30 PM",
    tags: ["Luxury", "Hotel Spa"]
  },
  {
    id: 'cut-4',
    name: "The Cut Collective",
    rating: 4.2,
    reviews: 450,
    location: "Khar West",
    distance: "1.2 km",
    image: "https://images.unsplash.com/photo-1521590832169-d721f460f915?q=80&w=1000",
    category: "hair",
    price: "₹₹",
    nextSlot: "Today, 4:00 PM",
    tags: ["Hair Color", "Trendy"]
  },
  {
    id: 'envy-5',
    name: "Envy Salon",
    rating: 4.6,
    reviews: 320,
    location: "Powai",
    distance: "8.5 km",
    image: "https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=1000",
    category: "hair",
    price: "₹₹",
    nextSlot: "Today, 8:00 PM",
    tags: ["Late Night", "Unisex"]
  },
  {
    id: 'ayur-6',
    name: "Ayur Healing Center",
    rating: 4.7,
    reviews: 90,
    location: "Dadar",
    distance: "5.0 km",
    image: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?q=80&w=1000",
    category: "spa",
    price: "₹",
    nextSlot: "Tomorrow, 11:00 AM",
    tags: ["Ayurveda", "Therapy"]
  }
];

export default function SearchPage() {
  const searchParams = useSearchParams();
  const category = searchParams.get('cat'); // 'hair' or 'spa'
  
  // Filter Logic
  const filteredSalons = SALONS.filter(salon => {
    if (category && salon.category !== category) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-linen">
      
      {/* 1. HEADER: Breadcrumb & Sort */}
      <div className="bg-white border-b border-borderSoft sticky top-20 z-30 px-4 py-3 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-serif text-cocoa font-bold capitalize">
              Best {category || 'Salon & Spa'}s in Mumbai
            </h1>
            <p className="text-xs text-taupe mt-1">Showing {filteredSalons.length} results based on your preferences</p>
          </div>
          
          <div className="flex gap-3">
            <button className="flex items-center gap-2 text-xs font-bold text-cocoa border border-borderSoft px-4 py-2 rounded-lg hover:border-gold hover:bg-sand/20 transition-colors">
              Sort: Recommended <ChevronDown className="w-3 h-3" />
            </button>
            <button className="md:hidden flex items-center gap-2 text-xs font-bold text-white bg-cocoa px-4 py-2 rounded-lg">
              <Filter className="w-3 h-3" /> Filter
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* 2. SIDEBAR FILTERS (Desktop Only) */}
        <aside className="hidden lg:block space-y-8 h-fit sticky top-40">
          {/* Price Filter */}
          <div>
            <h3 className="text-sm font-bold text-cocoa mb-3 uppercase tracking-wider">Price Range</h3>
            <div className="flex gap-2">
              {['₹', '₹₹', '₹₹₹', '₹₹₹₹'].map((p) => (
                <button key={p} className="flex-1 border border-borderSoft py-2 rounded-lg text-xs font-bold text-taupe hover:border-gold hover:text-cocoa transition-all">
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Rating Filter */}
          <div>
            <h3 className="text-sm font-bold text-cocoa mb-3 uppercase tracking-wider">Rating</h3>
            <div className="space-y-2">
              {[4.5, 4.0, 3.5].map((r) => (
                <label key={r} className="flex items-center gap-3 text-sm text-cocoa cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 text-gold border-gray-300 rounded focus:ring-gold" />
                  <span>{r}+ Stars</span>
                </label>
              ))}
            </div>
          </div>

          {/* Amenities */}
          <div>
            <h3 className="text-sm font-bold text-cocoa mb-3 uppercase tracking-wider">Amenities</h3>
            <div className="flex flex-wrap gap-2">
              {['Parking', 'WiFi', 'AC', 'Card Accepted', 'Instant Book'].map((tag) => (
                <span key={tag} className="px-3 py-1 bg-white border border-borderSoft rounded-full text-xs text-taupe cursor-pointer hover:border-gold transition-colors">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </aside>

        {/* 3. MAIN RESULTS GRID */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredSalons.map((salon) => (
            <Link href={`/search/salon/${salon.id}`} key={salon.id} className="block group">
              <div className="bg-white rounded-2xl border border-borderSoft overflow-hidden hover:shadow-card hover:border-gold/30 transition-all duration-300 relative">
                
                {/* Image Section */}
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={salon.image} 
                    alt={salon.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                  />
                  {/* Heart Icon */}
                  <button className="absolute top-3 right-3 bg-white/20 backdrop-blur-md p-2 rounded-full hover:bg-white transition-colors group/btn">
                    <Heart className="w-4 h-4 text-white group-hover/btn:text-red-500 transition-colors" />
                  </button>
                  {/* Rating Badge */}
                  <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                    <span className="bg-green-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                      {salon.rating} <Star className="w-2 h-2 fill-current" />
                    </span>
                    <span className="text-[10px] text-taupe font-medium border-l border-gray-300 pl-1.5 ml-1">
                      {salon.reviews} Ratings
                    </span>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-5">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="text-lg font-serif font-bold text-cocoa group-hover:text-goldDark transition-colors">
                      {salon.name}
                    </h3>
                    <span className="text-xs font-bold text-cocoa/60">{salon.distance}</span>
                  </div>
                  
                  <p className="text-sm text-taupe flex items-center gap-1.5 mb-3">
                    <MapPin className="w-3.5 h-3.5 text-goldDark" /> {salon.location}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {salon.tags.map(tag => (
                      <span key={tag} className="text-[10px] font-bold uppercase tracking-wider bg-sand/30 text-cocoa px-2 py-1 rounded-md">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Footer: Price & Availability */}
                  <div className="flex items-center justify-between border-t border-borderSoft pt-3">
                    <div className="flex items-center gap-2 text-xs font-medium text-green-700 bg-green-50 px-2 py-1 rounded-md">
                      <Clock className="w-3 h-3" />
                      Next Slot: {salon.nextSlot}
                    </div>
                    <span className="text-sm font-bold text-cocoa">{salon.price}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}
