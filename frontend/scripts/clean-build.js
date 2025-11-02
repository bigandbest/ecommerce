#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

/**
 * Clean Build Cache Script
 * Clears Next.js build cache and node_modules to fix CSS and build issues
 */

function deleteDirectory(dirPath) {
  if (fs.existsSync(dirPath)) {
    try {
      fs.rmSync(dirPath, { recursive: true, force: true });
      console.log(`✅ Removed: ${dirPath}`);
      return true;
    } catch (error) {
      console.warn(`⚠️  Failed to remove ${dirPath}:`, error.message);
      return false;
    }
  }
  return true;
}

function cleanBuildCache() {
  console.log("🧹 Cleaning Next.js build cache...\n");

  const pathsToClean = [
    ".next",
    "node_modules/.cache",
    ".cache",
    "dist",
    "out",
  ];

  let cleaned = 0;

  pathsToClean.forEach((dirPath) => {
    if (deleteDirectory(dirPath)) {
      cleaned++;
    }
  });

  console.log(`\n✨ Cleaned ${cleaned} directories`);

  // Check for package-lock.json issues
  const packageLock = "package-lock.json";
  if (fs.existsSync(packageLock)) {
    try {
      const lockData = fs.readFileSync(packageLock, "utf8");
      const lockJson = JSON.parse(lockData);

      // Check for integrity issues
      if (lockJson.lockfileVersion < 2) {
        console.log("⚠️  Old package-lock.json format detected");
        console.log("💡 Consider running: npm install --package-lock-only");
      }
    } catch (error) {
      console.warn("⚠️  Package-lock.json might be corrupted");
      console.log(
        "💡 Consider deleting package-lock.json and running npm install"
      );
    }
  }

  console.log("\n🚀 Build cache cleaned successfully!");
  console.log("\n📝 Next steps:");
  console.log("   1. Run: npm run dev");
  console.log("   2. Check browser console for remaining errors");
  console.log("   3. Hard refresh browser (Ctrl+Shift+R)");
}

// Run the cleanup
cleanBuildCache();
