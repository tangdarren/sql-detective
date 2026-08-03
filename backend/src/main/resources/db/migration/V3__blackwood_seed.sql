-- Case 01 seed data
-- Event night: private reception on 2024-11-03; painting vanished after midnight.

INSERT INTO guests (id, full_name, room_number, check_in_date, check_out_date, vip_status) VALUES
    (1, 'Arthur Blackwood', 417, '2024-11-03', '2024-11-04', TRUE),
    (2, 'Clara Whitmore',   415, '2024-11-02', '2024-11-05', TRUE),
    (3, 'Marcus Hale',      412, '2024-11-03', '2024-11-04', FALSE),
    (4, 'Evelyn Crowe',     420, '2024-11-02', '2024-11-06', TRUE),
    (5, 'Julian Pike',      410, '2024-11-03', '2024-11-04', TRUE),
    (6, 'Helena Vargas',    305, '2024-11-01', '2024-11-07', FALSE),
    (7, 'Owen Briggs',      218, '2024-11-03', '2024-11-05', FALSE),
    (8, 'Iris Lang',        422, '2024-11-03', '2024-11-04', TRUE);

SELECT setval(pg_get_serial_sequence('guests', 'id'), (SELECT MAX(id) FROM guests));

INSERT INTO employees (id, full_name, job_title, shift_start, shift_end, access_level) VALUES
    (1, 'Nora Kessler',   'Night Manager',       '2024-11-03 20:00:00+00', '2024-11-04 04:00:00+00', 'MASTER'),
    (2, 'Samuel Ortiz',   'Front Desk Clerk',    '2024-11-03 16:00:00+00', '2024-11-04 00:00:00+00', 'STAFF'),
    (3, 'Rita Solano',    'Housekeeping Lead',   '2024-11-03 22:00:00+00', '2024-11-04 06:00:00+00', 'MASTER'),
    (4, 'Tomás Nguyen',   'Security Officer',    '2024-11-03 18:00:00+00', '2024-11-04 02:00:00+00', 'STAFF'),
    (5, 'Priya Raman',    'Concierge',           '2024-11-03 10:00:00+00', '2024-11-03 18:00:00+00', 'BASIC'),
    (6, 'Derek Mooney',   'Maintenance Tech',    '2024-11-03 08:00:00+00', '2024-11-03 16:00:00+00', 'STAFF');

SELECT setval(pg_get_serial_sequence('employees', 'id'), (SELECT MAX(id) FROM employees));

INSERT INTO room_access_logs (
    id, room_number, person_type, person_id, entry_time, exit_time, access_method
) VALUES
    -- Ordinary evening traffic
    (1,  417, 'guest',    1, '2024-11-03 19:10:00+00', '2024-11-03 19:40:00+00', 'KEYCARD'),
    (2,  415, 'guest',    2, '2024-11-03 20:05:00+00', '2024-11-03 20:20:00+00', 'KEYCARD'),
    (3,  412, 'guest',    3, '2024-11-03 20:30:00+00', '2024-11-03 21:00:00+00', 'KEYCARD'),
    (4,  410, 'guest',    5, '2024-11-03 21:15:00+00', '2024-11-03 21:45:00+00', 'KEYCARD'),
    (5,  420, 'guest',    4, '2024-11-03 21:50:00+00', '2024-11-03 22:10:00+00', 'KEYCARD'),
    -- Staff movement with master keys (not Room 417)
    (6,  200, 'employee', 1, '2024-11-03 21:00:00+00', '2024-11-03 21:25:00+00', 'MASTER_KEY'),
    (7,  120, 'employee', 3, '2024-11-03 22:40:00+00', '2024-11-03 23:05:00+00', 'MASTER_KEY'),
    (8,  305, 'employee', 4, '2024-11-03 23:20:00+00', '2024-11-03 23:35:00+00', 'STAFF_BADGE'),
    -- Midnight window around the theft
    (9,  417, 'guest',    5, '2024-11-04 00:18:00+00', '2024-11-04 00:41:00+00', 'KEYCARD'),
    (10, 417, 'employee', 4, '2024-11-04 01:05:00+00', '2024-11-04 01:20:00+00', 'STAFF_BADGE'),
    (11, 410, 'guest',    5, '2024-11-04 00:45:00+00', '2024-11-04 01:10:00+00', 'KEYCARD'),
    (12, 422, 'guest',    8, '2024-11-04 00:50:00+00', '2024-11-04 01:00:00+00', 'KEYCARD'),
    -- Morning discovery
    (13, 417, 'guest',    1, '2024-11-04 08:15:00+00', '2024-11-04 08:40:00+00', 'KEYCARD'),
    (14, 417, 'employee', 1, '2024-11-04 08:45:00+00', '2024-11-04 09:10:00+00', 'MASTER_KEY');

SELECT setval(pg_get_serial_sequence('room_access_logs', 'id'), (SELECT MAX(id) FROM room_access_logs));

