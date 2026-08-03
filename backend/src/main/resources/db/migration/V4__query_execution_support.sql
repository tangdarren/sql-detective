-- Hidden expected queries for result validation (never exposed by challenge APIs).
ALTER TABLE challenges
    ADD COLUMN expected_query TEXT;

UPDATE challenges
SET expected_query = $sql$
SELECT full_name, room_number, vip_status
FROM guests
WHERE room_number BETWEEN 410 AND 422
  AND check_in_date <= DATE '2024-11-03'
  AND check_out_date > DATE '2024-11-03'
ORDER BY room_number
$sql$
WHERE level_number = 1;

UPDATE challenges
SET expected_query = $sql$
SELECT e.full_name, e.job_title, r.room_number, r.entry_time
FROM employees e
INNER JOIN room_access_logs r
  ON r.person_type = 'employee' AND r.person_id = e.id
WHERE e.access_level = 'MASTER'
  AND r.access_method = 'MASTER_KEY'
  AND r.entry_time >= TIMESTAMPTZ '2024-11-03 00:00:00+00'
  AND r.entry_time < TIMESTAMPTZ '2024-11-04 12:00:00+00'
$sql$
WHERE level_number = 2;

UPDATE challenges
SET expected_query = $sql$
SELECT person_type, person_id, entry_time, exit_time, access_method
FROM room_access_logs
WHERE room_number = 417
  AND entry_time BETWEEN TIMESTAMPTZ '2024-11-04 00:00:00+00'
                     AND TIMESTAMPTZ '2024-11-04 01:00:00+00'
$sql$
WHERE level_number = 3;

UPDATE challenges
SET expected_query = $sql$
SELECT g.full_name,
       COUNT(*) AS payment_count,
       SUM(p.amount) AS total_amount
FROM payments p
INNER JOIN guests g ON g.id = p.guest_id
WHERE p.payment_type = 'CASH'
  AND p.status = 'COMPLETED'
  AND p.payment_time BETWEEN TIMESTAMPTZ '2024-11-03 18:00:00+00'
                         AND TIMESTAMPTZ '2024-11-04 03:00:00+00'
GROUP BY g.full_name
HAVING SUM(p.amount) > 200
$sql$
WHERE level_number = 4;

UPDATE challenges
SET expected_query = $sql$
SELECT g.full_name,
       g.room_number,
       r.entry_time,
       r.access_method,
       p.amount,
       p.payment_time
FROM guests g
INNER JOIN room_access_logs r
  ON r.person_type = 'guest' AND r.person_id = g.id
INNER JOIN payments p
  ON p.guest_id = g.id
WHERE r.room_number = 417
  AND r.entry_time BETWEEN TIMESTAMPTZ '2024-11-04 00:00:00+00'
                       AND TIMESTAMPTZ '2024-11-04 01:00:00+00'
  AND p.payment_type = 'CASH'
  AND p.status = 'COMPLETED'
  AND p.amount > 2000
  AND p.payment_time > r.entry_time
$sql$
WHERE level_number = 5;

ALTER TABLE challenges
    ALTER COLUMN expected_query SET NOT NULL;

-- Read-only player role: can inspect investigation tables only.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'sql_detective_readonly') THEN
        CREATE ROLE sql_detective_readonly LOGIN PASSWORD 'sql_detective_readonly';
    END IF;
END
$$;

REVOKE ALL ON SCHEMA public FROM sql_detective_readonly;
GRANT USAGE ON SCHEMA public TO sql_detective_readonly;

REVOKE ALL ON ALL TABLES IN SCHEMA public FROM sql_detective_readonly;
GRANT SELECT ON TABLE guests, employees, room_access_logs, payments, evidence_items
    TO sql_detective_readonly;
