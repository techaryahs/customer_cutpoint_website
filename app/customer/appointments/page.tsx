'use client';
import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";

type Booking = {
  appointmentId: string;
  date: string;
  startTime: string;
  status: string;
  totalAmount: number;
  totalDuration: number;
  paymentStatus: string;
  place: {
    name: string;
    address: string;
  };
  employee: {
    name: string;
    phone: string;
  };
  services: {
    serviceId: string;
    name: string;
    image?: string; 
  }[];
};

export default function AppointmentsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const token = localStorage.getItem("salon_token");
        const rawUser = localStorage.getItem("salon_user");

        if (!rawUser || !token) {
          setLoading(false);
          return;
        }

        const user = JSON.parse(rawUser);
        const customerId = user.uid;
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/customer/appointments/${customerId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setBookings(res.data.appointments || []);
      } catch (error) {
        console.error("Failed to fetch appointments", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  if (loading) {
    return (
      <section className="max-w-6xl mx-auto text-center py-32">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#4a3728] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[#7a6a5e] font-medium">Curating your appointments...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-5xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="font-serif text-4xl text-[#4a3728] tracking-tight">
            My Appointments
          </h1>
          <p className="text-[#7a6a5e] mt-1">Manage your upcoming and past salon visits</p>
        </div>

        <Link
          href="/search"
          className="bg-[#4a3728] hover:bg-[#5d4633] transition-colors text-white px-8 py-3.5 rounded-2xl text-sm font-bold shadow-lg shadow-[#4a3728]/20"
        >
          Book New Experience
        </Link>
      </div>

      <div className="grid gap-6">
        {bookings.length > 0 ? (
          bookings.map((b) => {
            const serviceImage = b.services[0]?.image;

            return (
              <div
                key={b.appointmentId}
                className="group bg-white p-5 rounded-3xl border border-gray-100 flex flex-col sm:flex-row items-center sm:items-start gap-6 hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 ease-in-out"
              >
                {/* IMAGE BOX */}
                <div className="w-32 h-32 flex-shrink-0 relative overflow-hidden rounded-2xl shadow-inner">
                  {serviceImage ? (
                    <img
                      src={serviceImage}
                      alt={b.services[0].name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#FAF7F4] flex items-center justify-center border border-[#eae4dc]">
                      <span className="text-[#4a3728] text-2xl font-serif">
                        {b.services[0]?.name?.charAt(0) || "S"}
                      </span>
                    </div>
                  )}
                </div>

                {/* CONTENT AREA */}
                <div className="flex-1 flex flex-col md:flex-row justify-between w-full">
                  <div className="space-y-1 text-center sm:text-left">
                    <h3 className="font-bold text-xl text-[#4a3728] leading-tight">
                      {b.services.map(s => s.name).join(", ")}
                    </h3>
                    
                    <p className="text-[#7a6a5e] font-medium flex items-center justify-center sm:justify-start gap-1">
                      <span className="opacity-70">{b.place.name}</span>
                    </p>

                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-y-1 gap-x-3 text-sm text-[#7a6a5e] mt-2">
                      <span className="flex items-center gap-1 bg-[#FAF7F4] px-2 py-1 rounded-md">
                        📅 {b.date}
                      </span>
                      <span className="flex items-center gap-1 bg-[#FAF7F4] px-2 py-1 rounded-md">
                        ⏰ {b.startTime}
                      </span>
                      <span className="flex items-center gap-1 bg-[#FAF7F4] px-2 py-1 rounded-md">
                        ⏳ {b.totalDuration} mins
                      </span>
                    </div>

                    <p className="text-sm text-[#7a6a5e] pt-2">
                      With <span className="font-semibold text-[#4a3728]">{b.employee.name || "Assigned Professional"}</span>
                    </p>
                  </div>

                  {/* PRICE & STATUS SIDE */}
                  <div className="mt-4 md:mt-0 flex flex-col items-center md:items-end justify-between border-t md:border-t-0 border-gray-50 pt-4 md:pt-0">
                    <p className="text-2xl font-serif font-bold text-[#4a3728]">
                      ₹{b.totalAmount}
                    </p>

                    <div className="flex gap-2 mt-3">
                      <span className="text-[10px] uppercase tracking-wider font-bold px-3 py-1.5 rounded-lg bg-[#f0edea] text-[#4a3728]">
                        {b.status}
                      </span>

                      <span
                        className={`text-[10px] uppercase tracking-wider font-bold px-3 py-1.5 rounded-lg ${
                          b.paymentStatus === "paid"
                            ? "bg-green-50 text-green-600 border border-green-100"
                            : "bg-amber-50 text-amber-600 border border-amber-100"
                        }`}
                      >
                        {b.paymentStatus}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-20 bg-[#FAF7F4] rounded-3xl border border-dashed border-[#eae4dc]">
             <p className="text-[#7a6a5e]">No appointments found yet.</p>
          </div>
        )}
      </div>
    </section>
  );
}