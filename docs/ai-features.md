# AI Feature Ideas — Maximus Estimus

Brainstormed 2026-04-26. These are candidate features to prioritize in future sprints.

---

## During the Field Visit

**Guided Walkthrough**
Based on what's been enabled (island, sink, tub, etc.), the app generates a dynamic to-do list in real time: "You've measured Wall A — now photograph it." Adapts as the user works rather than showing a static checklist.

**Voice-to-Field Input**
Speak measurements out loud while hands are on the tape measure. "Wall A, twelve feet four inches." AI parses natural speech and fills the right fields. Eliminates stopping to tap the phone screen.

**Photo Analysis**
Point the camera at a wall and AI identifies what it sees — cabinets, windows, outlets, appliances — and either pre-fills fields or flags unlogged items: "I see what looks like a range hood — you haven't added an appliance to this wall."

**Auto-Completeness Nudges**
AI monitors what's been entered and surfaces gaps before the user leaves the job site. "You have a sink on Wall B but haven't measured the sink cabinet width." Prevents the most common problem in field work: driving back for one missed measurement.

**Photo Quality Check**
After a photo is marked as captured, AI flags blurry, too-dark, or off-angle shots and prompts a retake before leaving the site.

---

## Data Entry & Validation

**Natural Language Entry**
Instead of tapping through fields, type or dictate: "Undermount sink, 33 wide, 18 from the left corner, garbage disposal." AI maps it to the right structured fields.

**Measurement Cross-Validation**
Checks that numbers make sense together. If Wall A + Wall C don't roughly align, or a window is wider than its wall, it flags the inconsistency. Catches typos before they become quote errors.

**Smart Defaults & Pre-fill**
Based on job type and data already entered, AI suggests likely values. A 96" ceiling height → suggests standard 30" upper cab height. User confirms or overrides.

---

## Estimating & Quoting

**Auto-Estimate from Assessment**
Once the assessment is complete, AI generates a line-item estimate — cabinets, countertops, labor, etc. — from the measurements and scope questions already answered. Starting point in seconds instead of 30 minutes.

**Material Takeoff**
AI calculates quantities automatically: linear feet of cabinets, sq ft of tile, number of outlets. Less manual math, fewer errors.

**Scope Gap Warnings**
"You selected 'replace cabinets' but didn't answer whether you're keeping the existing layout — this affects the estimate." Catches logical mismatches between client intent and what's been documented.

**Upsell Detection**
"Clients doing a full kitchen remodel in this size range often also replace the flooring — do you want to add a flooring assessment?" Based on patterns in past jobs.

---

## Client Communication

**Assessment Summary**
AI writes a professional plain-English summary of what was assessed — room dimensions, key features, noted problem areas — ready to email or include in a proposal. No manual writeup.

**Proposal Draft**
From assessment + questions, AI generates a draft client-facing proposal with scope description, timeline, and pricing tiers. Review and send; don't write from scratch.

**Follow-up Email**
After the visit, AI drafts a follow-up: "Thanks for having us out — here's what we discussed, here's what's next." Keeps response time fast without composing from scratch.

---

## Business Intelligence

**Job Pattern Recognition**
Over time, AI analyzes which job types convert best, which scopes are most profitable, what referral sources bring the best clients, and which assessment details correlate with jobs going sideways.

**Time & Resource Prediction**
Based on scope and measurements, AI predicts job duration and crew requirements. Helps scheduling and prevents overcommitting.

**Lead Scoring**
AI scores new assessments by likelihood of closing based on budget signals, job complexity, referral source, and client response speed. Helps prioritize follow-up.

**Seasonal & Geographic Trends**
AI surfaces patterns: "Kitchen remodels spike in March — you typically under-staff that month." Actionable for business planning.

---

## Highest-Leverage Wins (Prioritized)

1. **Voice input** — Biggest time saver on-site
2. **Auto-estimate from assessment** — Biggest time saver in the office
3. **Completeness nudges before leaving the job** — Biggest error preventer
4. **Assessment summary / proposal draft** — Biggest client experience improvement

The infrastructure for most of this already exists — the data model is structured, measurements are typed, photos are tracked. Feeding that into an LLM call at the right moment is the implementation path for most of these features.
