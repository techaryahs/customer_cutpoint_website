/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { useTranslations } from 'next-intl';

import VenueHeader from '@/components/shared/VenueHeader';
import ServiceList from '@/components/shared/ServiceList';
import StaffCarousel from '@/components/shared/StaffCarousel';
import UnifiedBookingFlow from '@/components/shared/UnifiedBookingFlow';
import { Venue, Employee, BookingService, VenueService } from '@/types/venue';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function SalonDetailPage() {
  const params = useParams();
  const salonId = params?.id as string;
  const t = useTranslations('Detail');

  const [salon, setSalon] = useState<Venue | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [offers, setOffers] = useState<any[]>([]);

  useEffect(() => {
    if (!salonId) return;
    const fetchSalonDetails = async () => {
      try {
        setLoading(true);
        const [detailsRes, offersRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/customer/salon/details/${salonId}`),
          axios.get(`${API_BASE_URL}/offers/salon/${salonId}`)
        ]);
        
        if (detailsRes.data.success) {
          setSalon({ ...detailsRes.data.place, slotsByDate: detailsRes.data.slotsByDate, type: 'salon' });
          setEmployees(detailsRes.data.employees || []);
        } else {
          setError(t('error_not_found'));
        }
        
        // Store offers (only approved ones will be returned by backend for customers)
        setOffers(offersRes.data || []);
      } catch (err) {
        setError(t('error_failed'));
      } finally {
        setLoading(false);
      }
    };
    fetchSalonDetails();
  }, [salonId, t]);

  // Get active offers that are valid today
  const activeOffers = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return offers.filter(offer => 
      offer.status === 'approved' && 
      offer.validFrom <= today && 
      offer.validUntil >= today
    );
  }, [offers]);

  const activeServices = useMemo(() => {
    if (!salon?.services) return [];
    const servicesArray = Array.isArray(salon.services) 
      ? salon.services 
      : Object.values(salon.services);
    
    // Merge discount info from active offers into services
    return servicesArray
      .filter((s: VenueService) => s.isActive !== false)
      .map((service: VenueService) => {
        // Find if there's an offer for this service (or for "all" services)
        const matchingOffer = activeOffers.find(offer => 
          offer.serviceId === service.serviceId || offer.serviceId === 'all'
        );
        
        if (matchingOffer) {
          const originalPrice = Number(service.price);
          const discountPercent = Number(matchingOffer.discount);
          const discountedPrice = Math.round(originalPrice * (1 - discountPercent / 100));
          
          return {
            ...service,
            hasDiscount: true,
            discountPercent,
            discountedPrice
          };
        }
        
        return service;
      });
  }, [salon, activeOffers]);

  const selectedServices = useMemo<BookingService[]>(() => {
    return selectedServiceIds
      .map((id) => activeServices.find((s) => s.serviceId === id))
      .filter(Boolean)
      .map((s) => ({
        serviceId: s!.serviceId,
        name: s!.name,
        // Use discounted price if available
        price: s!.hasDiscount ? s!.discountedPrice! : s!.price,
        duration: s!.duration,
      }));
  }, [selectedServiceIds, activeServices]);

  const totalPrice = useMemo(() => 
    selectedServices.reduce((sum, s) => sum + Number(s.price), 0), 
  [selectedServices]);

  if (loading) return <div className="min-h-screen bg-[#FAF9F6] pt-32 text-center text-taupe font-bold">{t('loading')}</div>;
  if (error || !salon) return <div className="min-h-screen bg-[#FAF9F6] pt-32 text-center text-cocoa font-bold">{error || t('error_generic')}</div>;

  return (
    <div className="min-h-screen bg-[#FAF9F6] pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-6">
        <VenueHeader venue={salon} />

        <section className="mt-16">
          <h2 className="text-sm font-black uppercase tracking-[0.3em] text-goldDark/70 mb-8 ml-2">{t('available_experts')}</h2>
          <StaffCarousel staff={employees} />
        </section>

        <section className="mt-20">
          <div className="flex items-end justify-between mb-10 ml-2">
            <div>
              <h2 className="text-sm font-black uppercase tracking-[0.3em] text-goldDark/70 mb-2">{t('curated_services')}</h2>
              <h3 className="text-3xl font-serif font-bold text-cocoa">{t('menu_pricing')}</h3>
            </div>
            <p className="text-xs font-bold text-taupe opacity-40">{t('options_available', { count: activeServices.length })}</p>
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
