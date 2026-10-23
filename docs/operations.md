# ANIMEVERSE operations

## Current release posture

This expansion intentionally skips formal test authoring/execution, Playwright and two-account checks. TypeScript and frontend/private-API builds are compilation evidence only. Preserve the current owner-private audience. Do not change DNS, public access, security groups or production targets without authorization.

The default backend is hosted D1. The optional PostgreSQL service is compiled but has not been run against PostgreSQL here. There is no automatic data cutover.

## Build and deployment

1. Install the lockfile with `npm ci`; run `npm run typecheck`, `npm run build` and `npm run build:data`.
2. Review `drizzle/0001`–`0004` and their PostgreSQL equivalents. Migrations are additive; keep applied SQL immutable.
3. Keep a known source commit, image digest and database backup. Publish the exact source/build through the Sites workflow, preserving audience. Sites applies D1 migrations before the Worker.
4. A terminal successful deployment verifies publication only. `/api/health` must return `status: ok` and `database: ready` before claiming service readiness. It queries the expansion schema.
5. Staff moderation and configure real site-scoped `ADMIN_USER_IDS` before enabling social competition for outside users. Admin scheduling is available on `/events`; reports and action audit history on `/admin`.

GitHub Actions defaults to type checks, production/full dependency audits, frontend/private-API builds and container/readiness work. Formal suites are manual opt-in and were not run for this release. Full audit output remains visible even when nonblocking.

## PostgreSQL service and cutover

`compose.postgres.yaml` runs PostgreSQL 17, the private Node API and daily backups on an internal Compose network, with persistent named volumes. It publishes no ports. The API performs schema migrations under an advisory lock before listening, checks shared bearer tokens in constant time and trusts a user identity only from the authorized Worker. Never put `DATA_API_TOKEN` in frontend code or let an external caller supply `X-AV-User` through an unauthenticated proxy.

Before cutover, provision a secured HTTPS ingress reachable by the Worker, set the exact `SITE_ORIGIN`, require verified TLS for remote PostgreSQL, configure least-privilege DB credentials and network access, and review the service’s actual runtime behavior. Do not point `DATA_API_URL` at a Docker-only hostname from a hosted Worker.

DDL export does not copy D1 data. Quiesce writes, export/import all tables preserving identifiers and foreign keys, reconcile row counts and representative records, verify auth/CSRF and transaction semantics, and perform a restore drill. Then change the server-side `DATA_API_URL` and matching token. This checklist is required future operator work, not a claim that it was performed.

Independent AWS frontend hosting additionally requires a real OAuth/session adapter. The guest Docker lab deliberately strips Sites identity headers. Merely exposing that lab is not a secure signed-in AWS production deployment.

## Backups and recovery

D1: enable the host’s supported recovery/export policy. Local Docker SQLite backups do not protect the hosted database.

Local lab:

```bash
docker compose exec app node scripts/backup.mjs
```

The helper uses SQLite’s online backup API. Before restore, stop writers, preserve current state, restore a compatible copy and reconcile records. A file copied from a live WAL database is not a valid replacement for an online backup.

PostgreSQL: the backup service writes a custom-format `pg_dump` daily, then removes dump files older than 14 days. Dumps are written to a temporary file and renamed only on success. Backup volumes on the same host do not protect against host loss; provision encrypted, private off-host copies and alerts. No off-host service is configured here.

Example restore procedure for a deliberately selected dump (not executed):

```bash
docker compose -f compose.postgres.yaml stop data-api
docker compose -f compose.postgres.yaml run --rm --entrypoint sh backup -ec 'pg_restore -h postgres -U animeverse -d animeverse --clean --if-exists /backups/SELECTED.dump'
docker compose -f compose.postgres.yaml up -d data-api
```

Restoring replaces database content and can lose newer activity. Obtain operational authorization, retain the current database and inspect the dump before running a restore.

## Rollback

Sites: redeploy a previously successful saved version after confirming it can operate with the expanded schema. Code rollback does not reverse migrations or restore data. The additions are new tables/nullable columns; older code can ignore them, but it will not understand later game activity.

PostgreSQL API: retain the prior immutable image digest, stop writes if required, deploy the old image only when schema-compatible, and check health. A D1-to-PostgreSQL cutover rollback requires reconciling writes made after cutover; toggling an environment variable can strand newer data. Never do that blindly.

## Monitoring, schedules and retention

API logs include request IDs, paths, status, method and duration; private service logs omit sensitive request payloads. Connect a real log/metrics/alerting destination before public launch. Alert on readiness failure, 5xx rate, backup failure and DB storage growth. No monitoring backend or alert route is connected.

Daily/weekly quests use server UTC calculations; synchronize clocks. Tournaments activate through participant/admin requests after the scheduled opening; pages reconcile completed attempts and deadlines. Tied matches need an administrator to authorize replay. A future background scheduler may trigger these same authorized transitions, but none is silently assumed.

Guest cookies expire after 30 days. Define and communicate retention, then schedule deletion of orphaned guest records older than the retention window, old practice attempts and expired rate-limit buckets. Preserve account story history and required audits according to the approved policy. No cleanup job has been silently installed.

## Public release gate

Before authorization to make the Site public: review dependencies and CSP, complete deferred game/auth/authorization tests, inspect mobile and keyboard flows, configure administrators and reporting, verify PostgreSQL only if selected, validate backup recovery, set legal contact/retention policies, and establish incident/rollback ownership. Email/push, paid cosmetics, ads and public infrastructure remain disabled/unprovisioned.
