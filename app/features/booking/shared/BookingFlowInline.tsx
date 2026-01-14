'use client';

import { type FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Check } from 'lucide-react';

export type BookingService = {
  serviceId: string;
  name: string;
  price: string;
  duration: string;
};

export type BookingVenue = {
  id: string;
  name: string;
  type: 'salon' | 'spa';
};

type StaffMember = {
  staffId: string;
  name: string;
  role: string;
  availableSlots: string[];
};

type Props = {
  venue: BookingVenue;
  services: BookingService[];
  totalPrice: number;
  onChangeServices?: () => void;
};

type FetchStaffInput = {
  venueId: string;
  venueType: BookingVenue['type'];
  serviceIds: string[];
  dateISO?: string;
};

async function fetchStaffMembersStub(input: FetchStaffInput): Promise<StaffMember[]> {
  // Backend handoff point: replace with real staff availability API call.
  const base: StaffMember[] = [
    {
      staffId: `${input.venueType}-${input.venueId}-stf-001`,
      name: 'Aarav',
      role: input.venueType === 'spa' ? 'Therapist' : 'Stylist',
      availableSlots: ['10:00', '10:30', '11:00', '11:30', '12:00', '17:00', '17:30', '18:00'],
    },
    {
      staffId: `${input.venueType}-${input.venueId}-stf-002`,
      name: 'Isha',
      role: input.venueType === 'spa' ? 'Senior Therapist' : 'Senior Stylist',
      availableSlots: ['10:30', '11:00', '12:30', '13:00', '17:00', '18:00', '18:30', '19:00'],
    },
    {
      staffId: `${input.venueType}-${input.venueId}-stf-003`,
      name: 'Kabir',
      role: input.venueType === 'spa' ? 'Therapist' : 'Color Specialist',
      availableSlots: ['11:00', '11:30', '12:00', '16:30', '17:00', '17:30', '19:00', '19:30'],
    },
  ];

  return Promise.resolve(base);
}

function getSimulatedBookedSlots(staffId: string): string[] {
  // Backend handoff point: replace with real booked slots availability from backend.
  const lastTwo = staffId.slice(-2);
  if (lastTwo === '01') return ['11:00', '17:00'];
  if (lastTwo === '02') return ['10:30', '18:00'];
  return ['12:00', '19:00'];
}

function normalizePhone(raw: string): string {
  return raw.replace(/[^\d]/g, '');
}

