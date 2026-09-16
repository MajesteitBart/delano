# Delano Agent Plugin

Delano carries delivery context between agents and sessions. Specs, decisions, tasks, and verification records live in the repository being worked on. This plugin supplies the workflows and templates for maintaining those files.

The portable package uses Agent Plugins 1.0.0. Its root `plugin.json` is canonical; `extensions.com.openai` supplies OpenAI presentation metadata. A generated `.codex-plugin/plugin.json` supports clients using the older Codex layout.

## Included workflows

| Skill | Use it to |
| --- | --- |
| [discovery-skill](skills/discovery-skill/SKILL.md) | Define the user problem, measurable outcome, scope, and probe decision. |
| [research-skill](skills/research-skill/SKILL.md) | Resolve a specific question and fold findings into delivery contracts. |
| [prototype-skill](skills/prototype-skill/SKILL.md) | Test a material uncertainty with a bounded experiment. |
| [planning-skill](skills/planning-skill/SKILL.md) | Choose an implementation approach, verification, rollout, and work boundaries. |
| [breakdown-skill](skills/breakdown-skill/SKILL.md) | Produce tasks with observable acceptance criteria and valid dependencies. |
| [execution-skill](skills/execution-skill/SKILL.md) | Continue authorized work and record implementation evidence. |
| [quality-skill](skills/quality-skill/SKILL.md) | Check acceptance against observed results and identify missing evidence. |
| [sync-skill](skills/sync-skill/SKILL.md) | Compare local contracts with supplied or accessible tracker state. |
| [closeout-skill](skills/closeout-skill/SKILL.md) | Reconcile outcome, evidence, remaining work, and lifecycle state. |
| [learning-skill](skills/learning-skill/SKILL.md) | Turn observed delivery problems into specific process improvements. |

Use the workflow that fits the request. Installing the plugin does not require running all ten for each change.

Each skill defines the useful result to return. The shared [writing and scope guidance](references/output.md) keeps replies and saved artifacts focused on decisions, observed evidence, and remaining work. It calls for reusing existing records and continuing authorized work across stages, with extra files or process only where the repository or task needs them.

## Requirements and boundaries

The host needs to discover Agent Skills and read the package's Markdown resources. To update contracts or implement code, it also needs access to the target repository and appropriate file or execution tools. A chat without repository access can draft artifacts but cannot claim to have saved or verified them.

The workflows do not require Node, Bash, Python, an MCP server, credentials, or a repository-installed `.agents` or `.claude` runtime. Running the target project's checks still requires that project's normal tools. An existing Delano CLI is optional; see [CLI usage](references/cli.md). This package does not install the CLI, viewer, hooks, or tracker adapters.

Existing repository contracts and templates remain authoritative. The bundled templates preserve the current Delano file format; this packaging release does not implement lighter patch scaffolding or change the CLI's validation behavior. In a repository without Delano, use only the files needed for the agreed workflow. Do not describe such files as mechanically validated unless a relevant validator actually ran.

Recorded acceptance checks and evidence help a reviewer assess work. They do not independently prove that an implementation is correct. The quality and closeout skills distinguish observed results, unverified claims, and checks that could not run.

## Use the package

Keep this directory intact when copying it to another machine or installing it through an Agent Plugins host. `skills/`, `references/`, and `assets/` must stay together. The plugin directory is read-only workflow material; output belongs in the user's repository.

In a host that supports namespaced skill invocation, request `delano:discovery-skill`, `delano:execution-skill`, or another name from the table. Natural-language requests such as "Use Delano to plan this feature" can also select the relevant workflow. Invocation syntax and installation support depend on the host.

For a local Codex marketplace, place the plugin at `plugins/delano` within the selected marketplace root and add this entry to that marketplace's `.agents/plugins/marketplace.json`:

```json
{
  "name": "delano",
  "source": { "source": "local", "path": "./plugins/delano" },
  "policy": { "installation": "AVAILABLE", "authentication": "ON_INSTALL" },
  "category": "Productivity"
}
```

Append the entry to an existing `plugins` array; preserve the marketplace's name and other entries. For a new catalog, supply a top-level marketplace `name`, optional `interface.displayName`, and `plugins` array. The source path resolves from the marketplace root. Marketplace policy does not introduce a credential requirement for these skills.

Restart the ChatGPT desktop app, select the marketplace in the Plugins Directory, install Delano, and test it in a new chat. Copying source files alone does not refresh an already installed cache. No marketplace registration, installation, public publication, or workspace sharing is performed by this package's build.

See the official [packaging and local installation guide](https://developers.openai.com/plugins/build/plugins) for current client support and marketplace configuration. The public directory requires a separate submission.

## Maintainer build

From the Delano source repository:

```bash
npm run build:plugin
npm run check:plugin
npm run test:plugin
npm run pack:plugin
```

`pack:plugin` writes `output/bvdm-delano-plugin-0.1.0.tgz`. The archive contains a standard npm `package/` directory; extract that directory and name it `delano` when using a folder-based host. The package has no install scripts. It is ready for future npm-backed marketplace distribution but has not been published by this workflow.

Edit root `plugin.json`, the skills, and references here. Edit delivery template sources under the repository's `.project/templates/`. The build generates the compatibility manifest, npm metadata, license copy, and template assets; do not edit those generated copies directly. The plugin version is independent of the CLI version.
