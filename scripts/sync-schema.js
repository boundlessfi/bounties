#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const dest = path.resolve(root, "lib/graphql/schema.graphql");
// Candidate locations for the canonical schema:
// 1) Environment override via CANONICAL_SCHEMA (absolute or repo-relative)
// 2) `boundless-nestjs/src/schema.gql` (when the private repo is checked out into the workspace)
// 3) `../boundless-nestjs/src/schema.gql` (when the backend repo is a sibling checkout)
const candidates = [];
if (process.env.CANONICAL_SCHEMA) {
  candidates.push(
    path.isAbsolute(process.env.CANONICAL_SCHEMA)
      ? process.env.CANONICAL_SCHEMA
      : path.resolve(root, process.env.CANONICAL_SCHEMA),
  );
}
candidates.push(path.resolve(root, "boundless-nestjs/src/schema.gql"));
candidates.push(path.resolve(root, "../boundless-nestjs/src/schema.gql"));

function fail(msg) {
  console.error(msg);
  process.exit(1);
}

const src = candidates.find((p) => fs.existsSync(p));
if (!src) {
  fail(
    `Source schema not found. Tried the following locations:\n- CANONICAL_SCHEMA=${process.env.CANONICAL_SCHEMA || "<not set>"}\n- ${candidates.join("\n- ")}\nIf the canonical schema is in a private repo, configure the CI to check out the private repo or set CANONICAL_SCHEMA to point to the file.`,
  );
}

const srcContents = fs.readFileSync(src, "utf8");
if (process.argv.includes("--check")) {
  if (!fs.existsSync(dest)) {
    console.error(`Destination schema missing: ${dest}`);
    process.exit(1);
  }
  const destContents = fs.readFileSync(dest, "utf8");
  if (srcContents !== destContents) {
    console.error(
      "lib/graphql/schema.graphql is out of sync with ../boundless-nestjs/src/schema.gql",
    );
    console.error("Run `npm run sync-schema` to update the copied schema.");
    process.exit(2);
  }
  console.log("Schema is in sync.");
  process.exit(0);
}

// Write header and then the source contents
const header = `# ------------------------------------------------------\n# GENERATED FILE — DO NOT EDIT DIRECTLY\n# Source: ../boundless-nestjs/src/schema.gql\n# To update, run: npm run sync-schema\n# ------------------------------------------------------\n\n`;

fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.writeFileSync(dest, header + srcContents, "utf8");
console.log(`Wrote schema to ${dest}`);
