export default function CustomerWalletPage() {
  return (
    <section className="max-w-4xl">
      <h1 className="text-3xl font-semibold text-[#4a3728] mb-8">
        Wallet
      </h1>

      <div className="bg-white p-8 rounded-2xl border border-gray-200 mb-8">
        <p className="text-sm text-[#7a6a5e] mb-2">
          Wallet balance
        </p>
        <p className="text-4xl font-bold text-[#4a3728]">
          ₹0.00
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-gray-200">
        <h2 className="text-lg font-semibold mb-4">
          Wallet activity
        </h2>

        <p className="text-[#7a6a5e] text-sm">
          No wallet transactions yet
        </p>
      </div>
    </section>
  );
}
