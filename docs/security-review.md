# Dependency and scheduling continuation — 23 October 2026

## Dependency changes

The current full npm audit decreased from eight findings (seven high, one moderate) to six findings, all high. The remaining six are the braces finding and its inherited micromatch → fast-glob → dynamic-import → CommonJS → Vinext dependency chain. The production-only audit reported zero findings in this run. This is not six separately discovered application exploits, and it is not a claim that the chain is safe.

- Browserslist is pinned through an override to 4.29.4, beyond the patched 4.28.7 boundary for the reported cache/custom-stat issues.
- The fflate override applies only to versions below 0.7.5, selecting the compatible patched 0.7.5 release. It does not downgrade newer fflate release lines.
- No available patched braces release was identified. The reviewed advisory lists no patched version. Its published affected range includes the installed 3.0.3.
- The audit suggestion to downgrade Vinext to 0.0.15 was not applied: replacing the framework with an older release merely to remove a dependency path would require compatibility and security review.

Sources:

- https://github.com/advisories/GHSA-vfj7-8cjw-p6xm
- https://github.com/advisories/GHSA-c83g-rgw3-j3cx
- https://github.com/advisories/GHSA-73wf-gq98-2v4g
- https://github.com/advisories/GHSA-px8p-9vwx-vf98

Continue to keep build inputs under repository-owner control, isolate CI, and retain both production and full audit reports. These mitigations do not resolve the upstream advisory. Public readiness still requires dependency and CSP review.

## Tournament opening

Detail-page requests now activate a registered competition automatically once its server-side start time arrives. They seed only actual entries, respect cancellation, and commit activation/match creation in a database batch. Notification preferences are fetched once for the roster to reduce per-request database work; notification identities remain idempotent.

A competition with fewer than two entrants at opening is marked `insufficient`; no artificial entrant, bracket or winner is created. An unvisited registration that is already beyond its end closes without starting. Manual participant/admin start remains compatible and uses the same transition helper.

This is request-driven scheduling, not an installed background timer. No DNS, public audience, infrastructure or external scheduler settings were changed. Formal tests, Playwright and two-real-account verification remain deferred. Compilation and audit results do not establish game correctness under concurrency or production readiness.
