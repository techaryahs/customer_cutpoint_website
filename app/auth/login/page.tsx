'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginCustomer() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ✅ CHECK EXISTING CUSTOMER SESSION (CLIENT SIDE ONLY)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const raw = localStorage.getItem('salon_user');
      if (!raw) return;

      const user = JSON.parse(raw);

      if (user?.role === 'customer') {
        router.replace('/');
      }
    } catch {
      localStorage.clear();
    }
  }, [router]);

  // ✅ LOGIN HANDLER
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Email and password are required');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        'http://localhost:3001/api/auth/login',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            password,
            role: 'customer',
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || 'Login failed');
      }

      // 🔒 DEFENSIVE RESPONSE CHECK
      if (!data.token || !data.user) {
        throw new Error('Invalid server response');
      }

      // 🔒 CUSTOMER-ONLY ACCESS
      if (data.user.role !== 'customer') {
        throw new Error(
          'This account is not a Customer account. Please use the Partner App.'
        );
      }

      // ✅ SAVE AUTH DATA (UI STATE)
      localStorage.setItem('salon_token', data.token);
      localStorage.setItem('salon_user', JSON.stringify(data.user));

      // 🔥 SAVE COOKIE (AUTH STATE – REQUIRED FOR REFRESH & MIDDLEWARE)
      document.cookie = `salon_token=${data.token}; path=/; max-age=604800`;

      // ✅ SYNC HEADER / APP STATE
      window.dispatchEvent(new Event('auth-change'));

      // ✅ REDIRECT TO CUSTOMER HOME
      router.replace('/');
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-linen">
      {/* LEFT IMAGE */}
      <div className="hidden lg:block w-1/2 relative">
        <div className="absolute inset-0 bg-hero-overlay z-10" />
        <img
          src="https://images.unsplash.com/photo-1522337660859-02fbefca4702?q=80&w=1974&auto=format&fit=crop"
          alt="Lifestyle"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 z-20 flex flex-col justify-center px-16">
          <h2 className="text-4xl font-serif text-cocoa mb-6">
            Your Beauty <span className="text-goldDark">Journey</span>
          </h2>
        </div>
      </div>

      {/* FORM */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-serif text-cocoa font-bold">
              Customer Login
            </h1>
            <p className="text-taupe mt-2">Welcome to CutPoint</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center border border-red-200">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleLogin}>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-cocoa uppercase tracking-wider">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="email@example.com"
                className="w-full bg-white border border-borderSoft px-4 py-3 rounded-xl text-cocoa focus:outline-none focus:border-gold focus:ring-1"
              />
            </div>

            <div className="space-y-1.5 relative">
              <label className="text-xs font-semibold text-cocoa uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-white border border-borderSoft px-4 py-3 rounded-xl text-cocoa focus:outline-none focus:border-gold focus:ring-1"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-taupe hover:text-cocoa text-sm"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-cocoa text-sand py-3 rounded-xl font-medium hover:bg-goldDark transition-colors shadow-soft disabled:opacity-70"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-taupe">
            New here?{' '}
            <Link
              href="/auth/register/customer"
              className="text-goldDark hover:underline font-bold"
            >
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
