import React, { useEffect, useRef, useState } from "react";
import { Box, Text, render, useApp, useInput } from "ink";

const h = React.createElement;

const STATUS = {
  active: { color: "cyan", dim: false, icon: "◆" },
  done: { color: "white", dim: false, icon: "◇" },
  error: { color: "red", dim: false, icon: "✗" },
  pending: { color: "white", dim: true, icon: "◇" },
  success: { color: "green", dim: false, icon: "✓" }
};

function SetupFlow({ children }) {
  const steps = React.Children.toArray(children).filter(Boolean);
  const renderedSteps = [];

  steps.forEach((child, index) => {
    renderedSteps.push(h(React.Fragment, { key: `step-${index}` }, child));
    if (index < steps.length - 1) {
      renderedSteps.push(
        h(Box, { key: `connector-${index}`, paddingLeft: 0 }, h(Text, { dimColor: true }, "│"))
      );
    }
  });

  return h(
    Box,
    { flexDirection: "column", paddingLeft: 2 },
    h(Box, null, h(Text, { bold: true, color: "green" }, "Delano onboarding")),
    h(
      Box,
      { marginBottom: 1 },
      h(Text, { backgroundColor: "cyan", color: "black" }, " ┌ Ink setup flow ┐ ")
    ),
    ...renderedSteps
  );
}

function Step({ children, status = "done", title }) {
  const style = STATUS[status] || STATUS.done;

  return h(
    Box,
    { flexDirection: "row" },
    h(Text, { color: style.color, dimColor: style.dim }, style.icon),
    h(
      Box,
      { flexDirection: "column", marginLeft: 1 },
      title ? h(Text, { bold: status === "active" }, title) : null,
      typeof children === "string" ? h(Text, { dimColor: style.dim }, children) : children
    )
  );
}

function Bullet({ children, kind = "open" }) {
  const checked = kind === "done";
  return h(
    Box,
    { flexDirection: "row" },
    h(Text, { color: checked ? "green" : "yellow" }, checked ? "■" : "□"),
    h(Box, { marginLeft: 1 }, h(Text, null, children))
  );
}

function Hint({ children }) {
  return h(Box, { marginTop: 1 }, h(Text, { dimColor: true }, children));
}

function summarizeReview(review) {
  const strengthCount = review.strengths.length;
  const gapCount = review.gaps.length;
  if (gapCount === 0) {
    return `${strengthCount} strengths, no major gaps`;
  }
  return `${strengthCount} strengths, ${gapCount} improvement${gapCount === 1 ? "" : "s"}`;
}

function formatError(error) {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return String(error);
}

function OnboardingTui({ agentsPath, analyze, approveAnalysis, onExit }) {
  const { exit } = useApp();
  const [phase, setPhase] = useState(approveAnalysis ? "analyzing" : "confirm");
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState(null);
  const started = useRef(false);

  function finish(status) {
    onExit({ status });
    exit();
  }

  useEffect(() => {
    if (phase !== "analyzing" || started.current) {
      return;
    }

    started.current = true;
    Promise.resolve()
      .then(() => analyze())
      .then((nextReportData) => {
        setReportData(nextReportData);
        setPhase("complete");
      })
      .catch((nextError) => {
        setError(nextError);
        setPhase("error");
      });
  }, [analyze, phase]);

  useInput((input, key) => {
    const normalized = input.toLowerCase();
    const isReturn = key.return || input === "\r" || input === "\n";

    if (key.escape || normalized === "q") {
      const exitStatus = phase === "complete" ? "reviewed" : phase === "error" ? "error" : "skipped";
      finish(exitStatus);
      return;
    }

    if (phase === "confirm") {
      if (normalized === "y") {
        setPhase("analyzing");
        return;
      }
      if (normalized === "n") {
        setPhase("skipped");
      }
      return;
    }

    if ((phase === "complete" || phase === "error" || phase === "skipped") && isReturn) {
      const exitStatus = phase === "complete" ? "reviewed" : phase;
      finish(exitStatus);
    }
  });

  if (phase === "confirm") {
    return h(
      SetupFlow,
      null,
      h(Step, { status: "done", title: "AGENTS.md found" }, h(Text, { dimColor: true }, agentsPath)),
      h(
        Step,
        { status: "active", title: "Approval required" },
        h(Text, null, "Analyze AGENTS.md with the onboarding skill rubric? Press y to approve, n to skip.")
      ),
      h(Step, { status: "pending", title: "Review pending" }, "No file content has been analyzed yet.")
    );
  }

  if (phase === "analyzing") {
    return h(
      SetupFlow,
      null,
      h(Step, { status: "success", title: "Approval recorded" }, "Read-only analysis may run."),
      h(Step, { status: "active", title: "Reviewing AGENTS.md" }, "Checking mission, workflow, source maps, safety, and verification.")
    );
  }

  if (phase === "skipped") {
    return h(
      SetupFlow,
      null,
      h(Step, { status: "done", title: "AGENTS.md found" }, h(Text, { dimColor: true }, agentsPath)),
      h(Step, { status: "pending", title: "Onboarding skipped" }, "No analysis was performed."),
      h(Step, { status: "done", title: "No edits applied" }, "The onboarding command did not change repository files."),
      h(Hint, null, "Press enter or q to exit.")
    );
  }

  if (phase === "error") {
    return h(
      SetupFlow,
      null,
      h(Step, { status: "error", title: "Onboarding failed" }, h(Text, null, formatError(error))),
      h(Step, { status: "done", title: "No edits applied" }, "The onboarding command did not change repository files."),
      h(Hint, null, "Press enter or q to exit.")
    );
  }

  const { guidePath, review } = reportData;

  return h(
    SetupFlow,
    null,
    h(Step, { status: "done", title: "AGENTS.md found" }, h(Text, { dimColor: true }, agentsPath)),
    h(Step, { status: "done", title: "Onboarding rubric loaded" }, h(Text, { dimColor: true }, guidePath)),
    h(Step, { status: "success", title: "Review complete" }, summarizeReview(review)),
    review.strengths.length > 0
      ? h(
          Step,
          { status: "done", title: "Already working well" },
          h(Box, { flexDirection: "column" }, ...review.strengths.map((strength) => h(Bullet, { key: strength, kind: "done" }, strength)))
        )
      : null,
    review.gaps.length > 0
      ? h(
          Step,
          { status: "active", title: "Improve next" },
          h(Box, { flexDirection: "column" }, ...review.gaps.map((gap) => h(Bullet, { key: gap }, gap)))
        )
      : h(Step, { status: "success", title: "No major gaps" }, "No major gaps detected against the onboarding guide."),
    h(
      Step,
      { status: "done", title: "Guardrail" },
      h(
        Box,
        { flexDirection: "column" },
        h(Text, null, "No edits were applied."),
        h(Text, null, "Approve AGENTS.md changes explicitly in a separate step.")
      )
    ),
    h(Hint, null, "Press enter or q to exit.")
  );
}

export async function renderOnboardingTui({ agentsPath, analyze, approveAnalysis = false }) {
  let result = { status: "closed" };
  const instance = render(
    h(OnboardingTui, {
      agentsPath,
      analyze,
      approveAnalysis,
      onExit(nextResult) {
        result = nextResult;
      }
    })
  );

  await instance.waitUntilExit();
  return result;
}