function formatISODate(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function formatDateLabel(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
}

function isLoggedIn(): boolean {
  try {
    const raw = localStorage.getItem('salon_user');
    return Boolean(raw && raw !== 'undefined');
  } catch {
    return false;
  }
}

type TimeSlot = {
  slot: string;
  enabled: boolean;
};

type FetchSlotsInput = {
  venueId: string;
  venueType: BookingVenue['type'];
  dateISO: string;
  serviceIds: string[];
  staffId: string | 'any';
};

async function fetchAvailableTimeSlotsStub(input: FetchSlotsInput, staffMembers: StaffMember[]): Promise<TimeSlot[]> {
  // Backend handoff point: replace with real time-slot availability API call (includes existing bookings).
  const baseSlots = new Set<string>();
  staffMembers.forEach((s) => s.availableSlots.forEach((slot) => baseSlots.add(slot)));
  const allSlots = Array.from(baseSlots).sort((a, b) => a.localeCompare(b));

  if (input.staffId === 'any') {
    return allSlots.map((slot) => ({
      slot,
      enabled: staffMembers.some((s) => s.availableSlots.includes(slot) && !getSimulatedBookedSlots(s.staffId).includes(slot)),
    }));
  }

  const staff = staffMembers.find((s) => s.staffId === input.staffId);
  if (!staff) return allSlots.map((slot) => ({ slot, enabled: false }));
  const booked = new Set(getSimulatedBookedSlots(staff.staffId));
  return allSlots.map((slot) => ({
    slot,
    enabled: staff.availableSlots.includes(slot) && !booked.has(slot),
  }));
}

export default function BookingFlowInline({ venue, services, totalPrice, onChangeServices }: Props) {
  const serviceIdsKey = useMemo(() => services.map((s) => s.serviceId).sort().join('|'), [services]);
  const serviceIds = useMemo(() => services.map((s) => s.serviceId), [services]);

  const staffRef = useRef<HTMLDivElement | null>(null);
  const timeRef = useRef<HTMLDivElement | null>(null);
  const reviewRef = useRef<HTMLDivElement | null>(null);
  const customerRef = useRef<HTMLDivElement | null>(null);

  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [isStaffLoading, setIsStaffLoading] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState<string | 'any' | ''>('');

  const [selectedDateISO, setSelectedDateISO] = useState('');
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [isSlotsLoading, setIsSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState('');

  const [isReviewConfirmed, setIsReviewConfirmed] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [submitState, setSubmitState] = useState<'idle' | 'login_required' | 'success'>('idle');

  const [isSubmitting, setIsSubmitting] = useState(false);

  // ---------- HANDLE SUBMIT (PUT IT HERE) ----------
  const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();

  // ---------- Basic validation ----------
  const phone = normalizePhone(phoneNumber);
  if (customerName.trim().length < 2 || phone.length < 10) {
    return;
  }

  // ---------- Auth check (FIXED) ----------
  const rawUser = localStorage.getItem('salon_user');
  const token = localStorage.getItem('salon_token');

  if (!rawUser || !token) {
    setSubmitState('login_required');
    return;
  }

  let user: { uid: string };
  try {
    user = JSON.parse(rawUser);
  } catch {
    setSubmitState('login_required');
    return;
  }

  const customerId = user.uid;

  if (!customerId) {
    setSubmitState('login_required');
    return;
  }

  // ---------- Safety checks ----------
  if (!selectedDateISO || !selectedSlot) {
    alert('Please select date and time');
    return;
  }

  if (!selectedStaffId && selectedStaffId !== 'any') {
    alert('Please select a staff member');
    return;
  }

  // ---------- API call ----------
  try {
    setIsSubmitting(true);
    setSubmitState('idle');

    const payload = {
      type: venue.type,
      salonId: venue.type === 'salon' ? venue.id : undefined,
      spaId: venue.type === 'spa' ? venue.id : undefined,
      customerId,
      employeeId:
        selectedStaffId === 'any'
          ? staffMembers[0]?.staffId // fallback
          : selectedStaffId,
      services: services.map((s) => ({
        serviceId: s.serviceId,
        price: Number(s.price),
        duration: Number(s.duration),
      })),
      date: selectedDateISO,
      startTime: selectedSlot,
      paymentId: `PAY_${Date.now()}`, // dummy payment id
    };

    const res = await fetch(
      'http://localhost:3001/api/customer/appointments/book',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // ✅ correct token
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.error || 'Booking failed');
    }

    setSubmitState('success');
  } catch (err) {
    console.error('BOOKING ERROR:', err);
    alert('Failed to book appointment. Please try again.');
  } finally {
    setIsSubmitting(false);
  }
};



  const resetConfirmation = () => {
    setIsReviewConfirmed(false);
    setSubmitState('idle');
  };

  const selectedStaff = useMemo(() => {
    if (selectedStaffId === 'any' || !selectedStaffId) return null;
    return staffMembers.find((s) => s.staffId === selectedStaffId) ?? null;
  }, [selectedStaffId, staffMembers]);

  const staffLabel = selectedStaffId === 'any' ? 'Any available staff' : selectedStaff?.name ?? '—';

  const dateOptions = useMemo(() => {
    const today = new Date();
    const days = Array.from({ length: 7 }).map((_, idx) => {
      const d = new Date(today);
      d.setDate(today.getDate() + idx);
      const iso = formatISODate(d);
      return { iso, label: formatDateLabel(iso) };
    });
    return days;
  }, []);

  useEffect(() => {
    let cancelled = false;

    Promise.resolve().then(() => {
      if (cancelled) return;
      setIsStaffLoading(true);
    });

    fetchStaffMembersStub({ venueId: venue.id, venueType: venue.type, serviceIds, dateISO: selectedDateISO || undefined })
      .then((data) => {
        if (cancelled) return;
        setStaffMembers(data);
      })
      .finally(() => {
        if (cancelled) return;
        setIsStaffLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [venue.id, venue.type, serviceIdsKey, serviceIds, selectedDateISO]);

  useEffect(() => {
    if (!selectedDateISO || !selectedStaffId) return;

    let cancelled = false;

    Promise.resolve().then(() => {
      if (cancelled) return;
      setIsSlotsLoading(true);
    });

    fetchAvailableTimeSlotsStub(
      { venueId: venue.id, venueType: venue.type, dateISO: selectedDateISO, serviceIds, staffId: selectedStaffId },
      staffMembers,
    )
      .then((data) => {
        if (cancelled) return;
        setSlots(data);
      })
      .finally(() => {
        if (cancelled) return;
        setIsSlotsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedDateISO, selectedStaffId, staffMembers, venue.id, venue.type, serviceIds]);

  const canContinueFromStaff = selectedStaffId !== '';
  const canContinueFromTime = selectedDateISO.trim().length > 0 && selectedSlot.trim().length > 0;

  const scrollTo = (el: HTMLElement | null) => el?.scrollIntoView({ behavior: 'smooth', block: 'start' });


  return (
    <div className="space-y-8">
      <div
        id="booking-staff"
        ref={staffRef}
        className="scroll-mt-32 bg-white border border-borderSoft rounded-2xl shadow-card p-6"
      >
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-lg font-serif font-bold text-cocoa">Staff</h2>
          <p className="text-xs text-taupe font-bold uppercase tracking-wider">{venue.type === 'spa' ? 'Spa' : 'Salon'}</p>
        </div>

        <div className="mt-4">
          <p className="text-xs font-bold text-taupe uppercase tracking-wider">Select staff</p>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                resetConfirmation();
                setSelectedSlot('');
                setSlots([]);
                setSelectedStaffId('any');
              }}
              className={`w-full text-left px-4 py-3 rounded-2xl border transition-colors ${selectedStaffId === 'any' ? 'border-gold bg-sand/20' : 'border-borderSoft hover:border-gold/50'
                }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-cocoa truncate">Any available staff</p>
                  <p className="text-xs text-taupe mt-1">We’ll assign the best match for your services.</p>
                </div>
                {selectedStaffId === 'any' && <Check className="w-5 h-5 text-green-700" />}
              </div>
            </button>

            <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {isStaffLoading ? (
                <div className="sm:col-span-2 bg-linen border border-borderSoft rounded-2xl p-4">
                  <p className="text-sm text-taupe">Loading staff…</p>
                </div>
              ) : (
                staffMembers.map((s) => {
                  const active = selectedStaffId === s.staffId;
                  return (
                    <button
                      key={s.staffId}
                      type="button"
                      onClick={() => {
                        resetConfirmation();
                        setSelectedSlot('');
                        setSlots([]);
                        setSelectedStaffId(s.staffId);
                      }}
                      className={`w-full text-left px-4 py-3 rounded-2xl border transition-colors ${active ? 'border-gold bg-sand/20' : 'border-borderSoft hover:border-gold/50'
                        }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-cocoa truncate">{s.name}</p>
                          <p className="text-xs text-taupe mt-1">{s.role}</p>
                        </div>
                        {active && <Check className="w-5 h-5 text-green-700" />}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={() => scrollTo(timeRef.current)}
            disabled={!canContinueFromStaff}
            className={`px-6 py-3 rounded-xl font-bold shadow-soft ${canContinueFromStaff ? 'bg-cocoa text-sand hover:bg-taupe' : 'bg-cocoa text-sand opacity-60 cursor-not-allowed'
              }`}
          >
            Continue
          </button>
        </div>
      </div>

      {selectedStaffId !== '' && (
        <div ref={timeRef} className="scroll-mt-32 bg-white border border-borderSoft rounded-2xl shadow-card p-6">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-lg font-serif font-bold text-cocoa">Time</h2>
            <p className="text-xs text-taupe font-bold uppercase tracking-wider">Pick a slot</p>
          </div>

          <div className="mt-4">
            <p className="text-xs font-bold text-taupe uppercase tracking-wider">Select date</p>
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
              {dateOptions.map((d) => {
                const active = selectedDateISO === d.iso;
                return (
                  <button
                    key={d.iso}
                    type="button"
                    onClick={() => {
                      resetConfirmation();
                      setSelectedDateISO(d.iso);
                      setSelectedSlot('');
                      setSlots([]);
                    }}
                    className={`px-3 py-2 rounded-xl border text-sm font-bold transition-colors ${active ? 'border-gold bg-sand/30 text-cocoa' : 'border-borderSoft text-cocoa hover:border-gold/50'
                      }`}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-5">
            <p className="text-xs font-bold text-taupe uppercase tracking-wider">Available times</p>
            <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 gap-2">
              {isSlotsLoading ? (
                <div className="col-span-3 sm:col-span-4 bg-linen border border-borderSoft rounded-2xl p-4">
                  <p className="text-sm text-taupe">Loading availability…</p>
                </div>
              ) : (
                (slots.length > 0 ? slots : []).map((t) => {
                  const active = selectedSlot === t.slot;
                  return (
                    <button
                      key={t.slot}
                      type="button"
                      onClick={() => {
                        if (!t.enabled) return;
                        resetConfirmation();
                        setSelectedSlot(t.slot);
                      }}
                      disabled={!selectedDateISO || !t.enabled}
                      className={`px-2 py-2 rounded-xl text-xs font-bold border transition-colors ${!selectedDateISO
                          ? 'border-borderSoft text-taupe/60 bg-white opacity-60 cursor-not-allowed'
                          : t.enabled
                            ? active
                              ? 'border-gold bg-white text-cocoa'
                              : 'border-borderSoft bg-white text-cocoa hover:border-gold/60'
                            : 'border-borderSoft bg-white text-taupe/60 opacity-60 cursor-not-allowed'
                        }`}
                      title={!selectedDateISO ? 'Select a date first' : t.enabled ? undefined : 'Unavailable'}
                    >
                      {t.slot}
                    </button>
                  );
                })
              )}
            </div>

            {!isSlotsLoading && selectedDateISO && slots.length === 0 && (
              <div className="mt-3 bg-linen border border-borderSoft rounded-2xl p-4">
                <p className="text-sm text-taupe">No slots available for this date.</p>
              </div>
            )}
          </div>

          <div className="mt-5 bg-linen border border-borderSoft rounded-2xl p-4">
            <p className="text-xs font-bold text-taupe uppercase tracking-wider">Selection</p>
            <div className="mt-2 text-sm text-cocoa space-y-1">
              <p>
                Staff: <span className="font-bold">{staffLabel}</span>
              </p>
              <p>
                Date: <span className="font-bold">{selectedDateISO ? formatDateLabel(selectedDateISO) : '—'}</span>
              </p>
              <p>
                Time: <span className="font-bold">{selectedSlot || '—'}</span>
              </p>
            </div>
          </div>

          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={() => scrollTo(reviewRef.current)}
              disabled={!canContinueFromTime}
              className={`px-6 py-3 rounded-xl font-bold shadow-soft ${canContinueFromTime ? 'bg-cocoa text-sand hover:bg-taupe' : 'bg-cocoa text-sand opacity-60 cursor-not-allowed'
                }`}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {selectedStaffId !== '' && selectedDateISO && selectedSlot && (
        <div ref={reviewRef} className="scroll-mt-32 bg-white border border-borderSoft rounded-2xl shadow-card p-6">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-lg font-serif font-bold text-cocoa">Review</h2>
            <p className="text-xs text-taupe font-bold uppercase tracking-wider">Confirm details</p>
          </div>

          <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-4 text-sm">
            <div className="lg:col-span-6 bg-linen border border-borderSoft rounded-2xl p-4">
              <div className="flex items-center justify-between gap-4">
                <p className="text-xs font-bold text-taupe uppercase tracking-wider">Services</p>
                <button
                  type="button"
                  onClick={() => {
                    setIsReviewConfirmed(false);
                    onChangeServices?.();
                  }}
                  className="text-xs font-bold text-goldDark hover:underline"
                >
                  Change
                </button>
              </div>
              <div className="mt-3 space-y-2">
                {services.map((s) => (
                  <div key={s.serviceId} className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-cocoa truncate">{s.name}</p>
                      <p className="text-[10px] font-bold text-taupe uppercase tracking-wider">{s.duration} min</p>
                    </div>
                    <p className="text-sm font-serif font-bold text-goldDark">₹{s.price}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-6 space-y-4">
              <div className="bg-linen border border-borderSoft rounded-2xl p-4">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-xs font-bold text-taupe uppercase tracking-wider">Staff</p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsReviewConfirmed(false);
                      scrollTo(staffRef.current);
                    }}
                    className="text-xs font-bold text-goldDark hover:underline"
                  >
                    Change
                  </button>
                </div>
                <p className="mt-2 text-sm text-cocoa">
                  <span className="font-bold">{staffLabel}</span>
                </p>
              </div>

              <div className="bg-linen border border-borderSoft rounded-2xl p-4">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-xs font-bold text-taupe uppercase tracking-wider">Date &amp; time</p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsReviewConfirmed(false);
                      scrollTo(timeRef.current);
                    }}
                    className="text-xs font-bold text-goldDark hover:underline"
                  >
                    Change
                  </button>
                </div>
                <p className="mt-2 text-sm text-cocoa">
                  <span className="font-bold">{formatDateLabel(selectedDateISO)}</span> •{' '}
                  <span className="font-bold">{selectedSlot}</span>
                </p>
              </div>

              <div className="bg-linen border border-borderSoft rounded-2xl p-4">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-xs font-bold text-taupe uppercase tracking-wider">Total price</p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsReviewConfirmed(false);
                      onChangeServices?.();
                    }}
                    className="text-xs font-bold text-goldDark hover:underline"
                  >
                    Change
                  </button>
                </div>
                <p className="mt-2 text-lg font-serif font-bold text-goldDark">₹{totalPrice}</p>
              </div>
            </div>
          </div>

          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={() => {
                setIsReviewConfirmed(true);
                scrollTo(customerRef.current);
              }}
              className="px-6 py-3 rounded-xl font-bold shadow-soft bg-cocoa text-sand hover:bg-taupe"
            >
              Proceed
            </button>
          </div>
        </div>
      )}

      {selectedStaffId !== '' && selectedDateISO && selectedSlot && isReviewConfirmed && (
        <div ref={customerRef} className="scroll-mt-32 bg-white border border-borderSoft rounded-2xl shadow-card p-6">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-lg font-serif font-bold text-cocoa">Your details</h2>
            <p className="text-xs text-taupe font-bold uppercase tracking-wider">Submit booking</p>
          </div>

          {submitState === 'login_required' && (
            <div className="mt-4 bg-rose-50 border border-rose-200 text-rose-900 rounded-2xl p-4">
              <p className="text-sm font-bold">Login required</p>
              <p className="text-xs text-rose-900/80 mt-1">Please log in to submit your booking request.</p>
            </div>
          )}

          {submitState === 'success' ? (
            <div className="mt-4 bg-green-50 border border-green-200 text-green-900 rounded-2xl p-4">
              <p className="text-sm font-bold">Booking request submitted successfully</p>
              <p className="text-xs text-green-900/80 mt-1">You’ll receive confirmation once it’s processed.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-4 grid grid-cols-1 sm:grid-cols-12 gap-4">
              <div className="sm:col-span-6">
                <label className="block text-xs font-bold text-taupe uppercase tracking-wider">Customer name</label>
                <input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="mt-1 w-full bg-white border border-borderSoft rounded-xl px-4 py-3 text-sm text-cocoa outline-none focus:border-gold focus:ring-1 focus:ring-gold"
                  placeholder="Your full name"
                />
              </div>
              <div className="sm:col-span-6">
                <label className="block text-xs font-bold text-taupe uppercase tracking-wider">Phone number</label>
                <input
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  inputMode="tel"
                  className="mt-1 w-full bg-white border border-borderSoft rounded-xl px-4 py-3 text-sm text-cocoa outline-none focus:border-gold focus:ring-1 focus:ring-gold"
                  placeholder="10-digit number"
                />
              </div>

              <div className="sm:col-span-12 flex justify-end">
                <button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    customerName.trim().length < 2 ||
                    normalizePhone(phoneNumber).length < 10
                  }
                  className={`px-6 py-3 rounded-xl font-bold shadow-soft bg-gradient-to-r from-gold to-goldDark text-white transition-all ${!isSubmitting &&
                      customerName.trim().length >= 2 &&
                      normalizePhone(phoneNumber).length >= 10
                      ? 'hover:brightness-110'
                      : 'opacity-60 cursor-not-allowed'
                    }`}
                >
                  {isSubmitting ? 'Booking…' : 'Submit booking'}
                </button>

              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
