interface AnalyticsStatsProps {
  products: number;
  views: number;
  carts: number;
  purchases: number;
}

export default function AnalyticsStats({
  products,
  views,
  carts,
  purchases,
}: AnalyticsStatsProps) {
  const cards = [
    {
      title: "Produits",
      value: products,
    },
    {
      title: "Vues",
      value: views,
    },
    {
      title: "Paniers",
      value: carts,
    },
    {
      title: "Achats",
      value: purchases,
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.title}
          className="
            bg-white
            border
            border-stone-200
            rounded-3xl
            p-6
          "
        >
          <p className="text-sm text-stone-500">
            {card.title}
          </p>

          <h3 className="text-3xl font-light mt-3">
            {card.value}
          </h3>
        </div>
      ))}
    </div>
  );
}