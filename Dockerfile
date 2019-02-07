FROM node:11

ENV CACHE_TIME=3600
ENV PORT=3000
ENV BOT_TOKEN=

WORKDIR /app

COPY package*.json /app

RUN npm install

COPY . .

EXPOSE ${PORT}

CMD [ "node", "index" ]