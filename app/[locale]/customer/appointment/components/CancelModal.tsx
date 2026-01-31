'use client';

import { motion, AnimatePresence } from "framer-motion";
import { XCircle } from "lucide-react";
import { useTranslations } from "next-intl";

interface CancelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
  placeName: string;
}

export default function CancelModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  isSubmitting, 
  placeName 
}: CancelModalProps) {
  const t = useTranslations('Appointments.cancel_modal');

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !isSubmitting && onClose()}
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
            <h2 className="text-3xl font-serif font-bold text-cocoa mb-4 text-center">{t('title')}</h2>
            <p className="text-taupe mb-10 text-center text-sm leading-relaxed font-medium opacity-70">
              {t('desc', { placeName })}
            </p>

            <div className="flex flex-col gap-3">
              <button
                disabled={isSubmitting}
                onClick={onConfirm}
                className="w-full py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] bg-red-500 text-white hover:bg-red-600 transition-all shadow-xl shadow-red-200"
              >
                {isSubmitting ? t('processing') : t('confirm')}
              </button>
              <button
                disabled={isSubmitting}
                onClick={onClose}
                className="w-full py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] text-taupe hover:text-cocoa transition-all"
              >
                {t('keep')}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
