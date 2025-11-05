# Multi-stage build for API Gateway (Node.js + Express)
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Development stage
FROM node:18-alpine AS development
WORKDIR /app

# Install global dependencies for development
RUN npm install -g nodemon typescript ts-node

# Copy dependencies and source
COPY package*.json ./
RUN npm ci
COPY . .

# Development command
CMD ["npm", "run", "dev"]

# Production stage
FROM node:18-alpine AS production

# Install curl for health checks
RUN apk add --no-cache curl

# Create non-root user for security
RUN addgroup -g 1001 nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copy dependencies and built application
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package*.json ./

# Set ownership
RUN chown -R nodejs:nodejs /app
USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# Expose port
EXPOSE 8080

# Start application
CMD ["node", "dist/index.js"]

# Labels for metadata
LABEL maintainer="MiniMax Agent" \
      version="1.0.0" \
      description="API Gateway for Landlord Management System" \
      technology="Node.js, Express, TypeScript"