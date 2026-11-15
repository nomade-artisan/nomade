-- Prediction tables contain internal business forecasts. The application reads
-- product_predictions only through its server-only service-role client.
ALTER TABLE public.product_forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_predictions ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.product_forecasts, public.product_predictions
  FROM PUBLIC, anon, authenticated;
