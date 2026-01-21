'use client';

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Calendar, 
  Clock, 
  Clock3, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  ChevronRight, 
  MapPin, 
  User,
  Scissors
} from "lucide-react";

// --- Types ---
type Booking = {
  appointmentId: string;
  type: "salon" | "spa";
  placeId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  totalAmount: number;
  totalDuration: number;
  paymentStatus: string;
  place: { id: string; name: string; address: string; };
  employee: { employeeId: string; name: string; phone: string; };
  services: { serviceId: string; name: string; image?: string; }[];
};

type TabType = 'today' | 'upcoming' | 'previous';

export default function AppointmentsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState<TabType>('today');

  const [showCancelModal, setShowCancelModal] = useState<Booking | null>(null);
  const [showRescheduleModal, setShowRescheduleModal] = useState<Booking | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState(new Date().toISOString().split('T')[0]);
  const [venue, setVenue] = useState<any>(null);
  const [bookedSlots, setBookedSlots] = useState<Record<string, any>>({});
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const token = localStorage.getItem("salon_token");
        const rawUser = localStorage.getItem("salon_user");

        if (!rawUser || !token) {
          setLoading(false);
          return;
        }

        const user = JSON.parse(rawUser);
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/customer/appointments/${user.uid}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setBookings(res.data.appointments || []);
      } catch (error) {
        console.error("Failed to fetch appointments", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  // --- Helpers ---
  const getApptStatus = (appt: Booking) => {
    const now = new Date();

    // Robust Date Parsing: Handle both DD-MM-YYYY and YYYY-MM-DD
    let day, month, year;
    const parts = appt.date.split("-");
    if (parts[0].length === 4) {
      [year, month, day] = parts;
    } else {
      [day, month, year] = parts;
    }

    const [hour, minute] = appt.startTime.split(":");
    const apptDate = new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute));

    if (appt.status === 'cancelled') return 'cancelled';
    if (appt.status === 'completed') return 'previous';

    // If the appointment time has already passed
    if (apptDate < now) return 'previous';

    const isToday = apptDate.toDateString() === now.toDateString();
    if (isToday) return 'today';
    return 'upcoming';
  };

  const isActionable = (appt: Booking) => {
    if (appt.status !== 'booked') return false;
    const now = new Date();

    let day, month, year;
    const parts = appt.date.split("-");
    if (parts[0].length === 4) {
      [year, month, day] = parts;
    } else {
      [day, month, year] = parts;
    }

    const [hour, minute] = appt.startTime.split(":");
    const apptDate = new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute));

    const diffMs = apptDate.getTime() - now.getTime();
    const diffMins = diffMs / (1000 * 60);
    return diffMins > 60; // 1 hour rule
  };

  // --- Filtering & Tabs ---
  const filteredBookings = useMemo(() => {
    const query = searchTerm.toLowerCase();
    const list = bookings.filter(b =>
      b.place?.name?.toLowerCase().includes(query) ||
      b.services?.some(s => s.name?.toLowerCase().includes(query))
    );

    return list.filter(b => {
      const status = getApptStatus(b);
      if (selectedTab === 'today') return status === 'today';
      if (selectedTab === 'upcoming') return status === 'upcoming';
      if (selectedTab === 'previous') return status === 'previous' || b.status === 'cancelled';
      return true;
    });
  }, [bookings, searchTerm, selectedTab]);

  const handleCancelConfirm = async () => {
    if (!showCancelModal) return;
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("salon_token");
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/customer/${showCancelModal.type}/${showCancelModal.place.id}/appointments/${showCancelModal.appointmentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBookings(prev => prev.filter(b => b.appointmentId !== showCancelModal.appointmentId));
      setShowCancelModal(null);
    } catch (err: any) {
      console.error("Cancel error", err);
      alert(err.response?.data?.error || "Failed to cancel booking. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Rescheduling Slot Helpers (from BookingFlowInline) ---
  const timeToMins = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };

  const minsToTime = (m: number) => {
    const h = Math.floor(m / 60);
    const mm = m % 60;
    return `${h.toString().padStart(2, '0')}:${mm.toString().padStart(2, '0')}`;
  };

  const fetchAvailableSlots = async (date: string, appt: Booking) => {
    setIsLoadingSlots(true);
    try {
      const token = localStorage.getItem("salon_token");
      
      // 1. Fetch Venue Details (for Timings) if not already present
      if (!venue || venue.id !== appt.place.id) {
        const vRes = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/customer/${appt.type}/details/${appt.place.id}`
        );
        setVenue(vRes.data.place);
      }

      // 2. Fetch Booked Slots for that date
      const sRes = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/customer/customer/slots/${appt.type}/${appt.place.id}?date=${date}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update bookedSlots record
      const [y, m, d] = date.split('-');
      const dateDMY = `${d}-${m}-${y}`;
      setBookedSlots(prev => ({
        ...prev,
        [dateDMY]: sRes.data.slots || []
      }));

    } catch (err) {
      console.error("Fetch slots error", err);
    } finally {
      setIsLoadingSlots(false);
    }
  };

  const rescheduleSlots = useMemo(() => {
    if (!showRescheduleModal || !venue) return [];

    const dayName = new Date(rescheduleDate).toLocaleDateString('en-US', { weekday: 'long' });
    const todayTiming = venue.timings?.[dayName] || { open: "10:00", close: "20:00", isOpen: true };

    if (!todayTiming.isOpen) return [];

    const startMins = timeToMins(todayTiming.open);
    const endMins = timeToMins(todayTiming.close);
    const totalNeededMinutes = showRescheduleModal.totalDuration;
    const slots: string[] = [];

    const [year, month, day] = rescheduleDate.split('-');
    const selectedDateDMY = `${day}-${month}-${year}`;

    const daysBookings = bookedSlots[selectedDateDMY] || [];
    
    // Sort bookings for this employee
    const sortedBookings = [...daysBookings]
      .filter(b => b.employeeId === showRescheduleModal.employee.employeeId)
      .sort((a, b) => timeToMins(a.startTime) - timeToMins(b.startTime));

    let current = startMins;

    while (current < endMins) {
      const windowStart = current;
      const windowEnd = current + totalNeededMinutes;

      const activeBooking = sortedBookings.find(b => {
        const bStart = timeToMins(b.startTime);
        const bDuration = parseInt(b.duration || '30');
        const bEnd = bStart + bDuration;
        return (windowStart >= bStart && windowStart < bEnd);
      });

      if (activeBooking) {
        current += 15;
      } else {
        if (windowEnd <= endMins) {
          const nextBooking = sortedBookings.find(b => {
            const bStart = timeToMins(b.startTime);
            return bStart >= windowStart && bStart < windowEnd;
          });

          if (!nextBooking) {
            slots.push(minsToTime(windowStart));
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

    // Filter past times for today
    const now = new Date();
    const isToday = new Date(rescheduleDate).toDateString() === now.toDateString();
    if (isToday) {
      const nowMins = now.getHours() * 60 + now.getMinutes();
      return slots.filter(s => timeToMins(s) > nowMins + 15);
    }

    return slots;
  }, [rescheduleDate, showRescheduleModal, venue, bookedSlots]);

  const handleRescheduleSubmit = async () => {
    if (!showRescheduleModal || !selectedSlot) return;

    // Format date from YYYY-MM-DD to DD-MM-YYYY for backend
    const [y, m, d] = rescheduleDate.split("-");
    const formattedDate = `${d}-${m}-${y}`;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("salon_token");
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/customer/appointments/reschedule`,
        {
          type: showRescheduleModal.type,
          placeId: showRescheduleModal.place.id,
          appointmentId: showRescheduleModal.appointmentId,
          newDate: formattedDate,
          newStartTime: selectedSlot
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local state
      setBookings(prev => prev.map(b =>
        b.appointmentId === showRescheduleModal.appointmentId
          ? { ...b, date: formattedDate, startTime: selectedSlot }
          : b
      ));

      setShowRescheduleModal(null);
      setSelectedSlot(null);
      alert("Appointment rescheduled successfully!");
    } catch (err: any) {
      console.error("Reschedule error", err);
      alert(err.response?.data?.error || "Failed to reschedule. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-8 h-8 border-2 border-goldDark border-t-transparent rounded-full mb-3"
        />
        <p className="text-taupe text-sm font-medium">Loading your schedule...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent pb-24">
      {/* HEADER AREA */}
      <div className="max-w-6xl mx-auto px-4 pt-10 pb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="space-y-1">
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-cocoa tracking-tight">My Sessions</h1>
            <p className="text-taupe text-sm font-medium opacity-70">
              You have <span className="text-goldDark font-bold">{bookings.filter(b => b.status === 'booked').length}</span> active bookings in your history.
            </p>
          </div>
          <Link
            href="/search"
            className="bg-cocoa text-white px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-goldDark transition-all shadow-xl shadow-cocoa/10 flex items-center gap-2 w-fit"
          >
            <span>+</span> Book New Experience
          </Link>
        </div>

        {/* CONTROLS AREA (Tabs & Search) */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-borderSoft pb-8 mb-8">
          {/* TABS */}
          <div className="flex gap-2 p-1.5 bg-linen/50 rounded-2xl w-fit">
            {(['today', 'upcoming', 'previous'] as TabType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                  selectedTab === tab
                    ? 'bg-white text-cocoa shadow-sm'
                    : 'text-taupe hover:text-cocoa'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* SEARCH */}
          <div className="relative w-full max-w-sm group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-taupe/40 group-focus-within:text-goldDark transition-colors" />
            <input
              type="text"
              placeholder="Filter by salon or service..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-borderSoft rounded-2xl py-3 pl-11 pr-4 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
            />
          </div>
        </div>

        {/* APPOINTMENTS LIST */}
        <div className="grid gap-8">
          <AnimatePresence mode="popLayout">
            {filteredBookings.length > 0 ? (
              filteredBookings.map((b) => {
                const canModify = isActionable(b);
                const isCancelled = b.status === 'cancelled';

                return (
                  <motion.div
                    key={b.appointmentId}
                    layout
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className={`group relative bg-white rounded-2xl border border-borderSoft hover:border-gold/30 hover:shadow-lg transition-all duration-500 overflow-hidden ${isCancelled ? 'opacity-60 grayscale-[0.5]' : ''}`}
                  >
                    <div className="flex flex-col md:flex-row min-h-[140px]">
                      {/* Image Frame */}
                      <div className="md:w-36 h-36 md:h-auto bg-linen relative overflow-hidden flex-shrink-0">
                        {b.services[0]?.image ? (
                          <img
                            src={b.services[0].image}
                            alt=""
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl opacity-10">✨</div>
                        )}
                        <div className="absolute top-3 left-3">
                           <span className="bg-white/95 backdrop-blur px-2 py-0.5 rounded-full text-[6px] font-black uppercase tracking-widest text-cocoa shadow-sm border border-borderSoft/50">
                             {b.type}
                           </span>
                        </div>
                      </div>

                      {/* Info Panel */}
                      <div className="flex-1 p-4 md:px-6 md:py-4 flex flex-col justify-between">
                        <div>
                          <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 mb-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`w-1 h-1 rounded-full ${b.status === 'booked' ? 'bg-green-500' : 'bg-red-400'}`} />
                                <span className="text-[8px] font-black uppercase tracking-widest text-taupe/60">{b.status}</span>
                              </div>
                              <h3 className="text-base md:text-lg font-serif font-bold text-cocoa leading-tight mb-1 truncate">
                                {b.services.map(s => s.name).join(", ")}
                              </h3>
                              <p className="text-goldDark text-[9px] font-bold flex items-center gap-1 opacity-80">
                                <MapPin className="w-2.5 h-2.5" /> {b.place.name}
                              </p>
                            </div>

                            <div className="text-left md:text-right flex items-center md:block gap-3">
                              <p className="text-xl font-serif font-bold text-cocoa tracking-tighter">₹{b.totalAmount}</p>
                              <div className={`text-[7px] font-black uppercase tracking-[0.1em] px-2 py-0.5 rounded-full inline-block ${b.paymentStatus === 'paid' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                                {b.paymentStatus}
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 grid grid-cols-2 lg:grid-cols-3 gap-4 pb-4 border-b border-borderSoft">
                            <div className="space-y-1">
                               <p className="text-[7px] text-taupe/40 uppercase font-black tracking-widest">Date & Time</p>
                               <div className="flex items-center gap-2">
                                 <Calendar className="w-3.5 h-3.5 text-goldDark opacity-50" />
                                 <div className="leading-tight">
                                   <p className="text-[11px] font-black text-cocoa">{b.date}</p>
                                   <p className="text-[9px] text-taupe font-bold uppercase tracking-tighter">{b.startTime}</p>
                                 </div>
                               </div>
                            </div>
                            <div className="space-y-1">
                               <p className="text-[7px] text-taupe/40 uppercase font-black tracking-widest">Expert</p>
                               <div className="flex items-center gap-2">
                                 <User className="w-3.5 h-3.5 text-goldDark opacity-50" />
                                 <div className="leading-tight">
                                   <p className="text-[11px] font-black text-cocoa truncate max-w-[90px]">{b.employee.name}</p>
                                   <p className="text-[9px] text-taupe font-bold uppercase tracking-tighter">{b.totalDuration}m</p>
                                 </div>
                               </div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
                          {!isCancelled && (
                            <>
                              {canModify ? (
                                <>
                                  <button
                                    onClick={() => {
                                      setShowRescheduleModal(b);
                                      const today = new Date().toISOString().split('T')[0];
                                      setRescheduleDate(today);
                                      fetchAvailableSlots(today, b);
                                      setSelectedSlot(null);
                                    }}
                                    className="px-5 py-2 bg-linen text-cocoa text-[8px] font-black uppercase tracking-widest rounded-xl border border-borderSoft hover:bg-white hover:border-gold transition-all active:scale-95"
                                  >
                                    Reschedule
                                  </button>
                                  <button
                                    onClick={() => setShowCancelModal(b)}
                                    className="px-5 py-2 bg-white text-red-500 text-[8px] font-black uppercase tracking-widest rounded-xl border border-red-50 hover:bg-red-50/50 hover:border-red-200 transition-all active:scale-95"
                                  >
                                    Cancel
                                  </button>
                                </>
                              ) : (
                                <div className="flex items-center gap-2 text-taupe/50 italic text-[9px] font-medium px-4 py-2 bg-sand/5 rounded-xl border border-borderSoft/40">
                                  <AlertCircle className="w-3 h-3 text-goldDark" />
                                  Locked (within 1h)
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-32 text-center bg-white rounded-[3.5rem] border border-borderSoft shadow-soft"
              >
                <div className="w-24 h-24 bg-linen rounded-full flex items-center justify-center mx-auto mb-8">
                  <Scissors className="w-10 h-10 text-taupe/20" />
                </div>
                <h3 className="text-2xl font-serif font-bold text-cocoa mb-3">Your schedule is empty</h3>
                <p className="text-taupe text-sm max-w-xs mx-auto mb-10 font-medium opacity-60">Looks like you haven't booked anything for this category yet. Treat yourself today!</p>
                <Link href="/search" className="bg-cocoa text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-goldDark transition-all shadow-xl shadow-cocoa/20">
                   Find a salon & Book
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* CANCEL MODAL */}
      <AnimatePresence>
        {showCancelModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isSubmitting && setShowCancelModal(null)}
              className="absolute inset-0 bg-cocoa/30 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative bg-white p-10 md:p-14 rounded-[4rem] max-w-md w-full shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] overflow-hidden border border-borderSoft"
            >
              <div className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-8">
                <XCircle className="w-12 h-12" />
              </div>
              <h2 className="text-3xl font-serif font-bold text-cocoa mb-4 text-center">Cancel Booking?</h2>
              <p className="text-taupe mb-10 text-center text-sm leading-relaxed font-medium opacity-70">
                Are you sure? You're cancelling your session at <span className="text-cocoa font-black">{showCancelModal.place.name}</span>. This time slot will be released for others.
              </p>

              <div className="flex flex-col gap-3">
                <button
                  disabled={isSubmitting}
                  onClick={handleCancelConfirm}
                  className="w-full py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] bg-red-500 text-white hover:bg-red-600 transition-all shadow-xl shadow-red-200"
                >
                  {isSubmitting ? "Processing..." : "Yes, Cancel Session"}
                </button>
                <button
                  disabled={isSubmitting}
                  onClick={() => setShowCancelModal(null)}
                  className="w-full py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] text-taupe hover:text-cocoa transition-all"
                >
                  Keep Booking
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reschedule Modal */}
      <AnimatePresence>
        {showRescheduleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRescheduleModal(null)}
              className="absolute inset-0 bg-cocoa/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white rounded-[2rem] w-full max-w-lg overflow-hidden shadow-2xl border border-borderSoft"
            >
              <div className="p-8">
                <div className="w-16 h-16 bg-linen rounded-full flex items-center justify-center mx-auto mb-6">
                  <Calendar className="w-8 h-8 text-goldDark" />
                </div>

                <h2 className="text-2xl font-serif font-bold text-cocoa text-center mb-2">Move Appointment</h2>
                <p className="text-taupe text-sm text-center mb-8 px-4">
                  Select a new date and time for your session at <span className="font-bold text-goldDark">{showRescheduleModal.place.name}</span>.
                </p>

                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-taupe/60 mb-2 block">Pick Date</label>
                    <input
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={rescheduleDate}
                      onChange={(e) => {
                        setRescheduleDate(e.target.value);
                        fetchAvailableSlots(e.target.value, showRescheduleModal);
                      }}
                      className="w-full bg-linen border border-borderSoft rounded-xl px-4 py-3 text-cocoa font-bold outline-none focus:border-gold transition-colors"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-taupe/60">Available Slots</label>
                       {isLoadingSlots && <span className="text-[10px] text-goldDark animate-pulse font-bold uppercase">Updating...</span>}
                    </div>

                    <div className="grid grid-cols-4 gap-2 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
                      {rescheduleSlots.length > 0 ? (
                        rescheduleSlots.map(slot => (
                          <button
                            key={slot}
                            onClick={() => setSelectedSlot(slot)}
                            className={`py-2 rounded-lg text-[10px] font-black transition-all border ${
                              selectedSlot === slot
                                ? 'bg-cocoa text-white border-cocoa'
                                : 'bg-white text-taupe border-borderSoft hover:border-gold'
                            }`}
                          >
                            {slot}
                          </button>
                        ))
                      ) : (
                        <div className="col-span-4 py-8 text-center bg-sand/5 rounded-xl border border-dashed border-borderSoft">
                          <p className="text-[10px] text-taupe/50 uppercase font-black">
                            {rescheduleDate ? "No slots available for this date" : "Select a date first"}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-8 space-y-3">
                  <button
                    disabled={isSubmitting || !selectedSlot}
                    onClick={handleRescheduleSubmit}
                    className="w-full bg-cocoa text-white font-black uppercase tracking-widest text-[10px] py-4 rounded-xl hover:bg-cocoaLight transition-all active:scale-95 disabled:opacity-50 disabled:grayscale"
                  >
                    {isSubmitting ? "RESCHEDULING..." : "CONFIRM NEW TIME"}
                  </button>
                  <button
                    onClick={() => setShowRescheduleModal(null)}
                    className="w-full bg-transparent text-taupe/60 font-black uppercase tracking-widest text-[10px] py-4 rounded-xl hover:text-cocoa transition-all"
                  >
                    KEEP ORIGINAL TIIME
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}