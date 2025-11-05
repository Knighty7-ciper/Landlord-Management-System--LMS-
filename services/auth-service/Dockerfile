# Multi-stage build for Node.js Auth Service
FROM node:18-alpine AS builder

# Set working directory
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

# Copy source code and dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Development command
CMD ["npm", "run", "dev"]

# Production stage
FROM node:18-alpine AS production

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copy dependencies from builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Copy package files
COPY package*.json ./

# Set ownership to nodejs user
RUN chown -R nodejs:nodejs /app
USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Expose port
EXPOSE 8080

# Start application
CMD ["node", "dist/index.js"]

# Labels for metadata
LABEL maintainer="MiniMax Agent" \
      version="1.0.0" \
      description="Authentication Service for Landlord Management System" \
      technology="Node.js, TypeScript, JWT"