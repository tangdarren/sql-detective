export type ChallengeLevel = {
  id: number
  title: string
  objective: string
}

export type QueryResultRow = Record<string, string | number>

export type PlaceholderChallenge = {
  caseId: string
  title: string
  subtitle: string
  briefing: string
  levels: ChallengeLevel[]
  sampleQuery: string
  sampleResults: QueryResultRow[]
}

export const blackwoodHotelCase: PlaceholderChallenge = {
  caseId: '01',
  title: 'Case 01: The Blackwood Hotel',
  subtitle: 'The Missing Portrait',
  briefing:
    'During a private reception at the Blackwood Hotel, a valuable painting vanished from Room 417. Hotel ledgers, guest logs, and staff schedules remain. Query the records and identify the thief.',
  levels: [
    {
      id: 1,
      title: 'Guest Log',
      objective: 'List every guest registered at the Blackwood Hotel on the night of the theft.',
    },
    {
      id: 2,
      title: 'Room Access',
      objective: 'Find which guests accessed Room 417 during the private event.',
    },
    {
      id: 3,
      title: 'Staff Schedule',
      objective: 'Identify staff members assigned near Room 417 when the painting disappeared.',
    },
  ],
  sampleQuery: 'SELECT guest_name, room_number FROM guests WHERE check_in_date = \'1924-11-03\';',
  sampleResults: [
    { guest_name: 'Clara Whitmore', room_number: 417 },
    { guest_name: 'Marcus Hale', room_number: 412 },
    { guest_name: 'Evelyn Crowe', room_number: 420 },
    { guest_name: 'Julian Pike', room_number: 305 },
  ],
}
