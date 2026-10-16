-- Additional RPCs for revenue analytics page

-- Payment method breakdown (for donut chart)
CREATE OR REPLACE FUNCTION get_payment_method_breakdown(
  start_date timestamptz DEFAULT NULL,
  end_date   timestamptz DEFAULT NULL
)
RETURNS json AS $$
BEGIN
  RETURN (
    SELECT COALESCE(json_agg(row_to_json(r)), '[]'::json)
    FROM (
      SELECT
        payment_method AS method,
        COUNT(*)       AS order_count,
        COALESCE(SUM(final_amount), 0) AS total_amount
      FROM orders
      WHERE status = 'completed'
        AND (start_date IS NULL OR created_at >= start_date)
        AND (end_date   IS NULL OR created_at <= end_date)
      GROUP BY payment_method
      ORDER BY total_amount DESC
    ) r
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Daily order counts (for bar chart, last N days)
CREATE OR REPLACE FUNCTION get_daily_orders(
  start_date timestamptz DEFAULT NULL,
  end_date   timestamptz DEFAULT NULL
)
RETURNS json AS $$
BEGIN
  RETURN (
    SELECT COALESCE(json_agg(row_to_json(d)), '[]'::json)
    FROM (
      SELECT
        date_trunc('day', created_at)::date AS day,
        COUNT(*)                            AS order_count,
        COALESCE(SUM(final_amount), 0)      AS revenue
      FROM orders
      WHERE status = 'completed'
        AND (start_date IS NULL OR created_at >= start_date)
        AND (end_date   IS NULL OR created_at <= end_date)
      GROUP BY date_trunc('day', created_at)::date
      ORDER BY day ASC
    ) d
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Refund summary stats
CREATE OR REPLACE FUNCTION get_refund_stats(
  start_date timestamptz DEFAULT NULL,
  end_date   timestamptz DEFAULT NULL
)
RETURNS json AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'total_refunds', COUNT(*),
    'total_refund_amount', COALESCE(SUM(amount), 0),
    'pending_count', COUNT(*) FILTER (WHERE status = 'requested'),
    'approved_count', COUNT(*) FILTER (WHERE status = 'approved'),
    'processed_count', COUNT(*) FILTER (WHERE status = 'processed'),
    'rejected_count', COUNT(*) FILTER (WHERE status = 'rejected')
  ) INTO result
  FROM refunds
  WHERE (start_date IS NULL OR created_at >= start_date)
    AND (end_date   IS NULL OR created_at <= end_date);

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Index on orders.created_at for date range queries
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_refunds_created_at ON refunds(created_at);
CREATE INDEX IF NOT EXISTS idx_refunds_status ON refunds(status);
