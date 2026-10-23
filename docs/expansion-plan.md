# ANIMEVERSE expansion implementation plan

Preserve the portrait home, power results, discussion arena and original assets. Remain entirely 2D.

1. Add server-owned quiz sessions, UTC daily/weekly missions, an idempotent XP ledger, account/guest progress, real rankings and a compact play hub.
2. Add persistent branching chapters, server-resolved turn combat and an SVG district map using the same progression records.
3. Add authorized clan membership, real-player asynchronous tournament brackets, persisted notifications/preferences and deterministic cosmetic unlocks.
4. Extend navigation and privacy controls; prepare PostgreSQL persistence behind a private authenticated API, containers, migrations, backups and rollback docs.

No formal tests or Playwright runs in this expansion. Run TypeScript and production compilation only. Clearly label game rules, scoring limits, guest retention, unverified behavior and deployment prerequisites. Keep audience owner-private. No fake participants, scores, rewards or results.
