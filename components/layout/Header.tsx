'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import {
  MapPin,
  Menu,
  X,
  ShoppingBag,
  Heart,
  LogOut,
  CalendarCheck,
  LayoutGrid,
  Check,
  ChevronDown,
  User
} from 'lucide-react';

// --- TYPES ---
type User = {
  name: string;
  email?: string;
  role?: 'customer' | 'admin' | 'employee';
};

type NavLink = {
  name: string;
  href: string;
  type: 'exact' | 'path' | 'query';
  value?: string;
};

// --- CONSTANTS ---
const CITIES = ["Mumbai", "Delhi NCR", "Bangalore", "Pune", "Hyderabad", "Chennai"];
const LOCATION_STORAGE_KEY = 'cutpoint_location';
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_MAP_API;


export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // --- STATE ---
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Dropdown States
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isMobileLocationExpanded, setIsMobileLocationExpanded] = useState(false); // ✅ New state for mobile dropdown
  const [fullAddress, setFullAddress] = useState<string | null>(null);


  const [location, setLocation] = useState(() => {
    if (typeof window === 'undefined') return 'Mumbai';
    const stored = localStorage.getItem(LOCATION_STORAGE_KEY);
    return stored && CITIES.includes(stored) ? stored : 'Mumbai';
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem('salon_user');
      if (!raw || raw === 'undefined') return null;
      return JSON.parse(raw) as User;
    } catch {
      localStorage.removeItem('salon_user');
      localStorage.removeItem('salon_token');
      return null;
    }
  });

  // --- REFS ---
  const profileRef = useRef<HTMLDivElement>(null);
  const locationRef = useRef<HTMLDivElement>(null);

  // --- NAVIGATION LINKS ---
  const discoveryLinks: NavLink[] = [
    { name: 'Home', href: '/', type: 'exact' },
    {
      name: 'Salon',
      href: `/search?cat=salon&loc=${encodeURIComponent(location)}`,
      type: 'query',
      value: 'salon',
    },
    {
      name: 'Spa',
      href: `/search?cat=spa&loc=${encodeURIComponent(location)}`,
      type: 'query',
      value: 'spa',
    },
    { name: 'Offers', href: '/offers', type: 'path' },
    { name: 'Trends', href: '/trends', type: 'path' },
  ];


  // --- ACTIVE LOGIC ---
  const isActive = (link: NavLink) => {
    if (link.type === 'exact') return pathname === link.href;
    if (link.type === 'query') return pathname === '/search' && searchParams.get('cat') === link.value;
    if (link.type === 'path') return pathname.startsWith(link.href);
    return false;
  };

  // --- AUTH SYNC ---
  const syncUser = () => {
    try {
      const raw = localStorage.getItem('salon_user');
      if (!raw || raw === 'undefined') {
        setUser(null);
        return;
      }
      setUser(JSON.parse(raw));
    } catch {
      localStorage.removeItem('salon_user');
      localStorage.removeItem('salon_token');
      setUser(null);
    }
  };

  // --- EFFECTS ---
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('storage', syncUser);

    // 🔴 AUTO FETCH LIVE LOCATION (ONLY IF NOT ALREADY STORED)
    if (typeof window !== 'undefined') {
      const storedLocation = localStorage.getItem(LOCATION_STORAGE_KEY);
      if (!storedLocation) {
        fetchLiveLocation();
      }
    }

    // Unified Click Outside Handler
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (profileRef.current && !profileRef.current.contains(target)) {
        setIsProfileOpen(false);
      }
      if (locationRef.current && !locationRef.current.contains(target)) {
        setIsLocationOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('storage', syncUser);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  // --- HANDLERS ---
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}&loc=${location}`);
      setIsMobileOpen(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('salon_user');
    localStorage.removeItem('salon_token');
    window.dispatchEvent(new Event('storage'));
    router.push('/');
    setUser(null);
    setIsProfileOpen(false);
  };

  const handleLocationSelect = (city: string) => {
    setLocation(city);
    localStorage.setItem(LOCATION_STORAGE_KEY, city);
    window.dispatchEvent(new CustomEvent('cutpoint_location_change', { detail: city }));
    setIsLocationOpen(false);
    setIsMobileLocationExpanded(false); // Close mobile drawer dropdown too
    if (pathname === '/search') {
      const params = new URLSearchParams(Array.from(searchParams.entries()));
      params.set('loc', city);
      router.push(`/search?${params.toString()}`);
    }
  };


  const fetchLiveLocation = async () => {
  if (!navigator.geolocation) {
    console.warn('Geolocation not supported');
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;

      console.log('📍 GPS Coordinates:', { latitude, longitude });

      try {
        const res = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${process.env.NEXT_PUBLIC_MAP_API}`
        );

        const data = await res.json();

        console.log('🧭 FULL GEOCODE RESPONSE:', data);

        const primaryResult = data.results?.[0];
        if (!primaryResult) {
          console.warn('❌ No geocode result found');
          return;
        }

        const formattedAddress = primaryResult.formatted_address;
        const components = primaryResult.address_components || [];

        console.log('🏠 FORMATTED ADDRESS:', formattedAddress);

        console.table(
          components.map((c: any) => ({
            long_name: c.long_name,
            short_name: c.short_name,
            types: c.types.join(', '),
          }))
        );

        // ✅ PRIORITY: locality → sublocality → admin area
        const cityComponent =
          components.find((c: any) => c.types.includes('locality')) ||
          components.find((c: any) =>
            c.types.includes('sublocality_level_1')
          ) ||
          components.find((c: any) =>
            c.types.includes('administrative_area_level_2')
          );

        if (!cityComponent) {
          console.warn('❌ City not found in Google response');
          return;
        }

        const detectedCity = cityComponent.long_name;

        // ✅ NORMALIZE FOR BACKEND SEARCH
        const finalCity =
          detectedCity === 'Navi Mumbai' ? 'Mumbai' : detectedCity;

        console.log('✅ DETECTED CITY:', detectedCity);
        console.log('🎯 FINAL CITY USED:', finalCity);

        // ✅ UPDATE HEADER STATE
        setLocation(finalCity);
        if (formattedAddress) {
          setFullAddress(formattedAddress);
          localStorage.setItem('cutpoint_full_address', formattedAddress);
        }

        localStorage.setItem(LOCATION_STORAGE_KEY, finalCity);

        window.dispatchEvent(
          new CustomEvent('cutpoint_location_change', {
            detail: finalCity,
          })
        );

        // ✅ REFRESH SEARCH PAGE IF USER IS THERE
        if (pathname === '/search') {
          const params = new URLSearchParams(
            Array.from(searchParams.entries())
          );
          params.set('loc', finalCity);
          router.push(`/search?${params.toString()}`);
        }
      } catch (error) {
        console.error('❌ Geocoding API failed:', error);
      }
    },
    (error) => {
      console.warn('📍 Geolocation denied or failed:', error);

      // ✅ FALLBACK (NO CRASH)
      const fallbackCity =
        localStorage.getItem(LOCATION_STORAGE_KEY) || 'Mumbai';

      const fallbackAddress =
        localStorage.getItem('cutpoint_full_address') || fallbackCity;

      setLocation(fallbackCity);
      setFullAddress(fallbackAddress);

      localStorage.setItem(LOCATION_STORAGE_KEY, fallbackCity);

      console.info('➡️ Falling back to:', fallbackCity);
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    }
  );
};




  // --- STYLING VARS ---
  const isHome = pathname === '/';

  const headerClasses = `fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isHome && !isScrolled
    ? 'bg-transparent py-4 border-transparent'
    : 'bg-sand/95 backdrop-blur-md border-b border-borderSoft shadow-sm py-3'
    }`;

  const linkBaseClass = `text-sm font-bold uppercase tracking-wide transition-all duration-200 relative pb-1 ${isHome && !isScrolled ? 'text-cocoa hover:text-goldDark' : 'text-cocoa hover:text-goldDark'
    }`;

  return (
    <header className={headerClasses}>
      <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between gap-4">

        {/* ================= LEFT: BRAND & DESKTOP LOCATION ================= */}
        <div className="flex items-center gap-6">
          <Link href="/" className="group flex-shrink-0 z-50">
            <span className="text-2xl font-serif font-bold tracking-wide text-cocoa">
              Glow <span className="text-gold group-hover:text-goldDark transition-colors">Biz</span>
            </span>
          </Link>

          {/* DESKTOP LOCATION DROPDOWN (Hidden on Mobile) */}
          <div className="relative hidden md:block" ref={locationRef}>
            <button
              onClick={fetchLiveLocation}
              className="flex items-center gap-2 ..."
            >
              <MapPin className="w-4 h-4 text-goldDark" />
              <span className="truncate max-w-[180px] text-left leading-tight">
                {fullAddress ? fullAddress : location}
              </span>

              <span className={`text-xs opacity-60 transition-transform duration-200 ${isLocationOpen ? 'rotate-180' : ''}`}>▼</span>
            </button>

            {isLocationOpen && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 animate-in fade-in zoom-in-95 origin-top-left z-50">
                <div className="px-3 py-2 text-xs font-bold text-taupe uppercase tracking-wider border-b border-gray-50">
                  Select City
                </div>
                {CITIES.map((city) => (
                  <button
                    key={city}
                    onClick={() => handleLocationSelect(city)}
                    className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between hover:bg-sand/50 transition-colors ${location === city ? 'text-goldDark font-bold bg-sand/30' : 'text-cocoa'
                      }`}
                  >
                    {city}
                    {location === city && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ================= CENTER: NAVIGATION ================= */}
        <nav className="hidden lg:flex items-center gap-8">
          {discoveryLinks.map((item) => {
            const active = isActive(item);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`${linkBaseClass} ${active ? 'text-goldDark' : ''}`}
              >
                {item.name}
                {active && (
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gold rounded-full animate-in fade-in zoom-in duration-300" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* ================= RIGHT: ACTIONS ================= */}
        <div className="flex items-center gap-3 xl:gap-5">

          {/* Desktop Search
          <form onSubmit={handleSearch} className="hidden md:block relative group">
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-32 focus:w-56 lg:focus:w-64 text-sm px-4 py-2 pl-9 rounded-full focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all duration-300 shadow-sm text-cocoa placeholder:text-taupe/70 ${
                isHome && !isScrolled 
                  ? 'bg-white/90 border-transparent' 
                  : 'bg-white border-gray-200'
              }`}
            />
            <Search className="w-4 h-4 text-taupe absolute left-3 top-2.5 pointer-events-none" />
          </form> */}

          {/* Desktop Book Now */}
          <Link
            href={`/search?cat=all&loc=${encodeURIComponent(location)}`}
            className={`hidden lg:flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold shadow-soft transition-transform hover:scale-105 active:scale-95 ${isHome && !isScrolled
              ? 'bg-cocoa text-sand hover:bg-taupe'
              : 'bg-gradient-to-r from-gold to-goldDark text-white hover:brightness-110'
              }`}
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Book Now</span>
          </Link>

          {/* User Profile / Auth */}
          {user ? (
            <div className="relative" ref={profileRef}>
              <div className="flex items-center gap-3">
                <Link href="/saved" className="hidden md:block hover:text-red-500 transition-colors text-cocoa" title="Saved Items">
                  <Heart className="w-5 h-5" />
                </Link>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 focus:outline-none"
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all ${isHome && !isScrolled
                    ? 'bg-white text-cocoa border-transparent hover:border-cocoa'
                    : 'bg-cocoa text-sand border-transparent hover:border-gold'
                    }`}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                </button>
              </div>

              {isProfileOpen && (
                <div className="absolute right-0 mt-3 w-60 bg-white rounded-xl shadow-xl border border-gray-100 p-2 animate-in fade-in zoom-in-95 origin-top-right">

                  {/* USER INFO */}
                  <div className="px-3 py-2 border-b border-gray-100 mb-1">
                    <p className="text-sm font-bold text-gray-900 truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      Customer
                    </p>
                  </div>

                  {/* DASHBOARD */}
                  <Link
                    href="/customer"
                    className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <LayoutGrid className="w-4 h-4" />
                    Dashboard
                  </Link>

                  {/* MY APPOINTMENTS */}
                  <Link
                    href="/customer/appointment"
                    className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <CalendarCheck className="w-4 h-4" />
                    My Appointments
                  </Link>


                  {/* SIGN OUT */}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg mt-1 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>

                </div>
              )}

            </div>
          ) : (
            <div className={`flex items-center gap-3 pl-2 lg:border-l ${isHome && !isScrolled ? 'border-cocoa/20' : 'border-gray-300'}`}>
              <Link href="/auth/login/" className="hidden md:block text-sm font-bold hover:text-goldDark whitespace-nowrap text-cocoa transition-colors">
                Log In
              </Link>
              {/* ✅ HIDDEN ON MOBILE to avoid duplicate button in header */}
              <Link href="/auth/register" className="hidden md:block bg-cocoa text-linen px-5 py-2 rounded-lg text-sm font-bold hover:bg-taupe transition-colors shadow-sm whitespace-nowrap">
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button onClick={() => setIsMobileOpen(!isMobileOpen)} className="lg:hidden p-1 text-cocoa hover:text-goldDark transition-colors">
            {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* ================= MOBILE MENU DRAWER ================= */}
      {isMobileOpen && (
        <div className="lg:hidden bg-white/95 backdrop-blur-xl border-t border-gray-100 p-4 shadow-2xl absolute w-full animate-in slide-in-from-top-5 h-[calc(100vh-60px)] overflow-y-auto">

          {/* ✅ FIXED MOBILE LOCATION DROPDOWN */}
          <div className="mb-4">
            <button
              onClick={() => setIsMobileLocationExpanded(!isMobileLocationExpanded)}
              className="w-full flex items-center justify-between bg-white border border-gold/30 p-3 rounded-xl shadow-sm text-cocoa font-bold text-sm"
            >
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-goldDark" />
                {location}
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform ${isMobileLocationExpanded ? 'rotate-180' : ''}`} />
            </button>

            {isMobileLocationExpanded && (
              <div className="mt-2 bg-white border border-borderSoft rounded-xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                {CITIES.map(city => (
                  <button
                    key={city}
                    onClick={() => handleLocationSelect(city)}
                    className={`w-full text-left px-4 py-3 text-sm border-b border-gray-50 last:border-0 hover:bg-sand/30 flex justify-between items-center ${location === city ? 'font-bold text-goldDark bg-sand/20' : 'text-cocoa'
                      }`}
                  >
                    {city}
                    {location === city && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <nav className="space-y-1">
            {discoveryLinks.map((item) => {
              const active = isActive(item);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  // ✅ COMPACT SIZING: Reduced padding (py-2) and font size
                  className={`flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-sand text-cocoa font-bold border-l-4 border-gold' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  onClick={() => setIsMobileOpen(false)}
                >
                  {item.name}
                </Link>
              );
            })}

            <div className="my-4 border-t border-gray-100"></div>

            {/* Book Now - Compact */}
            <Link
              href={`/search?cat=all&loc=${encodeURIComponent(location)}`}
              onClick={() => setIsMobileOpen(false)}
              className="flex items-center justify-center gap-2 w-full bg-goldDark text-white py-2.5 rounded-xl font-bold text-sm shadow-soft mb-3 hover:bg-cocoa transition-colors"
            >
              <CalendarCheck className="w-4 h-4" />
              Book An Appointment
            </Link>

            {/* Auth Buttons - Visible Only in Drawer for Mobile */}
            {!user && (
              <div className="grid grid-cols-2 gap-3">
                <Link href="/auth/login" onClick={() => setIsMobileOpen(false)} className="text-center py-2.5 border border-borderSoft rounded-xl font-bold text-sm text-cocoa">
                  Log In
                </Link>
                <Link href="/auth/register" onClick={() => setIsMobileOpen(false)} className="text-center py-2.5 bg-cocoa text-white rounded-xl font-bold text-sm">
                  Sign Up
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
