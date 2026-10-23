FROM node:24-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts --no-audit --no-fund
COPY . .
RUN npm run check && npm run build
FROM node:24-bookworm-slim
ENV NODE_ENV=production WRANGLER_SEND_METRICS=false DATA_DIRECTORY=/app/.wrangler/state
WORKDIR /app
COPY --from=build --chown=node:node /app /app
RUN mkdir -p /app/.wrangler/state /app/backups && chown -R node:node /app/.wrangler /app/backups
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 CMD node -e "fetch('http://127.0.0.1:3000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
STOPSIGNAL SIGTERM
ENTRYPOINT ["node", "scripts/container-start.mjs"]
