import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = resolveRepoRoot(__dirname);
const errors = [];
const schemaPath = path.join(repoRoot, ".agents", "schemas", "leases", "lease.schema.json");
const schema = readJson(schemaPath);

if (schema.$id !== "https://delano.local/schemas/leases/lease.schema.json") errors.push("lease schema $id is not canonical.");
for (const field of ["schema_version", "lease_id", "owner", "mode", "paths", "created_at", "expires_at", "status"]) {
  if (!schema.required?.includes(field)) errors.push(`lease schema missing required field: ${field}`);
}
if (!schema.properties?.mode?.enum?.includes("exclusive") || !schema.properties?.mode?.enum?.includes("shared")) errors.push("lease schema must define shared and exclusive modes.");
if (!schema.properties?.status?.enum?.includes("released") || !schema.properties?.status?.enum?.includes("expired")) errors.push("lease schema must define expiry and release lifecycle states.");
if (!schema.properties?.paths?.items?.not?.pattern) errors.push("lease paths must reject absolute paths to avoid local machine leakage.");

if (errors.length > 0) {
  console.error("Lease contract check failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log("Lease contract check passed for owner, mode, path, expiry, and release semantics.");

function readJson(filePath) {
  if (!existsSync(filePath)) {
    errors.push(`missing file: ${path.relative(repoRoot, filePath)}`);
    return {};
  }
  return JSON.parse(readFileSync(filePath, "utf8"));
}
function resolveRepoRoot(startDir) {
  const candidates = [path.resolve(startDir, ".."), path.resolve(startDir, "..", "..")];
  for (const candidate of candidates) if (existsSync(path.join(candidate, ".project")) && existsSync(path.join(candidate, ".agents"))) return candidate;
  return path.resolve(startDir, "..");
}
