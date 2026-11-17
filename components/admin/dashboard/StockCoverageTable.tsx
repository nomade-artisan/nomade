import type { StockCoverage } from "@/lib/analytics/types";

const numberFormat = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 });

export default function StockCoverageTable({ data }: { data: StockCoverage[] }) {
  if (data.length === 0) {
    return (
      <div className="rounded-lg border p-6 text-sm text-muted-foreground">
        Aucun produit actif à analyser.
      </div>
    );
  }

  return (
    <section className="rounded-lg border bg-white p-5">
      <h2 className="text-xl font-semibold">Stock à examiner en priorité</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Trié selon la couverture estimée. La moyenne quotidienne tient compte des jours observés depuis
        la première commande payée dans la période et de la date de création du produit, pour éviter de
        diluer les données récentes. Sans vente observée, la couverture ne peut pas être estimée.
      </p>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b text-muted-foreground">
              <th scope="col" className="py-3 pr-4 font-medium">Produit</th>
              <th scope="col" className="px-4 py-3 text-right font-medium">Stock</th>
              <th scope="col" className="px-4 py-3 text-right font-medium">Vendus (30 j)</th>
              <th scope="col" className="px-4 py-3 text-right font-medium">Jours observés</th>
              <th scope="col" className="px-4 py-3 text-right font-medium">Moyenne / jour</th>
              <th scope="col" className="py-3 pl-4 text-right font-medium">Couverture estimée</th>
            </tr>
          </thead>
          <tbody>
            {data.map((product) => (
              <tr key={product.product_id} className="border-b last:border-0">
                <th scope="row" className="py-3 pr-4 font-medium">{product.product_name}</th>
                <td className="px-4 py-3 text-right">{numberFormat.format(product.current_stock)}</td>
                <td className="px-4 py-3 text-right">{numberFormat.format(product.units_sold_30d)}</td>
                <td className="px-4 py-3 text-right">{numberFormat.format(product.observed_days)}</td>
                <td className="px-4 py-3 text-right">{numberFormat.format(product.average_daily_units)}</td>
                <td className="py-3 pl-4 text-right font-medium">
                  {product.estimated_stock_days === null
                    ? "Non estimable"
                    : `${numberFormat.format(product.estimated_stock_days)} jours`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        Ce repère aide à repérer les références à vérifier. Le délai fournisseur et le stock de sécurité
        ne sont pas encore pris en compte ; il ne déclenche pas de commande automatiquement.
      </p>
    </section>
  );
}
