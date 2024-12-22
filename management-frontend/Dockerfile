# management-frontend Dockerfile
FROM node:18-alpine AS builder
WORKDIR /usr/app
COPY package*.json ./
RUN npm install
COPY ./ ./
RUN npm run build

# Nginx Stage
EXPOSE 3000
CMD [ "npm", "run", "start" ]

