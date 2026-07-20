<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:EF4444,45:F97316,100:111827&height=220&section=header&text=code-scanner&fontSize=52&fontColor=ffffff&fontAlignY=38&desc=Security%20review%20for%20AI-generated%20code.&descSize=18&descAlignY=58" width="100%" />

<p>
  <a href="https://openleash.com"><img src="https://img.shields.io/badge/OpenLeash-openleash.com-EF4444?style=for-the-badge&logo=googlechrome&logoColor=white" /></a>
  <a href="https://docs.openleash.com"><img src="https://img.shields.io/badge/Docs-docs.openleash.com-F97316?style=for-the-badge&logo=readthedocs&logoColor=white" /></a>
  <img src="https://img.shields.io/badge/License-MIT-111827?style=for-the-badge&logo=opensourceinitiative&logoColor=white" />
</p>

<h3>☣️ Catch concrete vulnerabilities in code written by vibe-coding agents.</h3>

</div>

---

## What it does

`code-scanner` observes code produced by supported coding agents, sends meaningful code and patches through OpenLeash's structured LLM evaluator, logs every completed review, and notifies the developer when a concrete vulnerability crosses the configured risk threshold.

It is advisory: it never blocks a tool or rewrites generated code.

```text
coding-agent response or file-write tool
                  │
          code candidate filter
                  │
       structured LLM security review
                  │
       clean JSON risk assessment
          ┌───────┴────────┐
          │                │
       normal          risky code
        log        log + signal + notification
```

## Agent scope

The manifest carries an explicit `agentKinds` allowlist. Non-coding SaaS agents, home automation agents, OpenClaw, and NanoClaw do not trigger this plugin.

Supported kinds include Claude Code, Codex and Codex Cloud, Cursor, GitHub Copilot, Gemini CLI, OpenCode, Cline, Continue, Windsurf, Kiro, Aider, and Zed.

## Events

- `agent.response` inspects code fences and code-like assistant responses.
- `tool.beforeUse` inspects generated content sent to write, edit, patch, notebook, create, replace, and insert tools.

Short prose and events without code are skipped before any model call.

## Structured assessment

The evaluator returns JSON containing:

- `risky`, `riskScore`, `severity`, and `summary`;
- up to eight concrete vulnerabilities;
- CWE identifiers when known;
- short source evidence; and
- specific remediation guidance.

The prompt focuses on exploitable risks such as injection, broken authorization, secret exposure, unsafe deserialization, path traversal, SSRF, XSS, CSRF, command execution, insecure cryptography, supply-chain risk, unsafe permissions, and dangerous defaults. Style issues and unsupported speculation are explicitly excluded.

## Configuration

| Setting                     | Default | Purpose                                            |
| --------------------------- | ------: | -------------------------------------------------- |
| `enabled`                   |  `true` | Enables generated-code review.                     |
| `notificationRiskThreshold` |    `70` | Minimum 0–100 score required to notify.            |
| `minimumCodeCharacters`     |    `80` | Skips tiny snippets before invoking the evaluator. |

OpenLeash resolves these settings for every request. A personal user may set them globally, for an agent kind, or for an exact authenticated/enrolled runtime. In organization modes, admin defaults and matching organization profiles apply first; employee settings and profiles apply only when configuration is unlocked. Mandatory installation and configuration locking are independent, so an admin may require Code Scanner while still allowing employee-specific thresholds.

The plugin receives only the effective `input.config` and does not branch on Individual Open Source, personal or organization OpenLeash Cloud, Private Cloud, or user role.

## Development

```bash
npm install
npm run typecheck
npm test
npm run build
```

## Privacy and safety

- Code is sent only through the evaluation provider configured for the OpenLeash deployment.
- Raw code is not copied into ordinary review logs; logs contain the structured assessment and bounded evidence.
- Notifications are deduplicated per agent session and vulnerability title.
- Image, prompt, model, and provider credentials are never owned by this plugin.

Please report security issues according to [SECURITY.md](SECURITY.md).

<div align="center">

### Vibe fast. Review what matters.

</div>
