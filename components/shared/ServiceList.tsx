/* eslint-disable @next/next/no-img-element */
'use client';

import { VenueService } from '@/types/venue';
import { Tag } from 'lucide-react';

interface ServiceListProps {
  services: VenueService[];
  selectedServiceIds: string[];
  onToggleService: (serviceId: string) => void;
}

export default function ServiceList({ services, selectedServiceIds, onToggleService }: ServiceListProps) {
  if (services.length === 0) {
    return (
      <div className="bg-white p-12 rounded-[2rem] text-center border border-dashed border-borderSoft">
        <p className="text-taupe font-medium opacity-60">No active services available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {services.map((service) => {
        const selected = selectedServiceIds.includes(service.serviceId);
        return (
          <div 
            key={service.serviceId} 
            className={`group flex flex-col md:flex-row gap-5 p-5 rounded-[1.5rem] border transition-all duration-300 relative ${
              selected 
                ? 'bg-cocoa border-cocoa shadow-lg shadow-cocoa/10' 
                : 'bg-white border-borderSoft hover:border-gold/50 hover:shadow-soft'
            }`}
          >
            {/* Discount Badge */}
            {service.hasDiscount && (
              <div className="absolute -top-2 -right-2 z-10">
                <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-lg flex items-center gap-1">
                  <Tag size={10} /> {service.discountPercent}% OFF
                </div>
              </div>
            )}
            
            {service.image && (
              <div className="w-full md:w-24 h-24 flex-shrink-0 overflow-hidden rounded-xl">
                <img 
                  src={service.image} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                  alt={service.name} 
                />
              </div>
            )}
            
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h4 className={`text-base font-bold tracking-tight transition-colors ${selected ? 'text-white' : 'text-cocoa'}`}>
                    {service.name}
                  </h4>
                  <p className={`text-[10px] mt-0.5 transition-colors ${selected ? 'text-white/60' : 'text-taupe'}`}>
                    {service.category || 'Service'} • {service.duration} min
                  </p>
                </div>
                
                {/* Price Display */}
                <div className="text-right">
                  {service.hasDiscount ? (
                    <div className="flex flex-col items-end">
                      <p className={`text-xs line-through transition-colors ${selected ? 'text-white/40' : 'text-taupe/50'}`}>
                        ₹{service.price}
                      </p>
                      <p className={`text-lg font-serif font-bold transition-colors ${selected ? 'text-green-300' : 'text-green-600'}`}>
                        ₹{service.discountedPrice}
                      </p>
                    </div>
                  ) : (
                    <p className={`text-lg font-serif font-bold transition-colors ${selected ? 'text-gold' : 'text-goldDark'}`}>
                      ₹{service.price}
                    </p>
                  )}
                </div>
              </div>
              
              <p className={`text-xs mt-2 line-clamp-1 transition-colors ${selected ? 'text-white/80' : 'text-taupe/70'}`}>
                {service.description}
              </p>
            </div>
            
            <div className="flex items-center">
              <button
                onClick={() => onToggleService(service.serviceId)}
                className={`w-full md:w-auto px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                  selected 
                    ? 'bg-goldDark text-white hover:bg-white hover:text-cocoa' 
                    : 'bg-linen text-cocoa hover:bg-cocoa hover:text-white'
                }`}
              >
                {selected ? 'Remove' : 'Add to Booking'}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
