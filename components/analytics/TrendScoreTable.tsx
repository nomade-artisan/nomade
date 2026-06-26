//components/analytics/TrendScoreTable.tsx
interface TrendProduct {
  product_id: string;
  trend_score: number;
}

function getTrend(score: number) {
  if (score >= 80) {
    return {
      icon: "📈",
      label: "Forte hausse",
    };
  }

  if (score >= 40) {
    return {
      icon: "➡️",
      label: "Stable",
    };
  }

  return {
    icon: "📉",
    label: "En baisse",
  };
}

export default function TrendScoreTable({
  products,
}: {
  products: TrendProduct[];
}) {
  return (
    <div className="bg-white border border-stone-200 rounded-3xl p-6">
      <h2 className="text-xl font-light mb-6">
        Tendances Produits
      </h2>

      <div className="space-y-4">
        {products.map((product) => {
          const trend = getTrend(product.trend_score);

          return (
            <div
              key={product.product_id}
              className="
                flex
                items-center
                justify-between
                border-b
                border-stone-100
                pb-4
              "
            >
              <div>
                <p className="font-medium">
                  {product.product_id}
                </p>

                <p className="text-sm text-stone-500">
                  Score : {product.trend_score.toFixed(1)}
                </p>
              </div>

              <div className="text-right">
                <p className="text-lg">
                  {trend.icon}
                </p>

                <p className="text-xs text-stone-500">
                  {trend.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}