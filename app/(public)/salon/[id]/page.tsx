/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';

import VenueHeader from '@/components/shared/VenueHeader';
import ServiceList from '@/components/shared/ServiceList';
import StaffCarousel from '@/components/shared/StaffCarousel';
import UnifiedBookingFlow from '@/components/shared/UnifiedBookingFlow';
import { Venue, Employee, BookingService, VenueService } from '@/types/venue';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function SalonDetailPage() {
  const params = useParams();
  const salonId = params?.id as string;

  const [salon, setSalon] = useState<Venue | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);

  useEffect(() => {
    if (!salonId) return;
    const fetchSalonDetails = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE_URL}/customer/salon/details/${salonId}`);
        if (res.data.success) {
          setSalon({ ...res.data.place, slotsByDate: res.data.slotsByDate, type: 'salon' });
          setEmployees(res.data.employees || []);
        } else {
          setError('Salon details not found');
        }
      } catch (err) {
        setError('Failed to load salon. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchSalonDetails();
  }, [salonId]);

  const activeServices = useMemo(() => {
    if (!salon?.services) return [];
    const servicesArray = Array.isArray(salon.services) 
      ? salon.services 
      : Object.values(salon.services);
    return servicesArray.filter((s: VenueService) => s.isActive !== false);
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

  const totalPrice = useMemo(() => 
    selectedServices.reduce((sum, s) => sum + Number(s.price), 0), 
  [selectedServices]);

  if (loading) return <div className="min-h-screen bg-[#FAF9F6] pt-32 text-center text-taupe font-bold">Refining your experience...</div>;
  if (error || !salon) return <div className="min-h-screen bg-[#FAF9F6] pt-32 text-center text-cocoa font-bold">{error || 'Something went wrong'}</div>;

  return (
    <div className="min-h-screen bg-[#FAF9F6] pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6">
        <VenueHeader venue={salon} />

        <section className="mt-16">
          <h2 className="text-sm font-black uppercase tracking-[0.3em] text-goldDark/70 mb-8 ml-2">Available Experts</h2>
          <StaffCarousel staff={employees} />
        </section>

        <section className="mt-20">
          <div className="flex items-end justify-between mb-10 ml-2">
            <div>
              <h2 className="text-sm font-black uppercase tracking-[0.3em] text-goldDark/70 mb-2">Curated Services</h2>
              <h3 className="text-3xl font-serif font-bold text-cocoa">Menu & Pricing</h3>
            </div>
            <p className="text-xs font-bold text-taupe opacity-40">{activeServices.length} Options Available</p>
          </div>
          <ServiceList 
            services={activeServices} 
            selectedServiceIds={selectedServiceIds} 
            onToggleService={(id) => setSelectedServiceIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])} 
          />
        </section>

        {selectedServiceIds.length > 0 && (
          <UnifiedBookingFlow
            venue={salon}
            services={selectedServices}
            totalPrice={totalPrice}
            bookedSlots={salon.slotsByDate || {}}
            staff={employees}
          />
        )}
      </div>
    </div>
  );
}
