# Windows Server 2019 (10.0.17763) — container nativo LTSC 2019
FROM node:20-windowsservercore-ltsc2019

WORKDIR C:/app

COPY package*.json ./
RUN npm ci --omit=dev && npm install prisma --no-save

COPY prisma ./prisma
RUN npx prisma generate

COPY . .

ENV NODE_ENV=production
ENV PORT=4001

EXPOSE 4001

CMD ["npm.cmd", "start"]
