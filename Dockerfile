FROM node:21-alpine

WORKDIR /usr/src/app

COPY . .

COPY package*.json ./

RUN npm install -g npm@10.5.1

RUN npm install -g yarn --force

RUN npm i -g @nestjs/cli

RUN yarn install --frozen-lockfile

EXPOSE 3350







