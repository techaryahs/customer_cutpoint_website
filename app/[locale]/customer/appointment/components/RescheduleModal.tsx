'use client';

import { motion, AnimatePresence } from "framer-motion";
import { Calendar } from "lucide-react";
import { useTranslations } from "next-intl";

interface RescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
  placeName: string;
  rescheduleDate: string;
  setRescheduleDate: (date: string) => void;
  rescheduleSlots: string[];
  selectedSlot: string | null;
  setSelectedSlot: (slot: string | null) => void;
  isLoadingSlots: boolean;
}

export default function RescheduleModal({
  isOpen,
  onClose,
  onConfirm,
  isSubmitting,
  placeName,
  rescheduleDate,
  setRescheduleDate,
  rescheduleSlots,
  selectedSlot,
  setSelectedSlot,
  isLoadingSlots
}: RescheduleModalProps) {
  const t = useTranslations('Appointments.reschedule_modal');

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
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

              <h2 className="text-2xl font-serif font-bold text-cocoa text-center mb-2">{t('title')}</h2>
              <p className="text-taupe text-sm text-center mb-8 px-4">
                {t('desc', { placeName })}
              </p>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-taupe/60 mb-2 block">{t('pick_date')}</label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={rescheduleDate}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                    className="w-full bg-linen border border-borderSoft rounded-xl px-4 py-3 text-cocoa font-bold outline-none focus:border-gold transition-colors"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                     <label className="text-[10px] font-black uppercase tracking-widest text-taupe/60">{t('available_slots')}</label>
                     {isLoadingSlots && <span className="text-[10px] text-goldDark animate-pulse font-bold uppercase">{t('updating')}</span>}
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
                          {rescheduleDate ? t('no_slots') : t('select_date_first')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-8 space-y-3">
                <button
                  disabled={isSubmitting || !selectedSlot}
                  onClick={onConfirm}
                  className="w-full bg-cocoa text-white font-black uppercase tracking-widest text-[10px] py-4 rounded-xl hover:bg-cocoaLight transition-all active:scale-95 disabled:opacity-50 disabled:grayscale"
                >
                  {isSubmitting ? t('rescheduling') : t('confirm_new_time')}
                </button>
                <button
                  onClick={onClose}
                  className="w-full bg-transparent text-taupe/60 font-black uppercase tracking-widest text-[10px] py-4 rounded-xl hover:text-cocoa transition-all"
                >
                  {t('keep_original')}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
