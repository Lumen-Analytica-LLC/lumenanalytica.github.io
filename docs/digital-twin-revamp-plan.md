# Digital Twin Revamp Plan

_Drafted 2026-10-04 · Updated 2026-10-04 with regional strategy_

## Goal

Reposition lumenanalytica.io around **operational digital twins** and sell to two buyer groups:

1. **Clinics and hospitals:** waiting room flow, patient and provider availability.
2. **3PL and cold storage warehouses:** dock scheduling, labor, and temperature exposure.

Positioning line: **"Digital twins for operations where waiting costs money."**
See your clinic or warehouse running live, test changes safely, and make the change knowing the payoff.

**Direction:** pivot the firm to offer digital twins only. The existing services (data platform, governance, software, accounting) stay, but as the groundwork for a twin rather than separate offerings.

Both industries share one shape: people or trucks arrive, wait in line, and compete for limited time slots, with schedules and staff in short supply. One shared simulation engine with a scenario per industry makes that point and suggests "we can model your operation too."

## Market strategy: Rio Grande Valley → Austin

**Home market:** the Rio Grande Valley (McAllen, Edinburg, Pharr, Harlingen, Brownsville), expanding along I-69C / I-35 through San Antonio to Austin. The team already has contacts in **healthcare, education and 3PL**.

_Regional facts below come from general knowledge and should be verified before they go into pitches._

### Why it fits

- **Buyers are concentrated nearby.** In-person meetings, referrals and visible local case studies matter more than marketing reach.
- **The big consultancies mostly fly in.** A local, bilingual firm that can walk the dock or the clinic floor stands out.
- **Budgets are tighter than in big metros,** which favors a fixed-price assessment and pilot over open-ended consulting.

### Order of attack

| Priority | Industry | Why |
| -------- | -------- | --- |
| 1 | **Cold storage / produce 3PL** (Pharr, Hidalgo/McAllen, Brownsville) | Major produce crossings from Mexico. Owner-operated or regional firms decide quickly, data exports are easy, and the pain has clear dollar amounts: detention, cold chain exposure, peak-season labor. |
| 2 | **Community health centers (FQHCs), independent clinic groups, urgent care** | Local decisions, pressure on no-shows, walk-ins and provider capacity, and access metrics they already report on. |
| 3 | **Hospitals** | Real demand, but chain-owned hospitals often decide at corporate, with long procurement and security reviews. Pursue through local champions; don't count on them early. |
| Channel | **Education** (UTRGV, South Texas College, TSTC, school districts) | Start as a partner: research collaboration, analyst interns, credibility. A student services twin (registration, financial aid and advising lines) is a later phase on the same engine. Districts buy through Texas cooperative purchasing contracts, so get on one before selling to them. |

**Expansion path:** RGV → San Antonio (large health systems, logistics base) → Austin (more competition; arrive with RGV case studies).

**Timing:** produce facilities plan ahead of the winter import peak. Pitch cold-chain pilots for the off-season or the ramp into it.

### Validation before going all-in

1. 10–15 discovery conversations through existing contacts, asking about the problem, not the twin.
2. 2–3 discounted fixed-price pilots in exchange for case studies.
3. Commit fully when at least two buyers pay and one pilot produces a publishable, measured result.

### Revenue model

Assessment → 30-day pilot → ongoing **Operate** retainer (monthly recalibration, quarterly scenario reviews, pre-peak re-planning). Project-only revenue is lumpy; the retainer is the goal.

### Messaging

- Lead with outcomes ("cut detention fees", "shorter waits without hiring"). "Digital twin" is the method, not the headline, since the term can sound expensive or vague.
- Site positioning: **"Operational digital twins for the Rio Grande Valley and South Texas."**
- Spanish versions of the landing pages and demos.

## How existing services map to twin layers

| Twin layer                                       | Existing service      |
| ------------------------------------------------ | --------------------- |
| Connect the data (EHR, scheduling, WMS/YMS, IoT) | Data Platform         |
| Model the flow (simulation, queueing, scheduling)| Operations Research   |
| Build the twin app or dashboard                  | Software Development  |
| HIPAA, data access, audit                        | Governance            |
| Cost and ROI of changes                          | Accounting Operations |

These become stages on an `/approach` page: **Assess → Connect → Model → Optimize → Operate**.

## Twin #1: Clinic and hospital

