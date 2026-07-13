import assert from "node:assert/strict";
import test from "node:test";
import type { EvaluationRequest, PluginCapabilities } from "@openleash/shared";
import { generatedCodeCandidate, runCodeScanner } from "./index.js";
import { CODE_SCANNER_AGENT_KINDS } from "./manifest.js";

function request(toolInput: unknown): EvaluationRequest {
  return {
    computer: { hostname: "test", platform: "darwin" },
    agent: { kind: "claude-code", displayName: "Claude Code" },
    event: {
      eventName: "PreToolUse",
      agentKind: "claude-code",
      sessionId: "session-1",
      occurredAt: new Date(0).toISOString(),
      tool: { name: "Write", input: toolInput },
    },
  };
}

function capabilities(assessment: unknown) {
  const calls = { notifications: 0, signals: 0, logs: 0 };
  const value = {
    llm: {
      evaluateJson: async () => ({
        json: assessment,
        model: "test-model",
        provider: "test",
        source: "heuristic" as const,
      }),
    },
    notification: {
      send: async () => {
        calls.notifications += 1;
        return { sent: true, deduped: false };
      },
    },
    signals: {
      emit: async (entry: unknown) => {
        calls.signals += 1;
        return entry;
      },
    },
    log: {
      emit: async (entry: unknown) => {
        calls.logs += 1;
        return entry;
      },
    },
  } as unknown as PluginCapabilities;
  return { value, calls };
}

test("manifest excludes non-coding agents", () => {
  assert.ok(CODE_SCANNER_AGENT_KINDS.includes("claude-code"));
  assert.ok(CODE_SCANNER_AGENT_KINDS.includes("github-copilot"));
  assert.equal(
    CODE_SCANNER_AGENT_KINDS.includes("salesforce-agentforce"),
    false,
  );
  assert.equal(CODE_SCANNER_AGENT_KINDS.includes("openclaw"), false);
});

test("extracts generated code and ignores prose", () => {
  assert.match(
    generatedCodeCandidate(
      request({
        content:
          "import os\n\ndef run(user):\n    command = 'echo ' + user\n    return os.system(command)\n",
      }),
      40,
    )?.code ?? "",
    /os\.system/,
  );
  assert.equal(
    generatedCodeCandidate(request({ content: "Updated successfully." }), 40),
    undefined,
  );
});

test("risky code produces a notification and security signal", async () => {
  const mock = capabilities({
    risky: true,
    riskScore: 94,
    severity: "critical",
    summary: "User input reaches a shell.",
    vulnerabilities: [
      {
        title: "Command injection",
        severity: "critical",
        cwe: "CWE-78",
        evidence: "os.system(command)",
        remediation: "Use a fixed argument array.",
      },
    ],
  });
  const result = await runCodeScanner(
    request({
      content:
        "import os\n\ndef run(user):\n    command = 'echo ' + user\n    return os.system(command)\n",
    }),
    "tool.beforeUse",
    mock.value,
  );
  assert.equal(result.metadata?.notificationSent, true);
  assert.deepEqual(mock.calls, { notifications: 1, signals: 1, logs: 1 });
});

test("clean code is logged without notifying", async () => {
  const mock = capabilities({
    risky: false,
    riskScore: 4,
    severity: "none",
    summary: "No vulnerability.",
    vulnerabilities: [],
  });
  const result = await runCodeScanner(
    request({
      content:
        "export function add(left: number, right: number) {\n  if (!Number.isFinite(left) || !Number.isFinite(right)) throw new Error('invalid');\n  return left + right;\n}\n",
    }),
    "tool.beforeUse",
    mock.value,
  );
  assert.equal(result.metadata?.notificationSent, false);
  assert.deepEqual(mock.calls, { notifications: 0, signals: 0, logs: 1 });
});
