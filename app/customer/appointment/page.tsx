'use client';

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Scissors } from "lucide-react";

import AppointmentCard from "./components/AppointmentCard";
import CancelModal from "./components/CancelModal";
import RescheduleModal from "./components/RescheduleModal";
import ReviewModal from "./components/ReviewModal";

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
  isReviewed?: boolean;
  place: { id: string; name: string; address: string; phone?: string; };
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
  const [showReviewModal, setShowReviewModal] = useState<Booking | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState(new Date().toISOString().split('T')[0]);
  const [venue, setVenue] = useState<any>(null);
  const [bookedSlots, setBookedSlots] = useState<Record<string, any>>({});
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem("salon_token");
      const rawUser = localStorage.getItem("salon_user");
      if (!rawUser || !token) { setLoading(false); return; }
      const user = JSON.parse(rawUser);
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/customer/appointments/${user.uid}`, { headers: { Authorization: `Bearer ${token}` } });
      setBookings(res.data.appointments || []);
    } catch (error) { console.error("Fetch error", error); } finally { setLoading(false); }
  };

  useEffect(() => { fetchAppointments(); }, []);

  const getApptStatus = (appt: Booking) => {
    const now = new Date();
    let [d, m, y] = appt.date.split("-");
    if (d.length === 4) [y, m, d] = [d, m, y];
    const apptDate = new Date(Number(y), Number(m) - 1, Number(d), ...appt.startTime.split(":").map(Number));
    if (appt.status === 'cancelled') return 'cancelled';
    if (appt.status === 'completed' || apptDate < now) return 'previous';
    return apptDate.toDateString() === now.toDateString() ? 'today' : 'upcoming';
  };

  const filteredBookings = useMemo(() => {
    const query = searchTerm.toLowerCase();
    return bookings.filter(b => (b.place?.name?.toLowerCase().includes(query) || b.services?.some(s => s.name?.toLowerCase().includes(query))))
      .filter(b => {
        const status = getApptStatus(b);
        if (selectedTab === 'today') return status === 'today';
        if (selectedTab === 'upcoming') return status === 'upcoming';
        return status === 'previous' || b.status === 'cancelled';
      });
  }, [bookings, searchTerm, selectedTab]);

  const handleCancel = async () => {
    if (!showCancelModal) return;
    setIsSubmitting(true);
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/customer/${showCancelModal.type}/${showCancelModal.place.id}/appointments/${showCancelModal.appointmentId}`, { headers: { Authorization: `Bearer ${localStorage.getItem("salon_token")}` } });
      setBookings(prev => prev.filter(b => b.appointmentId !== showCancelModal.appointmentId));
      setShowCancelModal(null);
    } catch (err) { console.error(err); alert("Failed to cancel"); } finally { setIsSubmitting(false); }
  };

  const fetchSlots = async (date: string, appt: Booking) => {
    setIsLoadingSlots(true);
    try {
      if (!venue || venue.id !== appt.place.id) {
        const vRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/customer/${appt.type}/details/${appt.place.id}`);
        setVenue(vRes.data.place);
      }
      const sRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/customer/customer/slots/${appt.type}/${appt.place.id}?date=${date}`, { headers: { Authorization: `Bearer ${localStorage.getItem("salon_token")}` } });
      const [y, m, d] = date.split('-');
      setBookedSlots(prev => ({ ...prev, [`${d}-${m}-${y}`]: sRes.data.slots || [] }));
    } catch (err) { console.error(err); } finally { setIsLoadingSlots(false); }
  };

  const rescheduleSlots = useMemo(() => {
    if (!showRescheduleModal || !venue) return [];
    const dayName = new Date(rescheduleDate).toLocaleDateString('en-US', { weekday: 'long' });
    const timing = venue.timings?.[dayName] || { open: "10:00", close: "20:00", isOpen: true };
    if (!timing.isOpen) return [];
    const startMins = Number(timing.open.split(':')[0]) * 60 + Number(timing.open.split(':')[1]);
    const endMins = Number(timing.close.split(':')[0]) * 60 + Number(timing.close.split(':')[1]);
    const [y, m, d] = rescheduleDate.split('-');
    const dayBookings = bookedSlots[`${d}-${m}-${y}`] || [];
    const empBookings = dayBookings.filter((b: any) => b.employeeId === showRescheduleModal.employee.employeeId).sort((a: any, b: any) => (Number(a.startTime.split(':')[0]) * 60 + Number(a.startTime.split(':')[1])) - (Number(b.startTime.split(':')[0]) * 60 + Number(b.startTime.split(':')[1])));
    
    let slots = [];
    let curr = startMins;
    while (curr + showRescheduleModal.totalDuration <= endMins) {
      const b = empBookings.find((eb: any) => {
        const s = Number(eb.startTime.split(':')[0]) * 60 + Number(eb.startTime.split(':')[1]);
        return curr >= s && curr < s + Number(eb.duration || 30);
      });
      if (b) { curr += 15; continue; }
      const next = empBookings.find((eb: any) => {
        const s = Number(eb.startTime.split(':')[0]) * 60 + Number(eb.startTime.split(':')[1]);
        return s >= curr && s < curr + showRescheduleModal.totalDuration;
      });
      if (!next) { slots.push(`${Math.floor(curr/60).toString().padStart(2,'0')}:${(curr%60).toString().padStart(2,'0')}`); curr += showRescheduleModal.totalDuration; }
      else { curr = Number(next.startTime.split(':')[0]) * 60 + Number(next.startTime.split(':')[1]); }
    }
    const now = new Date();
    if (new Date(rescheduleDate).toDateString() === now.toDateString()) {
      const nowMins = now.getHours() * 60 + now.getMinutes();
      slots = slots.filter(s => (Number(s.split(':')[0]) * 60 + Number(s.split(':')[1])) > nowMins + 15);
    }
    return slots;
  }, [rescheduleDate, showRescheduleModal, venue, bookedSlots]);

  const handleReschedule = async () => {
    if (!showRescheduleModal || !selectedSlot) return;
    setIsSubmitting(true);
    try {
      const [y, m, d] = rescheduleDate.split("-");
      const formattedDate = `${d}-${m}-${y}`;
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/customer/appointments/reschedule`, { type: showRescheduleModal.type, placeId: showRescheduleModal.place.id, appointmentId: showRescheduleModal.appointmentId, newDate: formattedDate, newStartTime: selectedSlot }, { headers: { Authorization: `Bearer ${localStorage.getItem("salon_token")}` } });
      setBookings(prev => prev.map(b => b.appointmentId === showRescheduleModal.appointmentId ? { ...b, date: formattedDate, startTime: selectedSlot } : b));
      setShowRescheduleModal(null); setSelectedSlot(null);
    } catch (err) { console.error(err); alert("Failed to reschedule"); } finally { setIsSubmitting(false); }
  };

  if (loading) return <div className="flex flex-col items-center justify-center min-h-[60vh]"><motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-8 h-8 border-2 border-goldDark border-t-transparent rounded-full mb-3" /><p className="text-taupe text-sm font-medium">Loading your schedule...</p></div>;

  return (
    <div className="min-h-screen bg-transparent pb-24">
      <div className="max-w-6xl mx-auto px-4 pt-10 pb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="space-y-1"><h1 className="text-3xl md:text-4xl font-serif font-bold text-cocoa tracking-tight">My Sessions</h1><p className="text-taupe text-sm font-medium opacity-70">You have <span className="text-goldDark font-bold">{bookings.filter(b => b.status === 'booked').length}</span> active bookings.</p></div>
          <Link href="/search" className="bg-cocoa text-white px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-goldDark transition-all shadow-xl shadow-cocoa/10 flex items-center gap-2 w-fit"><span>+</span> Book New Experience</Link>
        </div>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-borderSoft pb-8 mb-8">
          <div className="flex gap-1.5 p-1 bg-linen/50 rounded-2xl w-full lg:w-fit overflow-x-auto no-scrollbar">
            {(['today', 'upcoming', 'previous'] as TabType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`flex-1 lg:flex-none px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  selectedTab === tab
                    ? 'bg-white text-cocoa shadow-sm'
                    : 'text-taupe hover:text-cocoa'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="relative w-full lg:max-w-sm group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-taupe/40 group-focus-within:text-goldDark transition-colors" />
            <input
              type="text"
              placeholder="Filter..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-borderSoft rounded-2xl py-3 pl-11 pr-4 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
            />
          </div>
        </div>
        <div className="grid gap-8"><AnimatePresence mode="popLayout">{filteredBookings.length > 0 ? filteredBookings.map((b) => (<AppointmentCard key={b.appointmentId} booking={b} status={getApptStatus(b)} canModify={b.status === 'booked' && (new Date(b.date.split('-').reverse().join('-') + 'T' + b.startTime).getTime() - Date.now()) / 60000 > 60} onReschedule={(appt) => { setShowRescheduleModal(appt); const today = new Date().toISOString().split('T')[0]; setRescheduleDate(today); fetchSlots(today, appt); setSelectedSlot(null); }} onCancel={setShowCancelModal} onReview={setShowReviewModal} />)) : (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-32 text-center bg-white rounded-[3.5rem] border border-borderSoft shadow-soft"><div className="w-24 h-24 bg-linen rounded-full flex items-center justify-center mx-auto mb-8"><Scissors className="w-10 h-10 text-taupe/20" /></div><h3 className="text-2xl font-serif font-bold text-cocoa mb-3">Your schedule is empty</h3><p className="text-taupe text-sm max-w-xs mx-auto mb-10 font-medium opacity-60">Looks like you haven't booked anything yet.</p><Link href="/search" className="bg-cocoa text-white px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-goldDark transition-all shadow-xl shadow-cocoa/20">Find a salon & Book</Link></motion.div>)}</AnimatePresence></div>
      </div>
      <CancelModal isOpen={!!showCancelModal} onClose={() => setShowCancelModal(null)} onConfirm={handleCancel} isSubmitting={isSubmitting} placeName={showCancelModal?.place.name || ""} />
      <RescheduleModal isOpen={!!showRescheduleModal} onClose={() => setShowRescheduleModal(null)} onConfirm={handleReschedule} isSubmitting={isSubmitting} placeName={showRescheduleModal?.place.name || ""} rescheduleDate={rescheduleDate} setRescheduleDate={(d) => { setRescheduleDate(d); if (showRescheduleModal) fetchSlots(d, showRescheduleModal); }} rescheduleSlots={rescheduleSlots} selectedSlot={selectedSlot} setSelectedSlot={setSelectedSlot} isLoadingSlots={isLoadingSlots} />
      <ReviewModal isOpen={!!showReviewModal} onClose={() => setShowReviewModal(null)} onSuccess={fetchAppointments} booking={showReviewModal} />
    </div>
  );
}