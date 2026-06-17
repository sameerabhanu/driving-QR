import { formatCurrency } from "@/lib/utils";

interface ShopStatsCardsProps {
  stats: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    freeRemaining: number;
    amountDue: number;
  };
}

export function ShopStatsCards({ stats }: ShopStatsCardsProps) {
  const cards = [
    {
      label: "Pages This Month",
      value: String(stats.thisMonth),
      color: "bg-brand-50 text-brand-700 border-brand-100",
    },
    {
      label: "Pages Last Month",
      value: String(stats.lastMonth),
      color: "bg-violet-50 text-violet-700 border-violet-100",
    },
    {
      label: "Total Pages",
      value: String(stats.total),
      color: "bg-emerald-50 text-emerald-700 border-emerald-100",
    },
    {
      label:
        stats.amountDue > 0
          ? "This Month's Bill"
          : `${stats.freeRemaining} Free Pages Left`,
      value: stats.amountDue > 0 ? formatCurrency(stats.amountDue) : "₹0",
      color:
        stats.amountDue > 0
          ? "bg-amber-50 text-amber-700 border-amber-100"
          : "bg-green-50 text-green-700 border-green-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
      {cards.map((card) => (
        <div key={card.label} className={`rounded-xl border p-5 ${card.color}`}>
          <p className="text-sm font-medium opacity-80">{card.label}</p>
          <p className="mt-2 text-3xl font-bold">{card.value}</p>
        </div>
      ))}
    </div>
  );
}
