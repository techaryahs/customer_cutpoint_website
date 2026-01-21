'use memo';
'use client';

import { useMemo, useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle2, Ban } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { BookingService, Employee, VenueType } from '@/types/venue';

interface Props {
  venue: { id: string; name: string; type: VenueType; timings?: any };
  services: BookingService[];
  totalPrice: number;
  staff: Employee[];
  bookedSlots: Record<string, any>;
}

export default function UnifiedBookingFlow({ venue, services, totalPrice, staff, bookedSlots }: Props) {
  const [selectedDateISO, setSelectedDateISO] = useState(new Date().toISOString().split('T')[0]);
  const [selectedStaffId, setSelectedStaffId] = useState<string | 'any'>('any');
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [customerId, setCustomerId] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const userData = localStorage.getItem('salon_user');
    const tokenData = localStorage.getItem('salon_token');
    
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        setCustomerId(parsed.uid);
      } catch (e) {
        console.error("Failed to parse user data", e);
      }
    }
    if (tokenData) setAuthToken(tokenData);
  }, []);

  const totalNeededMinutes = useMemo(() => 
    services.reduce((acc, s) => acc + parseInt(s.duration.toString() || '0'), 0)
  , [services]);

  const timeToMins = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };

  const minsToTime = (m: number) => {
    const h = Math.floor(m / 60);
    const mm = m % 60;
    return `${h.toString().padStart(2, '0')}:${mm.toString().padStart(2, '0')}`;
  };

  const timeSlots = useMemo(() => {
    const dayName = new Date(selectedDateISO).toLocaleDateString('en-US', { weekday: 'long' });
    const todayTiming = venue.timings?.[dayName] || { open: "10:00", close: "20:00", isOpen: true };

    if (!todayTiming.isOpen) return [];

    const startMins = timeToMins(todayTiming.open);
    const endMins = timeToMins(todayTiming.close);
    const slots: { time: string; status: 'available' | 'booked' | 'mismatch' }[] = [];

    const [year, month, day] = selectedDateISO.split('-');
    const selectedDateDMY = `${day}-${month}-${year}`;

    const daysData = bookedSlots[selectedDateDMY];
    const daysBookings = Array.isArray(daysData) ? daysData : (daysData?.bookings || []);
    const sortedBookings = [...daysBookings].sort((a, b) => timeToMins(a.startTime) - timeToMins(b.startTime));

    let current = startMins;

    while (current < endMins) {
      const windowStart = current;
      const windowEnd = current + totalNeededMinutes;

      const activeBooking = sortedBookings.find(b => {
        if (selectedStaffId !== 'any' && b.employeeId !== selectedStaffId) return false;
        const bStart = timeToMins(b.startTime);
        const bDuration = parseInt(b.duration || '30');
        const bEnd = bStart + bDuration;
        return (windowStart >= bStart && windowStart < bEnd);
      });

      if (activeBooking) {
        slots.push({ time: minsToTime(windowStart), status: 'booked' });
        current += 15;
      } else {
        if (windowEnd <= endMins) {
          const nextBooking = sortedBookings.find(b => {
            if (selectedStaffId !== 'any' && b.employeeId !== selectedStaffId) return false;
            const bStart = timeToMins(b.startTime);
            return bStart >= windowStart && bStart < windowEnd;
          });

          if (!nextBooking) {
            slots.push({ time: minsToTime(windowStart), status: 'available' });
            current += totalNeededMinutes;
          } else {
            current = timeToMins(nextBooking.startTime);
          }
        } else {
          break;
        }
      }
      if (current <= windowStart && !activeBooking) current += 15;
    }

    const now = new Date();
    const isToday = new Date(selectedDateISO).toDateString() === now.toDateString();
    if (isToday) {
      const nowMins = now.getHours() * 60 + now.getMinutes();
      return slots.map(s => {
        if (timeToMins(s.time) <= nowMins + 15) return { ...s, status: 'booked' };
        return s;
      });
    }

    return slots;
  }, [selectedDateISO, selectedStaffId, totalNeededMinutes, bookedSlots, venue, services]);

  const handleBooking = async () => {
    if (!selectedSlot || !customerId || !authToken) {
      alert("Please login to proceed with the booking.");
      return;
    }

    setIsSubmitting(true);

    try {
      let finalEmpId = selectedStaffId;

      if (selectedStaffId === 'any') {
        const start = timeToMins(selectedSlot);
        const end = start + totalNeededMinutes;

        const eligibleStaff = staff.filter(emp => {
          const canDoAll = services.every(s => emp.services.some((es: any) => es.serviceId === s.serviceId));
          const isBusy = (bookedSlots[selectedDateISO] || []).some((b: any) => {
            if (b.employeeId !== emp.empid) return false;
            const bStart = timeToMins(b.startTime);
            const bEnd = bStart + parseInt(b.duration);
            return (start < bEnd && end > bStart);
          });
          return canDoAll && !isBusy;
        });

        if (eligibleStaff.length === 0) throw new Error("No staff available for this slot.");
        const randomIdx = Math.floor(Math.random() * eligibleStaff.length);
        finalEmpId = eligibleStaff[randomIdx].empid;
      }

      const payload = {
        type: venue.type,
        salonId: venue.type === 'salon' ? venue.id : undefined,
        spaId: venue.type === 'spa' ? venue.id : undefined,
        customerId: customerId,
        employeeId: finalEmpId,
        services: services.map(s => ({
          serviceId: s.serviceId,
          price: parseInt(s.price.toString()),
          duration: parseInt(s.duration.toString())
        })),
        date: selectedDateISO,
        startTime: selectedSlot,
        paymentId: "PAY-" + Math.random().toString(36).substring(7).toUpperCase()
      };

      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/customer/appointments/book`, payload, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      alert("Appointment successfully booked!");
      window.location.reload(); 
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || "Booking failed. Slot might be unavailable.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-8 bg-white border border-borderSoft rounded-[2rem] p-8 shadow-soft">
      <h2 className="text-2xl font-serif font-bold text-cocoa mb-6">Secure Your Experience</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-8">
          {/* DATE SELECTION */}
          <section>
            <label className="text-[9px] font-black text-taupe/40 uppercase tracking-[0.2em] block mb-4">01. Select Preferred Date</label>
            <div className="flex gap-3 overflow-x-auto pb-3 no-scrollbar">
              {[...Array(7)].map((_, i) => {
                const d = new Date(); d.setDate(d.getDate() + i);
                const iso = d.toISOString().split('T')[0];
                const active = selectedDateISO === iso;
                return (
                  <button 
                    key={iso} 
                    onClick={() => { setSelectedDateISO(iso); setSelectedSlot(null); }}
                    className={`flex-shrink-0 w-16 h-20 rounded-xl border flex flex-col items-center justify-center transition-all duration-300 ${
                      active 
                        ? 'bg-cocoa text-white border-cocoa shadow-lg' 
                        : 'bg-linen/30 border-borderSoft text-cocoa hover:border-gold'
                    }`}
                  >
                    <span className={`text-[9px] font-black uppercase tracking-tighter ${active ? 'opacity-60' : 'opacity-40'}`}>
                      {d.toLocaleDateString('en-US', { weekday: 'short' })}
                    </span>
                    <span className="text-xl font-black mt-1">{d.getDate()}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* STAFF SELECTION */}
          <section>
            <label className="text-[9px] font-black text-taupe/40 uppercase tracking-[0.2em] block mb-4">02. Choose Your Expert</label>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => { setSelectedStaffId('any'); setSelectedSlot(null); }}
                className={`p-4 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                  selectedStaffId === 'any' 
                    ? 'border-goldDark bg-linen text-goldDark shadow-inner' 
                    : 'border-borderSoft bg-white text-taupe hover:border-gold'
                }`}
              >
                Any Professional
              </button>
              {staff.map(emp => (
                <button 
                  key={emp.empid} 
                  onClick={() => { setSelectedStaffId(emp.empid); setSelectedSlot(null); }}
                  className={`p-4 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                    selectedStaffId === emp.empid 
                      ? 'border-goldDark bg-linen text-goldDark shadow-inner' 
                      : 'border-borderSoft bg-white text-taupe hover:border-gold'
                  }`}
                >
                  {emp.name}
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* TIME GRID */}
        <section>
          <label className="text-[9px] font-black text-taupe/40 uppercase tracking-[0.2em] block mb-4">
            03. Pick Available Time ({totalNeededMinutes} mins)
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {timeSlots.map(slot => {
              const isBooked = slot.status === 'booked' || slot.status === 'mismatch';
              const isSelected = selectedSlot === slot.time;
              return (
                <button 
                  key={slot.time} 
                  disabled={isBooked} 
                  onClick={() => setSelectedSlot(slot.time)}
                  className={`relative py-4 rounded-xl text-[11px] font-black border transition-all duration-300 ${
                    slot.status === 'booked' ? 'bg-linen/50 border-transparent text-taupe/20 cursor-not-allowed' :
                    slot.status === 'mismatch' ? 'bg-linen/20 border-transparent text-taupe/10 cursor-not-allowed' : 
                    isSelected ? 'bg-goldDark text-white border-goldDark shadow-lg' : 'bg-white border-borderSoft text-cocoa hover:border-gold/50'
                  }`}
                >
                  {slot.time}
                  {isBooked && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-10">
                       <Clock className="w-3.5 h-3.5" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          <div className="mt-6 flex items-center gap-5 text-[8px] font-black uppercase tracking-widest text-taupe/40">
             <span className="flex items-center gap-1.5">
               <div className="w-2 h-2 rounded-full bg-linen" /> Unavailable
             </span>
             <span className="flex items-center gap-1.5">
               <div className="w-2 h-2 rounded-full border border-borderSoft" /> Available
             </span>
          </div>
        </section>
      </div>

      {/* SUMMARY PANEL */}
      <AnimatePresence>
        {selectedSlot && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="mt-12 p-8 bg-cocoa text-white rounded-[2rem] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-gold opacity-5 rounded-full blur-3xl -mr-24 -mt-24" />
            <div className="z-10 text-center md:text-left">
              <p className="text-[9px] font-black text-gold uppercase tracking-[0.3em]">Confirmation Summary</p>
              <h4 className="text-2xl font-serif font-bold mt-1 whitespace-nowrap">
                {new Date(selectedDateISO).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })} • {selectedSlot}
              </h4>
              <p className="text-xs font-bold opacity-60 mt-1 uppercase tracking-widest">
                {services.length} Services • ₹{totalPrice}
              </p>
            </div>
            
            <button 
              onClick={handleBooking} 
              disabled={isSubmitting}
              className="z-10 w-full md:w-auto px-10 py-5 bg-goldDark text-white rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-white hover:text-cocoa transition-all duration-500 flex items-center justify-center gap-3 group text-[11px]"
            >
              {isSubmitting ? 'Confirming...' : 'Complete Booking'} 
              <CheckCircle2 className="w-5 h-5 transition-transform group-hover:scale-125" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
