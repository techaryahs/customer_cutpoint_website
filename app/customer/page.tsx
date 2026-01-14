'use client';

import { useState } from 'react';
import Link from 'next/link';

/* ---------------- TYPES ---------------- */

type Booking = {
  id: string;
  salon: string;
  service: string;
  date: string;
  time: string;
};

/* ---------------- MOCK DATA ---------------- */

const INITIAL_BOOKING: Booking = {
  id: 'BK1001',
  salon: 'Luxury Touch Salon',
  service: 'Hair Spa Treatment',
  date: '2026-01-12',
  time: '04:00 PM',
};

const TIME_SLOTS = [
  '10:00 AM',
  '12:00 PM',
  '02:00 PM',
  '04:00 PM',
  '06:00 PM',
];

/* ---------------- COMPONENT ---------------- */

export default function CustomerDashboard() {
  const [booking, setBooking] = useState<Booking | null>(INITIAL_BOOKING);
  const [isRescheduling, setIsRescheduling] = useState(false);

  /* ---------------- UI ---------------- */

  return (
    <section className="max-w-6xl mx-auto pb-24 px-6">
      {/* HEADER */}
      <div className="mb-14">
        <h1 className="font-serif text-4xl text-[#4a3728] italic mb-3">
          Welcome back 👋
        </h1>
        <p className="text-[#7a6a5e] text-lg">
          Here’s a look at your upcoming visit
        </p>
      </div>

      {/* UPCOMING APPOINTMENT */}
      {booking ? (
        <div className="bg-white rounded-[2.5rem] border border-[#eae4dc] p-10 mb-16">
          <span className="inline-block text-xs uppercase text-[#b3936a] font-semibold mb-3">
            Upcoming Appointment
          </span>

          <h2 className="text-2xl font-semibold text-[#4a3728] mb-1">
            {booking.service}
          </h2>
          <p className="text-[#7a6a5e] mb-6">{booking.salon}</p>

          <p className="text-lg font-medium text-[#4a3728] mb-8">
            {booking.date} • {booking.time}
          </p>

          {!isRescheduling ? (
            <div className="flex gap-4">
              <button
                onClick={() => setIsRescheduling(true)}
                className="px-8 py-3 rounded-full bg-[#FAF7F4] text-[#4a3728]"
              >
                Reschedule
              </button>
            </div>
          ) : (
            <div className="mt-8">
              <label className="block text-sm text-[#7a6a5e] mb-2">
                Select time
              </label>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                {TIME_SLOTS.map((slot) => (
                  <button
                    key={slot}
                    onClick={() =>
                      setBooking({ ...booking, time: slot })
                    }
                    className={`py-3 rounded-full border text-sm ${
                      booking.time === slot
                        ? 'bg-[#4a3728] text-white'
                        : 'bg-white text-[#4a3728] hover:bg-[#FAF7F4]'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setIsRescheduling(false)}
                  className="px-10 py-3 rounded-full bg-[#4a3728] text-white"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setIsRescheduling(false)}
                  className="px-10 py-3 rounded-full bg-[#FAF7F4] text-[#4a3728]"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] border border-[#eae4dc] p-16 text-center mb-16">
          <h2 className="text-2xl font-semibold text-[#4a3728] mb-3">
            No upcoming appointments
          </h2>
          <p className="text-[#7a6a5e] mb-8">
            Discover premium salons and book your next experience
          </p>
          <Link
            href="/"
            className="inline-block bg-[#4a3728] text-white px-10 py-4 rounded-full font-semibold"
          >
            Book New Appointment
          </Link>
        </div>
      )}

      {/* ACTION CARDS */}
      <div className="grid md:grid-cols-2 gap-8">
        <ActionCard
          title="My Appointments"
          desc="View upcoming & past bookings"
          href="/customer/appointments"
        />
        <ActionCard
          title="My Profile"
          desc="View and update your details"
          href="/customer/profile"
        />
      </div>
    </section>
  );
}

/* ---------------- ACTION CARD ---------------- */

function ActionCard({
  title,
  desc,
  href,
}: {
  title: string;
  desc: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="bg-white rounded-[2rem] border border-[#eae4dc] p-8 hover:shadow-lg transition"
    >
      <h3 className="text-xl font-semibold text-[#4a3728] mb-2">
        {title}
      </h3>
      <p className="text-[#7a6a5e]">{desc}</p>
    </Link>
  );
}
