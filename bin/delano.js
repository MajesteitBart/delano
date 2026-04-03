#!/usr/bin/env node

const { run } = require("../src/cli");

run(process.argv.slice(2))
  .then((exitCode) => {
    process.exitCode = exitCode;
  })
  .catch((error) => {
    const message = error && error.message ? error.message : String(error);
    console.error(message);
    process.exitCode = typeof error?.exitCode === "number" ? error.exitCode : 1;
  });
