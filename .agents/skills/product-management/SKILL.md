---
name: product-management
description: Turn a list of Halal Finder issues or feature requests into complete, end-to-end deliverables documents. Asks the product owner clarification questions in batches (written to a cycle folder, never AskUserQuestion), then writes a deliverables index + per-deliverable files. Stateless per round — re-run /product-management (no args) to continue after answering. Use when user gives a list of issues/features to scope into shippable deliverables.
---

# Product Management Skill — Halal Finder

Orchestrates the **`product-manager`** subagent across a multi-round clarification loop. You (the main agent) stay thin: spawn the PM, relay its short summary, tell the user how to continue. The PM keeps its own context clean by delegating codebase and PRD investigation to the `analyst` subagent and persisting all state under a dated `.context/pm-cycles/pm-cycle-*/` folder.

## Cycle Folders

Each PM cycle lives in its own **dated subfolder** under `.context/pm-cycles/`:

```
.context/pm-cycles/
  pm-cycle-2026-11-05-14-30-00/   # cycle folder (YYYY-MM-DD-HH-mm-ss)
    state.md
    questions/
      01-<slug>.md
    deliverables/
      DEL-01-<slug>.md
    deliverables.md
```

This keeps cycles self-contained and reproducible.

## Two modes

- **Start** — user provides a list of issues (inline text or a path to a file containing them). Begin a fresh cycle in a new dated folder.
- **Continue** — no new issues; the user has answered a question batch (they said so in thread, or re-invoked this skill). Advance the existing cycle.

### Mode detection

- **Start**: user supplied issues → find the latest `pm-cycle-*/state.md` under `.context/pm-cycles/`. If none exists OR the latest one has `phase: done` → create a new cycle folder. If the latest one has `phase: clarifying` → ask whether to start fresh or continue.
- **Continue**: no new issues → find the latest `pm-cycle-*/state.md` with `phase: clarifying`. If found, continue it. If not found, tell the user there is no active cycle.

## Authorization

Invoking this skill **is standing approval** to:
- Create cycle folders and write files under `.context/pm-cycles/` (questions, state, deliverables).
- Spawn `analyst` and `product-manager` subagents.

It does **not** commit, push, merge, or touch any file outside `.context/pm-cycles/`.

## Execution (every invocation)

1. **Determine mode** (see Mode detection above).
2. **Create or locate cycle folder:**
   - `start`: generate a dated folder name:
     ```bash
     CYCLE_DIR=".context/pm-cycles/pm-cycle-$(date +%Y-%m-%d-%H-%M-%S)"
     mkdir -p "$CYCLE_DIR/questions" "$CYCLE_DIR/deliverables"
     ```
   - `continue`: find active cycle folder:
     ```bash
     CYCLE_DIR=$(ls -dt .context/pm-cycles/pm-cycle-*/state.md 2>/dev/null | head -1 | xargs dirname)
     ```
3. **Spawn the PM subagent** with workspace set to `CYCLE_DIR`.
4. **Relay the summary** returned by the PM subagent to the user.
