# Use Node.js LTS
FROM node:18

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 8080
ENV PORT=8080

CMD [ "node", "src/app.js" ]
