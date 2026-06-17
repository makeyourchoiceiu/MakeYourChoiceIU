# ---- Build Stage ----
FROM node:20-alpine AS builder

WORKDIR /app

# Install all dependencies (including dev) for building
COPY package*.json ./
RUN npm ci

# Verify critical packages are installed
RUN npm list --depth=0 || echo "List failed"

# Copy source and build
COPY . .
RUN npm run build

# ---- Production Stage ----
FROM nginx:alpine

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Optional: copy custom nginx config if needed
# COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]