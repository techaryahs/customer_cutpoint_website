'use client';

import { Employee } from '@/types/venue';
import { useTranslations } from 'next-intl';

interface StaffCarouselProps {
  staff: Employee[];
}

export default function StaffCarousel({ staff }: StaffCarouselProps) {
  const t = useTranslations('Staff');
  if (staff.length === 0) return null;

  return (
    <div className="flex gap-3 overflow-x-auto pb-3 no-scrollbar">
      {staff.map((member) => (
        <div 
          key={member.empid} 
          className="min-w-[200px] bg-white p-5 rounded-[1.5rem] border border-borderSoft group hover:border-gold/30 hover:shadow-soft transition-all duration-300"
        >
          <div className="w-12 h-12 bg-linen rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
            <span className="text-lg font-serif font-bold text-cocoa">
              {member.name.charAt(0)}
            </span>
          </div>
          
          <div>
            <h4 className="text-sm font-bold text-cocoa group-hover:text-goldDark transition-colors">
              {member.name}
            </h4>
            <p className="text-[9px] font-black uppercase tracking-widest text-goldDark/70 mt-0.5">
              {member.role}
            </p>
            <p className="text-[9px] text-taupe font-bold mt-1.5 opacity-60">
              {t('exp_years', { count: member.experience })}
            </p>
          </div>
          
          <div className="mt-3 pt-3 border-t border-linen">
            <div className="flex flex-wrap gap-1">
              {member.services.slice(0, 2).map(s => (
                <span 
                  key={s.serviceId} 
                  className="text-[7px] font-black uppercase tracking-tighter bg-linen/50 px-1.5 py-0.5 rounded-md text-cocoa/60"
                >
                  {s.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
