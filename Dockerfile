FROM node:20-alpine

WORKDIR /app

# Copy package files and install prod deps (none beyond SDK, but future-proof)
COPY package.json yarn.lock ./
RUN yarn --production --frozen-lockfile || yarn --production

# Copy dist only (image is for running the built server)
COPY dist ./dist

ENV NODE_ENV=production
CMD ["node", "dist/index.js", "stdio"]

