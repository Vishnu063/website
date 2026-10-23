# Phase 1 verification — 23 October 2026

## Passed in the recovered implementation

- TypeScript check and production Worker/browser build (Vite 8.3.5).
- 11 API/game integration tests against actual isolated SQLite databases, using the committed migration. Tests cover all 1,024 power combinations, guest/account boundaries, save/read/delete isolation, battle creation, duplicate and concurrent voting, replies, follows, reports, moderation authorization, audit writes, blocking, origin validation, payload validation/limits, malformed JSON, wrong media type, rate limits and an actually closed database returning a safe 503.
- 10 preserved creator/portrait tests and eleven legacy page/asset checks.
- Recovered browser homepage and all five guest power questions, followed by name personalization and the reproducible result URL. The homepage, personalized result and mobile layout screenshots are fresh real browser captures. Mobile menu and database health were checked again in the recovered build.
- Before the workspace interruption, browser checks verified the same power-card export as a real 1080 × 1350 PNG, the generated 1200 × 630 social image, database health, genuine empty arena, guest posting boundary, 390 × 844 responsive layout/mobile menu, challenge link copying using a clearly labeled local-only fixture, motion preference persistence and the legacy builder redirect with saved state intact. That local fixture was never inserted into production.

## Still unverified or pending

- Hosted ChatGPT login and account provisioning, two real-user save/vote/reply journeys, and moderator allowlist configuration. Simulated identities in API tests do not prove live OAuth success.
- A container restore drill, hosted backup scheduling and AWS deployment remain unverified.
- Physical mobile-device tests, a full accessibility audit, load/penetration tests and external social crawler previews.
- Public search indexing and friend invitations: the Site remains owner-private.

## Dependency findings

Dependencies were reduced from the broad starter to the packages used here and maintained hosting tooling. React/RSC, Next.js, Vite, sharp, image-size, esbuild, undici and ws were patched using available registry versions. Full npm audit reported 8 findings: 7 high and 1 moderate, involving braces, browserslist, fast-glob, fflate, micromatch and the Vinext/CommonJS build-tool chain (some are inherited parent findings). No critical finding remained in that run. These are not silently described as resolved. Public production readiness requires continued dependency triage. Run both the production-only and full audits; an omit-dev scan alone is insufficient assurance.

## Scope

No fake users, discussions, votes, rankings or rewards are seeded. Daily games, story progression, 3D worlds, clans and tournaments are later phases. The published Site source and GitHub are separate repositories; verify the GitHub update and deployment result independently.

## Hosted deployment and CI

Sites deployment version 5 succeeded from source checkpoint `ecb270fc19a49b587ad0e528b881ae2dc8d410cb`. A service-authenticated request to the deployed `/api/health` returned HTTP 200 with `status: ok`, `database: ready`, `version: 2.0.0`. The live D1 overview confirmed all nine application tables. The audience remains owner-private.

GitHub run 39915731222 passed install, checks, production audit and build, then failed Docker build because the slim builder lacked Python for the legacy asset check. Python was added to the builder stage; the follow-up run must be checked before claiming Docker or Playwright success.

The recovered mobile menu and local `/api/health` were verified again. The local SQLite online-backup helper produced three backup files; each reopened copy returned `PRAGMA integrity_check = ok`. This does not establish a hosted backup or a container restore drill.

GitHub run 39916268777 built the Docker image successfully, then identified an EACCES error creating the non-root runtime directory. Directory ownership was corrected in commit `8d82ec6018a4d57ed91f735fde908614959f523d`; the follow-up GitHub run 39916744009 succeeded, including Docker Compose startup, actual database readiness and the desktop/mobile Playwright suite. Current work remains entirely 2D, with 3D deferred.

## Reference design refinement

The recent user screenshot shows the original Yoru portrait studio. The home now follows that direction with a charcoal surface, warm rose accents, editorial typography, three original character choices and an interactive full portrait preview. The existing quiz and community features remain available; this is entirely 2D. The shared ChatGPT URL itself could not be fetched, so the screenshot is the design source.
