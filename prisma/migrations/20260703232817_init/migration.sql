-- CreateTable
CREATE TABLE "perfis_portal" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "permissoes" JSONB NOT NULL DEFAULT '[]',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "perfis_portal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios_administrativos" (
    "id" TEXT NOT NULL,
    "login" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT,
    "senhaHash" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "perfilId" TEXT,
    "ultimoLoginEm" TIMESTAMP(3),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_administrativos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuracao_portal" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "nome" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL DEFAULT '',
    "endereco" TEXT NOT NULL DEFAULT '',
    "uf" TEXT NOT NULL DEFAULT '',
    "email" TEXT NOT NULL DEFAULT '',
    "telefone" TEXT NOT NULL DEFAULT '',
    "responsavel" TEXT NOT NULL DEFAULT '',
    "logo" TEXT NOT NULL DEFAULT '',
    "modoManutencao" BOOLEAN NOT NULL DEFAULT false,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "configuracao_portal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuracao_api_tributos" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "apiBaseUrl" TEXT NOT NULL DEFAULT '',
    "authType" TEXT NOT NULL DEFAULT 'x-api-key',
    "authToken" TEXT NOT NULL DEFAULT '',
    "healthPath" TEXT NOT NULL DEFAULT '/health',
    "timeoutMs" INTEGER NOT NULL DEFAULT 10000,
    "sincronizacao" TEXT NOT NULL DEFAULT '15min',
    "recursos" JSONB NOT NULL DEFAULT '[]',
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "configuracao_api_tributos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuracao_notificacao" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "emailWebhookUrl" TEXT NOT NULL DEFAULT '',
    "whatsappWebhookUrl" TEXT NOT NULL DEFAULT '',
    "smsWebhookUrl" TEXT NOT NULL DEFAULT '',
    "remetentePadrao" TEXT NOT NULL DEFAULT 'Portal CRC',
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "configuracao_notificacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuracao_ia" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "provedor" TEXT NOT NULL DEFAULT '',
    "modelo" TEXT NOT NULL DEFAULT '',
    "apiKey" TEXT NOT NULL DEFAULT '',
    "systemPrompt" TEXT NOT NULL DEFAULT '',
    "temperatura" DOUBLE PRECISION NOT NULL DEFAULT 0.7,
    "temasBloqueados" JSONB NOT NULL DEFAULT '[]',
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "configuracao_ia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consentimentos_lgpd" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "papel" TEXT NOT NULL,
    "versaoTermo" TEXT NOT NULL,
    "hashTermo" TEXT NOT NULL,
    "ip" TEXT,
    "userAgent" TEXT,
    "consentimentosOpcionais" JSONB NOT NULL DEFAULT '[]',
    "metodoAutenticacao" TEXT NOT NULL,
    "dataHora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "consentimentos_lgpd_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "preferencias_usuario" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "canais" JSONB NOT NULL DEFAULT '{}',
    "tema" TEXT,
    "outras" JSONB NOT NULL DEFAULT '{}',
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "preferencias_usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "logs_integracao" (
    "id" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "metodo" TEXT NOT NULL,
    "statusHttp" INTEGER,
    "duracaoMs" INTEGER,
    "requestId" TEXT,
    "sucesso" BOOLEAN NOT NULL DEFAULT false,
    "erro" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "logs_integracao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "logs_auditoria" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT,
    "acao" TEXT NOT NULL,
    "entidade" TEXT,
    "detalhe" JSONB,
    "ip" TEXT,
    "userAgent" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "logs_auditoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "logs_acesso_documento" (
    "id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "codigoAutenticacao" TEXT,
    "cpfCnpj" TEXT,
    "inscricao" TEXT,
    "urlPdf" TEXT,
    "requestId" TEXT,
    "validade" TIMESTAMP(3),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "logs_acesso_documento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "perfis_portal_nome_key" ON "perfis_portal"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_administrativos_login_key" ON "usuarios_administrativos"("login");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_administrativos_email_key" ON "usuarios_administrativos"("email");

-- CreateIndex
CREATE INDEX "consentimentos_lgpd_userId_idx" ON "consentimentos_lgpd"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "preferencias_usuario_userId_key" ON "preferencias_usuario"("userId");

-- CreateIndex
CREATE INDEX "logs_integracao_endpoint_idx" ON "logs_integracao"("endpoint");

-- CreateIndex
CREATE INDEX "logs_integracao_criadoEm_idx" ON "logs_integracao"("criadoEm");

-- CreateIndex
CREATE INDEX "logs_auditoria_usuarioId_idx" ON "logs_auditoria"("usuarioId");

-- CreateIndex
CREATE INDEX "logs_auditoria_criadoEm_idx" ON "logs_auditoria"("criadoEm");

-- CreateIndex
CREATE INDEX "logs_acesso_documento_codigoAutenticacao_idx" ON "logs_acesso_documento"("codigoAutenticacao");

-- CreateIndex
CREATE INDEX "logs_acesso_documento_cpfCnpj_idx" ON "logs_acesso_documento"("cpfCnpj");

-- AddForeignKey
ALTER TABLE "usuarios_administrativos" ADD CONSTRAINT "usuarios_administrativos_perfilId_fkey" FOREIGN KEY ("perfilId") REFERENCES "perfis_portal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logs_auditoria" ADD CONSTRAINT "logs_auditoria_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios_administrativos"("id") ON DELETE SET NULL ON UPDATE CASCADE;
