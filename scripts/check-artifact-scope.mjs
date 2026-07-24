import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const scopePath = path.join(repoRoot, ".agents", "schemas", "artifact-scope.json");

const requiredArtifactTypes = [
  "spec",
  "plan",
  "workstream",
  "task",
  "decision_log",
  "update",
  "context",
  "evidence",
  "review",
  "roadmap_item"
];

const errors = [];
const scope = readJson(scopePath);
const artifactTypes = scope.artifact_types || {};

if (scope.schema_version !== 1) {
  errors.push("artifact-scope.json schema_version must be 1.");
}

for (const artifactType of requiredArtifactTypes) {
  const contract = artifactTypes[artifactType];
  if (!contract) {
    errors.push(`artifact-scope.json is missing artifact type: ${artifactType}`);
    continue;
  }

  if (!Array.isArray(contract.path_patterns) || contract.path_patterns.length === 0) {
    errors.push(`${artifactType} must define at least one path pattern.`);
  }

  if (contract.frontmatter === true && !Array.isArray(contract.required_fields)) {
    errors.push(`${artifactType} with frontmatter=true must define required_fields.`);
  }

  if (contract.enum_fields && typeof contract.enum_fields === "object") {
    for (const [field, values] of Object.entries(contract.enum_fields)) {
      if (!Array.isArray(values) || values.length === 0) {
        errors.push(`${artifactType}.${field} enum must contain at least one allowed value.`);
      }
    }
  }
}

checkCurrentArtifacts("spec", ".project/projects/*/spec.md");
checkCurrentArtifacts("plan", ".project/projects/*/plan.md");
checkCurrentArtifacts("workstream", ".project/projects/*/workstreams/*.md");
checkCurrentArtifacts("task", ".project/projects/*/tasks/*.md");
checkCurrentArtifacts("review", ".project/reviews/*.md", { allowEmpty: true });
checkCurrentArtifacts("roadmap_item", ".project/roadmap/*.md", { allowEmpty: true });

