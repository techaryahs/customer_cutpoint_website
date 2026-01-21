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

export default function SpaDetailPage() {
  const params = useParams();
  const spaId = params?.id as string;

  const [spa, setSpa] = useState<Venue | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);

  useEffect(() => {
    if (!spaId) return;
    const fetchSpaDetails = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE_URL}/customer/spa/details/${spaId}`);
        if (res.data.success) {
          setSpa({ ...res.data.place, slotsByDate: res.data.slotsByDate, type: 'spa' });
          setEmployees(res.data.employees || []);
        } else {
          setError('Spa details not found');
        }
      } catch (err) {
        setError('Failed to load spa. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchSpaDetails();
  }, [spaId]);

  const activeServices = useMemo(() => {
    if (!spa?.services) return [];
    const servicesArray = Array.isArray(spa.services) 
      ? spa.services 
      : Object.values(spa.services);
    return servicesArray.filter((s: VenueService) => s.isActive !== false);
  }, [spa]);

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

  if (loading) return <div className="min-h-screen bg-[#FAF9F6] pt-32 text-center text-taupe font-bold">Preparing your sanctuary...</div>;
  if (error || !spa) return <div className="min-h-screen bg-[#FAF9F6] pt-32 text-center text-cocoa font-bold">{error || 'Something went wrong'}</div>;

  return (
    <div className="min-h-screen bg-[#FAF9F6] pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6">
        <VenueHeader venue={spa} />

        <section className="mt-16">
          <h2 className="text-sm font-black uppercase tracking-[0.3em] text-goldDark/70 mb-8 ml-2">Our Therapists</h2>
          <StaffCarousel staff={employees} />
        </section>

        <section className="mt-20">
          <div className="flex items-end justify-between mb-10 ml-2">
            <div>
              <h2 className="text-sm font-black uppercase tracking-[0.3em] text-goldDark/70 mb-2">Signature Treatments</h2>
              <h3 className="text-3xl font-serif font-bold text-cocoa">Wellness Menu</h3>
            </div>
            <p className="text-xs font-bold text-taupe opacity-40">{activeServices.length} Treatments Available</p>
          </div>
          <ServiceList 
            services={activeServices} 
            selectedServiceIds={selectedServiceIds} 
            onToggleService={(id) => setSelectedServiceIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])} 
          />
        </section>

        {selectedServiceIds.length > 0 && (
          <UnifiedBookingFlow
            venue={spa}
            services={selectedServices}
            totalPrice={totalPrice}
            bookedSlots={spa.slotsByDate || {}}
            staff={employees}
          />
        )}
      </div>
    </div>
  );
}
