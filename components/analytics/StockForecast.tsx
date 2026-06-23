interface StockProduct {
  product_id: string;
  stock: number;
  purchases: number;
}

export default function StockForecast({
  products,
}: {
  products: StockProduct[];
}) {
  return (
    <div className="bg-white border border-stone-200 rounded-3xl p-6">
      <h2 className="text-xl font-light mb-6">
        Prévision de stock
      </h2>

      <div className="space-y-4">
        {products.map((product) => {
          const daysLeft =
            product.purchases > 0
              ? Math.round(product.stock / product.purchases)
              : null;

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
                  Stock : {product.stock}
                </p>
              </div>

              <div className="text-right">
                {daysLeft ? (
                  <>
                    <p className="font-medium">
                      {daysLeft} jours
                    </p>

                    <p className="text-xs text-stone-500">
                      avant rupture
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-medium">
                      —
                    </p>

                    <p className="text-xs text-stone-500">
                      pas assez de données
                    </p>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}