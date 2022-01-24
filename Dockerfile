ARG PORT=3000

FROM node:12-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm test
RUN npm run build

FROM node:12-alpine AS final
ENV NODE_ENV production
ENV PORT ${PORT}

# Prepare destination directory and ensure user node owns it
RUN mkdir -p /home/node/app/dist && chown -R node:node /home/node/app

WORKDIR /home/node/app
COPY package*.json ./
USER node
RUN npm ci --only=production
COPY --chown=node:node --from=builder /app/dist ./dist

EXPOSE ${PORT}

ENTRYPOINT ["npm", "start"]  