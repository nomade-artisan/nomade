# Migrations de mise en production

## État vérifié le 14 novembre 2026

- Le projet de la boutique est `ioymapbrhuusvaitsoyu`; il répond après sa réactivation. Le build de production local passe, et des lectures en lecture seule ont confirmé des données dans `products`, `categories` et `collections`.
- `20261113040241_prepare_checkout_and_refund_schema.sql` est appliquée et vérifiée. Les index sont valides, les colonnes de remboursement sont présentes, et `reserve_products_for_payment` est exécutable uniquement par `service_role`.
- `20261114031427_restrict_public_prediction_reads.sql` est appliquée et vérifiée. RLS est activé sur `product_forecasts` et `product_predictions`; `anon` et `authenticated` n'ont plus le droit SELECT. Le client serveur `service_role` conserve l'accès.
- `20261114024801_restrict_public_writes_and_storage.sql` reste dans ce dossier : ses restrictions générales des anciennes écritures anonymes doivent attendre le déploiement du nouveau code.

Le projet `hsfxhydtrntmublewdmq` vu lors d'un audit antérieur est une autre base et ne doit pas être ciblé pour les migrations de la boutique.

## Ordre restant

1. Vérifier dans Vercel que `NEXT_PUBLIC_SUPABASE_URL` désigne `https://ioymapbrhuusvaitsoyu.supabase.co`.
2. Déployer le nouveau code et vérifier en mode test le catalogue, le panier, le paiement, le webhook Stripe, les stocks, les remboursements et les routes contact/avis/newsletter.
3. Après validation du nouveau code en ligne, déplacer le SQL de verrouillage de ce dossier dans `supabase/migrations`, refaire un dry-run et confirmer qu'il ne liste que cette migration, puis l'appliquer.
4. Contrôler les lectures publiques du catalogue, les écritures via les API serveur et les opérations d'administration après le verrouillage.

Le conseiller Supabase ne signale plus d'erreur RLS. Il signale encore un index unique redondant sur `product_daily_metrics` et un `search_path` non fixé sur `promo_codes_set_updated_at`. La fonction est actuellement `SECURITY INVOKER`; la migration de verrouillage fixe son `search_path` et retire le doublon d'index, en conservant celui utilisé par les upserts applicatifs.

Les migrations locales n'affectent pas le distant par elles-mêmes. Vérifier la liste et le dry-run avant chaque `db push`; ne pas utiliser `--include-all` ou `--yes` pour contourner ce contrôle.
