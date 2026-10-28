import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, sep } from "node:path";

const root = join(process.cwd(), "out");
const base = "/hoktou";
const port = Number(process.env.PORT || 3000);

const types = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json",
  ".map": "application/json",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

function insideRoot(relativePath) {
  const cleaned = normalize(relativePath).replace(/^(\.\.(\/|\\|$))+/, "");
  const file = join(root, cleaned);
  if (file !== root && !file.startsWith(root + sep)) return null;
  return file;
}

if (!existsSync(join(root, "index.html"))) {
  console.error("Run npm run build before npm start. Expected out/index.html.");
  process.exit(1);
}

const server = createServer((request, response) => {
  const url = new URL(request.url ?? "/", "http://127.0.0.1");
  let pathname = decodeURIComponent(url.pathname);
  if (pathname === "/" || pathname === base) {
    response.writeHead(302, { Location: `${base}/` });
    response.end();
    return;
  }
  if (!pathname.startsWith(`${base}/`)) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end(`This preview is mounted at ${base}/`);
    return;
  }

  let relative = pathname.slice(base.length);
  if (relative.endsWith("/")) relative += "index.html";
  let file = insideRoot(relative);
  if (!file || !existsSync(file) || statSync(file).isDirectory()) {
    file = insideRoot("/404.html");
  }
  if (!file || !existsSync(file)) {
    response.writeHead(404);
    response.end("Not found");
    return;
  }
  response.writeHead(200, {
    "Content-Type": types[extname(file)] ?? "application/octet-stream",
    "Cache-Control": "no-store",
  });
  createReadStream(file).pipe(response);
});

server.listen(port, "127.0.0.1", () => {
  console.log(`學途 static preview: http://127.0.0.1:${port}${base}/`);
});
