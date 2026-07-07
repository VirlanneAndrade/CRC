# escape=`

# ── STAGE 1: BUILD (instala deps, gera Prisma Client, copia tudo) ──
FROM mcr.microsoft.com/windows/servercore:1809 AS builder

SHELL ["powershell", "-Command", "$ErrorActionPreference = 'Stop'; $ProgressPreference = 'SilentlyContinue';"]

RUN Invoke-WebRequest -OutFile C:\node.zip -UseBasicParsing `
      https://nodejs.org/dist/v20.18.2/node-v20.18.2-win-x64.zip; `
    Expand-Archive C:\node.zip -DestinationPath C:\; `
    Rename-Item C:\node-v20.18.2-win-x64 C:\nodejs; `
    Remove-Item C:\node.zip; `
    & C:\nodejs\node.exe -v

WORKDIR C:/app

COPY package*.json ./

# --ignore-scripts: evita postinstall do @prisma/client sem o CLI prisma instalado.
# prisma e instalado em seguida; generate roda explicitamente abaixo.
SHELL ["cmd", "/S", "/C"]
RUN C:\nodejs\npm.cmd ci --omit=dev --ignore-scripts && C:\nodejs\npm.cmd install prisma --no-save --ignore-scripts

COPY prisma ./prisma
RUN C:\nodejs\npx.cmd prisma generate

COPY . .

# ── STAGE 2: RUNTIME (Node + app prontos para producao) ──
FROM mcr.microsoft.com/windows/servercore:1809

COPY --from=builder C:/nodejs C:/nodejs
COPY --from=builder C:/app C:/app

ENV NODE_ENV=production
ENV PORT=4001

WORKDIR C:/app

EXPOSE 4001

CMD ["C:\\nodejs\\npm.cmd", "start"]
