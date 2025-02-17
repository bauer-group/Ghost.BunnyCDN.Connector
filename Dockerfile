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

# Create app directory
WORKDIR /usr/src/app

# Copy built files and dependencies from the builder stage
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package*.json ./

# === Expose Port ===
EXPOSE 3000

# === Environment Variables ===
ENV NODE_ENV=production
ENV PORT=3000

ENV GHOST_URL=http://localhost:2368
ENV GHOST_ADMIN_API_SECRET=
ENV GHOST_WEBHOOK_SECRET=
ENV GHOST_WEBHOOK_TARGET=http://localhost:3000

# === Application Start ===
CMD [ "npm", "start" ]
