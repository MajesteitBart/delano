import {
  appendFileSync,
  mkdirSync,
  rmSync,
  watch,
  writeFileSync,
} from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { performance } from 'node:perf_hooks'
import { fileURLToPath } from 'node:url'

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(scriptDirectory, '../../../..')
const projectRoot = join(repoRoot, '.project')
const scratchRoot = join(projectRoot, 'viewer', 'probe-tmp')
const eventDeadlineMs = 2_000
const quietPeriodMs = 200

function delay(milliseconds) {
  return new Promise((resolveDelay) => setTimeout(resolveDelay, milliseconds))
}

function normalizePath(path) {
  return path.replaceAll('\\', '/').replace(/^\.\//u, '')
}

function projectRelative(path) {
  return normalizePath(relative(projectRoot, path))
}

function formatError(error) {
  return error instanceof Error ? error.message : String(error)
}

const allEvents = []
const results = []
let watcher
let watcherError
let fatalError

async function waitForQuiet(maximumWaitMs = 1_000) {
  const startedAt = performance.now()
  let observedCount = allEvents.length
  let unchangedSince = performance.now()

  while (performance.now() - startedAt < maximumWaitMs) {
    await delay(25)

    if (allEvents.length !== observedCount) {
      observedCount = allEvents.length
      unchangedSince = performance.now()
    } else if (performance.now() - unchangedSince >= quietPeriodMs) {
      return
    }
  }
}

async function runScenario(name, affectedPaths, operation) {
  await waitForQuiet()

  const targets = new Set(affectedPaths.map(projectRelative))
  const eventStartIndex = allEvents.length
  const operationStartedAt = performance.now()
  operation()

  const deadline = operationStartedAt + eventDeadlineMs
  let matchingEvent

  while (performance.now() < deadline) {
    const scenarioEvents = allEvents.slice(eventStartIndex)
    matchingEvent ??= scenarioEvents.find((event) => targets.has(event.path))
    const lastEvent = scenarioEvents.at(-1)

    if (
      matchingEvent &&
      lastEvent &&
      performance.now() - lastEvent.receivedAt >= quietPeriodMs
    ) {
      break
    }

    await delay(25)
  }

  const scenarioEvents = allEvents.slice(eventStartIndex)
  matchingEvent ??= scenarioEvents.find((event) => targets.has(event.path))
  const firstEvent = scenarioEvents[0]
  const latencyMs = firstEvent
    ? Math.max(0, Math.round(firstEvent.receivedAt - operationStartedAt))
    : null
  const matchingLatencyMs = matchingEvent
    ? Math.max(0, Math.round(matchingEvent.receivedAt - operationStartedAt))
    : null

  results.push({
    scenario: name,
    eventsReceived: scenarioEvents.length,
    uniquePathsSeen: new Set(scenarioEvents.map((event) => event.path)).size,
    latencyMs,
    passed: matchingLatencyMs !== null && matchingLatencyMs <= eventDeadlineMs,
  })
}

try {
  watcher = watch(projectRoot, { recursive: true }, (eventType, filename) => {
    allEvents.push({
      eventType,
      path: filename === null ? '<unknown>' : normalizePath(String(filename)),
      receivedAt: performance.now(),
    })
  })

  watcher.on('error', (error) => {
    watcherError ??= error
  })

  rmSync(scratchRoot, { recursive: true, force: true })
  mkdirSync(scratchRoot, { recursive: true })
  await waitForQuiet()

  const singleFile = join(scratchRoot, 'single.md')
  await runScenario('single file write', [singleFile], () => {
    writeFileSync(singleFile, '# Single write\n', 'utf8')
  })

  const burstFile = join(scratchRoot, 'burst.md')
  await runScenario('20 rapid writes', [burstFile], () => {
    for (let index = 0; index < 20; index += 1) {
      writeFileSync(burstFile, `# Burst ${index}\n`, 'utf8')
    }
  })

  const bulkDirectory = join(scratchRoot, 'bulk')
  mkdirSync(bulkDirectory, { recursive: true })
  await waitForQuiet()
  const bulkFiles = Array.from({ length: 50 }, (_, index) =>
    join(bulkDirectory, `file-${String(index).padStart(2, '0')}.md`),
  )

  await runScenario('bulk create 50', bulkFiles, () => {
    for (const [index, path] of bulkFiles.entries()) {
      writeFileSync(path, `# Bulk ${index}\n`, 'utf8')
    }
  })

  await runScenario('delete 50', bulkFiles, () => {
    for (const path of bulkFiles) {
      rmSync(path)
    }
  })

  const nestedFile = join(scratchRoot, 'nested', 'deep', 'file.md')
  mkdirSync(dirname(nestedFile), { recursive: true })
  writeFileSync(nestedFile, '# Nested\n', 'utf8')
  await waitForQuiet()

  await runScenario('nested file modify', [nestedFile], () => {
    appendFileSync(nestedFile, '\nModified.\n', 'utf8')
  })
} catch (error) {
  fatalError = error
} finally {
  watcher?.close()

  try {
    rmSync(scratchRoot, { recursive: true, force: true })
  } catch (error) {
    fatalError ??= error
  }
}

console.log(`fs.watch recursive probe (${process.platform})`)
console.table(
  results.map((result) => ({
    Scenario: result.scenario,
    Events: result.eventsReceived,
    'Unique paths': result.uniquePathsSeen,
    'Latency (ms)': result.latencyMs ?? 'none',
    Result: result.passed ? 'PASS' : 'FAIL',
  })),
)

const passed =
  !fatalError &&
  !watcherError &&
  results.length === 5 &&
  results.every((result) => result.passed)

if (fatalError) {
  console.error(`Fatal error: ${formatError(fatalError)}`)
}

if (watcherError) {
  console.error(`Watcher error: ${formatError(watcherError)}`)
}

console.log(
  `Verdict: ${passed ? 'PASS' : 'FAIL'} - ${
    passed
      ? 'every scenario produced a matching event within 2000ms'
      : 'one or more scenarios missed the 2000ms matching-event budget'
  }`,
)

process.exitCode = passed ? 0 : 1
