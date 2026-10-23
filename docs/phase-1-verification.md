# Phase 1 verification — 23 October 2026

## Passed in the recovered implementation

- TypeScript check and production Worker/browser build (Vite 8.3.5).
- 11 API/game integration tests against actual isolated SQLite databases, using the committed migration. Tests cover all 1,024 power combinations, guest/account boundaries, save/read/delete isolation, battle creation, duplicate and concurrent voting, replies, follows, reports, moderation authorization, audit writes, blocking, origin validation, payload validation/limits, malformed JSON, wrong media type, rate limits and an actually closed database returning a safe 503.
- 10 preserved creator/portrait tests and eleven legacy page/asset checks.
- Recovered browser homepage and all five guest power questions, followed by name personalization and the reproducible result URL. The homepage screenshot is a fresh real browser capture.
- Before the workspace interruption, browser checks verified the same power-card export as a real 1080 × 1350 PNG, the generated 1200 × 630 social image, database health, genuine empty arena, guest posting boundary, 390 × 844 responsive layout/mobile menu, challenge link copying using a clearly labeled local-only fixture, motion preference persistence and the legacy builder redirect with saved state intact. That local fixture was never inserted into production.

## Still unverified or pending

- The recovered build's download-file inspection was interrupted by browser/host transport failures; a download attempt or UI status alone is not treated as fresh independent file verification.
- Hosted ChatGPT login and account provisioning, two real-user save/vote/reply journeys, and moderator allowlist configuration. Simulated identities in API tests do not prove live OAuth success.
- Playwright CLI suite, Docker Compose, backup helper/restore drill and AWS deployment. Those tools/configurations exist; authoring this workflow is not evidence that it passed. Supported cloud browser checks used Playwright locators.
- Physical mobile-device tests, a full accessibility audit, load/penetration tests and external social crawler previews.
- Public search indexing and friend invitations: the Site remains owner-private.

## Dependency findings

Dependencies were reduced from the broad starter to the packages used here and maintained hosting tooling. React/RSC, Next.js, Vite, sharp, image-size, esbuild, undici and ws were patched using available registry versions. Full npm audit reported 8 findings: 7 high and 1 moderate, involving braces, browserslist, fast-glob, fflate, micromatch and the Vinext/CommonJS build-tool chain (some are inherited parent findings). No critical finding remained in that run. These are not silently described as resolved. Public production readiness requires continued dependency triage. Run both the production-only and full audits; an omit-dev scan alone is insufficient assurance.

## Scope

No fake users, discussions, votes, rankings or rewards are seeded. Daily games, story progression, 3D worlds, clans and tournaments are later phases. The published Site source and GitHub are separate repositories; verify the GitHub update and deployment result independently.
