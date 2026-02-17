FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

ENV CHOKIDAR_USEPOLLING=true

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev"]
