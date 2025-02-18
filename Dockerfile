#####################
#### Build stage ####
#####################
FROM node:22 AS builder

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

# Build the TypeScript code
RUN npm run build

##########################
#### Production stage ####
##########################
FROM node:22-slim

# Metadata
LABEL vendor="BAUER GROUP"
LABEL maintainer="Karl Bauer <karl.bauer@bauer-group.com>"

# Create a new user and group
RUN groupadd -r app && useradd -r -g app app

# Ensure /data exists and set correct permissions
RUN mkdir -p /data && chown app:app /data

# Create app directory
WORKDIR /app

# Copy built files and dependencies from the builder stage
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package*.json ./

# Switch to the "app" user
USER app

# === Expose Port ===
EXPOSE 3000

# === Environment Variables ===
ENV NODE_ENV=production
ENV PORT=3000
ENV LOG_LEVEL=debug

ENV GHOST_URL=http://localhost:2368
ENV GHOST_ADMIN_API_SECRET=
ENV GHOST_WEBHOOK_SECRET=
ENV GHOST_WEBHOOK_TARGET=http://localhost:3000

# === Volumes ===
VOLUME /data

# === Application Start ===
CMD [ "npm", "start" ]

# === Healthcheck ===
#HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 CMD curl -f http://localhost:3000/health || exit 1
