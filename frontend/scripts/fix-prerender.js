#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// Create .next directory if it doesn't exist
const nextDir = path.join(process.cwd(), ".next");
if (!fs.existsSync(nextDir)) {
  fs.mkdirSync(nextDir, { recursive: true });
  console.log("Created .next directory");
}

// Create prerender-manifest.json if it doesn't exist
const prerenderManifestPath = path.join(nextDir, "prerender-manifest.json");
if (!fs.existsSync(prerenderManifestPath)) {
  const templatePath = path.join(
    process.cwd(),
    "prerender-manifest-template.json"
  );
  const template = fs.readFileSync(templatePath, "utf8");
  fs.writeFileSync(prerenderManifestPath, template);
  console.log("Created prerender-manifest.json");
}

console.log("Next.js build environment prepared");
