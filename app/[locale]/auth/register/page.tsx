'use client';

import { useState } from 'react';
import { Link, useRouter } from '@/app/routing';
import { useTranslations, useLocale } from 'next-intl';
import axios from 'axios';

export default function RegisterCustomer() {
  const router = useRouter();
  const t = useTranslations('Register');
  const locale = useLocale();

  // --- STATE ---
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    mobile: '',
  });

  // --- HANDLERS ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError(t('error_password_match'));
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/auth/register`,
        {
          name: formData.fullName,
          email: formData.email,
          password: formData.password,
          phone: formData.mobile, // backend expects `phone`
          role: 'customer',
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const data = res.data;
      if (!data) throw new Error(t('error_failed'));

      if (data.requiresOtp) {
        // Redirect to OTP verification
        router.push(`/auth/otp-verify?uid=${data.uid}&role=customer`);
        return;
      }

      // Save Data
      localStorage.setItem('salon_token', data.token);
      localStorage.setItem('salon_user', JSON.stringify(data.user));

      // 🔥 SAVE COOKIE (AUTH STATE)
      document.cookie = `salon_token=${data.token}; path=/; max-age=604800`;

      window.dispatchEvent(new Event('auth-change'));

      // ✅ FULL RELOAD TO SYNC EVERYTHING
      window.location.href = locale === 'en' ? '/' : `/${locale}`;
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.message || err.message || t('error_failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-linen">
      {/* LEFT SIDE: Visuals (Lifestyle Image) */}
      <div className="hidden lg:block w-1/2 relative">
        <div className="absolute inset-0 bg-hero-overlay z-10" />
        <img
          src="https://images.unsplash.com/photo-1522337660859-02fbefca4702?q=80&w=1974&auto=format&fit=crop"
          alt="Lifestyle"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 z-20 flex flex-col justify-center px-16">
          <h2 className="text-4xl font-serif text-cocoa mb-6">
            {t.rich('hero_title', {
              gold: (chunks) => <span className="text-goldDark">{chunks}</span>
            })}
          </h2>
          <p className="text-taupe text-lg max-w-md">
            {t('hero_subtitle')}
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-serif text-cocoa font-bold">{t('title')}</h1>
            <p className="text-taupe mt-2">{t('desc')}</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center border border-red-200 animate-in fade-in">
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleRegister}>
            <InputGroup
              label={t('full_name')}
              placeholder={t('full_name_placeholder')}
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              autoComplete="name"
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputGroup
                label={t('phone')}
                placeholder={t('phone_placeholder')}
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                autoComplete="tel"
                required
              />
              <InputGroup
                label={t('email')}
                placeholder={t('email_placeholder')}
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputGroup
                label={t('password')}
                placeholder={t('password_placeholder')}
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
                required
              />
              <InputGroup
                label={t('confirm_password')}
                placeholder={t('password_placeholder')}
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-cocoa text-sand py-3.5 rounded-xl font-medium hover:bg-taupe transition-all shadow-soft mt-6 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? t('creating') : t('sign_up')}
            </button>
          </form>

          <p className="text-center text-sm text-taupe">
            {t('already_have_account')}{' '}
            <Link href="/auth/login" className="text-goldDark hover:underline font-medium">
              {t('log_in')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// Reuse InputGroup Component Here...
function InputGroup({
  label,
  required,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-cocoa uppercase tracking-wider flex gap-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        {...props}
        required={required}
        className="w-full bg-white border border-borderSoft px-4 py-3 rounded-xl text-cocoa placeholder:text-taupe/50 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all"
      />
    </div>
  );
}
