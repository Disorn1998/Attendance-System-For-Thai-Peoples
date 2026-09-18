# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
# Need to pass env vars during build if any are required, normally Vite embeds VITE_ vars
RUN npm run build

# Production stage (Nginx)
FROM nginx:alpine

# Copy built assets to Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port (internal)
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
