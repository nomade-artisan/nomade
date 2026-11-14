-- Protect paid checkout retries and concurrent purchases from overselling stock.
CREATE TABLE IF NOT EXISTS public.stripe_inventory_reservations (
  payment_intent_id text PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.stripe_inventory_reservations ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.stripe_inventory_reservations FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.stripe_inventory_reservations TO service_role;

CREATE OR REPLACE FUNCTION public.reserve_products_for_payment(
  p_payment_intent_id text,
  p_items jsonb
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  item jsonb;
  product_id integer;
  quantity integer;
BEGIN
  IF p_payment_intent_id IS NULL OR length(p_payment_intent_id) > 255 THEN
    RAISE EXCEPTION 'Invalid payment reference';
  END IF;
  IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) > 50 THEN
    RAISE EXCEPTION 'Invalid product list';
  END IF;

  INSERT INTO public.stripe_inventory_reservations (payment_intent_id)
  VALUES (p_payment_intent_id)
  ON CONFLICT (payment_intent_id) DO NOTHING;
  IF NOT FOUND THEN
    RETURN true;
  END IF;

  FOR item IN SELECT value FROM jsonb_array_elements(p_items)
  LOOP
    product_id := (item->>'id')::integer;
    quantity := (item->>'quantity')::integer;
    IF product_id <= 0 OR quantity <= 0 THEN
      RAISE EXCEPTION 'Invalid product quantity';
    END IF;

    UPDATE public.products
    SET stock = stock - quantity
    WHERE id = product_id
      AND status = 'active'
      AND stock >= quantity;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Insufficient product stock';
    END IF;
  END LOOP;

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.reserve_products_for_payment(text, jsonb)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reserve_products_for_payment(text, jsonb)
  TO service_role;

CREATE UNIQUE INDEX IF NOT EXISTS orders_payment_intent_id_key
  ON public.orders (payment_intent_id);

CREATE UNIQUE INDEX IF NOT EXISTS order_items_order_product_key
  ON public.order_items (order_id, product_id);

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS stripe_refund_id text,
  ADD COLUMN IF NOT EXISTS refunded_at timestamptz;
