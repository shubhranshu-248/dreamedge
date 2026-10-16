-- Revenue aggregation RPCs + slug unique constraint
-- Replaces JS-side summing that breaks at >1000 rows

-- Aggregate revenue stats server-side so the dashboard
-- never silently under-counts when orders exceed the
-- default Supabase response limit.
CREATE OR REPLACE FUNCTION get_revenue_stats(
  start_date timestamptz DEFAULT NULL,
  end_date   timestamptz DEFAULT NULL
)
RETURNS json AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'total_revenue', COALESCE(SUM(final_amount), 0),
    'total_orders',  COUNT(*),
    'monthly_revenue', (
      SELECT COALESCE(json_agg(row_to_json(m)), '[]'::json)
      FROM (
        SELECT
          date_trunc('month', created_at) AS month,
          SUM(final_amount)               AS revenue,
          COUNT(*)                        AS order_count
        FROM orders
        WHERE status = 'completed'
          AND (start_date IS NULL OR created_at >= start_date)
          AND (end_date   IS NULL OR created_at <= end_date)
        GROUP BY date_trunc('month', created_at)
        ORDER BY month DESC
        LIMIT 12
      ) m
    )
  ) INTO result
  FROM orders
  WHERE status = 'completed'
    AND (start_date IS NULL OR created_at >= start_date)
    AND (end_date   IS NULL OR created_at <= end_date);

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Top courses by enrollment count with revenue,
-- replacing the N+1 pattern of one query per course.
CREATE OR REPLACE FUNCTION get_top_courses(course_limit int DEFAULT 5)
RETURNS json AS $$
BEGIN
  RETURN (
    SELECT COALESCE(json_agg(row_to_json(c)), '[]'::json)
    FROM (
      SELECT
        co.id,
        co.name,
        co.slug,
        co.thumbnail_url,
        co.status,
        co.price,
        COUNT(DISTINCT e.id)            AS enrollment_count,
        COALESCE(SUM(o.final_amount), 0) AS total_revenue
      FROM courses co
      LEFT JOIN enrollments e ON e.course_id = co.id
      LEFT JOIN orders o      ON o.course_id = co.id AND o.status = 'completed'
      WHERE co.status = 'published'
      GROUP BY co.id, co.name, co.slug, co.thumbnail_url, co.status, co.price
      ORDER BY enrollment_count DESC
      LIMIT course_limit
    ) c
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Slug uniqueness is already enforced by the courses table definition
-- (slug text unique not null), so no ALTER TABLE needed.
