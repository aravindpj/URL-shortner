FROM node:23-alpine AS base

WORKDIR /usr/src/app

EXPOSE 3000

COPY package*.json ./

FROM base AS  development

ENV NODE_ENV = development

RUN npm ci

COPY . .

CMD [ "npm" , "run" , "start:dev"]

FROM base AS production

ENV NODE_ENV = production

RUN npm ci --only=production \ && npm run build

CMD [ "node" , "dist/main"]
