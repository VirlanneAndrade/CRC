# escape=`

# ── STAGE 1: BUILD (instala deps, gera Prisma Client, copia tudo) ──
FROM mcr.microsoft.com/windows/servercore:1809 AS builder

SHELL ["powershell", "-Command", "$ErrorActionPreference = 'Stop'; $ProgressPreference = 'SilentlyContinue';"]

RUN Invoke-WebRequest -OutFile C:\node.zip -UseBasicParsing `
      https://nodejs.org/dist/v20.18.2/node-v20.18.2-win-x64.zip; `
    Expand-Archive C:\node.zip -DestinationPath C:\; `
    Rename-Item C:\node-v20.18.2-win-x64 C:\nodejs; `
    Remove-Item C:\node.zip

ENV PATH="C:\\nodejs;C:\\Windows\\system32;C:\\Windows"

WORKDIR C:/app

COPY package*.json ./
RUN npm ci --omit=dev; npm install prisma --no-save

COPY prisma ./prisma
RUN npx prisma generate

COPY . .

# ── STAGE 2: RUNTIME (Node + app prontos para producao) ──
FROM mcr.microsoft.com/windows/servercore:1809

SHELL ["powershell", "-Command", "$ErrorActionPreference = 'Stop'; $ProgressPreference = 'SilentlyContinue';"]

COPY --from=builder C:/nodejs C:/nodejs
COPY --from=builder C:/app C:/app

ENV PATH="C:\\nodejs;C:\\Windows\\system32;C:\\Windows"
ENV NODE_ENV=production
ENV PORT=4001

WORKDIR C:/app

EXPOSE 4001

CMD ["npm.cmd", "start"]
