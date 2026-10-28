import { copyFileSync, existsSync } from "node:fs";

const indexPath = "out/index.html";
if (!existsSync(indexPath)) {
  console.error("Static export is missing out/index.html");
  process.exit(1);
}

// GitHub Pages serves 404.html for unknown paths under the project site.
// The game is one client app, so the fallback is the same shell. Asset URLs
// are absolute (/hoktou/_next/...), so this still loads under the subpath.
copyFileSync(indexPath, "out/404.html");
console.log("Wrote out/404.html for GitHub Pages client-side paths");
