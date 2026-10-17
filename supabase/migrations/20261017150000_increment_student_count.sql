CREATE OR REPLACE FUNCTION increment_student_count(
  p_course_id UUID
)
RETURNS void AS $$
BEGIN
  UPDATE courses
  SET student_count = COALESCE(student_count, 0) + 1
  WHERE id = p_course_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
