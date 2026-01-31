'use client';

import { Link } from '@/app/routing';
import { usePathname } from 'next/navigation';
import {
  User,
  CalendarCheck,
  Wallet,
  Heart,
  ShoppingBag,
  Settings,
} from 'lucide-react';
import { motion } from "framer-motion";
import { useTranslations } from 'next-intl';

const menuItems = [
  {
    key: 'profile',
    href: '/customer/profile',
    icon: User,
  },
  {
    key: 'appointments',
    href: '/customer/appointment',
    icon: CalendarCheck,
  },
  {
    key: 'wallet',
    href: '/customer/wallet',
    icon: Wallet,
  },
  {
    key: 'favorites',
    href: '/customer/favorites',
    icon: Heart,
  },
  {
    key: 'orders',
    href: '/customer/orders',
    icon: ShoppingBag,
  },
  {
    key: 'settings',
    href: '/customer/settings',
    icon: Settings,
  },
];

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const t = useTranslations('Layout');

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] pt-[72px]">
      
      {/* PREMIUM MOBILE SUB-NAV */}
      <nav className="md:hidden sticky top-[72px] z-40 bg-white/80 backdrop-blur-md border-b border-borderSoft/50 overflow-x-auto no-scrollbar shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)]">
        <div className="flex px-6 py-4 gap-8">
          {menuItems.map((item) => {
            const active = pathname.includes(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative flex flex-col items-center gap-1.5 min-w-fit group"
              >
                <div className={`p-2 rounded-xl transition-all duration-300 ${
                  active ? 'bg-cocoa text-white shadow-lg' : 'text-taupe group-hover:bg-linen group-hover:text-cocoa'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`text-[9px] font-black uppercase tracking-[0.15em] transition-colors duration-300 ${
                  active ? 'text-cocoa' : 'text-taupe/60 group-hover:text-cocoa'
                }`}>
                  {t(`menu.${item.key}`)}
                </span>
                {active && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute -bottom-[17px] left-0 right-0 h-0.5 bg-goldDark rounded-full" 
                  />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="flex flex-1 max-w-[1600px] mx-auto w-full">
        {/* REFINED DESKTOP SIDEBAR */}
        <aside className="hidden md:flex flex-col w-72 bg-white border-r border-borderSoft/40 p-8 sticky top-[72px] h-[calc(100vh-72px)]">
          <div className="mb-12">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-goldDark/70 mb-2">{t('member_portal')}</h2>
            <h3 className="text-2xl font-serif font-bold text-cocoa tracking-tight">{t('personal_area')}</h3>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => {
              const active = pathname.includes(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 group ${
                    active
                      ? 'bg-cocoa text-white shadow-xl shadow-cocoa/10'
                      : 'text-taupe hover:bg-linen hover:text-cocoa'
                  }`}
                >
                  <Icon className={`w-4 h-4 transition-transform duration-300 group-hover:scale-110 ${active ? 'text-gold' : 'text-taupe group-hover:text-cocoa'}`} />
                  {t(`menu.${item.key}`)}
                  {active && (
                    <motion.div 
                      layoutId="sidebarActive"
                      className="ml-auto w-1 h-3 bg-gold rounded-full" 
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto px-5 py-6 bg-linen/30 rounded-[2rem] border border-borderSoft/30">
             <p className="text-[10px] font-bold text-cocoa leading-relaxed">
               {t('styling_advice')}<br/>
               <span className="text-goldDark">{t('consult_expert')}</span>
             </p>
          </div>
        </aside>

        {/* MAIN CONTENT PANEL */}
        <main className="flex-1 p-6 md:p-12">
           <div className="bg-white/50 rounded-[3rem] min-h-full">
              {children}
           </div>
        </main>
      </div>
    </div>
  );
}
