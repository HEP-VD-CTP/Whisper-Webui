FROM node:22.13.1-alpine AS base

COPY ./packages/backend/start.sh /usr/local/bin/start.sh
RUN chmod +x /usr/local/bin/start.sh
RUN npm install -g tsx

FROM base AS dev
WORKDIR /app_dev
COPY ./package*.json .
RUN npm install

WORKDIR /app_dev/packages/lib
COPY ./packages/lib .
RUN npm install

WORKDIR /app_dev/packages/backend
COPY ./packages/backend .
RUN npm install

FROM base AS prod
WORKDIR /app
COPY ./package*.json .
RUN npm install

WORKDIR /app/packages/lib
COPY ./packages/lib .
RUN npm install

WORKDIR /app/packages/backend
COPY ./packages/backend .
RUN npm install

FROM dev AS development

FROM prod AS production