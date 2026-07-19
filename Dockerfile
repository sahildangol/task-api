FROM node:22-alpine AS base

WORKDIR /app
RUN corepack enable

FROM base AS build

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --ignore-scripts

COPY tsconfig.json prisma.config.ts ./
COPY prisma ./prisma
COPY src ./src

RUN pnpm prisma generate
RUN pnpm build

FROM base AS runtime

ENV NODE_ENV=production

RUN chown -R node:node /app
USER node

COPY --chown=node:node package.json pnpm-lock.yaml ./
RUN pnpm install --prod --shamefully-hoist --ignore-scripts

COPY --chown=node:node prisma.config.ts ./prisma.config.ts
COPY --chown=node:node docker-entrypoint.sh ./docker-entrypoint.sh
COPY --from=build --chown=node:node /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build --chown=node:node /app/dist ./dist
COPY --from=build --chown=node:node /app/prisma ./prisma

RUN chmod +x ./docker-entrypoint.sh

EXPOSE 5001

CMD ["./docker-entrypoint.sh"]
