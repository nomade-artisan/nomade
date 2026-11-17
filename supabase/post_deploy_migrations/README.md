# Migrations de mise en production

## État vérifié le 17 novembre 2026

- Le projet Vercel `nomade` utilise en Production le projet Supabase `hsfxhydtrntmublewdmq` (`supabase-nomade`, région `eu-north-1`). Cette URL a été confirmée par l’utilisateur dans les variables de Production de Vercel.
- Le fichier local `supabase/.temp/project-ref` pointe encore vers `ioymapbrhuusvaitsoyu`. Une inspection en lecture seule y a trouvé des tables `wedding_*` et aucune table boutique comme `orders` ou `products`. Ne pas y appliquer les migrations NOMADE ni utiliser `supabase db push --linked` avant d’avoir vérifié le lien et les migrations propres à ce projet.
- La migration `prepare_checkout_and_refund_schema` a été appliquée sur `hsfxhydtrntmublewdmq` le 17 novembre. Les colonnes `orders.stripe_refund_id` et `orders.refunded_at`, les index, la table de réservation et sa fonction sont présents. Aucun doublon bloquant n’a été trouvé avant l’application.
- Supabase a enregistré cette opération sous la version `20261117141915`, tandis que le dépôt contient `20261113040241_prepare_checkout_and_refund_schema.sql`. Vérifier la liste des migrations et réconcilier ces versions avant le prochain `db push`.
- Après la migration, le contrôle SQL a confirmé que RLS est activé sur `stripe_inventory_reservations`, que `anon` ne peut pas exécuter `reserve_products_for_payment` et que `service_role` le peut.
- Vercel n’a signalé aucune nouvelle erreur sur `/admin/dashboard` dans la fenêtre de dix minutes suivant la migration. Recharger le tableau de bord pour confirmer le parcours en direct.

## Migrations restantes à examiner

- `20261114031427_restrict_public_prediction_reads.sql` cible `product_forecasts` et `product_predictions`, tables absentes du projet `hsfxhydtrntmublewdmq` lors de la vérification. Ne pas appliquer cette migration telle quelle à cette base.
- `20261114024801_restrict_public_writes_and_storage.sql` reste dans ce dossier et n’a pas été appliquée. Elle modifie les politiques et les droits du catalogue, des avis, des événements analytiques, des contacts et du stockage. Vérifier les parcours concernés avant de l’appliquer.
- Le conseiller Supabase signale aussi que `public.rls_auto_enable()` est une fonction `SECURITY DEFINER` dont l’exécution est accordée à `anon` et `authenticated`, ainsi qu’un `search_path` non fixé pour `promo_codes_set_updated_at`. La migration de verrouillage ci-dessus prévoit des corrections, mais elle touche aussi les politiques et le stockage ; traiter ces points dans une étape dédiée.
