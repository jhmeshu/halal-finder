---
name: verify-deliverable
description: Verify an implementation against Halal Finder ticket acceptance criteria (what we want), not just the plan. Checks both links — deliverable→implementation (intent conformance) and plan→implementation (plan conformance) — plus builds, tests, and Sacred Trust Invariants. Writes a per-AC verdict report. Use after a ticket is implemented or when asked to verify a ticket against requirements.
---

# Verify Deliverable Skill — Halal Finder

Chain of truth:

```
ticket/deliverable (WHAT we want) → plan (HOW) → implementation (DID)
```

Verifying only against the plan can pass while missing intent — the plan itself may have drifted from the deliverable. This skill checks **both** links.

## Inputs

- **Ticket file** (required): `docs/tickets/F<nn>-<slug>.md` — acceptance-criteria source of truth
- **Plan file** (required): the `*-plan.md` written by create-implementation-plan
- **Tasks file** (optional): the `*-tasks.md` breakdown
- **Base branch** (default `main`) for the diff

If any required input is missing, ask. Do not guess paths.

## Execution

### Step 1 — Gather evidence
1. Read ticket, plan, tasks files fully.
2. Diff: `git diff --name-only <base>...HEAD` → changed files. Full diff for files named in plan.
3. Run verification tests:
   ```bash
   npm test
   ```

### Step 2 — Intent conformance (deliverable → implementation)
For **each acceptance criterion** in the ticket, assign a verdict:

| Verdict | Meaning |
|---|---|
| ✅ satisfied | AC demonstrably met (code + tests as evidence) |
| ⚠️ partial | Some evidence, incomplete implementation |
| ❌ missing | Not implemented or not demonstrable |
| ❓ unverifiable | Needs manual runtime verification (e.g. physical device PWA install flow, Open Food Facts live network availability, camera scanner hardware permission) — state exactly what to check manually |

### Step 3 — Sacred Trust Invariants verification
Specifically audit against Halal Finder's non-negotiable trust rules:
1. Are the 5 evidence statuses maintained without collapsing into a vague "verified" badge?
2. Is the "No Pay-To-Verify" rule intact? (No code path where sponsorship or payment modifies evidence status).
3. Are scanner disclaimers visible, explicitly stating that keyword screening is an informational aid, not a religious fatwa?
4. Is evidence freshness tracked and expiry downgrade logic in place?

### Step 4 — Plan conformance (plan → implementation)
For each planned file/component: implemented as planned / deviates (note how) / dropped.

### Step 5 — Divergence report & Verdict
Write report to `.context/tickets/F<nn>/findings/verify-<date>.md`:
- Intent Conformance table (per AC).
- Trust Invariants Audit.
- Plan Conformance table.
- Overall Verdict: `accepted` (all ACs satisfied or justified) or `gaps-found` (actionable items to fix).
