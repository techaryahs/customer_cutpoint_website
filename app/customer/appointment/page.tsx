'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

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
  place: { name: string; address: string; };
  employee: { name: string; phone: string; };
  services: { serviceId: string; name: string; image?: string; }[];
};

export default function AppointmentsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState<Booking | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

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

  const handleCancelConfirm = async () => {
    if (!showCancelModal) return;
    const b = showCancelModal;
    setIsCancelling(true);

    try {
      const token = localStorage.getItem("salon_token");
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/customer/${b.type}/${b.placeId}/appointments/${b.appointmentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setBookings(prev =>
        prev.map(appt => appt.appointmentId === b.appointmentId ? { ...appt, status: "cancelled" } : appt)
      );
      setShowCancelModal(null);
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to cancel appointment");
    } finally {
      setIsCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
        <div className="w-12 h-12 border-4 border-[#4a3728] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[#7a6a5e] font-serif italic animate-pulse text-lg">Preparing your schedule...</p>
      </div>
    );
  }

  return (
    <section className="max-w-6xl mx-auto px-6 py-16 min-h-screen">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16 pb-8 border-b border-gray-100">
        <div className="space-y-2">
          <h1 className="font-serif text-5xl text-[#4a3728] tracking-tight">My Appointments</h1>
          <p className="text-[#7a6a5e] text-lg font-light tracking-wide">
            You have <span className="font-bold text-[#4a3728]">{bookings.filter(b => b.status === 'booked').length}</span> upcoming sessions.
          </p>
        </div>
        <Link 
          href="/search" 
          className="bg-[#4a3728] hover:bg-[#36281d] text-white px-10 py-4 rounded-2xl font-bold transition-all transform hover:-translate-y-1 shadow-2xl shadow-[#4a3728]/20 flex items-center gap-2"
        >
          <span>+</span> Book New Experience
        </Link>
      </div>

      {/* APPOINTMENTS GRID */}
      <div className="grid gap-8">
        {bookings.length > 0 ? (
          bookings.map((b) => (
            <motion.div 
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={b.appointmentId}
              className={`relative bg-white p-6 rounded-[2.5rem] border border-gray-50 transition-all duration-500 shadow-sm hover:shadow-2xl hover:shadow-[#4a3728]/5 ${b.status === 'cancelled' ? 'opacity-60 grayscale-[0.3]' : ''}`}
            >
              <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-center">
                
                {/* Image Section */}
                <div className="w-full lg:w-44 h-44 rounded-[2rem] overflow-hidden bg-[#FAF7F4] flex-shrink-0 relative">
                  {b.services[0]?.image ? (
                    <img 
                      src={b.services[0].image} 
                      alt="service" 
                      className="w-full h-full object-cover transform hover:scale-110 transition duration-700" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl font-serif text-[#4a3728]/20">
                      {b.services[0]?.name?.charAt(0)}
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <span className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-[#4a3728] shadow-sm">
                      {b.type}
                    </span>
                  </div>
                </div>

                {/* Content Section */}
                <div className="flex-1 space-y-4 text-center lg:text-left">
                  <div>
                    <h3 className="text-2xl font-bold text-[#4a3728] mb-1">
                      {b.services.map(s => s.name).join(", ")}
                    </h3>
                    <p className="text-[#7a6a5e] font-medium flex items-center justify-center lg:justify-start gap-1">
                      <span className="opacity-60 text-sm italic">at</span> {b.place.name}
                    </p>
                  </div>

                  <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                    <InfoBadge icon="📅" text={b.date} />
                    <InfoBadge icon="⏰" text={b.startTime} />
                    <InfoBadge icon="⏳" text={`${b.totalDuration} mins`} />
                  </div>

                  <p className="text-sm text-[#7a6a5e]">
                    Artist: <span className="font-bold text-[#4a3728]">{b.employee.name || "Stylist Assigned"}</span>
                  </p>
                </div>

                {/* Action Section */}
                <div className="w-full lg:w-auto flex lg:flex-col items-center lg:items-end justify-between gap-6 pt-6 lg:pt-0 border-t lg:border-t-0 border-gray-50">
                  <div className="lg:text-right">
                    <p className="text-3xl font-serif font-bold text-[#4a3728]">₹{b.totalAmount}</p>
                    <div className={`text-[10px] font-black uppercase mt-1 px-3 py-1 rounded-full text-center ${b.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {b.paymentStatus}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <StatusChip status={b.status} />
                    {b.status === "booked" && (
                      <button 
                        onClick={() => setShowCancelModal(b)}
                        className="p-3 px-5 rounded-2xl text-red-500 hover:bg-red-50 font-bold text-xs transition-all active:scale-95"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-32 bg-gray-50/50 rounded-[4rem] border-4 border-dashed border-white">
             <div className="text-6xl mb-6">🌿</div>
             <p className="text-[#7a6a5e] font-serif italic text-xl">Your beauty journey starts here.</p>
             <Link href="/search" className="text-[#4a3728] underline font-bold mt-4 block">Find a Salon</Link>
          </div>
        )}
      </div>

      {/* CANCEL CONFIRMATION MODAL */}
      <AnimatePresence>
        {showCancelModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-hidden">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => !isCancelling && setShowCancelModal(null)}
              className="absolute inset-0 bg-[#4a3728]/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white p-10 rounded-[3rem] max-w-md w-full shadow-2xl border border-white/20"
            >
              <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-8 text-3xl">
                ✕
              </div>
              <h2 className="text-3xl font-serif font-bold text-[#4a3728] mb-4 text-center">Cancel Visit?</h2>
              <p className="text-[#7a6a5e] mb-10 text-center leading-relaxed">
                Are you sure you want to cancel your appointment at <span className="font-bold text-[#4a3728]">{showCancelModal.place.name}</span>? This session will be released to other clients.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  disabled={isCancelling}
                  onClick={() => setShowCancelModal(null)} 
                  className="flex-1 py-4 rounded-2xl font-bold text-[#7a6a5e] hover:bg-gray-100 transition-colors order-2 sm:order-1"
                >
                  Keep Booking
                </button>
                <button 
                  disabled={isCancelling}
                  onClick={handleCancelConfirm} 
                  className="flex-1 py-4 rounded-2xl font-bold bg-red-500 text-white hover:bg-red-600 transition-all shadow-xl shadow-red-200 order-1 sm:order-2 disabled:opacity-50"
                >
                  {isCancelling ? "Processing..." : "Yes, Cancel"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}

// --- Helper Components ---

function InfoBadge({ icon, text }: { icon: string, text: string }) {
  return (
    <div className="flex items-center gap-2 bg-[#FAF7F4] px-4 py-2 rounded-2xl border border-[#F0EBE6]">
      <span className="text-sm">{icon}</span>
      <span className="text-xs font-bold text-[#7a6a5e]">{text}</span>
    </div>
  );
}

function StatusChip({ status }: { status: string }) {
  const styles: Record<string, string> = {
    booked: "bg-[#4a3728] text-white shadow-lg shadow-[#4a3728]/20",
    cancelled: "bg-gray-100 text-gray-400",
    completed: "bg-green-600 text-white shadow-lg shadow-green-200",
  };
  return (
    <span className={`text-[10px] uppercase tracking-[0.2em] font-black px-6 py-3 rounded-2xl ${styles[status] || styles.cancelled}`}>
      {status}
    </span>
  );
}