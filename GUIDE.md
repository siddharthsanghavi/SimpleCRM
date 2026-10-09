# simpleCRM — The Complete Guide

simpleCRM is a small, free CRM for a team running outreach to organisations —
built for a student club asking manufacturers for plant tours and sponsorship,
and just as usable by any small group that works a list of companies together.

It runs entirely on free tiers (Vercel + Supabase), keeps every rule about who
may see and change what inside the database itself, and never sends email on
your behalf.

This guide covers **everything**: installing it, setting it up for your team,
and using every screen. If you only want to get it running, follow Part 1 and
then [SETUP.md](SETUP.md). If you are adapting it for a different kind of
organisation, read [MAKE-IT-YOURS.md](MAKE-IT-YOURS.md) as well. If you are
going to change the code, [HANDOFF.md](HANDOFF.md) is the maintainer's notes.

---

## Contents

1. [Getting it running](#1-getting-it-running)
2. [First-time setup for your team](#2-first-time-setup-for-your-team)
3. [Getting your data in](#3-getting-your-data-in)
4. [A typical week](#4-a-typical-week)
5. [Every screen, explained](#5-every-screen-explained)
6. [Roles and permissions](#6-roles-and-permissions)
7. [How the important ideas work](#7-how-the-important-ideas-work)
8. [End of season and handing over](#8-end-of-season-and-handing-over)
9. [Admin recipes (SQL)](#9-admin-recipes-sql)
10. [Troubleshooting](#10-troubleshooting)
11. [Free-tier limits](#11-free-tier-limits)
12. [Glossary](#12-glossary)

---

## 1. Getting it running

You need about 45 minutes the first time. Nothing here costs money.

### What you need

| Thing | Why | Cost |
| --- | --- | --- |
| A computer with **Node.js 20 or newer** | To run it locally and build it | Free |
| A **GitHub** account | To host the code so Vercel can deploy it | Free |
| A **Supabase** account | The database, sign-in, and file storage | Free tier |
| A **Vercel** account | Hosting the website | Hobby tier, free |
| *Optional:* a **Google Cloud** account | "Sign in with Google" | Free |

### The short version

The full, click-by-click instructions are in [SETUP.md](SETUP.md). In outline:

1. **Unzip** this folder somewhere that is **not** synced (not OneDrive, Dropbox
   or iCloud — sync services corrupt `node_modules`). `C:\Git\simpleCRM` or
   `~/code/simpleCRM` are good.
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Create a Supabase project** (free plan). On the creation screen leave
   *Enable Data API* on, leave *Automatically expose new tables* on, turn
   *Enable automatic RLS* on, and keep the default Postgres type.
4. **Create the database:** Supabase → **SQL Editor** → **New query** → paste
   the whole of [`supabase/schema.sql`](supabase/schema.sql) → **Run**. You
   should see *Success. No rows returned.* That one file builds everything.
   You do **not** need to run anything in `supabase/migrations/` on a new
   project — those exist only to upgrade older databases.
5. **Let yourself in.** Still in the SQL editor:
   ```sql
   insert into allowed_emails (email, note) values ('you@example.com', 'admin');
   ```
6. **Connect the app to the database.** Copy `.env.example` to `.env.local` and
   fill in the **Project URL** and the **anon public** key from Supabase →
   Project Settings → API. *Never* put the `service_role` key here.
7. **Run it:** `npm run dev`, open <http://localhost:3000>, type your email,
   click the link that arrives.
8. **Make yourself an admin** (only after your first sign-in):
   ```sql
   update profiles set role = 'admin' where email = 'you@example.com';
   ```
9. **Deploy:** push to GitHub, import the repository in Vercel, add the same two
   environment variables, deploy.
10. **Tell Supabase where you live:** Authentication → URL Configuration → set
    the **Site URL** to your Vercel address and add
    `https://YOUR-APP.vercel.app/auth/callback` and
    `http://localhost:3000/auth/callback` to **Redirect URLs**. *Sign-in links
    silently fail until you do this.*
11. **Strongly recommended:** set up Google sign-in (SETUP.md Part F). Email
    links are limited to a handful per hour for the whole project.

### Checking it worked

- The sign-in page loads, and an email link signs you in.
- The left-hand rail shows Dashboard, Companies, Pipeline, Calendar, Map,
  Contacts, Tasks, Activity, Import / Export, Settings and Guide.
- Settings shows three tabs (Club, Email templates, Members) and lets you save.

If any of that is wrong, jump to [Troubleshooting](#10-troubleshooting).

---

## 2. First-time setup for your team

Do these once, as an admin, before inviting anybody. Ten minutes.

### 2.1 Club details — *Settings → Club*

| Field | What it does |
| --- | --- |
| **Club name** | Merged into every email draft and shown on the public privacy and terms pages. |
| **School or university** | Same. |
| **Group size** | Used by templates that ask for a tour ("a group of 20"). |
| **Visit length** | Likewise ("about two hours"). |
| **Time zone** | Decides when "today" ends: when tasks become overdue, when the daily outreach goal resets, and which day a calendar event is filed under. The form offers the zone your browser is in with one click. **Set this** — the default is UTC, which makes a task due today go overdue at 8pm on the US east coast. |

Until club details are filled in, email drafts contain visible `[YOUR CLUB]`
placeholders, so nothing half-finished goes out by accident.

### 2.2 Outreach goal — *Settings → Club*

Set a target per **day**, **month** and/or **year** — leave any blank and it
simply isn't tracked. Choose what counts:

- **Every piece of outreach logged** (emails, calls, meetings…), or
- **Companies moved out of Prospect for the first time.**

The dashboard shows a progress bar for each target you set. Periods are calendar
periods in your time zone; the year runs January–December.

### 2.3 Going-cold rules — *Settings → Club*

How many days each stage may sit with no logged contact before a company is
flagged as going cold. Defaults:

| Stage | Goes cold after |
| --- | --- |
| Contacted | 21 days |
| In conversation | 14 days |
| Committed | 30 days |
| Prospect, Declined, Dormant | never |

Leave a stage blank to stop it ever going cold.

### 2.4 Email templates — *Settings → Email templates*

The app ships with skeleton letters (ask for a tour, ask for sponsorship, nudge
after silence, reintroduce a new committee). Rewrite them in your own words.

- **Merge fields** — click an insert button and `{{company}}`, `{{first_name}}`,
  `{{city}}`, `{{club}}` and the rest land at your cursor. A live preview
  against a made-up company shows exactly what a recipient would read.
- **Suggested for** — which statuses a template is offered for first (a
  prospect gets the first approach, a contacted company gets the nudge).
- **Export / import as Markdown** — download every template as one file, edit
  it anywhere, import it back. Import matches on each template's *slug*:
  existing ones update, new ones are added, anything the file doesn't mention
  is left alone.

Any member can edit templates; every edit appears in Activity with a name.

### 2.5 Invite your team — *Settings → Members*

1. Type each person's email into **Add a member** and choose a role (see
   [Roles](#6-roles-and-permissions)). This puts them on the allowlist.
2. Tell them the site address. They sign in with that email (or Google, if the
   Google account uses the same address).
3. Their profile is created the moment they first sign in; nobody else can
   create an account, even with Google.

Change somebody's role from the same list. **Before removing someone**, use
**Hand off** beside their name to move their companies and open tasks to another member — work
left assigned to a person who has gone is how a pipeline quietly goes stale.

### 2.6 Your geography (if you are not in Georgia, USA)

The map groups locations into twelve Georgia regions, and the street-address
geocoder checks results against a Georgia bounding box. Both are easy to
change — [MAKE-IT-YOURS.md §3](MAKE-IT-YOURS.md) walks through it. Until you
do, the map works but its region bubbles will be named after Georgia.

---

## 3. Getting your data in

### 3.1 Importing companies — *Import / Export*

Choose **Companies**, pick a CSV file, check the preview, and press
**Import _N_ companies**. Nothing is written yet: simpleCRM first checks the file
and, if any rows look like companies you already have ("Pennine Print Works,
Inc." vs "Pennine Print Works"), shows them for review. **Tick** any that are
genuinely different — two sites of one firm, say — then press **Import** (or
**Import _N_, skip the rest**). **Cancel** writes nothing.

Recognised columns (any order; extra columns are ignored; only `name` is
required):

| Column | Notes |
| --- | --- |
| `name` | Required. |
| `type` | Free text — OEM, Integrator, Machine Shop… Filterable. |
| `tier` | `Tier 1`, `Tier 2`, `Tier 3` or `Reference`. Also accepts `confidence`. |
| `status` | `prospect` (default), `contacted`, `in_conversation`, `committed`, `declined`, `dormant`. |
| `interest` | `tour`, `sponsorship`, or both separated by `;`. |
| `website`, `phone`, `employees`, `industry` (or `specialty`), `notes` | As named. |
| `address`, `city`, `region` | Become the company's **primary location**. |
| `capabilities` (or `tags`) | Separate with **semicolons**: `CNC; Robotics; AS9100`. |

Re-importing a file **tops up** rather than duplicates: names already present
are skipped.

Have a spreadsheet in a different shape? `scripts/convert_directory.py` turns an
Excel workbook into this CSV format — adjust the column mapping at the top for
your file.

### 3.2 Importing contacts

Choose **Contacts**. Columns: `first_name` (required), `last_name`, `email`,
`phone`, `title`, `notes`, and `company`. The `company` column is matched to an
existing company **by exact name**; if nothing matches, the contact is imported
**without a company** and the import tells you which rows that happened to.

Those unlinked contacts are not lost: open the right company and use **Or add an
existing contact** in its Contacts panel, or edit them from the Contacts list.

### 3.3 Putting companies on the map

Locations appear on the map once they have coordinates. Two ways:

- **Town-centre pins** (good enough for most): run
  `scripts/geocode_cities.py` to look up each distinct city, load the result
  into the `geocache` table, and copy the coordinates across (exact SQL in
  [HANDOFF.md](HANDOFF.md), "Map and geocoding").
- **Street-level pins**: an admin runs the geocoder from Import / Export. It
  uses the US Census Bureau's free batch service through the `geocode` Edge
  Function, which you deploy once (`supabase functions deploy geocode`). Only
  addresses with a street number are tried, and every result is checked before
  it is saved.

Pins pinned to a town centre are drawn faded; real street addresses are solid.

### 3.4 Exporting

Import / Export offers CSVs of **Companies**, **Contacts**, **Locations** and
**Activity** — every row, not a page of them. Each export is recorded in the
activity feed, because taking the club's whole contact list out of the building
is something you want to be able to point at later.

---

## 4. A typical week

**Monday (5 minutes).** Open the **Dashboard**. Check *Going cold* — the
companies that have waited too long — and *Coming up* for this week's tours.
Glance at the goal bars.

**Picking who to contact.** On **Companies**, filter by what matters this week
— *Tier 1*, *Unassigned*, a region, or a capability such as *Robotics* — and
**save the view** so it is one click next time. Tick a handful and **Assign** them
to yourself in one go.

**Writing the first email.** Open a company. In **Cold email**, the right
template is pre-selected for its status and the right contact for its email
address. Edit the draft, then **Open in mail app** (it sends from *your*
account and lands in your Sent folder) or **Copy**. Back in simpleCRM, press
**Log as sent** — this is what keeps the company off the going-cold list.

**After a call.** In **Log activity**, choose *call*, add a line about what
happened, and tick the follow-up box to get a task dated a week out.

**When they say yes to a tour.** Change the status to *In conversation* or
*Committed*, then in **Tours & meetings** press **Schedule a tour or meeting**:
date, time, host (from their contacts), location, and notes such as PPE, group
size or NDA. It appears on the Calendar and on everyone's dashboard.

**Learning who matters.** As you meet people, **Edit** each contact and set
their *role in the deal*. If a company is in conversation and nobody is marked
decision-maker, its page tells you — that is the usual reason a friendly
conversation never becomes a tour.

**Recording what they do.** Add **capability tags** on the company page — they
are how next year's team finds "everyone who does injection moulding".

---

## 5. Every screen, explained

### Signing in

- **Email link** — type an allowlisted email; a one-time link arrives. Open it
  **in the same browser** you requested it from. Links are rate-limited for
  the whole project (see [Free-tier limits](#11-free-tier-limits)).
- **Continue with Google** — appears only once Google sign-in is configured
  and working. It does not let strangers in: only allowlisted addresses get a
  profile; anyone else lands on a "no access" page.

### The rail, search, and dark mode

- The **left rail** shows a count beside Companies, Contacts, open Tasks,
  Members and pending Deletions. On phones it collapses into a top strip.
- **⌘K** (Ctrl-K on Windows), anywhere: search companies and contacts by name,
  city, industry or email. Arrow keys to move, Enter to open.
- The **sun/moon** control switches between light, dark and system themes.

### Dashboard

- **Companies tracked** and, if any, **overdue tasks**.
- **Status counts** — one number per stage with a proportional bar beneath;
  click a number to open that list.
- **Going cold** — the worst five, with a bar showing how overdue each is, and
  *See all* when there are more.
- **Coming up** — the next two weeks of tours, meetings, events and deadlines.
- **Goal bars** — one per outreach target you set.
- **Open tasks** and **Recent activity**.

### Companies

**Searching:** the search box matches name, specialty, or any of a company's
cities.

**Filters:** Type · Region (matches *any* of a company's locations) ·
Capability · Status · Tier · Owner (including *Unassigned*) · Going cold ·
Archived. Filters combine.

**Saved views:** **+ Save this view** stores the current filters under a name,
privately or shared with the club. Saved views appear as chips above the list.

**The list** is ordered Tier 1 first (or worst-first when filtered to *Going
cold*), 50 per page. Each row shows type, primary city, how many locations,
industry and the first few capability tags, plus owner, money and last touch.

**Bulk actions** — tick rows (or *select all*), then:

| Action | Effect |
| --- | --- |
| **Assign** | Give them all to one member, or *Unassign*. |
| **Status** | Move them all to one stage. |
| **Tier** | Set or clear the tier. |
| **Archive** / **Restore** | Take off the working list, or bring back (Restore shows when viewing Archived). |
| **Draft emails** | Download one email draft per company as a spreadsheet, ready for a mail merge. |
| **Delete** (admins) / **Request deletion** (members) | See [Deletions](#deletions). |

### A company's page

From top to bottom:

- **Header** — name, website, type, primary city and region, how many
  locations, employees, amount and close date.
- **Status** — choose a stage and press **Update**. If the database refuses a
  change, the reason is shown under the control.
- **Owner** and **Tier** — each with its own button.
- **Edit** — name, website, industry, type, tier, phone, employees, interest,
  notes, amount, close date, and the **primary** address. Also **Archive** and
  (admins) **Delete**, or (members) **Request deletion**.
- **Capabilities** — tags for what the company actually does. Type and press
  **Add**; tags already used elsewhere are suggested so the vocabulary stays
  consistent ("cnc" becomes your existing "CNC"). Click a tag to see every
  company that shares it. Changes save immediately.
- **Locations** — every place the company is: head office, plant, warehouse.
  One is **Primary** (it stands in wherever there's room for only one place).
  **Add location**, **Edit**, **Make primary**, **Remove**, and a **Map** link
  for any with an address. Badges say *Not on the map* or *Approximate*.
  Editing an address clears its old coordinates so the geocoder places it again.
- **Cold email** — template, contact, editable draft, **Open in mail app**,
  **Copy**, **Log as sent**. Viewers can draft and copy but not log.
- **Log activity** — type (note, email, call, meeting, LinkedIn, other),
  contact, date, subject and notes, with an optional follow-up task.
- **History** — this company's slice of the activity feed.
- **Tours & meetings** (right column) — upcoming entries, the last three past
  ones, **Edit**, and **Schedule a tour or meeting** with the company fixed and
  its contacts offered as host.
- **Contacts** — drawn as an org chart: grouped by division, indented by who
  reports to whom, with a role chip beside each name. Hover a name for:
  - **Edit** — name, title, email, phone, and *role in the deal*.
  - **Place** — who they report to and which division they're in. You can't
    create a reporting loop; the list won't offer it and the database refuses
    it.
  - A yellow note appears when the company is being worked but nobody is the
    decision-maker.
  - Add a new contact below, or **Or add an existing contact** to attach
    somebody who is in the system with no company yet.
- **Tasks** — add, tick off, delete.
- **Files** — signed agreements, waivers, decks; up to 10 MB each, private to
  the club, downloadable through a link that expires after a minute.

### Pipeline

- **The board** — one column per stage with a count and the money in it. Drag a
  card between columns to change its status.
- **Weighted pipeline** — the sum of every amount multiplied by its stage's
  likelihood: prospect 5%, contacted 15%, in conversation 40%, committed 100%,
  declined and dormant 0%. Shown beside what is actually committed.
- **Flow chart** of how companies have moved between stages, **recent status
  changes**, and **who is carrying what**.

### Calendar

- A **month grid** (Sunday first) with today highlighted; **←**, **Today**, **→**
  to move. Each entry shows a coloured dot for its kind: **tour**, **meeting**,
  **club event**, **deadline**.
- The **same month as a list** underneath — easier on a phone.
- **Schedule a tour or event** — title, kind, date, start and end time (leave
  the start blank for an all-day entry), optional company (search by name),
  location and notes.
- Click any entry to **edit** it. Whoever added it, or an admin, can **Remove
  from calendar**.
- All times are in the club time zone (shown in the page subtitle).

### Map

- Zoomed out: one bubble per region with how many **companies** are there and
  how many are Tier 1/Tier 2. Click a bubble to zoom in.
- Zoomed in: one pin per **location** — a company with three plants is three
  pins, all opening the same company. Nearby pins cluster; click a cluster to
  fan it out. Colour is tier; faded means approximate (town centre).
- Filter by tier and owner. The subtitle counts companies, locations, and how
  many companies have no location yet.

### Contacts

Everyone, most recently contacted first, with their company, role chip, email,
phone, how many times they've been contacted and when last. Search by name or
email. **Edit** is here too — the only place to reach a contact with no company.
Add a contact (optionally choosing a company) from the side panel.

### Tasks

Every open task across the club, soonest due first, overdue highlighted in your
time zone. Tick to complete; add quick tasks.

### Activity

Everything anybody did — companies added and edited, status moves, assignments,
contacts, tasks, outreach, files, locations, calendar entries, templates,
settings, imports and exports, member changes — with who and when. Filter with
the chips at the top: Companies, Contacts, Tasks, Outreach, Deletions, Members,
Import / export, Locations, Calendar, Files, Templates, Settings.

### Import / Export

See [Getting your data in](#3-getting-your-data-in). Admins also see the
**street-address geocoder** here.

### Settings

Three tabs: **Club** (details, time zone, outreach goal, going-cold rules),
**Email templates**, and **Members** (add a member, roles, **Hand off**, your display name, recent
sign-ins, and how many sign-in emails the project has used this hour).

### Deletions

Deleting a company also deletes its contacts, activity and tasks, so it is
deliberately hard:

- **Members** file a **request** with a reason; the company page shows that a
  request is pending, and the requester can withdraw it.
- **Admins** approve or decline requests on this page, or delete directly.
- Every deletion is recorded permanently with a snapshot of the company — the
  record survives the company itself.

Prefer **Archive** for "we're done with this one for now". It keeps everything
and is reversible.

### Guide

The in-app user manual, including **What's new** — the changelog in
`lib/changelog.ts`.

---

## 6. Roles and permissions

| | Viewer | Member | Admin |
| --- | :---: | :---: | :---: |
| See everything (companies, contacts, pipeline, calendar, map, activity) | ✅ | ✅ | ✅ |
| Draft and copy emails | ✅ | ✅ | ✅ |
| Add and edit companies, contacts, locations, tags, tasks, events | | ✅ | ✅ |
| Log outreach, change status, assign | | ✅ | ✅ |
| Edit email templates | | ✅ | ✅ |
| Remove your own activity, tasks, contacts, files, calendar entries | | ✅ | ✅ |
| Remove **anyone's** of the above | | | ✅ |
| Request a company's deletion | | ✅ | ✅ |
| Delete companies / decide deletion requests | | | ✅ |
| Change club settings, goal, going-cold rules | | | ✅ |
| Manage members, roles and hand-over | | | ✅ |
| Run the street geocoder | | | ✅ |

Viewers exist for people who need to *see* the pipeline — a treasurer, a staff
advisor, an incoming committee member — without being able to change 1,000
companies by accident.

**Where this is enforced:** in the database (Postgres row-level security), not
in the app. Even someone calling the database directly with their own sign-in
can do exactly what this table says and no more. Anybody not on the allowlist
sees nothing at all.

---

## 7. How the important ideas work

**Statuses.** *Prospect* (on the list), *Contacted* (we reached out),
*In conversation* (they replied), *Committed* (yes — a tour or sponsorship is
agreed), *Declined*, *Dormant* (not now). Every change is recorded with who and
when.

**Last touch.** Logging any activity updates the company's and the contact's
*last touch*. Going cold, the contacts list and the dashboard all use it. Editing
a typo does **not** count as contact. Back-dating an old call can't make a
company look colder than it is.

**Going cold.** A company is cold when its stage has a threshold
([2.3](#23-going-cold-rules--settings--club)) and its last touch is older than
that, or it has never been touched.

**Primary location.** A company can have many locations; exactly one is
primary. It is used wherever only one place fits (list rows, search results,
the "your *city* site" merge field). The first location a company gets becomes
primary automatically; removing the primary promotes the next.

**Capability tags.** Free text, but self-tidying: tags keep their capitals,
reuse an existing spelling when you type one in a different case, and can't
contain commas, braces or quotes.

**Deal roles.** *Champion* (wants this to happen), *Decision-maker* (can say
yes), *Technical contact* (knows the floor), *Gatekeeper* (controls access).

**Time zone.** Everything that needs a calendar date — due today, the daily
goal, which day an event belongs to — uses the club time zone. Times you type
into the calendar are your local wall-clock time.

**Archive vs delete.** Archive hides a company from working lists and the
pipeline but keeps everything, reversibly. Delete removes it and its contacts,
activity and tasks for good, leaving only a record that it existed.

---

## 8. End of season and handing over

1. **Archive** companies you're finished with — filter, select all, *Archive*.
2. **Hand off** each leaving member's work in *Settings → Members* before
   changing their role or removing them.
3. **Promote** the incoming lead to admin, and give observers the *viewer* role.
4. **Export** a CSV of everything for the club's records.
5. Update **Club details** if the committee or group size changes.

---

## 9. Admin recipes (SQL)

Run these in Supabase → SQL Editor. Most have an equivalent in Settings →
Members; these are for when you need them directly.

```sql
-- Let someone in (they become a member on first sign-in)
insert into allowed_emails (email, note) values ('name@example.org', 'outreach');

-- Make someone an admin (they must have signed in once)
update profiles set role = 'admin' where email = 'name@example.org';

-- Make someone read-only
update profiles set role = 'viewer' where email = 'name@example.org';

-- Remove someone entirely (hand their work over first!)
delete from profiles where email = 'name@example.org';
delete from allowed_emails where email = 'name@example.org';

-- How many companies in each stage
select status, count(*) from companies where archived_at is null group by status order by 2 desc;

-- Every tag in use
select * from capability_counts();
```

---

## 10. Troubleshooting

| Symptom | Cause and fix |
| --- | --- |
| Clicking the email link signs nobody in, or lands on the wrong site | The site isn't in Supabase's redirect allowlist. Authentication → URL Configuration: set **Site URL** and add `/auth/callback` for both your Vercel address and localhost. |
| "Email link is invalid or has expired" | It was opened in a different browser or app (e.g. a mail app's built-in browser). Copy the link into the browser you requested it from — or use Google sign-in. |
| "Too many sign-in emails" / no email arrives | Supabase's free email limit for the whole project. Wait an hour, or set up Google sign-in, or connect your own SMTP (SETUP.md). |
| Signed in but see "no access" | That email isn't on the allowlist. Add it, sign out, and sign in again. |
| Everything is empty after signing in | Your profile wasn't created — the address was added to the allowlist *after* the first sign-in attempt. Sign out and in again. |
| Tasks go overdue in the evening; the daily goal resets early | Set the **time zone** in Settings → Club. |
| A calendar entry is on the wrong day | Same — the time zone. |
| The map is empty | Locations need coordinates; see [3.3](#33-putting-companies-on-the-map). |
| The site shows "simpleCRM is not configured" | The two `NEXT_PUBLIC_…` variables are missing in Vercel. Add them and **redeploy** — they are baked in at build time. |
| `invalid distance code`, phantom missing modules when installing | The folder is inside OneDrive/Dropbox/iCloud. Move it. |
| A change in Settings doesn't stick | Only admins can change club settings; the form says so. |
| A member can't delete a company | By design — they can request deletion; an admin decides. |
| The first page load of the day is slow | Free tiers sleep when idle; the first request wakes them. It's quick after that. |
| Running `schema.sql` fails partway | Run it on a **new, empty** project. To upgrade an existing database, run the files in `supabase/migrations/` in order instead. |

---

## 11. Free-tier limits

- **Sign-in emails**: Supabase's built-in email sender allows only a few emails
  per hour for the whole project. simpleCRM counts them and tells you when
  you're close (Settings → Members). Google sign-in has no such limit.
- **Database**: 500 MB — tens of thousands of companies.
- **Files**: 1 GB of storage on Supabase's free plan; each file up to 10 MB.
- **Idle projects**: a free Supabase project that sees no activity for a week
  is paused; open the dashboard and press *Restore*. Nothing is lost.
- **Cold starts**: the first request after a quiet spell is slow on both
  Vercel and Supabase free tiers.
- **Weekly digest email**: written (`supabase/functions/weekly-digest`) but
  needs an email provider key and a scheduled job; see [ROADMAP.md](ROADMAP.md).

---

## 12. Glossary

| Term | Meaning |
| --- | --- |
| **Allowlist** | The list of email addresses permitted to sign in (`allowed_emails`). |
| **Archive** | Hide a company from working lists without deleting anything. |
| **Capability** | A tag for what a company does — CNC, robotics, AS9100. |
| **Champion / Decision-maker / Technical / Gatekeeper** | A contact's role in getting to yes. |
| **Going cold** | In a stage too long with no logged contact. |
| **Last touch** | When anyone last logged activity with a company or contact. |
| **Location** | One place a company is; exactly one is primary. |
| **Owner** | The member responsible for a company. |
| **RLS** | Row-level security: the database rules deciding who sees and changes what. |
| **Saved view** | A named set of filters on the Companies list. |
| **Tier** | Your judgement of how promising a company is: Tier 1 = call first. |
| **Weighted pipeline** | Money in play, each amount multiplied by its stage's likelihood. |

---

*For setup detail see [SETUP.md](SETUP.md). For adapting simpleCRM to another
organisation, region or vocabulary see [MAKE-IT-YOURS.md](MAKE-IT-YOURS.md).
For how it's built and the traps worth knowing see [HANDOFF.md](HANDOFF.md).*
