# Expansion implementation status

Date: 23 October 2026. Current scope: 2D only.

## Implemented code

Stage 1: four guessing modes, difficulty/timer/hints/explanations, daily question order, saved attempts, server-owned scoring, UTC quests, unique XP rewards and real daily/weekly/all-time rankings.

Stage 2: three branching story chapters with persistent choices/relationships/routes/endings; original turn-based heroes, energy, status effects and server-resolved computer encounters; eight-district SVG map, NPC conversations, level gates, discoveries and district objectives.

Stage 3: clan roles/membership/invites/ownership, authentic asynchronous tournament brackets and match attempts, read/unread notifications and preferences, friend challenges, polls with moderation, original character editions and actual equipped profile frames.

Stage 4: navigation/profile/privacy updates, guest-to-account import and guest deletion, account deletion across new records, conditional writes and authorization, additive migrations, PostgreSQL API/schema/container/backup configuration, environment and operations documentation, and build-only default CI with formal suites opt-in.

## Evidence boundaries

TypeScript, the production frontend/Worker build and the private PostgreSQL API bundle compiled during implementation. No formal tests were authored or run. No Playwright, browser QA of the expansion, two-real-user verification, PostgreSQL connectivity/migration run, restore drill, public deployment or AWS deployment was performed in this expansion.

Historical Phase 1 verification and screenshots remain in the repository and apply only to that earlier implementation. They are not evidence for new game/social behavior.

## Practical limits

- The existing 22-table D1-backed runtime is retained. PostgreSQL is optional compiled code/configuration, not an activated or proven migration.
- No fabricated community activity, users, scores, tournament entrants or winners are inserted. Editorial poll questions and original story content are authored content, not fake user activity.
- Tournament opening/reconciliation is request-driven. Ties require admin-authorized replay. Incomplete competitions close without a fabricated champion.
- Three original illustrated heroes are reused for transparent portrait editions. There are 24 finite original text clues, three story chapters and eight district interactions.
- Ranking scores have daily qualification limits, but are not a guarantee against coordinated multi-account abuse, answer sharing or automation.
- Formal fixture migrations/new-system coverage, account and fairness validation, strict CSP work, advisory triage, operator retention/cleanup, monitoring, secured production networking and public release approval remain outstanding.

The expansion dependency audit reported eight findings: seven high and one moderate, none critical. These remain review items, primarily in the existing build-tool chain. No claim of dependency cleanliness is made.

## Security and scheduling continuation

Browserslist and fflate receive scoped patched-version overrides. The unpatched braces dependency chain remains reported; no framework downgrade or blanket audit suppression is used. Tournament detail pages automatically open an eligible scheduled bracket, or record insufficient participation without fake matches. Existing manual participant/admin activation remains a compatible fallback. No background scheduler or formal tests were added.