if (errors.length > 0) {
  console.error("Artifact scope check failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(`Artifact scope check passed for ${requiredArtifactTypes.length} artifact types.`);

function readJson(filePath) {
  try {
    return JSON.parse(readFileSync(filePath, "utf8"));
  } catch (error) {
    errors.push(`Could not read ${path.relative(repoRoot, filePath)}: ${error.message}`);
    return {};
  }
}

function checkCurrentArtifacts(artifactType, globPattern, { allowEmpty = false } = {}) {
  const contract = artifactTypes[artifactType];
  if (!contract || contract.frontmatter !== true) {
    return;
  }

  const files = expandSimpleGlob(globPattern);
  if (files.length === 0) {
    if (!allowEmpty) errors.push(`No current artifacts found for ${artifactType} using ${globPattern}`);
    return;
  }

  for (const file of files) {
    const frontmatter = parseFrontmatter(file);
    if (artifactType === "review") {
      const schemaPath = path.join(repoRoot, contract.schema_path);
      const schema = readJson(schemaPath);
      for (const error of validateJsonSchema(frontmatter, schema, schema)) {
        errors.push(`${toRepoPath(file)} failed review schema validation: ${error}`);
      }
    }
    for (const field of contract.required_fields || []) {
      if (!(field in frontmatter)) {
        errors.push(`${toRepoPath(file)} is missing required ${artifactType} field: ${field}`);
      }
    }

    for (const [field, allowedValues] of Object.entries(contract.enum_fields || {})) {
      if (!(field in frontmatter) || frontmatter[field] === "") {
        continue;
      }
      if (!allowedValues.includes(frontmatter[field])) {
        errors.push(`${toRepoPath(file)} has ${artifactType}.${field}=${frontmatter[field]}, expected one of ${allowedValues.join(", ")}`);
      }
    }
  }
}

function parseFrontmatter(filePath) {
  const text = readFileSync(filePath, "utf8");
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) {
    errors.push(`${toRepoPath(filePath)} is missing frontmatter.`);
    return {};
  }

  const block = match[1].trim();
  if (block.startsWith("{")) {
    try {
      return JSON.parse(block);
    } catch (error) {
      errors.push(`${toRepoPath(filePath)} has malformed JSON frontmatter: ${error.message}`);
      return {};
    }
  }

  const result = {};
  for (const line of block.split(/\r?\n/)) {
    const index = line.indexOf(":");
    if (index === -1) {
      continue;
    }
    result[line.slice(0, index).trim()] = line.slice(index + 1).trim();
  }
  return result;
}

function expandSimpleGlob(pattern) {
  const parts = pattern.split("/");
  let paths = [repoRoot];
  for (const part of parts) {
    const next = [];
    for (const current of paths) {
      if (part === "*") {
        if (!existsSync(current)) continue;
        for (const child of listDir(current)) {
          if (child.isDirectory()) next.push(path.join(current, child.name));
        }
      } else if (part.includes("*")) {
        if (!existsSync(current)) continue;
        const regex = new RegExp(`^${part.replaceAll(".", "\\.").replaceAll("*", ".*")}$`);
        for (const child of listDir(current)) {
          if (child.isFile() && regex.test(child.name)) next.push(path.join(current, child.name));
        }
      } else {
        next.push(path.join(current, part));
      }
    }
    paths = next;
  }
  return paths.filter((filePath) => existsSync(filePath));
}

function listDir(dir) {
  return existsSync(dir) ? Array.from(readdirSync(dir, { withFileTypes: true })) : [];
}

function toRepoPath(filePath) {
  return path.relative(repoRoot, filePath).split(path.sep).join("/");
}

function validateJsonSchema(value, schema, rootSchema, location = "$") {
  if (!schema || typeof schema !== "object") return [`${location} has an invalid schema`];
  if (schema.$ref) {
    const target = resolveSchemaRef(rootSchema, schema.$ref);
    return target ? validateJsonSchema(value, target, rootSchema, location) : [`${location} uses unresolved schema reference ${schema.$ref}`];
  }

  const validationErrors = [];
  const matches = (candidateSchema) => validateJsonSchema(value, candidateSchema, rootSchema, location).length === 0;
  if (schema.const !== undefined && !deepEqual(value, schema.const)) validationErrors.push(`${location} must equal ${JSON.stringify(schema.const)}`);
  if (Array.isArray(schema.enum) && !schema.enum.some((candidate) => deepEqual(value, candidate))) validationErrors.push(`${location} is not an allowed value`);
  if (schema.type && !matchesType(value, schema.type)) {
    validationErrors.push(`${location} must be ${Array.isArray(schema.type) ? schema.type.join(" or ") : schema.type}`);
    return validationErrors;
  }

  if (Array.isArray(schema.allOf)) {
    for (const candidate of schema.allOf) validationErrors.push(...validateJsonSchema(value, candidate, rootSchema, location));
  }
  if (Array.isArray(schema.oneOf)) {
    const count = schema.oneOf.filter(matches).length;
    if (count !== 1) validationErrors.push(`${location} must match exactly one schema variant`);
  }
  if (schema.not && matches(schema.not)) validationErrors.push(`${location} matches a forbidden schema`);
  if (schema.if) {
    const branch = matches(schema.if) ? schema.then : schema.else;
    if (branch) validationErrors.push(...validateJsonSchema(value, branch, rootSchema, location));
  }

  if (typeof value === "string") {
    if (schema.minLength != null && value.length < schema.minLength) validationErrors.push(`${location} is shorter than ${schema.minLength}`);
    if (schema.maxLength != null && value.length > schema.maxLength) validationErrors.push(`${location} is longer than ${schema.maxLength}`);
    if (schema.pattern && !new RegExp(schema.pattern).test(value)) validationErrors.push(`${location} does not match ${schema.pattern}`);
    if (schema.format === "date-time" && !validRfc3339(value)) validationErrors.push(`${location} is not an RFC 3339 date-time`);
  }
  if (typeof value === "number" && schema.minimum != null && value < schema.minimum) validationErrors.push(`${location} is below ${schema.minimum}`);

  if (Array.isArray(value)) {
    if (schema.minItems != null && value.length < schema.minItems) validationErrors.push(`${location} has fewer than ${schema.minItems} items`);
    if (schema.maxItems != null && value.length > schema.maxItems) validationErrors.push(`${location} has more than ${schema.maxItems} items`);
    if (schema.uniqueItems && new Set(value.map((item) => JSON.stringify(item))).size !== value.length) validationErrors.push(`${location} must contain unique items`);
    if (schema.items) value.forEach((item, index) => validationErrors.push(...validateJsonSchema(item, schema.items, rootSchema, `${location}[${index}]`)));
    if (schema.contains) {
      const count = value.filter((item, index) => validateJsonSchema(item, schema.contains, rootSchema, `${location}[${index}]`).length === 0).length;
      if (count < (schema.minContains ?? 1)) validationErrors.push(`${location} does not contain enough matching items`);
    }
  }

  if (value && typeof value === "object" && !Array.isArray(value)) {
    for (const field of schema.required || []) {
      if (!(field in value)) validationErrors.push(`${location}.${field} is required`);
    }
    for (const [field, childSchema] of Object.entries(schema.properties || {})) {
      if (field in value) validationErrors.push(...validateJsonSchema(value[field], childSchema, rootSchema, `${location}.${field}`));
    }
    if (schema.additionalProperties === false) {
      const allowed = new Set(Object.keys(schema.properties || {}));
      for (const field of Object.keys(value)) if (!allowed.has(field)) validationErrors.push(`${location}.${field} is unsupported`);
    }
  }
  return validationErrors;
}

function resolveSchemaRef(rootSchema, reference) {
  if (!reference.startsWith("#/")) return null;
  return reference.slice(2).split("/").reduce((current, token) => current?.[token.replaceAll("~1", "/").replaceAll("~0", "~")], rootSchema);
}

function matchesType(value, type) {
  const types = Array.isArray(type) ? type : [type];
  return types.some((candidate) => (
    candidate === "null" ? value === null
      : candidate === "array" ? Array.isArray(value)
        : candidate === "object" ? Boolean(value) && typeof value === "object" && !Array.isArray(value)
          : candidate === "integer" ? Number.isInteger(value)
            : typeof value === candidate
  ));
}

function deepEqual(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function validRfc3339(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})[Tt](\d{2}):(\d{2}):(\d{2})(?:\.\d+)?(?:[Zz]|[+-](\d{2}):(\d{2}))$/.exec(value);
  if (!match) return false;
  const [, yearText, monthText, dayText, hourText, minuteText, secondText, offsetHourText, offsetMinuteText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const daysInMonth = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return month >= 1 && month <= 12
    && day >= 1 && day <= daysInMonth[month - 1]
    && Number(hourText) <= 23 && Number(minuteText) <= 59 && Number(secondText) <= 59
    && (offsetHourText == null || (Number(offsetHourText) <= 23 && Number(offsetMinuteText) <= 59));
}
