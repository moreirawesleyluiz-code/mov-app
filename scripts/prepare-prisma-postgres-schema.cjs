const fs = require("fs");
const path = require("path");

const source = path.join(__dirname, "..", "prisma", "schema.prisma");
const targetDir = path.join(__dirname, "..", ".prisma");
const target = path.join(targetDir, "schema.postgresql.prisma");

const raw = fs.readFileSync(source, "utf8");
const next = raw.replace(
  /datasource\s+db\s*\{([\s\S]*?)provider\s*=\s*"sqlite"/m,
  (match) => match.replace(/provider\s*=\s*"sqlite"/, 'provider = "postgresql"'),
);

if (raw === next) {
  console.error('[MOV] Não foi possível preparar schema Postgres (provider "sqlite" não encontrado).');
  process.exit(1);
}

fs.mkdirSync(targetDir, { recursive: true });
fs.writeFileSync(target, next, "utf8");
console.log("[MOV] Schema Postgres pronto em .prisma/schema.postgresql.prisma");

const sourceMigrationsDir = path.join(__dirname, "..", "prisma", "migrations");
const targetMigrationsDir = path.join(targetDir, "migrations");

if (fs.existsSync(sourceMigrationsDir)) {
  fs.rmSync(targetMigrationsDir, { recursive: true, force: true });
  fs.mkdirSync(targetMigrationsDir, { recursive: true });
  fs.cpSync(sourceMigrationsDir, targetMigrationsDir, { recursive: true, force: true });
  console.log("[MOV] Migrations espelhadas em .prisma/migrations");
}
