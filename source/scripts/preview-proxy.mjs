import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";

const root = resolve(process.cwd(), "dist", "client");
const upstream = "http://127.0.0.1:4181";
const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

createServer(async (request, response) => {
  const pathname = decodeURIComponent(new URL(request.url ?? "/", "http://localhost").pathname);
  const candidate = normalize(join(root, `.${pathname}`));

  if (candidate.startsWith(root) && existsSync(candidate) && statSync(candidate).isFile()) {
    response.writeHead(200, {
      "Cache-Control": pathname.startsWith("/assets/") ? "public, max-age=31536000, immutable" : "no-cache",
      "Content-Type": mimeTypes[extname(candidate).toLowerCase()] ?? "application/octet-stream",
    });
    createReadStream(candidate).pipe(response);
    return;
  }

  try {
    const upstreamResponse = await fetch(new URL(request.url ?? "/", upstream), {
      body: request.method === "GET" || request.method === "HEAD" ? undefined : request,
      duplex: "half",
      headers: request.headers,
      method: request.method,
      redirect: "manual",
    });
    const headers = Object.fromEntries(upstreamResponse.headers);
    delete headers["content-encoding"];
    delete headers["content-length"];
    response.writeHead(upstreamResponse.status, headers);
    if (upstreamResponse.body) {
      for await (const chunk of upstreamResponse.body) response.write(chunk);
    }
    response.end();
  } catch (error) {
    response.writeHead(502, { "Content-Type": "text/plain; charset=utf-8" });
    response.end(`Preview unavailable: ${String(error)}`);
  }
}).listen(4180, "0.0.0.0", () => {
  console.log("Preview available at http://0.0.0.0:4180");
});
