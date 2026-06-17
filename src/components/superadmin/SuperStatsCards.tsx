import { formatCurrency } from "@/lib/utils";

interface SuperStatsCardsProps {
  stats: {
    totalShops: number;
    activeShops: number;
    suspendedShops: number;
    billableShops: number;
    pagesThisMonth: number;
    revenueThisMonth: number;
    collectedThisMonth: number;
  };
}

export function SuperStatsCards({ stats }: SuperStatsCardsProps) {
  const cards = [
    {
      label: "Total Shops",
      value: String(stats.totalShops),
      sub: `${stats.activeShops} active · ${stats.suspendedShops} suspended`,
      color: "bg-brand-50 text-brand-700 border-brand-100",
    },
    {
      label: "Pages This Month",
      value: String(stats.pagesThisMonth),
      sub: `${stats.billableShops} billable shops`,
      color: "bg-violet-50 text-violet-700 border-violet-100",
    },
    {
      label: "Revenue This Month",
      value: formatCurrency(stats.revenueThisMonth),
      sub: "across all shops",
      color: "bg-amber-50 text-amber-700 border-amber-100",
    },
    {
      label: "Collected This Month",
      value: formatCurrency(stats.collectedThisMonth),
      sub: `${formatCurrency(stats.revenueThisMonth - stats.collectedThisMonth)} pending`,
      color: "bg-green-50 text-green-700 border-green-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
      {cards.map((card) => (
        <div key={card.label} className={`rounded-xl border p-5 ${card.color}`}>
          <p className="text-sm font-medium opacity-80">{card.label}</p>
          <p className="mt-2 text-3xl font-bold">{card.value}</p>
          <p className="mt-1 text-xs opacity-70">{card.sub}</p>
        </div>
      ))}
    </div>
  );
}
