const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
function removeDesc(label, rel) {
  const p = path.join(root, ...rel);
  try {
    fs.rmSync(p, { recursive: true, force: true });
    console.log("Removido: " + label);
  } catch (e) {
    if (e && e.code !== "ENOENT") console.warn(e.message);
  }
}

removeDesc(".next", [".next"]);
// Cache de bundler; evita "Cannot find module './NNN.js'" após hot-reload/alterações.
removeDesc("node_modules/.cache (se existir)", ["node_modules", ".cache"]);