- **Floor plan:** entrance, front desk (check-in and checkout), waiting room seats, corridor, exam rooms with status lights, care team station.
- **Agents:** patients (colored by how long they've waited), providers, medical assistants, front desk staff.
- **Provider availability board:** a schedule row per provider showing booked slots vs. actual visit, charting and away time, with a moving "now" line.
- **Controls:** providers, exam rooms, appointment template (staggered / modified wave / block), double-booking %, no-show %, walk-ins per hour, disruption ("provider pulled away 10:00–11:30").
- **Metrics:** door-to-provider wait (average and 90th percentile), patients in the waiting room, patients who left without being seen, provider utilization, patients seen vs. booked, projected finish and overtime.

## Twin #2: Produce cold storage cross-dock

Modeled on a border produce cross-dock rather than a generic 3PL, so local buyers recognize their own building.

- **Facility view:** truck yard and gate queue, inbound and outbound dock doors with staging lanes, a forced-air pre-cooling tunnel, an inspection hold area, a cooler (34°F) and a mild room (50°F), with forklifts carrying individual pallets between them.
- **Flow:** reefer trucks arrive from the bridge in waves (or by appointment), queue in the yard, back into a door, and get unloaded pallet by pallet. Pallets sit on the dock until a forklift puts them away; berries and greens go through pre-cooling first. Some loads are held for inspection. Outbound trucks arrive by appointment and are loaded from stored inventory.
- **The trade-off it shows:** forklifts can't do everything at once. Unloading first turns trucks faster but leaves pallets warming on the dock; putting away first protects the product but trucks wait and run into detention.
- **Dock door board:** a row per door showing when trucks were at the door, with the time past free time highlighted as detention.
- **Controls:** forklift drivers, inbound dock doors, trucks per day, arrival pattern (bridge waves vs. appointments), forklift priority (unload first / put away first / balanced), inspection rate, pre-cool tunnel capacity, peak-season surge, forklifts down for a stretch of the morning.
- **Metrics:** average truck turn time, detention cost ($), trucks waiting in the yard, pallets with a temperature excursion (too long on the dock), average dock dwell, forklift utilization.

## What makes it feel realistic

- 2D top-down canvas rendering with simple sprites, real walking paths (corridors, doors) and smooth movement. Forklift and pallet positions are computed from the simulation's own travel times, so what you see is what the model is doing.
- A simulation clock (07:30 → close) with speed control; a full day plays in about 1–2 minutes.
- Events ticker ("10:42 Dr. Patel pulled away, 3 patients waiting on them").
- Believable synthetic inputs (morning peaks, late arrivals, variable visit length), presented as "a typical 4-provider primary care clinic" or "a produce cross-dock near the bridge".
- **Same patients in every scenario:** each source of randomness uses its own seeded stream, so changing a setting replays the same day with the same patients, and before/after comparisons are fair.

## Site structure

```
/                       Hero: live mini-twin, toggle Clinic | Cold Storage
/digital-twins          What a twin is vs. a dashboard; how we build one
/healthcare             Landing page for clinic buyers (problems → twin → ROI → pilot)
/healthcare/demo        Full clinic twin
/cold-chain             Landing page for 3PL and cold storage buyers
/cold-chain/demo        Full warehouse twin
/approach               Assess → Connect → Model → Optimize → Operate (current services fold in here)
/pilot                  30-day twin pilot: scope, deliverables, starting price
/about, /contact
```

### Sales features

- ROI calculator on each landing page, feeding into the contact form.
- Packaged 30-day fixed-scope pilot.
- Shareable scenario URLs (`/healthcare/demo?p=4&t=staggered`) so a champion inside the buyer's organization can forward a result to their CFO.
- Trust sections: HIPAA and synthetic data only (healthcare); how the twin connects to warehouse, yard and temperature-sensor systems (cold chain).
- Replace the generic "Proven Impact" numbers with industry-specific ones: real client numbers, or results clearly labeled as simulated.

## Code structure

Everything runs client-side, so GitHub Pages static hosting still works. No UI framework is needed.

```
src/twin/
  engine/          seeded random streams, event queue (shared by both industries)
  render/          canvas helpers: DPR scaling, theme colors, people sprites
  scenarios/
    clinic/        model.ts (simulation logic), layout.ts (floor plan + paths),
                   renderer.ts, board.ts, app.ts (DOM wiring)
    cold-storage/  same shape as clinic/, plus a dock door board
  twin-theme.css   canvas color tokens (light and dark)
  twin-ui.css      shared toolbar, metric tiles, controls and log styles
src/components/twin/ClinicTwin.astro, ClinicTwinPreview.astro, HealthcareRoi.astro
src/components/twin/ColdStorageTwin.astro
src/pages/healthcare/index.astro, healthcare/demo.astro
src/pages/cold-chain/demo.astro
```

The clinic simulation is cheap enough to run on the main thread. A Web Worker comes in when running many replications for side-by-side comparison (phase 4).

## Phases

1. **Engine + clinic twin MVP** _(done)_: floor plan, moving agents, provider board, metrics, controls, shareable URL params, `at=` start time.
2. **Healthcare landing page, homepage hero preview, ROI calculator** _(done)_. Healthcare link added to the nav.
3. **Cold storage cross-dock twin** _(done)_ at `/cold-chain/demo`, plus the `/cold-chain` landing page with a detention and spoilage ROI calculator.
4. **Regional repositioning:**
   - _Done:_ regional homepage; contact form (Formspree) and Cal.com booking replacing email links, with ROI numbers and demo scenarios attached to inquiries; Spanish versions under `/es/` (home, both landing pages, both demos, contact) with a language switch and hreflang tags. Page text lives in `src/i18n/`.
   - _Next:_ native-speaker review of the Spanish copy, retune clinic defaults (no-shows, walk-ins) to regional clinics, `/approach` page absorbing the current services, `/pilot` page. Services and About remain English-only for now.
5. **Side-by-side scenario comparison** (Web Worker, many replications).
6. **Education:** student services twin (registration, financial aid and advising lines) once a university partner is in place.
7. **Polish:** click-to-inspect, accessible table view, mobile tuning, explainers that open the demo with settings applied, optional "bring your own schedule" CSV import (processed in the browser only).

## Open questions

- Pilot pricing: publish a starting price or "contact us"?
- Do the non-healthcare / non-logistics services stay visible, or move under `/approach` only?
- Real case-study numbers available for either industry?
- Contact email: the site uses `insights@lumen-analytica.io` (hyphenated) while the domain is `lumenanalytica.io`. Confirm which is correct.
- Confirm the pilot claims on `/healthcare` (30-day fixed scope, de-identified data, "nothing touches your EHR", "you keep the twin").
- Which local contacts go first for discovery conversations, and in which industry?
