'use client';

import { useEffect, useState } from 'react';
import { useRouter } from '@/app/routing';
import { useTranslations } from 'next-intl';

export default function CustomerSettingsPage() {
  const router = useRouter();
  const t = useTranslations('Settings');

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  /* ---------------- FETCH PROFILE ---------------- */
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('salon_token');
        if (!token) return;

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/dashboard`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (data?.profile) {
          setProfile({
            name: data.profile.name || '',
            email: data.profile.email || '',
            phone: data.profile.phone || '',
          });
        }
      } catch (err) {
        console.error('Failed to fetch profile', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  /* ---------------- HANDLERS ---------------- */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const token = localStorage.getItem('salon_token');
      if (!token) return;

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/dashboard/profile`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(profile),
        }
      );

      if (!res.ok) {
        throw new Error(t('update_failed'));
      }

      setIsEditing(false);
    } catch (err) {
      console.error('Profile update error', err);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    document.cookie =
      'salon_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
    localStorage.clear();
    router.replace('/auth/login');
  };

  /* ---------------- UI ---------------- */
  if (loading) {
    return (
      <section className="max-w-5xl py-20 text-center text-[#7a6a5e]">
        {t('loading')}
      </section>
    );
  }

  return (
    <section className="max-w-5xl">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-3xl font-semibold text-[#4a3728]">
          {t('title')}
        </h1>

        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="px-6 py-3 rounded-xl border font-semibold hover:bg-[#FAF7F4]"
          >
            {t('edit_profile')}
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={() => setIsEditing(false)}
              className="px-6 py-3 rounded-xl border font-semibold hover:bg-[#FAF7F4]"
            >
              {t('cancel')}
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-3 rounded-xl bg-[#4a3728] text-white font-semibold hover:opacity-90 disabled:opacity-60"
            >
              {saving ? t('saving') : t('save_changes')}
            </button>
          </div>
        )}
      </div>

      {/* PROFILE INFO */}
      <div className="bg-white rounded-3xl border border-gray-200 p-8 mb-10">
        <h2 className="text-lg font-semibold text-[#4a3728] mb-6">
          {t('profile_info')}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Field
            label={t('full_name')}
            name="name"
            value={profile.name}
            onChange={handleChange}
            disabled={!isEditing}
          />

          <Field
            label={t('email_addr')}
            name="email"
            value={profile.email}
            onChange={handleChange}
            disabled={!isEditing}
          />

          <Field
            label={t('phone_num')}
            name="phone"
            value={profile.phone}
            onChange={handleChange}
            disabled={!isEditing}
          />
        </div>
      </div>

      {/* LOGOUT */}
      <div className="bg-white rounded-3xl border border-red-200 p-8">
        <h2 className="text-lg font-semibold text-red-600 mb-4">
          {t('logout_title')}
        </h2>

        <button
          onClick={handleLogout}
          className="px-6 py-3 rounded-xl bg-red-600 text-white font-semibold hover:opacity-90"
        >
          {t('logout_btn')}
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
