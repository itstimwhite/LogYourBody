import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";

const componentsRoot = path.resolve(__dirname, "..");

function getComponentFiles(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (entry.name === "__tests__") continue;
      files.push(...getComponentFiles(path.join(dir, entry.name)));
    } else if (
      entry.isFile() &&
      entry.name.endsWith(".tsx") &&
      !entry.name.endsWith(".test.tsx")
    ) {
      files.push(path.join(dir, entry.name));
    }
  }
  return files;
}

const componentFiles = getComponentFiles(componentsRoot);

for (const file of componentFiles) {
  const componentName = path.basename(file, ".tsx");
  describe(`Component file: ${componentName}`, () => {
    it("has at least one export", async () => {
      const mod = await import(pathToFileURL(file).href);
      expect(Object.keys(mod).length).toBeGreaterThan(0);
    });
  });
}