INSERT INTO payments (id, guest_id, amount, payment_type, payment_time, status) VALUES
    (1,  1,  800.00, 'CARD', '2024-11-03 18:30:00+00', 'COMPLETED'),
    (2,  2,  120.00, 'CARD', '2024-11-03 19:00:00+00', 'COMPLETED'),
    (3,  2,   45.00, 'CASH', '2024-11-03 21:10:00+00', 'COMPLETED'),
    (4,  3,   60.00, 'CARD', '2024-11-03 20:40:00+00', 'COMPLETED'),
    (5,  4,  220.00, 'CARD', '2024-11-03 22:00:00+00', 'COMPLETED'),
    (6,  5,   75.00, 'CASH', '2024-11-03 21:30:00+00', 'COMPLETED'),
    (7,  5, 2500.00, 'CASH', '2024-11-04 01:02:00+00', 'COMPLETED'),
    (8,  6,   90.00, 'CARD', '2024-11-03 17:45:00+00', 'COMPLETED'),
    (9,  7,   35.00, 'CASH', '2024-11-03 23:15:00+00', 'FAILED'),
    (10, 8,  150.00, 'WIRE', '2024-11-03 19:50:00+00', 'COMPLETED'),
    (11, 3,  180.00, 'CASH', '2024-11-03 22:50:00+00', 'COMPLETED'),
    (12, 3,   40.00, 'CASH', '2024-11-04 00:10:00+00', 'COMPLETED'),
    (13, 4,   55.00, 'CASH', '2024-11-03 23:40:00+00', 'COMPLETED'),
    (14, 4,  160.00, 'CASH', '2024-11-04 00:25:00+00', 'COMPLETED'),
    (15, 8,   95.00, 'CASH', '2024-11-03 20:15:00+00', 'COMPLETED');

SELECT setval(pg_get_serial_sequence('payments', 'id'), (SELECT MAX(id) FROM payments));

INSERT INTO evidence_items (id, title, description, discovered_at, related_room) VALUES
    (1, 'Empty frame hooks',
        'Wall mounts in Room 417 held a heavy frame. Dust outlines remain.',
        '2024-11-04 08:50:00+00', 417),
    (2, 'Bent keycard sleeve',
        'A scratched guest key sleeve was found near the service stairwell.',
        '2024-11-04 09:20:00+00', 410),
    (3, 'Night ledger note',
        'Front desk noted a master key checkout discrepancy during the late shift.',
        '2024-11-04 09:35:00+00', 200),
    (4, 'Cash envelope stub',
        'A torn envelope marked for a late cash settlement was found in the lobby trash.',
        '2024-11-04 10:05:00+00', NULL);

SELECT setval(pg_get_serial_sequence('evidence_items', 'id'), (SELECT MAX(id) FROM evidence_items));

INSERT INTO challenges (
    level_number, title, story_text, objective, starter_query, hint, success_clue, difficulty, order_sensitive
) VALUES
(
    1,
    'The Guest Registry',
    'The Blackwood Hotel logged every guest for the private reception. Start with the names and rooms nearest the crime.',
    'List guests who stayed on the fourth floor (rooms 410 to 422) during the event night of 2024-11-03. Include full name, room number, and VIP status. Order the rows by room number.',
    'SELECT full_name, room_number, vip_status' || E'\n' || 'FROM guests;',
    'Filter with WHERE on room_number and check-in/check-out dates, then ORDER BY room_number.',
    'Several guests stayed on the fourth floor near Room 417 that night.',
    'EASY',
    TRUE
),
(
    2,
    'The Missing Master Key',
    'A master key was signed out during the night shift. Cross-check staff access with late-night door activity.',
    'Find employees with MASTER access who used a MASTER_KEY on the night of the event. Return employee name, job title, room number accessed, and entry time.',
    'SELECT e.full_name, e.job_title' || E'\n' || 'FROM employees e;',
    'INNER JOIN room_access_logs where person_type is employee, then filter access_level and access_method.',
    'Master-key holders were active after dark, and one key may have left official hands.',
    'MEDIUM',
    FALSE
),
(
    3,
    'Midnight Entry',
    'The painting was last confirmed in Room 417 before midnight. The door logs after twelve may matter most.',
    'Return every access to Room 417 between 2024-11-04 00:00 and 2024-11-04 01:00. Include person type, person id, entry time, exit time, and access method.',
    'SELECT room_number, person_type, person_id, entry_time' || E'\n' || 'FROM room_access_logs;',
    'Combine a room filter with a time window using BETWEEN on entry_time.',
    'Room 417 was opened once in the first hour after midnight.',
    'MEDIUM',
    FALSE
),
(
    4,
    'Suspicious Payments',
    'Cash moved through the lobby after the reception. Unusual totals may mark a hurried getaway.',
    'Join guests to payments. For completed cash payments between 2024-11-03 18:00 and 2024-11-04 03:00, show each guest name with payment count and total amount. Keep only guests whose total cash exceeds 200.',
    'SELECT g.full_name, COUNT(*) AS payment_count' || E'\n' || 'FROM payments p' || E'\n' || 'INNER JOIN guests g ON g.id = p.guest_id;',
    'Filter payment_type, status, and payment_time, GROUP BY guest name, then HAVING on the summed amount.',
    'A few guests moved unusual amounts of cash that night — one total stands far above the rest.',
    'HARD',
    FALSE
),
(
    5,
    'Identify the Thief',
    'Separate clues are not enough. Connect the midnight entry to the unusual cash trail.',
    'Identify the guest who entered Room 417 between 2024-11-04 00:00 and 01:00 and also made a completed cash payment greater than 2000 after that entry. Return the guest full name, room number, entry time, access method, payment amount, and payment time.',
    'SELECT g.full_name, g.room_number' || E'\n' || 'FROM guests g;',
    'Join guests to room_access_logs and payments. Filter the midnight window and the large cash payment. A subquery for the midnight guest id is optional.',
    'The same guest who slipped into Room 417 after midnight later settled a large cash payment.',
    'HARD',
    FALSE
);
