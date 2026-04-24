/**
 * Verifica email+senha contra a BD (mesmo fluxo que login credentials).
 * Uso: npx tsx scripts/verify-admin-credentials.ts <email> <senha>
 */
import { authorizeCredentials } from "@/lib/credentials-authorize";

async function main() {
  const email = process.argv[2];
  const password = process.argv[3];
  if (!email?.trim() || !password) {
    console.error("Uso: npx tsx scripts/verify-admin-credentials.ts <email> <senha>");
    process.exit(1);
  }
  const user = await authorizeCredentials({ email, password });
  if (!user) {
    console.log("RESULT: login falhou (credenciais inválidas ou sem hash)");
    process.exit(1);
  }
  console.log("RESULT: OK", { email: user.email, role: user.role, id: user.id });
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
