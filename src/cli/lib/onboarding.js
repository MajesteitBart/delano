const { existsSync, readFileSync } = require("node:fs");
const path = require("node:path");
const readline = require("node:readline/promises");
const { stdin, stdout } = require("node:process");

const { CliError } = require("./errors");
const { getPackageRoot } = require("./runtime");

const ANALYSIS_APPROVAL_FLAG = "--approve-agents-analysis";

function parseOnboardingArgs(args) {
  const options = {
    approveAnalysis: false,
    target: process.cwd()
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === "--target") {
      index += 1;
      if (!args[index]) {
        throw new CliError("Missing value for --target.", 1);
      }
      options.target = args[index];
      continue;
    }

    if (arg.startsWith("--target=")) {
      options.target = arg.slice("--target=".length);
      continue;
    }

    if (arg === ANALYSIS_APPROVAL_FLAG) {
      options.approveAnalysis = true;
      continue;
    }

    throw new CliError(`Unknown onboarding option: ${arg}`, 1);
  }

  options.target = path.resolve(options.target);
  return options;
}

function findAgentsFile(startDir = process.cwd()) {
  let current = path.resolve(startDir);
  const { root } = path.parse(current);

  while (true) {
    const candidate = path.join(current, "AGENTS.md");
    if (existsSync(candidate)) {
      return candidate;
    }

    if (current === root) {
      return null;
    }

    current = path.dirname(current);
  }
}

function getOnboardingGuidePath() {
  const packageRoot = getPackageRoot();
  const candidates = [
    path.join(packageRoot, ".agents", "skills", "onboarding", "references", "agents-md-best-practices.md"),
    path.join(
      packageRoot,
      "assets",
      "payload",
      ".agents",
      "skills",
      "onboarding",
      "references",
      "agents-md-best-practices.md"
    )
  ];

  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      return candidate;
    }
  }

  throw new CliError(
    "Could not find the packaged onboarding guide. Rebuild the package assets with 'npm run build:assets'.",
    1
  );
}

function analyzeAgentsContent(content) {
  const checks = [
    {
      label: "mission",
      presentMessage: "Maps the repository's core operating surface and canonical files.",
      missingMessage: "Add a one-line mission so each turn starts from the repo's purpose and quality bar.",
      test: (text) => /(^|\n)##\s+mission\b/i.test(text)
    },
    {
      label: "first-turn workflow",
      presentMessage: "Provides a reusable first-turn sequence instead of only static rules.",
      missingMessage: "Add a numbered first-turn workflow so the agent knows how to inspect, retrieve, implement, and verify in order.",
      test: (text) => /first-turn workflow|first turn workflow/i.test(text)
        || (/order of operations/i.test(text) && /(^|\n)1\.\s/m.test(text))
    },
    {
      label: "source-of-truth map",
      presentMessage: "Points to the main sources of truth the agent should trust.",
      missingMessage: "Keep a compact source-of-truth map and include 'read this first for X' hints where drift would be costly.",
      test: (text) => /canonical truth|source of truth/i.test(text)
    },
    {
      label: "retrieval index",
      presentMessage: "Provides retrieval hints for common questions and work areas.",
      missingMessage: "Add a retrieval index so the agent can jump from a task area to the right file quickly.",
      test: (text) => /retrieval index/i.test(text)
    },
    {
      label: "stable constraints",
      presentMessage: "Captures durable repo constraints and runtime shape.",
      missingMessage: "Call out stable high-impact constraints such as runtime assumptions, branch policy, style rules, or business-logic conventions.",
      test: (text) => /branch policy|style rules|runtime quirks|default workspace|definition of done|node|bash|python|workspace/i.test(text)
    },
    {
      label: "approval and safety boundaries",
      presentMessage: "States approval boundaries or destructive-action handling.",
      missingMessage: "Make approval boundaries explicit, including destructive actions, recoverable edits, and outbound/public actions.",
      test: (text) => /approval|destructive|recoverable|outbound|public actions|confirm/i.test(text)
    },
    {
      label: "verification expectations",
      presentMessage: "Tells the agent how to verify work and report completion state.",
      missingMessage: "Add verification expectations, including when to run lint/test/build and how to report done, partial, or blocked.",
      test: (text) => /verification|verify|lint|test|build|done|partial|blocked/i.test(text)
    }
  ];

  const strengths = [];
  const gaps = [];

  for (const check of checks) {
    if (check.test(content)) {
      strengths.push(check.presentMessage);
    } else {
      gaps.push(check.missingMessage);
    }
  }

  return { strengths, gaps };
}

function formatOnboardingReport({ agentsPath, guidePath, review }) {
  const lines = [
    "Onboarding review",
    "-----------------",
    `AGENTS.md: ${agentsPath}`,
    `Guide: ${guidePath}`,
    ""
  ];

  if (review.strengths.length > 0) {
    lines.push("Already working well:");
    for (const strength of review.strengths) {
      lines.push(`- ${strength}`);
    }
    lines.push("");
  }

  if (review.gaps.length > 0) {
    lines.push("Improve next:");
    for (const gap of review.gaps) {
      lines.push(`- ${gap}`);
    }
    lines.push("");
  } else {
    lines.push("No major gaps detected against the onboarding guide.");
    lines.push("");
  }

  lines.push("No edits were applied.");
  lines.push("If you want AGENTS.md changed, approve that explicitly in a separate step.");

  return lines.join("\n");
}

async function confirmAgentsAnalysis(options, agentsPath) {
  if (options.approveAnalysis) {
    return true;
  }

  if (!stdin.isTTY || !stdout.isTTY) {
    throw new CliError(
      `Onboarding requires explicit approval. Re-run interactively or pass ${ANALYSIS_APPROVAL_FLAG}.`,
      1
    );
  }

  const rl = readline.createInterface({ input: stdin, output: stdout });
  try {
    const answer = await rl.question(
      `Analyze AGENTS.md at ${agentsPath} with the onboarding skill rubric? This only reads the file and prints recommendations. [y/N] `
    );
    return /^[Yy](es)?$/.test(answer.trim());
  } finally {
    rl.close();
  }
}

async function runOnboarding(args) {
  const options = parseOnboardingArgs(args);
  const agentsPath = findAgentsFile(options.target);

  if (!agentsPath) {
    throw new CliError(
      `Could not find AGENTS.md from ${options.target}. Add AGENTS.md or pass --target to a repository that has one.`,
      1
    );
  }

  const approved = await confirmAgentsAnalysis(options, agentsPath);
  if (!approved) {
    console.log("Onboarding skipped. No analysis performed.");
    return 0;
  }

  const guidePath = getOnboardingGuidePath();
  const agentsContent = readFileSync(agentsPath, "utf8");
  const review = analyzeAgentsContent(agentsContent);
  console.log(formatOnboardingReport({ agentsPath, guidePath, review }));
  return 0;
}

module.exports = {
  ANALYSIS_APPROVAL_FLAG,
  analyzeAgentsContent,
  confirmAgentsAnalysis,
  findAgentsFile,
  formatOnboardingReport,
  getOnboardingGuidePath,
  parseOnboardingArgs,
  runOnboarding
};
