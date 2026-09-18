# ==================== Backend Dockerfile ====================
# Multi-stage build:
# - Stage 1 (base): Install dependencies
# - Stage 2 (development): Add dev tools, nodemon for hot reload
# - Stage 3 (production): Minimal image, no dev dependencies, non-root user

# ==================== Stage 1: Base ====================
FROM node:20-alpine AS base
WORKDIR /app

# Install system dependencies needed for bcrypt native module
RUN apk add --no-cache python3 make g++

# Copy package files first (Docker layer caching — only re-install if deps change)
COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci --only=production && \
    npx prisma generate

# ==================== Stage 2: Development ====================
FROM base AS development

# Install ALL dependencies (including devDependencies)
RUN npm ci

COPY . .

EXPOSE 3000
CMD ["npm", "run", "dev"]

# ==================== Stage 3: Production ====================
FROM node:20-alpine AS production

# Security: create a non-root user to run the application
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copy only production artifacts from base stage
COPY --from=base --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=base --chown=nodejs:nodejs /app/prisma ./prisma
COPY --chown=nodejs:nodejs package*.json ./
COPY --chown=nodejs:nodejs src ./src

# Switch to non-root user
USER nodejs

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => r.statusCode === 200 ? process.exit(0) : process.exit(1))"

CMD ["node", "src/app.js"]
