'use client';

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, X } from "lucide-react";
import axios from "axios";
import { useTranslations } from "next-intl";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  booking: {
    appointmentId: string;
    type: string;
    placeId: string;
    place: { name: string };
    services: { name: string }[];
  } | null;
}

export default function ReviewModal({ isOpen, onClose, onSuccess, booking }: ReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const t = useTranslations('Appointments.review_modal');

  const handleSubmit = async () => {
    if (!booking) return;
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("salon_token");
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/customer/reviews/add`,
        {
          type: booking.type,
          placeId: booking.placeId,
          appointmentId: booking.appointmentId,
          rating,
          comment
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Review error", err);
      alert("Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && booking && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-cocoa/30 backdrop-blur-md"
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative bg-white rounded-[3rem] max-w-md w-full shadow-2xl overflow-hidden border border-borderSoft"
          >
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-linen transition-colors"
            >
              <X size={20} className="text-taupe" />
            </button>

            <div className="p-8 md:p-10 text-center">
              <div className="w-20 h-20 bg-gold/10 text-goldDark rounded-full flex items-center justify-center mx-auto mb-6">
                <Star className="w-10 h-10" fill="currentColor" />
              </div>

              <h2 className="text-2xl font-serif font-bold text-cocoa mb-2">{t('title')}</h2>
              <p className="text-taupe text-xs font-medium opacity-60 mb-8">
                {t('desc', { placeName: booking.place.name })}
              </p>

              <div className="flex justify-center gap-2 mb-8">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    onClick={() => setRating(s)}
                    className="transition-transform active:scale-90"
                  >
                    <Star 
                      size={32} 
                      className={s <= rating ? "text-goldDark" : "text-borderSoft"} 
                      fill={s <= rating ? "currentColor" : "none"} 
                    />
                  </button>
                ))}
              </div>

              <textarea
                placeholder={t('placeholder')}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full bg-linen/50 border border-borderSoft rounded-2xl p-4 text-xs font-medium focus:ring-2 focus:ring-gold/20 focus:outline-none min-h-[100px] mb-8"
              />

              <button
                disabled={isSubmitting}
                onClick={handleSubmit}
                className="w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] bg-cocoa text-white hover:bg-goldDark transition-all shadow-xl shadow-cocoa/10"
              >
                {isSubmitting ? t('submitting') : t('submit')}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
