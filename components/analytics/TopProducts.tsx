//components/analytics/TopProducts.tsx
interface ProductMetric {
  product_id: string;
  views: number;
  carts: number;
  purchases: number;
  trend_score: number;
}

export default function TopProducts({
  products,
}: {
  products: ProductMetric[];
}) {
  return (
    <div className="bg-white border border-stone-200 rounded-3xl p-6">
      <h2 className="text-xl font-light mb-6">
        Top Produits
      </h2>

      <div className="space-y-4">
        {products.map((product, index) => (
          <div
            key={product.product_id}
            className="flex items-center justify-between border-b border-stone-100 pb-4"
          >
            <div>
              <p className="font-medium">
                #{index + 1}
              </p>

              <p className="text-stone-500 text-sm">
                {product.product_id}
              </p>
            </div>

            <div className="text-right">
              <p className="text-lg">
                {product.trend_score.toFixed(1)}
              </p>

              <p className="text-xs text-stone-400">
                score
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}