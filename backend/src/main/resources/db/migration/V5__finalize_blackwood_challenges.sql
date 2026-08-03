-- Finalize Case 01 challenge copy, expected queries, and evidence image filenames.
-- Keeps one consistent mystery ending with a single correct thief.

ALTER TABLE challenges
    ADD COLUMN evidence_image_filename VARCHAR(120);

UPDATE challenges
SET
    story_text = 'The Blackwood Hotel logged every guest for the private reception. Start with the names and rooms nearest the crime.',
    objective = 'List guests who stayed on the fourth floor (rooms 410 to 422) during the event night of 2024-11-03. Include full name, room number, and VIP status. Order the rows by room number.',
    starter_query = 'SELECT full_name, room_number, vip_status' || E'\n' || 'FROM guests;',
    hint = 'Filter with WHERE on room_number and check-in/check-out dates, then ORDER BY room_number.',
    success_clue = 'Several guests stayed on the fourth floor near Room 417 that night — including the guest in Room 410 beside the crime scene.',
    difficulty = 'EASY',
    order_sensitive = TRUE,
    evidence_image_filename = 'guest-registry.svg',
    expected_query = $sql$
SELECT full_name, room_number, vip_status
FROM guests
WHERE room_number BETWEEN 410 AND 422
  AND check_in_date <= DATE '2024-11-03'
  AND check_out_date > DATE '2024-11-03'
ORDER BY room_number
$sql$
WHERE level_number = 1;

UPDATE challenges
SET
    story_text = 'A master key was signed out during the night shift. Cross-check who held MASTER access while they were actually on duty.',
    objective = 'Find employees with MASTER access who used a MASTER_KEY during their own shift. Return employee name, job title, room number accessed, and entry time.',
    starter_query = 'SELECT e.full_name, e.job_title' || E'\n' || 'FROM employees e;',
    hint = 'INNER JOIN room_access_logs on employee id. Filter access_level and access_method, then keep only entries that fall inside each employee''s shift_start and shift_end.',
    success_clue = 'Two master-key holders were active on duty that night, but their master-key logs never open Room 417 during the theft window.',
    difficulty = 'MEDIUM',
    order_sensitive = FALSE,
    evidence_image_filename = 'master-key.svg',
    expected_query = $sql$
SELECT e.full_name, e.job_title, r.room_number, r.entry_time
FROM employees e
INNER JOIN room_access_logs r
  ON r.person_type = 'employee' AND r.person_id = e.id
WHERE e.access_level = 'MASTER'
  AND r.access_method = 'MASTER_KEY'
  AND r.entry_time >= e.shift_start
  AND r.entry_time < e.shift_end
$sql$
WHERE level_number = 2;

UPDATE challenges
SET
    story_text = 'The painting was last confirmed in Room 417 before midnight. Door logs after twelve — from guests and staff — may matter most.',
    objective = 'Return every access to Room 417 between 2024-11-04 00:00 and 2024-11-04 02:00. Include person type, person id, entry time, exit time, and access method.',
    starter_query = 'SELECT room_number, person_type, person_id, entry_time' || E'\n' || 'FROM room_access_logs;',
    hint = 'Combine a room filter with a time window using BETWEEN on entry_time. The logs include both guests and employees.',
    success_clue = 'After midnight, Room 417 logged a guest keycard entry, then a security officer with a staff badge.',
    difficulty = 'MEDIUM',
    order_sensitive = FALSE,
    evidence_image_filename = 'midnight-entry.svg',
    expected_query = $sql$
SELECT person_type, person_id, entry_time, exit_time, access_method
FROM room_access_logs
WHERE room_number = 417
  AND entry_time BETWEEN TIMESTAMPTZ '2024-11-04 00:00:00+00'
                     AND TIMESTAMPTZ '2024-11-04 02:00:00+00'
$sql$
WHERE level_number = 3;

UPDATE challenges
SET
    story_text = 'Cash moved through the lobby after the reception. Unusual totals may mark a hurried getaway.',
    objective = 'Join guests to payments. For completed cash payments between 2024-11-03 18:00 and 2024-11-04 03:00, show each guest name with payment count and total amount. Keep only guests whose total cash exceeds 200.',
    starter_query = 'SELECT g.full_name, COUNT(*) AS payment_count' || E'\n' || 'FROM payments p' || E'\n' || 'INNER JOIN guests g ON g.id = p.guest_id;',
    hint = 'Filter payment_type, status, and payment_time, GROUP BY guest name, then HAVING on the summed amount.',
    success_clue = 'A few guests moved unusual amounts of cash that night — one total stands far above the rest.',
    difficulty = 'MEDIUM',
    order_sensitive = FALSE,
    evidence_image_filename = 'suspicious-payments.svg',
    expected_query = $sql$
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
SET
    story_text = 'Separate clues are not enough. Connect the earliest midnight entry into Room 417 with the unusual cash trail.',
    objective = 'Identify the guest who entered Room 417 between 2024-11-04 00:00 and 01:00 and also made a completed cash payment greater than 2000 after that entry. Return the guest full name, room number, entry time, access method, payment amount, and payment time.',
    starter_query = 'SELECT g.full_name, g.room_number' || E'\n' || 'FROM guests g;',
    hint = 'Join guests to room_access_logs and payments. Filter the midnight window and the large cash payment. A subquery for the midnight guest id is optional.',
    success_clue = 'The same guest who slipped into Room 417 just after midnight later settled a large cash payment.',
    difficulty = 'HARD',
    order_sensitive = FALSE,
    evidence_image_filename = 'identify-thief.svg',
    expected_query = $sql$
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
    ALTER COLUMN evidence_image_filename SET NOT NULL;
