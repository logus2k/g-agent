FROM node:25.2-alpine3.22

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application and assets
COPY app.js ./
COPY public ./public
COPY library ./library
COPY script ./script

# Set environment
ENV NODE_ENV=production
ENV PORT=6677
ENV HOST=0.0.0.0

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:6677/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Expose port
EXPOSE 6677

# Start
CMD ["npm", "start"]
