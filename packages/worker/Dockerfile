FROM node:22.13.1-bullseye AS base

# install Python and system dependencies
RUN apt-get update && apt-get install -y python3 python3-pip ffmpeg
RUN npm install -g tsx
RUN pip install whisperx==3.4.2 

# https://github.com/m-bain/whisperX/issues/826
RUN pip install numpy==1.26.4 nltk==3.8
RUN pip install --upgrade torchaudio


FROM base AS dev
WORKDIR /app_dev
COPY ./package*.json .
RUN npm install

WORKDIR /app_dev/packages/lib
COPY ./packages/lib .
RUN npm install

WORKDIR /app_dev/packages/worker
COPY ./packages/worker .
RUN npm install

FROM base AS prod
WORKDIR /app
COPY ./package*.json .
RUN npm install

WORKDIR /app/packages/lib
COPY ./packages/lib .
RUN npm install

WORKDIR /app/packages/worker
COPY ./packages/worker .
RUN npm install

FROM dev AS development

FROM prod AS production