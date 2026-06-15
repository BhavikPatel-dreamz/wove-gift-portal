# ============================================================================
# Wove Gift Portal - Production Dockerfile
# Multi-stage build for Next.js 16 + Prisma + native deps (canvas)
# ============================================================================

# ---- Stage 1: Install Dependencies ----
FROM node:20-slim AS deps

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@10.26.2 --activate

WORKDIR /app

# Native build dependencies required by the 'canvas' npm package
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    python3 \
    pkg-config \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg62-turbo-dev \
    libgif-dev \
    librsvg2-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy dependency manifests
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY prisma ./prisma/
COPY prisma.config.js ./

# Provide a dummy DATABASE_URL so prisma generate (postinstall) doesn't fail
ENV DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"

RUN pnpm install --frozen-lockfile


# ---- Stage 2: Build Application ----
FROM node:20-slim AS builder

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@10.26.2 --activate

WORKDIR /app

# Runtime native libs needed during build (canvas is used in server components).
# openssl: lets Prisma detect libssl during prisma generate / build (avoids defaulting to openssl-1.1.x on slim images).
RUN apt-get update && apt-get install -y --no-install-recommends \
    libcairo2 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libjpeg62-turbo \
    libgif7 \
    librsvg2-2 \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Dummy env vars so modules don't throw during next build.
# These are never used to connect — real values are injected at runtime by App Platform.
ENV DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"
ENV STRIPE_SECRET_KEY="sk_placeholder"
ENV STRIPE_WEBHOOK_SECRET="whsec_placeholder"
ENV SHOPIFY_API_KEY="placeholder"
ENV SHOPIFY_SECRET_KEY="placeholder"
ENV SHOPIFY_APP_URL="https://placeholder.example.com"
ENV SHOPIFY_ACCESS_TOKEN="shpat_placeholder"
ENV NEXT_BREVO_API_KEY="placeholder"
ENV NEXT_TWILIO_ACCOUNT_SID="placeholder"
ENV NEXT_TWILIO_AUTH_TOKEN="placeholder"

RUN pnpm build


# ---- Stage 3: Production Runner ----
FROM node:20-slim AS runner

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@10.26.2 --activate

WORKDIR /app
ENV NODE_ENV=production

# Runtime native libraries for canvas + openssl for Prisma
RUN apt-get update && apt-get install -y --no-install-recommends \
    libcairo2 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libjpeg62-turbo \
    libgif7 \
    librsvg2-2 \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user with a writable home directory (needed by corepack)
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 --home /home/nextjs nextjs

# Prepare corepack/pnpm cache so it's available to the nextjs user at runtime
ENV COREPACK_HOME=/home/nextjs/.corepack
RUN mkdir -p /home/nextjs/.corepack && \
    corepack prepare pnpm@10.26.2 --activate && \
    chown -R nextjs:nodejs /home/nextjs

# Copy built application and runtime files
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./
COPY --from=builder --chown=nextjs:nodejs /app/pnpm-lock.yaml ./
COPY --from=builder --chown=nextjs:nodejs /app/pnpm-workspace.yaml ./
COPY --from=builder --chown=nextjs:nodejs /app/next.config.js ./
COPY --from=builder --chown=nextjs:nodejs /app/prisma.config.js ./
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/generated ./generated
COPY --from=builder --chown=nextjs:nodejs /app/scripts ./scripts
COPY --from=builder --chown=nextjs:nodejs /app/src ./src

# Ensure Prisma client exists in the image (covers empty/missed COPY layers or cache quirks).
# Must run before USER nextjs so prisma can write; then fix ownership for the app user.
ENV DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"
RUN pnpm exec prisma generate && chown -R nextjs:nodejs /app/generated

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["pnpm", "run", "start:web"]
