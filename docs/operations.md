# ANIMEVERSE operations

## Release and health

Run `npm ci`, `npm run check`, production build and audits. Review migrations and test guest/account boundaries. Publish verified source through Sites, preserving project identity and audience. Require a terminal successful deployment and real `/api/health` database readiness. A static HTML 200 is insufficient.

API logs are structured JSON with request ID, method, path, status and duration. They omit request bodies, email addresses, secrets and database exceptions. Correlate problems using `X-Request-ID`. No external monitoring or metrics scraper is connected.

Configure `ADMIN_USER_IDS` with real site-scoped identities before inviting a wider audience. Store secrets in runtime settings. Never promote a first visitor to administrator automatically.

## Rollback

Sites: redeploy a previous successful saved version, after checking database compatibility. The initial migration is additive; the former static Yoru app can ignore its new tables. Code rollback does not imply data restoration.

Docker lab: retain a previous image digest, back up the database before release, promote the next immutable image, verify health, then switch traffic. Roll back the image if health fails. Restore data only after assessing migration compatibility and acceptable data loss. Registry promotion and automated AWS deployment are not configured.

## Local backup helper

```bash
docker compose exec app node scripts/backup.mjs
```

This uses SQLite's online backup API, not a copy of an active WAL file. It is provided but unverified inside Docker here. No backup scheduler or retention policy is installed. Before public launch, choose retention and access controls and perform a restore drill.

To restore a lab backup, stop the app, preserve current state, identify the corresponding Miniflare SQLite file, replace it with a verified backup, handle obsolete WAL/SHM files only with the database stopped, restart and check a known record and health.

Local backups do not protect the hosted D1 database. Configure hosting-supported exports/recovery and test a restoration separately.

## AWS production gap

EC2 can run the guest development lab. An independent public AWS release still needs a production server/runtime adapter, trusted authentication, PostgreSQL conversion and integration tests if selected, TLS, restricted security groups, secret management, scheduled backups and a real deployment target. No AWS deployment or PostgreSQL compatibility is claimed.
