-- Dream Edge Online — Seed Data
-- Run after initial schema to populate lookup data

-- ============================================
-- DEFAULT ROLES
-- ============================================
insert into roles (name, description, permissions) values
  ('super_admin', 'Full access to everything', '{"all": true}'),
  ('content_creator', 'Create/edit courses, content, tests; view student progress', '{"content": true, "tests": true, "students": "read"}'),
  ('teacher', 'View student performance, go live', '{"students": "read", "live_classes": true}'),
  ('accountant', 'Orders, payments, refunds, invoices, revenue analytics', '{"orders": true, "refunds": true, "revenue": true}'),
  ('support_staff', 'Student profiles, leads, notifications, banners', '{"students": true, "leads": true, "notifications": true, "banners": true}'),
  ('technical', 'Integrations, logs, user accounts, system settings', '{"settings": true, "audit_log": true, "users": true}');

-- ============================================
-- DEFAULT COURSE CATEGORIES
-- ============================================
insert into course_categories (name, slug, description, weight) values
  ('Class 6', 'class-6', 'Foundation courses for Class 6 students', 1),
  ('Class 7', 'class-7', 'Foundation courses for Class 7 students', 2),
  ('Class 8', 'class-8', 'Foundation courses for Class 8 students', 3),
  ('Class 9', 'class-9', 'Foundation courses for Class 9 students', 4),
  ('Class 10', 'class-10', 'Board preparation courses for Class 10 students', 5);
