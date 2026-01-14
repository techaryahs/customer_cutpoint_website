'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
   import axios from 'axios';
export default function RegisterCustomer() {
  const router = useRouter();
  
  // --- STATE ---
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
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

    try {
   

const res = await axios.post(
  'http://localhost:3001/api/auth/register',
  {
    name: formData.fullName,
    email: formData.email,
    password: formData.password,
    phone: formData.mobile,   // ✅ backend expects `phone`
    role: 'customer',
  },
  {
    headers: {
      'Content-Type': 'application/json',
    },
  }
);


      const data = await res.data;
      if (!res) throw new Error(data.message || "Register failed");

      // Save Data
      localStorage.setItem("salon_token", data.token);
      localStorage.setItem("salon_user", JSON.stringify(data.user));
      window.dispatchEvent(new Event("storage"));

      // Redirect Customer
      router.replace("/customer/bookings");

    } catch (err: any) {
      setError(err.message || "Something went wrong");
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
            Beauty, <span className="text-goldDark">Simplified.</span>
          </h2>
          <p className="text-taupe text-lg max-w-md">
            Join our exclusive community for priority bookings, personalized trends, and loyalty rewards.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md space-y-8">
          
          <div className="text-center">
            <h1 className="text-3xl font-serif text-cocoa font-bold">Join CutPoint</h1>
            <p className="text-taupe mt-2">Create your customer account</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center border border-red-200 animate-in fade-in">
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleRegister}>
            
            <InputGroup 
              label="Full Name" 
              placeholder="Jane Doe" 
              type="text" 
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              autoComplete="name"
              required 
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <InputGroup 
                label="Mobile Number" 
                placeholder="+91 98765..." 
                type="tel" 
                name="mobile" 
                value={formData.mobile}
                onChange={handleChange}
                autoComplete="tel" 
                required 
              />
              <InputGroup 
                label="Email Address" 
                placeholder="you@example.com" 
                type="email" 
                name="email" 
                value={formData.email}
                onChange={handleChange}
                autoComplete="email" 
                required 
              />
            </div>

            <InputGroup 
              label="Password" 
              placeholder="••••••••" 
              type="password" 
              name="password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password" 
              required 
            />

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-cocoa text-sand py-3.5 rounded-xl font-medium hover:bg-taupe transition-all shadow-soft mt-6 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </button>
          </form>

          <p className="text-center text-sm text-taupe">
            Are you a business owner? <Link href="/auth/register/owner" className="text-goldDark hover:underline font-medium">Partner with us</Link>
          </p>
          <p className="text-center text-sm text-taupe -mt-2">
            Already have an account? <Link href="/auth/login" className="text-goldDark hover:underline font-medium">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// Reuse InputGroup Component Here...
function InputGroup({ label, required, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
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