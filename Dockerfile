# Build stage
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules /app/node_modules
COPY . .
RUN node ace build --production

# Production deps only
FROM node:22-alpine AS production-deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# Production stage: run the app with pg_dump available for DB backups
FROM node:22-alpine AS production

# PostgreSQL client so pg_dump is available for DB backups
RUN apk add --no-cache postgresql-client

WORKDIR /app
COPY package.json package-lock.json* ./
COPY --from=production-deps /app/node_modules /app/node_modules
COPY --from=build /app/build .

# Writable dir for BackupService (pg_dump writes here before upload)
RUN mkdir -p /app/backups

ENV NODE_ENV=production
ENV PORT=3333
EXPOSE 3333

# Provide APP_KEY, DATABASE URLs, R2, etc. at runtime (e.g. --env-file .env or -e VAR=value)
CMD ["node", "bin/server.js"]
