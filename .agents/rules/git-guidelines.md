---
trigger: model_decision
description: Ruleset that MUST be followed when executing ANY git command in Halal Finder.
---

# Git Guidelines — Halal Finder

## Sacred Rule

- **NEVER** run `git push`, `git merge`, `git rebase`, `git commit --amend`, or force-push without explicit user authorization.
- Committing after a task is pre-approved ONLY when invoked via `/orchestrator`, `/handle-ticket`, `/dev-cycle`, or when the user explicitly instructs "commit per task".
- Always run tests and ensure clean verification before creating commits.

## Branching

- Default/primary branch: **`main`**.
- Feature branches: `feature/<slug>`.
- Bugfix branches: `fix/<slug>`.
- Chore / docs branches: `chore/<slug>`, `docs/<slug>`.

## Commit Messages

Format:
```
<type>: <subject>
```

- **type** (lowercase): `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `ui`, `config`.
- **subject:** imperative, lowercase, ≤72 chars, no trailing period.
- **Traceability:** When a change traces to a PRD requirement or feature ticket, cite the ID (`PRD-01`, `PRD-04`, `F01`, etc.) in the subject or body.

Examples:
```
feat: add evidence status filter chip for certificate reviewed (PRD-01)
fix: downgrade expired business certificate status to unverified (PRD-04)
ui: improve ingredient screening warning and disclaimer clarity
test: add unit tests for ingredient keyword triage matching
docs: add London market launch checklist (PRD-02)
```

## Workflow

1. Stage explicit paths only — `git add <path1> <path2>`.
2. **Never** `git add -A`, `git add .`, or `git add -u`.
3. Verify staged set with `git status` and `git diff --cached --stat`.
4. Commit with a properly formatted conventional message.
5. Report commit hash + message + file list from `git show --stat --oneline HEAD`.

## .gitignore Discipline

Never commit:
- `node_modules/`, `dist/`, build artifacts
- `.env*`
- Database binaries (`*.db`, `*.db-journal`, `*.db.bak`)
- `*.log`, `logs/`
- `.DS_Store`
- IDE state: `.idea/`, `.vscode/`, `*.swp`

Note: `.context/` (agent pipeline state) IS committed to the repo to preserve multi-round agent context and decisions.
