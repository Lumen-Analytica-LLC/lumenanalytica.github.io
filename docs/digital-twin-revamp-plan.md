# Digital Twin Revamp Plan

_Drafted 2026-10-04_

## Goal

Reposition lumenanalytica.io around **operational digital twins** and sell to two buyer groups:

1. **Clinics and hospitals:** waiting room flow, patient and provider availability.
2. **3PL and cold storage warehouses:** dock scheduling, labor, and temperature exposure.

Positioning line: **"Digital twins for operations where waiting costs money."**
See your clinic or warehouse running live, test changes safely, and make the change knowing the payoff.

Both industries share one shape: people or trucks arrive, wait in line, and compete for limited time slots, with schedules and staff in short supply. One shared simulation engine with a scenario per industry makes that point and suggests "we can model your operation too."

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

## Twin #2: 3PL and cold storage

- **Facility view:** yard and gate queue, dock doors, staging area, ambient / cooler / freezer zones, forklifts and order pickers moving through aisles.
- **Dock appointment board:** a schedule row per door with booked slots and early, late and live trucks.
- **Controls:** dock doors, appointment slot length, labor per shift, pick wave timing, how long reefer trucks can sit on the dock, holiday surge, equipment going down.
- **Metrics:** truck turn time, detention fees ($), dock-to-stock time, door use, minutes a product is exposed to unsafe temperatures, units picked per labor hour, on-time shipping.

## What makes it feel realistic

- 2D top-down canvas rendering with simple sprites, real walking paths (corridors, doors) and smooth movement.
- A simulation clock (07:30 → close) with speed control; a full day plays in about 1–2 minutes.
- Events ticker ("10:42 Dr. Patel pulled away, 3 patients waiting on them").
- Believable synthetic inputs (morning peaks, late arrivals, variable visit length), presented as "a typical 4-provider primary care clinic" or "a 40-door multi-temperature 3PL".
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
    cold-storage/  (phase 3)
src/components/twin/ClinicTwin.astro
src/pages/healthcare/demo.astro
```

The clinic simulation is cheap enough to run on the main thread. A Web Worker comes in when running many replications for side-by-side comparison (phase 4).

## Phases

1. **Engine + clinic twin MVP** _(in progress)_: floor plan, moving agents, provider board, metrics, controls, shareable URL params. Standalone page at `/healthcare/demo`, not linked from nav yet.
2. **Healthcare landing page, homepage hero embed, ROI calculator.** The site becomes sellable here.
3. **Cold storage scenario** on the same engine, plus its landing page.
4. **Side-by-side scenario comparison** (Web Worker, many replications), `/pilot` page, consolidating services into `/approach`, updating nav.
5. **Polish:** click-to-inspect agents, accessible table view, mobile tuning, explainers that open the demo with settings already applied, optional "bring your own schedule" CSV import (processed in the browser only).

## Open questions

- Pilot pricing: publish a starting price or "contact us"?
- Do the non-healthcare / non-logistics services stay visible, or move under `/approach` only?
- Real case-study numbers available for either industry?
