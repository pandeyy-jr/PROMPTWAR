import { cpSync, existsSync, mkdirSync } from "node:fs";
import { spawn } from "node:child_process";

const root = process.cwd();
const standalone = `${root}/.next/standalone`;
if (!existsSync(`${standalone}/server.js`)) {
  throw new Error("Standalone build missing. Run npm run build before npm start.");
}
mkdirSync(`${standalone}/.next`, { recursive: true });
if (existsSync(`${root}/.next/static`)) cpSync(`${root}/.next/static`, `${standalone}/.next/static`, { recursive: true });
if (existsSync(`${root}/public`)) cpSync(`${root}/public`, `${standalone}/public`, { recursive: true });
const child = spawn(process.execPath, ["server.js"], { cwd: standalone, stdio: "inherit", env: { ...process.env, HOSTNAME: "0.0.0.0" } });
child.on("exit", (code, signal) => { if (signal) process.kill(process.pid, signal); else process.exit(code ?? 1); });
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => child.kill(signal));
