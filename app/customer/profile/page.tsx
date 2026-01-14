'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type UserRole = 'admin' | 'employee' | 'super_admin';

type User = {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
};

const ALLOWED_ROLES: UserRole[] = ['admin', 'employee', 'super_admin'];

export default function OwnerProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const token = localStorage.getItem('salon_token');
    const rawUser = localStorage.getItem('salon_user');

    if (!token || !rawUser) {
      router.replace('/auth/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(rawUser) as User;

      if (
        !parsedUser?.uid ||
        !parsedUser?.email ||
        !ALLOWED_ROLES.includes(parsedUser.role)
      ) {
        throw new Error('Invalid user');
      }

      setUser(parsedUser);
    } catch {
      localStorage.clear();
      router.replace('/auth/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.clear();
    router.replace('/auth/login');
  };

  if (loading) {
    return (
      <section className="max-w-3xl mx-auto py-20 text-center text-[#7a6a5e]">
        Loading profile…
      </section>
    );
  }

  if (!user) return null;

  return (
    <section className="max-w-3xl mx-auto pb-24">
      <h1 className="font-serif text-3xl text-[#4a3728] mb-6">
        My Profile
      </h1>

      <div className="bg-white p-8 rounded-3xl border border-gray-100 space-y-6">
        <ProfileItem label="Name" value={user.name} />
        <ProfileItem label="Email" value={user.email} />
        <ProfileItem
          label="Role"
          value={user.role.replace('_', ' ')}
          capitalize
        />

        <button
          onClick={handleLogout}
          className="mt-6 px-6 py-2 rounded-xl bg-[#4a3728] text-white hover:opacity-90 transition"
        >
          Logout
        </button>
      </div>
    </section>
  );
}

function ProfileItem({
  label,
  value,
  capitalize = false,
}: {
  label: string;
  value: string;
  capitalize?: boolean;
}) {
  return (
    <div>
      <p className="text-sm text-[#7a6a5e]">{label}</p>
      <p
        className={`font-medium text-[#4a3728] ${
          capitalize ? 'capitalize' : ''
        }`}
      >
        {value}
      </p>
    </div>
  );
}
