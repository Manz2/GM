# management-frontend Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY ./ ./
RUN npm run build

FROM node:18-alpine
WORKDIR /app
# These are the important file copies
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Nginx Stage
EXPOSE 3000
CMD ["node", "server.js"]


