'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  User,
  CalendarCheck,
  Wallet,
  Heart,
  ShoppingBag,
  Settings,
} from 'lucide-react';

const menu = [
  {
    name: 'Profile',
    href: '/customer/profile',
    icon: User,
  },
  {
    name: 'Appointments',
    href: '/customer/appointment', // ✅ FIXED
    icon: CalendarCheck,
  },
  {
    name: 'Wallet',
    href: '/customer/wallet',
    icon: Wallet,
  },
  {
    name: 'Favorites',
    href: '/customer/favorites',
    icon: Heart,
  },
  {
    name: 'Orders',
    href: '/customer/orders',
    icon: ShoppingBag,
  },
  {
    name: 'Settings',
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

  return (
    <div className="min-h-screen mt-10 flex bg-[#fafafa]">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-gray-200 p-6">
        <h2 className="text-xl font-bold text-[#4a3728] mb-8">
          Aryahs Tech
        </h2>

        <nav className="space-y-1">
          {menu.map((item) => {
            const active = pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                  active
                    ? 'bg-[#4a3728] text-white'
                    : 'text-[#4a3728] hover:bg-[#FAF7F4]'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-10">{children}</main>
    </div>
  );
}
