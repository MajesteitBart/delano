---
title: AI SDK DevTools
description: Debug AI SDK calls by inspecting captured runs and steps.
---

# AI SDK DevTools

## Why Use DevTools

DevTools captures all AI SDK calls (`generateText`, `streamText`, `ToolLoopAgent`) to a local JSON file. This lets you inspect LLM requests, responses, tool calls, and multi-step interactions without manually logging.

## Setup

Requires AI SDK v7-compatible packages (`@ai-sdk/provider@4.x`; use `ai@canary` if stable v7 is not available in your project). Install `@ai-sdk/devtools` using your project's package manager.

Register the telemetry integration once during local development:

```ts
import { registerTelemetry } from 'ai';
import { DevToolsTelemetry } from '@ai-sdk/devtools';

registerTelemetry(DevToolsTelemetry());
```

Telemetry is enabled after registration, so normal AI SDK calls are captured:

```ts
import { generateText } from 'ai';

const result = await generateText({
  model: 'anthropic/claude-sonnet-5',
  prompt: 'What cities are in the United States?',
});
```

## Viewing Captured Data

All runs and steps are saved to:

```
.devtools/generations.json
```

Read this file directly to inspect captured data:

```bash
cat .devtools/generations.json | jq
```

Or launch the web UI:

```bash
npx @ai-sdk/devtools
# Open http://localhost:4983
```

## Data Structure

- **Run**: A complete multi-step interaction grouped by initial prompt
- **Step**: A single LLM call within a run (includes input, output, tool calls, token usage)
