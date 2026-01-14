import Link from "next/link";

const bookings = [
  {
    id: "BK001",
    salon: "Luxury Touch Salon",
    service: "Hair Spa",
    date: "12 Jan 2026",
    time: "02:00 PM",
    status: "confirmed",
  },
  {
    id: "BK002",
    salon: "Glow Beauty Studio",
    service: "Facial Therapy",
    date: "05 Jan 2026",
    time: "11:00 AM",
    status: "completed",
  },
];

export default function AppointmentsPage() {
  return (
    <section className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-10">
        <h1 className="font-serif text-3xl text-[#4a3728]">
          My Appointments
        </h1>

        <Link
          href="/search"
          className="bg-[#4a3728] text-white px-6 py-3 rounded-xl text-sm font-bold"
        >
          Book New
        </Link>
      </div>

      <div className="space-y-6">
        {bookings.map((b) => (
          <div
            key={b.id}
            className="bg-white p-6 rounded-2xl border border-gray-100"
          >
            <h3 className="font-semibold text-[#4a3728]">
              {b.service}
            </h3>
            <p className="text-sm text-[#7a6a5e]">
              {b.salon}
            </p>
            <p className="text-sm text-[#7a6a5e]">
              {b.date} • {b.time}
            </p>
            <span className="inline-block mt-2 text-xs px-3 py-1 rounded-full bg-[#FAF7F4]">
              {b.status}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
