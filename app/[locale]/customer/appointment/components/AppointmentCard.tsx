'use client';

import { motion } from "framer-motion";
import { 
  Calendar, 
  MapPin, 
  User, 
  AlertCircle,
  Star
} from "lucide-react";
import { useTranslations } from "next-intl";

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

interface AppointmentCardProps {
  booking: Booking;
  canModify: boolean;
  status: string;
  onReschedule: (b: Booking) => void;
  onCancel: (b: Booking) => void;
  onReview: (b: Booking) => void;
}

export default function AppointmentCard({ 
  booking, 
  canModify, 
  status, 
  onReschedule, 
  onCancel, 
  onReview 
}: AppointmentCardProps) {
  const t = useTranslations('Appointments');
  const isCancelled = booking.status === 'cancelled';
  const isPrevious = status === 'previous';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className={`group relative bg-white rounded-2xl border border-borderSoft hover:border-gold/30 hover:shadow-lg transition-all duration-500 overflow-hidden ${isCancelled ? 'opacity-60 grayscale-[0.5]' : ''}`}
    >
      <div className="flex flex-col md:flex-row min-h-[140px]">
        {/* Image Frame */}
        <div className="md:w-36 h-36 md:h-auto bg-linen relative overflow-hidden flex-shrink-0">
          {booking.services[0]?.image ? (
            <img
              src={booking.services[0].image}
              alt=""
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl opacity-10">✨</div>
          )}
          <div className="absolute top-3 left-3">
             <span className="bg-white/95 backdrop-blur px-2 py-0.5 rounded-full text-[6px] font-black uppercase tracking-widest text-cocoa shadow-sm border border-borderSoft/50">
               {booking.type}
             </span>
          </div>
        </div>

        {/* Info Panel */}
        <div className="flex-1 p-4 md:px-6 md:py-4 flex flex-col justify-between">
          <div>
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 mb-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`w-1 h-1 rounded-full ${booking.status === 'booked' ? 'bg-green-500' : (isCancelled ? 'bg-red-400' : 'bg-goldDark')}`} />
                  <span className="text-[8px] font-black uppercase tracking-widest text-taupe/60">{booking.status}</span>
                </div>
                <h3 className="text-base md:text-lg font-serif font-bold text-cocoa leading-tight mb-1 truncate">
                  {booking.services.map(s => s.name).join(", ")}
                </h3>
                <p className="text-goldDark text-[9px] font-bold flex items-center gap-1 opacity-80 mb-1">
                  <MapPin className="w-2.5 h-2.5" /> {booking.place.name}
                </p>
                <p className="text-taupe text-[8px] font-medium opacity-60 flex flex-wrap items-center gap-y-1 gap-x-2">
                  <span>{booking.place.address}</span>
                  {booking.place.phone && (
                    <span className="flex items-center gap-1 sm:ml-2 sm:pl-2 sm:border-l sm:border-borderSoft">
                      📞 {booking.place.phone}
                    </span>
                  )}
                </p>
              </div>

              <div className="text-left md:text-right flex items-center md:block gap-3">
                <p className="text-xl font-serif font-bold text-cocoa tracking-tighter">₹{booking.totalAmount}</p>
                <div className={`text-[7px] font-black uppercase tracking-[0.15em] px-2 py-0.5 rounded-full inline-block ${booking.paymentStatus === 'paid' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                  {booking.paymentStatus}
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 lg:grid-cols-3 gap-4 pb-4 border-b border-borderSoft">
              <div className="space-y-1">
                 <p className="text-[7px] text-taupe/40 uppercase font-black tracking-widest">{t('date_time')}</p>
                 <div className="flex items-center gap-2">
                   <Calendar className="w-3.5 h-3.5 text-goldDark opacity-50" />
                   <div className="leading-tight">
                     <p className="text-[11px] font-black text-cocoa">{booking.date}</p>
                     <p className="text-[9px] text-taupe font-bold uppercase tracking-tighter">{booking.startTime}</p>
                   </div>
                 </div>
              </div>
              <div className="space-y-1">
                 <p className="text-[7px] text-taupe/40 uppercase font-black tracking-widest">{t('expert')}</p>
                 <div className="flex items-center gap-2">
                   <User className="w-3.5 h-3.5 text-goldDark opacity-50" />
                   <div className="leading-tight">
                     <p className="text-[11px] font-black text-cocoa truncate max-w-[90px]">{booking.employee.name}</p>
                     <p className="text-[9px] text-taupe font-bold uppercase tracking-tighter">{t('duration_mins', { count: booking.totalDuration })}</p>
                   </div>
                 </div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-start md:justify-end gap-3 pb-2 md:pb-0">
            {!isCancelled && (
              <>
                {canModify ? (
                  <>
                    <button
                      onClick={() => onReschedule(booking)}
                      className="px-5 py-2 bg-linen text-cocoa text-[8px] font-black uppercase tracking-widest rounded-xl border border-borderSoft hover:bg-white hover:border-gold transition-all active:scale-95"
                    >
                      {t('reschedule')}
                    </button>
                    <button
                      onClick={() => onCancel(booking)}
                      className="px-5 py-2 bg-white text-red-500 text-[8px] font-black uppercase tracking-widest rounded-xl border border-red-50 hover:bg-red-50/50 hover:border-red-200 transition-all active:scale-95"
                    >
                      {t('cancel')}
                    </button>
                  </>
                ) : (
                  <div className="flex items-center gap-3">
                    {isPrevious && !booking.isReviewed && (
                      <button
                        onClick={() => onReview(booking)}
                        className="px-5 py-2 bg-goldDark text-white text-[8px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-goldDark/20 hover:bg-cocoa transition-all active:scale-95 flex items-center gap-2"
                      >
                        <Star size={10} fill="white" />
                        {t('review_exp')}
                      </button>
                    )}
                    {booking.isReviewed && (
                      <span className="text-[9px] font-bold text-green-600 flex items-center gap-1">
                        <Star size={10} fill="currentColor" /> {t('reviewed')}
                      </span>
                    )}
                    {!isPrevious && (
                      <div className="flex items-center gap-2 text-taupe/50 italic text-[9px] font-medium px-4 py-2 bg-sand/5 rounded-xl border border-borderSoft/40">
                        <AlertCircle className="w-3 h-3 text-goldDark" />
                        {t('locked')}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
