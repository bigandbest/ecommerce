#!/usr/bin/env node

// Script to help replace react-icons imports with centralized icons
// Run this script to see all react-icons imports in your project

const fs = require("fs");
const path = require("path");

function findFiles(dir, ext, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (
      stat.isDirectory() &&
      !file.startsWith(".") &&
      file !== "node_modules"
    ) {
      findFiles(filePath, ext, fileList);
    } else if (file.endsWith(ext)) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

function findReactIconsImports() {
  const srcDir = path.join(process.cwd(), "src");
  const jsxFiles = findFiles(srcDir, ".jsx");
  const jsFiles = findFiles(srcDir, ".js");
  const allFiles = [...jsxFiles, ...jsFiles];

  const imports = [];

  allFiles.forEach((file) => {
    try {
      const content = fs.readFileSync(file, "utf8");
      const lines = content.split("\n");

      lines.forEach((line, index) => {
        if (
          line.includes("from 'react-icons") ||
          line.includes('from "react-icons')
        ) {
          imports.push({
            file: file.replace(process.cwd(), "."),
            line: index + 1,
            content: line.trim(),
          });
        }
      });
    } catch (err) {
      console.error(`Error reading file ${file}:`, err.message);
    }
  });

  return imports;
}

console.log("Finding all react-icons imports...\n");
const imports = findReactIconsImports();

if (imports.length === 0) {
  console.log("No react-icons imports found!");
} else {
  console.log(`Found ${imports.length} react-icons imports:\n`);

  imports.forEach((imp) => {
    console.log(`${imp.file}:${imp.line}`);
    console.log(`  ${imp.content}`);
    console.log("");
  });

  console.log("\nRecommendation:");
  console.log("1. Update src/utils/icons.js to include all needed icons");
  console.log(
    "2. Replace imports with: import { IconName } from '@/utils/icons';"
  );
  console.log("3. Test that all icons still work correctly");
}
