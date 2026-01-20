'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CustomerSettingsPage() {
  const router = useRouter();

  // ---------- STATIC STATE (for now) ----------
  const [profile, setProfile] = useState({
    name: 'Aryahs Tech',
    email: 'aryahs@example.com',
    phone: '+91 96199 01999',
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    setIsEditing(false);
    // 🔒 Later → API / Firebase update
  };

  const handleLogout = () => {
    document.cookie =
      'salon_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
    localStorage.clear();
    router.replace('/auth/login');
  };

  return (
    <section className="max-w-5xl">
      {/* PAGE HEADER */}
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-3xl font-semibold text-[#4a3728]">
          Settings
        </h1>

        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="px-6 py-3 rounded-xl border font-semibold hover:bg-[#FAF7F4]"
          >
            Edit profile
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={() => setIsEditing(false)}
              className="px-6 py-3 rounded-xl border font-semibold hover:bg-[#FAF7F4]"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-3 rounded-xl bg-[#4a3728] text-white font-semibold hover:opacity-90"
            >
              Save changes
            </button>
          </div>
        )}
      </div>

      {/* PROFILE SETTINGS */}
      <div className="bg-white rounded-3xl border border-gray-200 p-8 mb-10">
        <h2 className="text-lg font-semibold text-[#4a3728] mb-6">
          Profile information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Field
            label="Full name"
            name="name"
            value={profile.name}
            onChange={handleChange}
            disabled={!isEditing}
          />

          <Field
            label="Email address"
            name="email"
            value={profile.email}
            onChange={handleChange}
            disabled={!isEditing}
          />

          <Field
            label="Phone number"
            name="phone"
            value={profile.phone}
            onChange={handleChange}
            disabled={!isEditing}
          />
        </div>
      </div>

      {/* ACCOUNT SETTINGS */}
      <div className="bg-white rounded-3xl border border-gray-200 p-8 mb-10">
        <h2 className="text-lg font-semibold text-[#4a3728] mb-6">
          Account
        </h2>

        <div className="flex flex-col gap-4">
          <button className="text-left px-5 py-3 rounded-xl border font-semibold hover:bg-[#FAF7F4]">
            Change password
          </button>

          <button className="text-left px-5 py-3 rounded-xl border font-semibold hover:bg-[#FAF7F4]">
            Notification preferences
          </button>

          <button className="text-left px-5 py-3 rounded-xl border font-semibold hover:bg-[#FAF7F4]">
            Privacy & security
          </button>
        </div>
      </div>

      {/* LOGOUT */}
      <div className="bg-white rounded-3xl border border-red-200 p-8">
        <h2 className="text-lg font-semibold text-red-600 mb-4">
          Logout
        </h2>

        <button
          onClick={handleLogout}
          className="px-6 py-3 rounded-xl bg-red-600 text-white font-semibold hover:opacity-90"
        >
          Logout
        </button>
      </div>
    </section>
  );
}

/* ---------------- FIELD COMPONENT ---------------- */

function Field({
  label,
  name,
  value,
  onChange,
  disabled,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled: boolean;
}) {
  return (
    <div>
      <label className="block text-sm text-[#7a6a5e] mb-2">
        {label}
      </label>
      <input
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full px-4 py-3 rounded-xl border text-sm ${
          disabled
            ? 'bg-gray-50 text-gray-500'
            : 'bg-white focus:outline-none focus:ring-2 focus:ring-[#4a3728]'
        }`}
      />
    </div>
  );
}
