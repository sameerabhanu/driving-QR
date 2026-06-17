interface ShopStatsCardsProps {
  stats: {
    totalActivePages: number;
    availableCredits: number;
  };
}

export function ShopStatsCards({ stats }: ShopStatsCardsProps) {
  const cards = [
    {
      label: "Active Pages",
      value: String(stats.totalActivePages),
      color: "bg-brand-50 text-brand-700 border-brand-100",
    },
    {
      label: "Available Credits",
      value: String(stats.availableCredits),
      color: "bg-violet-50 text-violet-700 border-violet-100",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-8">
      {cards.map((card) => (
        <div key={card.label} className={`rounded-xl border p-4 sm:p-5 ${card.color}`}>
          <p className="text-xs sm:text-sm font-medium opacity-80">{card.label}</p>
          <p className="mt-2 text-2xl sm:text-3xl font-bold">{card.value}</p>
        </div>
      ))}
    </div>
  );
}
