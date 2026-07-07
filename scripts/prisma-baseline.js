/**
 * Marca todas as migrations versionadas como ja aplicadas (baseline P3005).
 * Use quando o banco ja tem o schema mas _prisma_migrations esta vazio.
 * Uso: DATABASE_URL=... npm run db:baseline
 */
const { execSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const migrationsDir = path.join(__dirname, '..', 'prisma', 'migrations');

function listMigrationNames() {
  return fs.readdirSync(migrationsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

function main() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL nao definida');
    process.exit(1);
  }

  const names = listMigrationNames();
  if (names.length === 0) {
    console.error('Nenhuma migration encontrada em prisma/migrations');
    process.exit(1);
  }

  for (const name of names) {
    console.log(`resolve --applied ${name}`);
    execSync(`npx prisma migrate resolve --applied ${name}`, {
      stdio: 'inherit',
      env: process.env,
    });
  }

  console.log('Baseline concluido. Proximo passo: npx prisma migrate deploy');
}

if (require.main === module) {
  main();
}

module.exports = { listMigrationNames };
