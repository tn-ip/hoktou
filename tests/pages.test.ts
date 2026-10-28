import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import config from "../next.config.ts";

describe("GitHub Pages export", () => {
  it("uses a static project-site subpath", () => {
    assert.equal(config.output, "export");
    assert.equal(config.basePath, "/hoktou");
    assert.equal(config.assetPrefix, "/hoktou");
    assert.equal(config.trailingSlash, true);
    assert.equal(config.images?.unoptimized, true);
  });

  it("deploys with the official Pages actions", () => {
    const workflow = readFileSync(".github/workflows/pages.yml", "utf8");
    assert.match(workflow, /actions\/upload-pages-artifact@v3/);
    assert.match(workflow, /actions\/deploy-pages@v4/);
    assert.match(workflow, /branches:\n\s+- main/);
    assert.match(workflow, /path: out/);
  });
});
