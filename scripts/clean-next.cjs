const fs = require("fs");
const path = require("path");
const dir = path.join(__dirname, "..", ".next");
try {
  fs.rmSync(dir, { recursive: true, force: true });
  console.log("Removida a pasta .next");
} catch (e) {
  if (e && e.code !== "ENOENT") console.warn(e.message);
}
