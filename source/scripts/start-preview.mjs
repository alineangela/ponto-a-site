import { spawn, spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const previewUrl = "http://127.0.0.1:4180";
const pidFile = resolve(".preview-pids.json");
const restart = process.argv.includes("--restart");

async function healthCheck() {
  try {
    const page = await fetch(`${previewUrl}/`, { cache: "no-store" });
    if (!page.ok) return false;
    const html = await page.text();
    const assets = [...html.matchAll(/(?:href|src)="(\/assets\/[^"]+\.(?:css|js))"/g)]
      .map((match) => match[1]);
    if (!assets.some((asset) => asset.endsWith(".css")) || !assets.some((asset) => asset.endsWith(".js"))) return false;
    const checks = await Promise.all(assets.slice(0, 8).map((asset) => fetch(`${previewUrl}${asset}`, { cache: "no-store" })));
    return checks.every((response) => response.ok);
  } catch {
    return false;
  }
}

function stopPid(pid) {
  if (!Number.isInteger(pid) || pid <= 0) return;
  if (process.platform === "win32") {
    spawnSync("taskkill", ["/PID", String(pid), "/T", "/F"], { stdio: "ignore" });
  } else {
    try { process.kill(-pid, "SIGTERM"); } catch {}
  }
}

function stopWindowsPort(port) {
  if (process.platform !== "win32") return;
  const result = spawnSync("netstat", ["-ano", "-p", "tcp"], {
    encoding: "utf8",
    windowsHide: true,
  });
  if (!result.stdout) return;

  const pids = new Set();
  for (const line of result.stdout.split(/\r?\n/)) {
    if (!line.includes(`:${port}`) || !/LISTENING/i.test(line)) continue;
    const pid = Number(line.trim().split(/\s+/).at(-1));
    if (Number.isInteger(pid) && pid > 0) pids.add(pid);
  }
  for (const pid of pids) stopPid(pid);
}

function stopPreviousPreview() {
  if (existsSync(pidFile)) {
    try {
      const state = JSON.parse(readFileSync(pidFile, "utf8"));
      stopPid(state.proxy);
      stopPid(state.upstream);
    } catch {}
  }
  stopWindowsPort(4180);
  stopWindowsPort(4181);
}

async function waitUntilReady() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    if (await healthCheck()) return true;
    await new Promise((resolveDelay) => setTimeout(resolveDelay, 250));
  }
  return false;
}

async function main() {
  if (!restart && await healthCheck()) {
    console.log("Preview already healthy at http://localhost:4180/");
    return;
  }

  if (!existsSync(resolve("dist", "server", "index.js"))) {
    console.error("Build missing. Run npm run build first.");
    process.exitCode = 1;
    return;
  }

  stopPreviousPreview();

  const common = { detached: true, stdio: "ignore", windowsHide: true };
  const env = { ...process.env, WRANGLER_LOG_PATH: process.env.WRANGLER_LOG_PATH ?? ".wrangler/wrangler.log" };
  const upstream = spawn(process.execPath, [resolve("node_modules", "vinext", "dist", "cli.js"), "start", "--port", "4181"], { ...common, env });
  const proxy = spawn(process.execPath, [resolve("scripts", "preview-proxy.mjs")], common);
  upstream.unref();
  proxy.unref();
  writeFileSync(pidFile, JSON.stringify({ upstream: upstream.pid, proxy: proxy.pid }, null, 2));

  if (!await waitUntilReady()) {
    console.error("Preview failed its HTML/CSS/JS health check.");
    process.exitCode = 1;
    return;
  }

  console.log("Preview ready at http://localhost:4180/");
}

await main();
