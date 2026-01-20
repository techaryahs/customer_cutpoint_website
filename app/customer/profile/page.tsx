'use client';

import { useEffect, useState } from 'react';
import { Pencil, Plus, Home, Briefcase } from 'lucide-react';

type Profile = {
  name: string;
  email: string;
  phone: string;
};

export default function CustomerProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("salon_token");

      console.log("🟡 TOKEN FROM LOCAL STORAGE:", token);

      const res = await fetch("http://localhost:3001/api/dashboard", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("🟢 RESPONSE STATUS:", res.status);

      const data = await res.json();
      console.log("🟢 FULL DASHBOARD RESPONSE:", data);

      console.log("🟢 PROFILE OBJECT:", data.profile);

      setProfile(data.profile);
    } catch (error) {
      console.error("🔴 FETCH PROFILE ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchProfile();
}, []);


  if (loading) {
    return (
      <section className="max-w-6xl text-center py-20 text-[#7a6a5e]">
        Loading profile…
      </section>
    );
  }

  if (!profile) {
    return (
      <section className="max-w-6xl text-center py-20">
        <p className="text-[#7a6a5e] mb-6">
          Profile information not found
        </p>
      </section>
    );
  }

  const [firstName, ...lastNameParts] = profile.name.split(' ');
  const lastName = lastNameParts.join(' ');

  return (
    <section className="max-w-6xl">
      <h1 className="text-3xl font-semibold text-[#4a3728] mb-8">
        Profile
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT: PROFILE CARD */}
        <div className="bg-white rounded-3xl border border-gray-200 p-8">
          <div className="flex justify-end">
            <button className="text-sm text-blue-600 font-medium hover:underline">
              Edit
            </button>
          </div>

          {/* Avatar */}
          <div className="flex flex-col items-center mt-4">
            <div className="relative">
              <div className="w-28 h-28 rounded-full bg-green-700 text-white flex items-center justify-center text-4xl font-bold">
                {firstName.charAt(0)}
              </div>
              <button className="absolute bottom-1 right-1 bg-white border rounded-full p-1 shadow">
                <Pencil className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            <h2 className="mt-4 text-xl font-semibold text-[#4a3728]">
              {profile.name}
            </h2>
          </div>

          {/* DETAILS */}
          <div className="mt-8 space-y-4 text-sm">
            <ProfileItem label="First name" value={firstName} />
            <ProfileItem label="Last name" value={lastName || '—'} />
            <ProfileItem
              label="Mobile number"
              value={profile.phone || '—'}
            />
            <ProfileItem
              label="Email"
              value={profile.email || '—'}
            />
            <ProfileItem label="Date of birth" value="—" />
            <ProfileItem label="Gender" value="—" />
          </div>
        </div>

        {/* RIGHT: ADDRESSES */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-200 p-8">
          <h2 className="text-xl font-semibold text-[#4a3728] mb-6">
            My addresses
          </h2>

          <div className="space-y-4">
            <AddressCard
              icon={<Home className="w-5 h-5" />}
              title="Home"
              subtitle="Add a home address"
            />

            <AddressCard
              icon={<Briefcase className="w-5 h-5" />}
              title="Work"
              subtitle="Add a work address"
            />
          </div>

          <button className="mt-6 inline-flex items-center gap-2 px-5 py-2 rounded-xl border text-sm font-semibold hover:bg-[#FAF7F4]">
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
      </div>
    </section>
  );
}

/* ---------------- COMPONENTS ---------------- */

function ProfileItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs text-[#7a6a5e]">{label}</p>
      <p className="font-medium text-[#4a3728]">
        {value}
      </p>
    </div>
  );
}

function AddressCard({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-center justify-between border rounded-2xl p-4 hover:bg-[#FAF7F4] transition">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
          {icon}
        </div>
        <div>
          <p className="font-medium text-[#4a3728]">{title}</p>
          <p className="text-sm text-[#7a6a5e]">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}
