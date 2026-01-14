'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="max-w-6xl mt-10 mx-auto px-6 py-8">
      {/* CUSTOMER TOP NAV */}
      <nav className="flex gap-6 mb-8 border-b border-gray-200 pb-4 text-sm font-medium">
        <NavItem href="/customer" active={pathname === '/customer'}>
          Overview
        </NavItem>

        <NavItem
          href="/customer/appointments"
          active={pathname === '/customer/appointments'}
        >
          Appointments
        </NavItem>

        <NavItem
          href="/customer/profile"
          active={pathname === '/customer/profile'}
        >
          Profile
        </NavItem>
      </nav>

      {/* PAGE CONTENT */}
      <main>{children}</main>
    </div>
  );
}

function NavItem({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`px-4 py-2 rounded-lg transition ${
        active
          ? 'bg-[#4a3728] text-white'
          : 'text-[#4a3728] hover:bg-[#FAF7F4]'
      }`}
    >
      {children}
    </Link>
  );
}
