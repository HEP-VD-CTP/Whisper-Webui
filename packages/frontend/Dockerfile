FROM node:22.13.1-alpine

WORKDIR /app
COPY ./package*.json .
RUN npm install

WORKDIR /app/packages/frontend
COPY ./packages/frontend .
RUN npm install

