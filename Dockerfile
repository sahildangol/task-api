FROM node:20-alpine AS base

WORKDIR /app
RUN corepack enable

FROM base AS build

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY tsconfig.json prisma.config.ts ./
COPY prisma ./prisma
COPY src ./src

RUN pnpm prisma generate
RUN pnpm build

FROM base AS runtime

ENV NODE_ENV=production

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN chown -R appuser:appgroup /app
USER appuser

COPY --chown=appuser:appgroup package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile --shamefully-hoist

COPY --chown=appuser:appgroup prisma.config.ts ./prisma.config.ts
COPY --chown=appuser:appgroup docker-entrypoint.sh ./docker-entrypoint.sh
COPY --from=build --chown=appuser:appgroup /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build --chown=appuser:appgroup /app/dist ./dist
COPY --from=build --chown=appuser:appgroup /app/prisma ./prisma

RUN chmod +x ./docker-entrypoint.sh

EXPOSE 5000

CMD ["./docker-entrypoint.sh"]
