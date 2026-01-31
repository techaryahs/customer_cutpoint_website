'use client';

import { useTranslations } from 'next-intl';

export default function CustomerWalletPage() {
  const t = useTranslations('Wallet');

  return (
    <section className="max-w-4xl">
      <h1 className="text-3xl font-semibold text-[#4a3728] mb-8">
        {t('title')}
      </h1>

      <div className="bg-white p-8 rounded-2xl border border-gray-200 mb-8">
        <p className="text-sm text-[#7a6a5e] mb-2">
          {t('balance')}
        </p>
        <p className="text-4xl font-bold text-[#4a3728]">
          ₹0.00
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-gray-200">
        <h2 className="text-lg font-semibold mb-4">
          {t('activity')}
        </h2>

        <p className="text-[#7a6a5e] text-sm">
          {t('no_transactions')}
        </p>
      </div>
    </section>
  );
}
