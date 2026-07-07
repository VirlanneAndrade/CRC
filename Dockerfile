FROM node:20-alpine

WORKDIR /app

# Prisma CLI precisa estar disponível para migrate deploy via docker exec
COPY package*.json ./
RUN npm ci --omit=dev && npm install prisma --no-save

COPY prisma ./prisma
RUN npx prisma generate

COPY . .

ENV NODE_ENV=production
ENV PORT=4001

EXPOSE 4001

CMD ["npm", "start"]