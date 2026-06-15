import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)));
const port = Number(process.argv[2] || 8123);

const contentTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".webmanifest", "application/manifest+json; charset=utf-8"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".webp", "image/webp"],
  [".svg", "image/svg+xml"],
  [".ico", "image/x-icon"],
  [".woff2", "font/woff2"],
]);

function resolvePath(requestPath) {
  const cleanPath = decodeURIComponent(requestPath.split("?")[0]).replace(/^\/+/, "");
  const candidate = path.resolve(rootDir, cleanPath || "index.html");

  if (!candidate.startsWith(rootDir)) {
    return null;
  }

  return candidate;
}

const server = createServer(async (req, res) => {
  const urlPath = req.url || "/";
  let filePath = resolvePath(urlPath);

  if (!filePath) {
    res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Forbidden");
    return;
  }

  try {
    let statPath = filePath;
    let data;

    try {
      data = await readFile(statPath);
    } catch (error) {
      if (urlPath.endsWith("/") || path.extname(filePath) === "") {
        statPath = path.join(filePath, "index.html");
        data = await readFile(statPath);
      } else if (path.extname(filePath) !== ".html") {
        statPath = path.join(rootDir, "index.html");
        data = await readFile(statPath);
      } else {
        throw error;
      }
    }

    const ext = path.extname(statPath).toLowerCase();
    res.writeHead(200, {
      "Content-Type": contentTypes.get(ext) || "application/octet-stream",
      "Cache-Control": "no-cache",
    });
    res.end(data);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not Found");
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Serving ${rootDir} at http://127.0.0.1:${port}/`);
});
