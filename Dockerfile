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
FROM node:22-alpine

# Metadata
LABEL vendor="BAUER GROUP"
LABEL maintainer="Karl Bauer <karl.bauer@bauer-group.com>"

# Opencontainers Metadata
LABEL org.opencontainers.image.title="Ghost BunnyCDN Connector"
LABEL org.opencontainers.image.version="0.1.0"
LABEL org.opencontainers.image.licenses="MIT"
LABEL org.opencontainers.image.vendor="BAUER GROUP"
LABEL org.opencontainers.image.authors="Karl Bauer <karl.bauer@bauer-group.com>"
LABEL org.opencontainers.image.source="https://github.com/bauer-group/Ghost.BunnyCDN.Connector"
LABEL org.opencontainers.image.description="$(cat README.md)"


# Install tini and curl
RUN apk add --no-cache tini curl

# Create a new user and group
RUN addgroup -g 1005 app && \
    adduser -u 1005 -G app -s /bin/sh -D app

# Ensure /data exists and set correct permissions
RUN mkdir -p /data && chown -R app:app /data && chmod -R 770 /data

# Create app directory
WORKDIR /app

# Copy built files and dependencies from the builder stage
COPY --from=builder /usr/src/app/public ./public
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
ENV GHOST_CDN_BASE_URL=
ENV GHOST_ADMIN_API_SECRET=
ENV GHOST_WEBHOOK_SECRET=
ENV GHOST_WEBHOOK_TARGET=http://localhost:3000
ENV BUNNYCDN_API_KEY=

# === Volumes ===
VOLUME /data

# === Application Start ===
#CMD [ "npm", "start" ]
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/index.js"]

# === Healthcheck ===
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 CMD curl -f http://localhost:${PORT}/health || exit 1
