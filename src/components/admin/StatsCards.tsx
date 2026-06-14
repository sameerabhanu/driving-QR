interface StatsCardsProps {
  stats: {
    total: number;
    active: number;
    expired: number;
    expiringThisMonth: number;
  };
}

const cards = [
  { key: "total" as const, label: "Total Schools", color: "bg-brand-50 text-brand-700 border-brand-100" },
  { key: "active" as const, label: "Active Schools", color: "bg-green-50 text-green-700 border-green-100" },
  { key: "expired" as const, label: "Expired Schools", color: "bg-red-50 text-red-700 border-red-100" },
  { key: "expiringThisMonth" as const, label: "Expiring This Month", color: "bg-amber-50 text-amber-700 border-amber-100" },
];

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
      {cards.map((card) => (
        <div
          key={card.key}
          className={`rounded-xl border p-5 ${card.color}`}
        >
          <p className="text-sm font-medium opacity-80">{card.label}</p>
          <p className="mt-2 text-3xl font-bold">{stats[card.key]}</p>
        </div>
      ))}
    </div>
  );
}
