FROM node:14-slim

WORKDIR /usr/server

COPY ./package.json ./
COPY ./package-lock.json ./

RUN npm i

COPY . .

EXPOSE 3005:3005

ENV NODE_ENV=production

CMD ["npm", "run", "serve:prod"]