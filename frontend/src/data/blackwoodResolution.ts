export const blackwoodResolution = {
  caseTitle: 'Case 01: The Blackwood Hotel',
  thiefName: 'Julian Pike',
  thiefRoom: 410,
  explanation:
    'Julian Pike, the VIP guest in Room 410, entered Room 417 with a keycard just after midnight, then settled a large cash payment in the lobby. No other person matches every thread of evidence.',
  evidencePoints: [
    'Guest and employee records narrowed the suspects to fourth-floor guests and on-duty master-key holders — without placing staff inside Room 417 during the theft window.',
    'Access logs placed a guest (person id 5) in Room 417 at 00:18, followed by a security officer on rounds at 01:05.',
    'Payment evidence showed Julian Pike moving far more completed cash than any other guest that night, including a $2,500 settlement after the 417 entry.',
    'The final query combined the midnight guest entry with the oversized cash payment, leaving only Julian Pike.',
  ],
  levels: [
    {
      levelNumber: 1,
      title: 'The Guest Registry',
      summary: 'Mapped the fourth-floor guests staying near Room 417 on the event night.',
    },
    {
      levelNumber: 2,
      title: 'The Missing Master Key',
      summary: 'Found on-duty master-key holders whose logs never opened Room 417 during the theft.',
    },
    {
      levelNumber: 3,
      title: 'Midnight Entry',
      summary: 'Logged the guest keycard and security badge entries into Room 417 after midnight.',
    },
    {
      levelNumber: 4,
      title: 'Suspicious Payments',
      summary: 'Surfaced guests with unusual completed cash totals, led by Julian Pike.',
    },
    {
      levelNumber: 5,
      title: 'Identify the Thief',
      summary: 'Joined the midnight entry and cash trail to name the only matching suspect.',
    },
  ],
}
