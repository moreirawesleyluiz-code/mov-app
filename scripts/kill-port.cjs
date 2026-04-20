/**
 * Liberta uma porta TCP no Windows (taskkill no PID em LISTENING).
 * Uso: node scripts/kill-port.cjs 3456
 */
const { execSync } = require("child_process");

const port = process.argv[2];
if (!port || !/^\d+$/.test(port)) {
  console.error("Uso: node scripts/kill-port.cjs <porta>");
  process.exit(1);
}

if (process.platform !== "win32") {
  console.warn("kill-port: só implementado para Windows; em Unix use: lsof -ti:" + port + " | xargs kill -9");
  process.exit(0);
}

try {
  const out = execSync(`netstat -ano | findstr :${port}`, { encoding: "utf8" });
  const pids = new Set();
  for (const line of out.trim().split(/\r?\n/)) {
    const parts = line.trim().split(/\s+/).filter(Boolean);
    const state = parts[3];
    const pid = parts[parts.length - 1];
    if (state === "LISTENING" && /^\d+$/.test(pid)) pids.add(pid);
  }
  for (const pid of pids) {
    try {
      execSync(`taskkill /PID ${pid} /F`, { stdio: "inherit" });
      console.log(`kill-port: terminado PID ${pid} (porta ${port})`);
    } catch {
      /* ignore */
    }
  }
} catch {
  /* nada em LISTEN — porta já livre */
}
