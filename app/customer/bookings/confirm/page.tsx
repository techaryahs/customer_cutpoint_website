import Link from "next/link";

export default function BookingConfirmPage() {
  return (
    <section className="max-w-xl mx-auto text-center">
      <div className="bg-white p-12 rounded-3xl border border-gray-100">
        <h1 className="font-serif text-3xl text-[#4a3728] mb-4">
          Booking Confirmed 🎉
        </h1>
        <p className="text-[#7a6a5e] mb-8">
          Your appointment has been successfully booked.
        </p>

        <Link
          href="/customer/appointments"
          className="bg-[#4a3728] text-white px-8 py-4 rounded-xl font-bold"
        >
          View My Appointments
        </Link>
      </div>
    </section>
  );
}
