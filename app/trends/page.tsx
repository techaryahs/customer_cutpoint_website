'use client';

// Real Unsplash IDs for Salon/Hair/Spa images
const TRENDS = [
  { id: 1, img: "https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=800&auto=format&fit=crop", title: "Textured Bob" },
  { id: 2, img: "https://images.unsplash.com/photo-1605497788044-5a32c7078486?q=80&w=800&auto=format&fit=crop", title: "Classic Fade" },
  { id: 3, img: "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?q=80&w=800&auto=format&fit=crop", title: "Copper Balayage" },
  { id: 4, img: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?q=80&w=800&auto=format&fit=crop", title: "Bridal Glow" },
  { id: 5, img: "https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?q=80&w=800&auto=format&fit=crop", title: "Gel Extensions" },
  { id: 6, img: "https://images.unsplash.com/photo-1560869713-7d0a29430803?q=80&w=800&auto=format&fit=crop", title: "Keratin Smooth" },
  { id: 7, img: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?q=80&w=800&auto=format&fit=crop", title: "Natural Curls" },
  { id: 8, img: "https://images.unsplash.com/photo-1596462502278-27bfdd403348?q=80&w=800&auto=format&fit=crop", title: "Spa Day" },
];

export default function TrendsPage() {
  return (
    // Added 'pt-24' to push content below the fixed header
    <div className="min-h-screen bg-linen pt-28 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-serif text-cocoa font-bold mb-4">Trends</h1>
          <p className="text-taupe text-lg">Trending styles from top stylists near you.</p>
        </div>
        
        {/* MASONRY GRID LAYOUT */}
        <div className="columns-1 md:columns-3 lg:columns-4 gap-4 space-y-4">
          {TRENDS.map((item) => (
            <div key={item.id} className="break-inside-avoid relative group rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500">
              <img 
                src={item.img} 
                alt={item.title} 
                className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-110"
              />
              
              {/* Overlay with Button */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-4">
                <h3 className="text-white font-serif text-xl mb-3 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">{item.title}</h3>
                <button className="bg-white text-cocoa px-6 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider hover:bg-gold hover:text-white transition-colors transform translate-y-4 group-hover:translate-y-0 duration-500">
                  Book This Look
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}