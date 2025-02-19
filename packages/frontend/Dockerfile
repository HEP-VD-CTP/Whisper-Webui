FROM node:22.13.1-alpine AS base


FROM base AS dev
WORKDIR /app_dev
COPY ./package*.json .
RUN npm install

WORKDIR /app_dev/packages/lib
COPY ./packages/lib .
RUN npm install

WORKDIR /app_dev/packages/backend
COPY ./packages/backend .

WORKDIR /app_dev/packages/frontend
COPY ./packages/frontend .
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

WORKDIR /app/packages/frontend
COPY ./packages/frontend .
RUN npm install

FROM dev AS development

FROM prod AS production