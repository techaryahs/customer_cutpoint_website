'use client';

import { useMemo, useState, useEffect } from 'react';
import { Calendar, Clock, User, CheckCircle2, Ban } from 'lucide-react';
import axios from 'axios';

export type BookingService = {
  serviceId: string;
  name: string;
  price: string;
  duration: string;
};

type Props = {
  venue: { id: string; name: string; type: 'salon' | 'spa'; timings?: any };
  services: BookingService[];
  totalPrice: number;
  staff: any[];
  bookedSlots: Record<string, any[]>; // e.g. {"2026-01-19": [{startTime: "10:30", duration: 60, employeeId: "emp1"}]}
};

export default function BookingFlowInline({ venue, services, totalPrice, staff, bookedSlots }: Props) {
  const [selectedDateISO, setSelectedDateISO] = useState(new Date().toISOString().split('T')[0]);
  const [selectedStaffId, setSelectedStaffId] = useState<string | 'any'>('any');
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auth States
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);

  // 1. Initialize Auth Data from LocalStorage
  useEffect(() => {
    const userData = localStorage.getItem('salon_user');
    const tokenData = localStorage.getItem('salon_token');
    
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        setCustomerId(parsed.uid);
      } catch (e) {
        console.error("Failed to parse salonuser", e);
      }
    }
    if (tokenData) {
      setAuthToken(tokenData);
    }
  }, []);

  // 2. Helper: Time Calculations
  const totalNeededMinutes = useMemo(() => 
    services.reduce((acc, s) => acc + parseInt(s.duration || '0'), 0)
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

  // 3. Generate Dynamic Slots with Service-Based Intervals & Booked Visibility
  const timeSlots = useMemo(() => {
    const dayName = new Date(selectedDateISO).toLocaleDateString('en-US', { weekday: 'long' });
    const todayTiming = venue.timings?.[dayName] || { open: "10:00", close: "20:00", isOpen: true };

    if (!todayTiming.isOpen) return [];

    const startMins = timeToMins(todayTiming.open);
    const endMins = timeToMins(todayTiming.close);
    const slots: { time: string; status: 'available' | 'booked' | 'mismatch' }[] = [];

    // Date Conversion: YYYY-MM-DD -> DD-MM-YYYY (for DB lookup)
    const [year, month, day] = selectedDateISO.split('-');
    const selectedDateDMY = `${day}-${month}-${year}`;

    // Access bookings from the correct structure { date, totalBookings, bookings }
    const daysData = bookedSlots[selectedDateDMY];
    const daysBookings = Array.isArray(daysData) ? daysData : (daysData?.bookings || []);

    // Sort bookings to process chronologically
    const sortedBookings = [...daysBookings].sort((a, b) => timeToMins(a.startTime) - timeToMins(b.startTime));

    let current = startMins;

    while (current < endMins) {
      const windowStart = current;
      const windowEnd = current + totalNeededMinutes;

      // Check if current time falls within ANY booking for the selected staff
      const activeBooking = sortedBookings.find(b => {
        if (selectedStaffId !== 'any' && b.employeeId !== selectedStaffId) return false;
        const bStart = timeToMins(b.startTime);
        const bDuration = parseInt(b.duration || '30'); // Default to 30 if duration missing
        const bEnd = bStart + bDuration;
        return (windowStart >= bStart && windowStart < bEnd);
      });

      if (activeBooking) {
        // This time is booked. Add a booked slot.
        slots.push({ time: minsToTime(windowStart), status: 'booked' });
        // To "show all slots booked under that period", we increment by 15 mins
        current += 15;
      } else {
        // This time is free. Check if we can fit the service here.
        if (windowEnd <= endMins) {
          // Check if it overlaps with the NEXT booking
          const nextBooking = sortedBookings.find(b => {
            if (selectedStaffId !== 'any' && b.employeeId !== selectedStaffId) return false;
            const bStart = timeToMins(b.startTime);
            return bStart >= windowStart && bStart < windowEnd;
          });

          if (!nextBooking) {
            // No overlap, this is an available slot!
            slots.push({ time: minsToTime(windowStart), status: 'available' });
            current += totalNeededMinutes; // Move by service duration
          } else {
            // Gap is too small for the service. Jump to the start of the next booking.
            current = timeToMins(nextBooking.startTime);
          }
        } else {
          // Can't fit before closing
          break;
        }
      }

      // Safety break
      if (current <= windowStart && !activeBooking) current += 15;
    }

    // Filter past times for today
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
  }, [selectedDateISO, selectedStaffId, totalNeededMinutes, bookedSlots, venue, staff, services]);
  console.log(selectedSlot,customerId,authToken)
  // 4. Handle Final Booking
  const handleBooking = async () => {
    if (!selectedSlot || !customerId || !authToken) {
      alert("Please login to proceed with the booking.");
      return;
    }
 
    setIsSubmitting(true);

    try {
      let finalEmpId = selectedStaffId;

      // Logic for "Any Professional" - Select random from capable & free staff
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
        
        // Pick Random
        const randomIdx = Math.floor(Math.random() * eligibleStaff.length);
        finalEmpId = eligibleStaff[randomIdx].empid;
      }

      const payload = {
        type: venue.type,
        salonId: venue.id,
        customerId: customerId,
        employeeId: finalEmpId,
        services: services.map(s => ({
          serviceId: s.serviceId,
          price: parseInt(s.price),
          duration: parseInt(s.duration)
        })),
        date: selectedDateISO.split('-').reverse().join('-'), // YYYY-MM-DD -> DD-MM-YYYY
        startTime: selectedSlot,
        paymentId: "PAY-" + Math.random().toString(36).substring(7).toUpperCase()
      };

      await axios.post(`http://localhost:3001/api/customer/appointments/book`, payload, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      alert("Appointment successfully booked!");
      window.location.reload(); 
    } catch (err: any) {
      alert(err.response?.data?.message || "Booking failed. Slot might be unavailable.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-8 bg-white border border-borderSoft rounded-3xl p-8 shadow-card">
      <h2 className="text-2xl font-serif font-bold text-cocoa mb-6">Complete Your Booking</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="space-y-8">
          {/* 1. Select Date */}
          <div>
            <label className="text-[10px] font-bold text-taupe uppercase tracking-widest block mb-4">1. Select Date</label>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {[...Array(7)].map((_, i) => {
                const d = new Date(); d.setDate(d.getDate() + i);
                const iso = d.toISOString().split('T')[0];
                const active = selectedDateISO === iso;
                return (
                  <button key={iso} onClick={() => { setSelectedDateISO(iso); setSelectedSlot(null); }}
                    className={`flex-shrink-0 w-16 h-20 rounded-2xl border flex flex-col items-center justify-center transition-all ${active ? 'bg-goldDark text-white border-goldDark shadow-lg' : 'bg-linen border-borderSoft text-cocoa'}`}>
                    <span className="text-[10px] font-bold uppercase">{d.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                    <span className="text-xl font-bold">{d.getDate()}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Select Specialist */}
          <div>
            <label className="text-[10px] font-bold text-taupe uppercase tracking-widest block mb-4">2. Select Specialist</label>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => { setSelectedStaffId('any'); setSelectedSlot(null); }}
                className={`p-4 rounded-2xl border text-sm font-bold transition-all ${selectedStaffId === 'any' ? 'border-goldDark bg-sand/20 text-cocoa' : 'border-borderSoft bg-white text-taupe'}`}>
                Any Professional
              </button>
              {staff.map(emp => (
                <button key={emp.empid} onClick={() => { setSelectedStaffId(emp.empid); setSelectedSlot(null); }}
                  className={`p-4 rounded-2xl border text-sm font-bold transition-all ${selectedStaffId === emp.empid ? 'border-goldDark bg-sand/20 text-cocoa' : 'border-borderSoft bg-white text-taupe'}`}>
                  {emp.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Time Grid */}
        <div>
          <label className="text-[10px] font-bold text-taupe uppercase tracking-widest block mb-4">3. Select Time ({totalNeededMinutes} mins)</label>
          <div className="grid grid-cols-3 gap-3">
            {timeSlots.map(slot => {
              const isBooked = slot.status === 'booked' || slot.status === 'mismatch';
              const isSelected = selectedSlot === slot.time;
              return (
                <button 
                  key={slot.time} 
                  disabled={isBooked} 
                  onClick={() => setSelectedSlot(slot.time)}
                  className={`relative py-4 rounded-2xl text-sm font-bold border transition-all ${
                    slot.status === 'booked' ? 'bg-gray-400 border-transparent text-white/50 cursor-not-allowed' :
                    slot.status === 'mismatch' ? 'bg-linen border-transparent text-taupe/20 cursor-not-allowed' : 
                    isSelected ? 'bg-cocoa text-white border-cocoa shadow-md' : 'bg-white border-borderSoft text-cocoa hover:border-goldDark'
                  }`}
                >
                  {slot.time}
                  {isBooked && (
                    <div className="absolute inset-0 flex items-center justify-center">
                       {slot.status === 'mismatch' ? <Ban className="w-4 h-4 text-red-500/10" /> : <Clock className="w-4 h-4 text-white/20" />}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          <div className="mt-6 flex justify-center gap-4 text-[10px] font-bold uppercase text-taupe/50">
             <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-400/30"/> Booked</span>
             <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-borderSoft"/> Available</span>
          </div>
        </div>
      </div>

      {/* Summary & Confirm */}
      {selectedSlot && (
        <div className="mt-10 p-8 bg-linen rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-6 border border-borderSoft">
          <div>
            <p className="text-xs font-bold text-taupe uppercase tracking-widest">Appointment Summary</p>
            <h4 className="text-2xl font-serif font-bold text-cocoa">{selectedSlot} • {totalNeededMinutes} mins</h4>
            <p className="text-sm font-bold text-goldDark">Payable: ₹{totalPrice}</p>
          </div>
          <button onClick={handleBooking} disabled={isSubmitting}
            className="w-full md:w-auto px-12 py-5 bg-goldDark text-white rounded-2xl font-bold shadow-xl hover:brightness-110 transition-all flex items-center justify-center gap-3">
            {isSubmitting ? 'Confirming...' : 'Confirm Booking'} <CheckCircle2 className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
}