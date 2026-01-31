'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/app/routing';

const orders = [
  {
    id: 'ORD001',
    product: 'Argan Nourishing Hair Serum',
    brand: 'Luxury Touch',
    date: '18 Jan 2026',
    price: '₹1,499',
    status: 'Delivered',
    image:
      'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?q=80&w=1200&auto=format&fit=crop',
  },
  {
    id: 'ORD002',
    product: 'Herbal Repair Shampoo',
    brand: 'Glow Beauty',
    date: '10 Jan 2026',
    price: '₹899',
    status: 'Processing',
    image:
      'https://images.unsplash.com/photo-1585232351745-1c2b0f7b4b63?q=80&w=1200&auto=format&fit=crop',
  },
];

export default function CustomerOrdersPage() {
  const t = useTranslations('Orders');

  return (
    <section className="max-w-6xl">
      {/* PAGE HEADER */}
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-3xl font-semibold text-[#4a3728]">
          {t('title')}
        </h1>

        <button className="px-6 py-3 rounded-xl bg-[#4a3728] text-white font-semibold hover:opacity-90">
          {t('browse_products')}
        </button>
      </div>

      {orders.length > 0 ? (
        <div className="space-y-8">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-3xl border border-gray-200 p-6 flex gap-6 items-center hover:shadow-lg transition"
            >
              {/* PRODUCT IMAGE */}
              <div className="w-32 h-32 rounded-2xl overflow-hidden flex-shrink-0">
                <img
                  src={order.image}
                  alt={order.product}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* ORDER DETAILS (F-pattern) */}
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-[#4a3728] mb-1">
                  {order.product}
                </h3>
                <p className="text-sm text-[#7a6a5e] mb-2">
                  {order.brand}
                </p>
                <p className="text-sm text-[#7a6a5e]">
                  {t('ordered_on', { date: order.date })}
                </p>
              </div>

              {/* STATUS + CTA (Z-pattern) */}
              <div className="text-right">
                <span
                  className={`inline-block mb-4 text-xs px-3 py-1 rounded-full font-semibold ${
                    order.status === 'Delivered'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {order.status}
                </span>

                <div>
                  <p className="text-lg font-semibold text-[#4a3728] mb-3">
                    {order.price}
                  </p>

                  <button className="px-5 py-2 rounded-xl border text-sm font-semibold hover:bg-[#FAF7F4]">
                    {t('view_details')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* EMPTY STATE */
        <div className="bg-white p-16 rounded-3xl border border-gray-200 text-center">
          <p className="text-[#7a6a5e] mb-6 text-lg">
            {t('empty_desc')}
          </p>
          <button className="px-6 py-3 rounded-xl bg-[#4a3728] text-white font-semibold">
            {t('browse_products')}
          </button>
        </div>
      )}
    </section>
  );
}
