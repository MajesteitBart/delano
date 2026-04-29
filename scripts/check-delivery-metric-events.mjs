import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const __filename = fileURLToPath(import.meta.url); const __dirname = path.dirname(__filename);
const repoRoot = resolveRepoRoot(__dirname);
const schema = JSON.parse(readFileSync(path.join(repoRoot, ".agents", "schemas", "learning", "delivery-metric-event.schema.json"), "utf8"));
const errors=[];
for (const f of ["schema_version","event_id","event_type","project","task_id","occurred_at","privacy"]) if (!schema.required?.includes(f)) errors.push(`missing required ${f}`);
for (const t of ["task_started","validation_passed","validation_failed","task_completed","blocked","handoff_created"]) if (!schema.properties?.event_type?.enum?.includes(t)) errors.push(`missing event type ${t}`);
if (!schema.properties?.privacy?.enum?.includes("summary-only")) errors.push("privacy enum must include summary-only");
if (errors.length) { console.error("Delivery metric event check failed:"); errors.forEach(e=>console.error(`- ${e}`)); process.exit(1); }
console.log("Delivery metric event schema check passed.");
function resolveRepoRoot(startDir){ for(const c of [path.resolve(startDir,".."), path.resolve(startDir,"..","..")]) if(existsSync(path.join(c,".agents"))) return c; return path.resolve(startDir,".."); }
