/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Star, UserCheck } from 'lucide-react';
import axios from 'axios';
import BookingFlowInline, {
  type BookingService,
} from './BookingFlowInline';

/* =========================
   BACKEND TYPES
========================= */

type EmployeeService = {
  serviceId: string;
  name: string;
  isActive: boolean;
};

type Employee = {
  empid: string;
  name: string;
  role: string;
  experience: string | number;
  gender: string;
  isActive: boolean;
  services: EmployeeService[];
};

type SalonService = {
  serviceId: string;
  name: string;
  category?: string;
  price: string;
  duration: string;
  description?: string;
  image?: string;
  isActive?: boolean;
};

type SalonData = {
  id: string;
  name: string;
  address?: string;
  branch?: string;
  image?: string;
  rating?: number;
  services?: Record<string, SalonService>;
  slotsByDate?: Record<string, any>;
};

/* =========================
   CONSTANTS
========================= */

const LOCATION_STORAGE_KEY = 'cutpoint_location';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

/* =========================
   PAGE
========================= */

export default function SalonDetailPage() {
  const router = useRouter();
  const params = useParams();
  const salonId = params?.id as string;

  const [salon, setSalon] = useState<SalonData | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);

  /* =========================
      FETCH DATA WITH AXIOS
  ========================= */

  useEffect(() => {
    if (!salonId) return;

    const fetchSalonDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/customer/salon/details/${salonId}`);
        
        if (response.data.success) {
          const { place, employees, slotsByDate } = response.data;
          
          setSalon({
            ...place,
            slotsByDate: slotsByDate
          });
          setEmployees(employees || []);
        } else {
          setError('Salon details not found');
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Failed to load salon. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchSalonDetails();
  }, [salonId]);

  /* =========================
      DERIVED STATE
  ========================= */

  const activeServices = useMemo(() => {
    if (!salon?.services) return [];
    return Object.values(salon.services).filter((s) => s.isActive !== false);
  }, [salon]);

  const selectedServices = useMemo<BookingService[]>(() => {
    return selectedServiceIds
      .map((id) => activeServices.find((s) => s.serviceId === id))
      .filter(Boolean)
      .map((s) => ({
        serviceId: s!.serviceId,
        name: s!.name,
        price: s!.price,
        duration: s!.duration,
      }));
  }, [selectedServiceIds, activeServices]);

  const totalPrice = useMemo(() => {
    return selectedServices.reduce((sum, s) => sum + Number(s.price), 0);
  }, [selectedServices]);

  const toggleService = (serviceId: string) => {
    setSelectedServiceIds((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  /* =========================
      RENDER
  ========================= */

  if (loading) return <div className="min-h-screen bg-linen pt-24 text-center text-taupe">Loading...</div>;
  if (error || !salon) return <div className="min-h-screen bg-linen pt-24 text-center text-cocoa">{error}</div>;

  return (
    <div className="min-h-screen bg-linen pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* SALON HEADER */}
        <section className="bg-white border border-borderSoft rounded-3xl shadow-soft overflow-hidden">
          <div className="p-6">
            <button onClick={() => router.back()} className="flex items-center gap-2 text-sm font-bold text-cocoa/70 hover:text-cocoa">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <h1 className="text-3xl font-serif font-bold mt-4 text-cocoa">{salon.name}</h1>
            <p className="flex items-center gap-2 text-sm text-taupe mt-1">
              <MapPin className="w-4 h-4 text-goldDark" /> {salon.address}
            </p>
            <div className="mt-3 flex items-center gap-2">
              <span className="bg-green-600 text-white px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                5.0 <Star className="w-3 h-3 fill-current" />
              </span>
            </div>
          </div>
          {salon.image && <img src={salon.image} alt={salon.name} className="w-full h-80 object-cover" />}
        </section>

        {/* STAFF / EMPLOYEES SECTION */}
        <section className="mt-8 bg-white p-6 rounded-2xl shadow-card">
          <h2 className="text-lg font-serif font-bold mb-4 text-cocoa flex items-center gap-2">
             Our Stylists
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {employees.map((staff) => (
              <div key={staff.empid} className="min-w-[200px] bg-linen p-4 rounded-xl border border-borderSoft">
                <p className="font-bold text-cocoa">{staff.name}</p>
                <p className="text-xs text-goldDark font-semibold">{staff.role}</p>
                <p className="text-[10px] text-taupe mt-1">{staff.experience} Years Experience</p>
                <div className="mt-2 pt-2 border-t border-white/50">
                  <p className="text-[10px] font-bold text-cocoa/50 uppercase tracking-tighter">Specialties</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {staff.services.map(s => (
                      <span key={s.serviceId} className="text-[9px] bg-white px-1.5 py-0.5 rounded border border-borderSoft text-taupe">
                        {s.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SERVICES SECTION */}
        <section className="mt-8 bg-white p-6 rounded-2xl shadow-card">
          <h2 className="text-lg font-serif font-bold mb-4 text-cocoa">Services</h2>
          {activeServices.map((service) => {
            const selected = selectedServiceIds.includes(service.serviceId);
            return (
              <div key={service.serviceId} className="flex gap-4 mb-4 bg-linen p-4 rounded-xl">
                {service.image && <img src={service.image} className="w-24 h-24 object-cover rounded-lg" alt={service.name} />}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-cocoa">{service.name}</p>
                  <p className="text-xs text-taupe line-clamp-2">{service.description}</p>
                  <p className="text-xs mt-1 text-cocoa/70">{service.category} • {service.duration} min</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-goldDark">₹{service.price}</p>
                  <button
                    onClick={() => toggleService(service.serviceId)}
                    className={`mt-2 px-3 py-1 rounded-lg text-xs font-bold ${selected ? 'bg-cocoa text-white' : 'border border-borderSoft text-cocoa'}`}
                  >
                    {selected ? 'Remove' : 'Add'}
                  </button>
                </div>
              </div>
            );
          })}
        </section>

        {/* BOOKING FLOW */}
        {selectedServiceIds.length > 0 && (
          <BookingFlowInline
            venue={{ id: salon.id, name: salon.name, type: 'salon' }}
            services={selectedServices}
            totalPrice={totalPrice}
            bookedSlots={salon.slotsByDate} // This handles the movie-booking "Booked" logic
            staff={employees}
          />
        )}
      </div>
    </div>
  );
}