/**
 * The guide's changelog.
 *
 * KEEPING THIS CURRENT IS PART OF SHIPPING. When you add or change a feature,
 * add an entry here in the same commit — the guide at /guide renders this
 * directly, so an out-of-date entry is an out-of-date user manual.
 *
 * Newest first.
 */

export type Change = {
  date: string; // ISO date
  title: string;
  notes: string[];
};

export const CHANGELOG: Change[] = [
  {
    date: '2026-10-08',
    title: 'simpleCRM, first release',
    notes: [
      'Companies with any number of locations, a capability tag list, an owner, a tier, a status and an optional sponsorship amount and close date. Filter, search, save views, and act on many at once.',
      'Contacts drawn as an org chart, grouped by division and indented by reporting line, each marked as champion, decision-maker, technical contact or gatekeeper.',
      'A calendar for tours, meetings, club events and deadlines, a Tours & meetings panel on every company, and the next two weeks on the dashboard.',
      'A pipeline board you can drag between stages, a weighted total of the money in play, and a going-cold list with per-stage thresholds.',
      'A map of every location, grouped into regions when zoomed out.',
      'Cold-email drafts from templates the club edits itself, handed to your own mail program — the app never sends mail.',
      'An activity feed of everything anyone did, deletion requests that an admin approves, and three roles: viewer, member and admin.',
      'CSV import with near-duplicate detection, CSV export of everything, and a club time zone so "today" ends at your midnight.',
    ],
  },
];

export const LAST_UPDATED = CHANGELOG[0].date;
