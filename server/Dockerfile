FROM node:22-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps

FROM base AS dev
COPY . .
EXPOSE 4000
CMD ["npm", "run", "dev"]

FROM node:22-alpine AS prod
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev --legacy-peer-deps && npm cache clean --force
COPY . .
EXPOSE 4000
CMD ["npm", "run", "start"]
