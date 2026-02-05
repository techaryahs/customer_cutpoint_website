'use client';

import { useState, useEffect, useRef } from 'react';
import { Link, useRouter, usePathname } from '@/app/routing'; // Use localized navigation
import { useSearchParams } from 'next/navigation';
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
  User,
  Globe
} from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';

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
const CITIES_EN = ["Mumbai", "Delhi NCR", "Bangalore", "Pune", "Hyderabad", "Chennai"];
const LOCATION_STORAGE_KEY = 'glowbiz_location';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations('Header');
  const locale = useLocale();

  // --- STATE ---
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Dropdown States
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false); // ✅ Language dropdown
  const [isMobileLocationExpanded, setIsMobileLocationExpanded] = useState(false);
  const [fullAddress, setFullAddress] = useState<string | null>(null);

  const [location, setLocation] = useState('Mumbai');
  const [user, setUser] = useState<User | null>(null);
  const [mounted, setMounted] = useState(false);

  // --- REFS ---
  const profileRef = useRef<HTMLDivElement>(null);
  const locationRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  // --- NAVIGATION LINKS ---
  const discoveryLinks: NavLink[] = [
    { name: t('nav.home'), href: '/', type: 'exact' },
    {
      name: t('nav.salon'),
      href: `/search?cat=salon&loc=${encodeURIComponent(location)}`,
      type: 'query',
      value: 'salon',
    },
    {
      name: t('nav.spa'),
      href: `/search?cat=spa&loc=${encodeURIComponent(location)}`,
      type: 'query',
      value: 'spa',
    },
    { name: t('nav.offers'), href: '/offers', type: 'path' },
    { name: t('nav.trends'), href: '/trends', type: 'path' },
  ];

  const handleLangChange = (newLocale: string) => {
    const currentParams = searchParams.toString();
    const newPath = currentParams ? `${pathname}?${currentParams}` : pathname;
    router.replace(newPath, { locale: newLocale });
    setIsLangOpen(false);
  };

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
    setMounted(true);

    // Initialize state from localStorage
    const storedLocation = localStorage.getItem(LOCATION_STORAGE_KEY);
    if (storedLocation && CITIES_EN.includes(storedLocation)) {
      setLocation(storedLocation);
    } else {
      fetchLiveLocation();
    }

    try {
      const raw = localStorage.getItem('salon_user');
      if (raw && raw !== 'undefined') {
        setUser(JSON.parse(raw));
      }
    } catch (e) {
      console.error("Failed to parse user", e);
    }

    const handleScroll = () => setIsScrolled(window.scrollY > 20);

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('storage', syncUser);
    window.addEventListener('auth-change', syncUser);

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (profileRef.current && !profileRef.current.contains(target)) {
        setIsProfileOpen(false);
      }
      if (locationRef.current && !locationRef.current.contains(target)) {
        setIsLocationOpen(false);
      }
      if (langRef.current && !langRef.current.contains(target)) {
        setIsLangOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('storage', syncUser);
      window.removeEventListener('auth-change', syncUser);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
    window.dispatchEvent(new CustomEvent('glowbiz_location_change', { detail: city }));
    setIsLocationOpen(false);
    setIsMobileLocationExpanded(false);
    if (pathname === '/search') {
      const params = new URLSearchParams(Array.from(searchParams.entries()));
      params.set('loc', city);
      router.push(`/search?${params.toString()}`);
    }
  };


  const fetchLiveLocation = async () => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${process.env.NEXT_PUBLIC_MAP_API}`
          );
          const data = await res.json();
          const primaryResult = data.results?.[0];
          if (!primaryResult) return;

          const formattedAddress = primaryResult.formatted_address;
          const components = primaryResult.address_components || [];

          const cityComponent =
            components.find((c: any) => c.types.includes('locality')) ||
            components.find((c: any) => c.types.includes('sublocality_level_1')) ||
            components.find((c: any) => c.types.includes('administrative_area_level_2'));

          if (!cityComponent) return;

          const detectedCity = cityComponent.long_name;
          const finalCity = detectedCity === 'Navi Mumbai' ? 'Mumbai' : detectedCity;

          setLocation(finalCity);
          if (formattedAddress) {
            setFullAddress(formattedAddress);
            localStorage.setItem('glowbiz_full_address', formattedAddress);
          }
          localStorage.setItem(LOCATION_STORAGE_KEY, finalCity);
          window.dispatchEvent(new CustomEvent('glowbiz_location_change', { detail: finalCity }));

          if (pathname === '/search') {
            const params = new URLSearchParams(Array.from(searchParams.entries()));
            params.set('loc', finalCity);
            router.push(`/search?${params.toString()}`);
          }
        } catch (error) {
          console.error('❌ Geocoding API failed:', error);
        }
      },
      (error) => {
        const fallbackCity = localStorage.getItem(LOCATION_STORAGE_KEY) || 'Mumbai';
        setLocation(fallbackCity);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const isHome = pathname === '/';
  const headerClasses = `fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isHome && !isScrolled
    ? 'bg-transparent py-4 border-transparent'
    : 'bg-sand/95 backdrop-blur-md border-b border-borderSoft shadow-sm py-3'
    }`;

  const linkBaseClass = `text-sm font-bold uppercase tracking-wide transition-all duration-200 relative pb-1 text-cocoa hover:text-goldDark`;

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

          <div className="relative hidden md:block" ref={locationRef}>
            <button
              onClick={() => setIsLocationOpen(!isLocationOpen)}
              className="flex items-center gap-2 text-xs font-bold text-cocoa hover:text-goldDark transition-colors"
            >
              <MapPin className="w-4 h-4 text-goldDark" />
              <span className="truncate max-w-[150px] text-left">
                {fullAddress ? fullAddress : t(`cities.${location.toLowerCase().replace(/ /g, '_')}`, { defaultValue: location })}
              </span>
              <ChevronDown className={`w-3 h-3 transition-transform ${isLocationOpen ? 'rotate-180' : ''}`} />
            </button>

            {isLocationOpen && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 origin-top-left z-50">
                <div className="px-3 py-2 text-xs font-bold text-taupe uppercase tracking-wider border-b border-gray-50">
                  {t('select_city')}
                </div>
                {CITIES_EN.map((city) => (
                  <button
                    key={city}
                    onClick={() => handleLocationSelect(city)}
                    className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between hover:bg-sand/50 transition-colors ${location === city ? 'text-goldDark font-bold bg-sand/30' : 'text-cocoa'}`}
                  >
                    {t(`cities.${city.toLowerCase().replace(/ /g, '_')}`, { defaultValue: city })}
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
                key={item.href}
                href={item.href}
                className={`${linkBaseClass} ${active ? 'text-goldDark' : ''}`}
              >
                {item.name}
                {active && (
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gold rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* ================= RIGHT: ACTIONS ================= */}
        <div className="flex items-center gap-3 xl:gap-5">

          {/* LANGUAGE SELECTOR */}
          <div className="relative hidden md:block" ref={langRef}>
            <button
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="flex items-center gap-2 p-2 rounded-full hover:bg-sand/50 transition-colors text-cocoa"
            >
              <Globe className="w-5 h-5" />
              <span className="text-xs font-bold uppercase">{locale}</span>
            </button>
            {isLangOpen && (
              <div className="absolute top-full right-0 mt-2 w-32 bg-white rounded-xl shadow-xl border border-gray-100 py-1 origin-top-right z-50">
                <button onClick={() => handleLangChange('en')} className={`w-full text-left px-4 py-2 text-sm hover:bg-sand/50 ${locale === 'en' ? 'font-bold text-goldDark' : 'text-cocoa'}`}>English</button>
                <button onClick={() => handleLangChange('hi')} className={`w-full text-left px-4 py-2 text-sm hover:bg-sand/50 ${locale === 'hi' ? 'font-bold text-goldDark' : 'text-cocoa'}`}>हिंदी</button>
                <button onClick={() => handleLangChange('mr')} className={`w-full text-left px-4 py-2 text-sm hover:bg-sand/50 ${locale === 'mr' ? 'font-bold text-goldDark' : 'text-cocoa'}`}>मराठी</button>
              </div>
            )}
          </div>

          <Link
            href={`/search?cat=all&loc=${encodeURIComponent(location)}`}
            className={`hidden lg:flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold shadow-soft transition-transform hover:scale-105 active:scale-95 ${isHome && !isScrolled
              ? 'bg-cocoa text-sand hover:bg-taupe'
              : 'bg-gradient-to-r from-gold to-goldDark text-white hover:brightness-110'}`}
          >
            <CalendarCheck className="w-4 h-4" />
            <span>{t('book_now')}</span>
          </Link>

          {!mounted ? (
            <div className="w-9 h-9" />
          ) : user ? (
            <div className="relative" ref={profileRef}>
              <div className="flex items-center gap-3">
                <Link href="/customer/favorites" className="hidden md:block hover:text-red-500 transition-colors text-cocoa" title="Saved Items">
                  <Heart className="w-5 h-5" />
                </Link>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 focus:outline-none"
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all ${isHome && !isScrolled ? 'bg-white text-cocoa border-transparent hover:border-cocoa' : 'bg-cocoa text-sand border-transparent hover:border-gold'}`}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                </button>
              </div>

              {isProfileOpen && (
                <div className="absolute right-0 mt-3 w-60 bg-white rounded-xl shadow-xl border border-gray-100 p-2 origin-top-right">
                  <div className="px-3 py-2 border-b border-gray-100 mb-1">
                    <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{t('customer')}</p>
                  </div>
                  <Link href="/customer" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors" onClick={() => setIsProfileOpen(false)}>
                    <LayoutGrid className="w-4 h-4" />
                    {t('dashboard')}
                  </Link>
                  <Link href="/customer/appointment" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors" onClick={() => setIsProfileOpen(false)}>
                    <CalendarCheck className="w-4 h-4" />
                    {t('my_appointments')}
                  </Link>
                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg mt-1 transition-colors">
                    <LogOut className="w-4 h-4" />
                    {t('sign_out')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className={`flex items-center gap-3 pl-2 lg:border-l ${isHome && !isScrolled ? 'border-cocoa/20' : 'border-gray-300'}`}>
              <Link href="/auth/login/" className="hidden md:block text-sm font-bold hover:text-goldDark whitespace-nowrap text-cocoa transition-colors">
                {t('log_in')}
              </Link>
              <Link href="/auth/register" className="hidden md:block bg-cocoa text-linen px-5 py-2 rounded-lg text-sm font-bold hover:bg-taupe transition-colors shadow-sm whitespace-nowrap">
                {t('sign_up')}
              </Link>
            </div>
          )}

          <button onClick={() => setIsMobileOpen(!isMobileOpen)} className="lg:hidden p-1 text-cocoa hover:text-goldDark transition-colors">
            {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {isMobileOpen && (
        <div className="lg:hidden bg-white/95 backdrop-blur-xl border-t border-gray-100 p-4 shadow-2xl absolute w-full h-[calc(100vh-60px)] overflow-y-auto">
          <div className="mb-4 space-y-3">
            {/* Mobile Locale Selector */}
            <div className="flex gap-2">
              {['en', 'hi', 'mr'].map((l) => (
                <button
                  key={l}
                  onClick={() => { handleLangChange(l); setIsMobileOpen(false); }}
                  className={`flex-1 py-2 rounded-lg border text-xs font-bold uppercase transition-colors ${locale === l ? 'bg-goldDark text-white border-goldDark' : 'text-cocoa border-gray-200 hover:bg-sand/30'}`}
                >
                  {l === 'en' ? 'EN' : l === 'hi' ? 'हिंदी' : 'मराठी'}
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsMobileLocationExpanded(!isMobileLocationExpanded)}
              className="w-full flex items-center justify-between bg-white border border-gold/30 p-3 rounded-xl shadow-sm text-cocoa font-bold text-sm"
            >
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-goldDark" />
                {t(`cities.${location.toLowerCase().replace(/ /g, '_')}`, { defaultValue: location })}
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform ${isMobileLocationExpanded ? 'rotate-180' : ''}`} />
            </button>

            {isMobileLocationExpanded && (
              <div className="mt-2 bg-white border border-borderSoft rounded-xl overflow-hidden">
                {CITIES_EN.map(city => (
                  <button
                    key={city}
                    onClick={() => handleLocationSelect(city)}
                    className={`w-full text-left px-4 py-3 text-sm border-b border-gray-50 last:border-0 hover:bg-sand/30 flex justify-between items-center ${location === city ? 'font-bold text-goldDark bg-sand/20' : 'text-cocoa'}`}
                  >
                    {t(`cities.${city.toLowerCase().replace(/ /g, '_')}`, { defaultValue: city })}
                    {location === city && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <nav className="space-y-1">
            {discoveryLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive(item) ? 'bg-sand text-cocoa font-bold border-l-4 border-gold' : 'text-gray-600 hover:bg-gray-50'}`}
                onClick={() => setIsMobileOpen(false)}
              >
                {item.name}
              </Link>
            ))}

            <div className="my-4 border-t border-gray-100"></div>

            <Link
              href={`/search?cat=all&loc=${encodeURIComponent(location)}`}
              onClick={() => setIsMobileOpen(false)}
              className="flex items-center justify-center gap-2 w-full bg-goldDark text-white py-2.5 rounded-xl font-bold text-sm shadow-soft mb-3 hover:bg-cocoa transition-colors"
            >
              <CalendarCheck className="w-4 h-4" />
              {t('book_now')}
            </Link>

            {mounted && !user && (
              <div className="grid grid-cols-2 gap-3">
                <Link href="/auth/login" onClick={() => setIsMobileOpen(false)} className="text-center py-2.5 border border-borderSoft rounded-xl font-bold text-sm text-cocoa">
                  {t('log_in')}
                </Link>
                <Link href="/auth/register" onClick={() => setIsMobileOpen(false)} className="text-center py-2.5 bg-cocoa text-white rounded-xl font-bold text-sm">
                  {t('sign_up')}
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

