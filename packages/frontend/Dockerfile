FROM node:22.13.1-alpine

WORKDIR /app
COPY ./package*.json /app
RUN npm install

WORKDIR /app/packages/frontend
COPY ./packages/frontend /app/packages/frontend
RUN npm install
