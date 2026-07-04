-- AlterTable
ALTER TABLE "configuracao_portal" ADD COLUMN     "ibge" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "logs_acesso_documento" ADD COLUMN     "dados" JSONB,
ADD COLUMN     "titulo" TEXT;

-- CreateTable
CREATE TABLE "configuracao_modulos" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "modulos" JSONB NOT NULL DEFAULT '{}',
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "configuracao_modulos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solicitacoes_lgpd" (
    "id" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Em analise',
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "solicitacoes_lgpd_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "solicitacoes_lgpd_numero_key" ON "solicitacoes_lgpd"("numero");

-- CreateIndex
CREATE INDEX "solicitacoes_lgpd_userId_idx" ON "solicitacoes_lgpd"("userId");
