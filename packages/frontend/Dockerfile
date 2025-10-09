FROM node:22.13.1-alpine AS base

COPY ./packages/frontend/start.sh /usr/local/bin/start.sh
RUN chmod +x /usr/local/bin/start.sh

FROM base AS dev
WORKDIR /app_dev
COPY ./package*.json .
RUN npm install

WORKDIR /app_dev/packages/frontend
COPY ./packages/frontend .
RUN npm install

FROM base AS prod
WORKDIR /app
COPY ./package*.json .
RUN npm install
RUN npm install -g tsx

WORKDIR /app/packages/frontend
COPY ./packages/frontend .
RUN npm install

FROM dev AS development

FROM prod AS production
