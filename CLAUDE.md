# Claude Code entry point

This repository contains the **build-engineer** AI agent (lab 1, variant 3: JavaScript + npm scripts + Jest).
The agent is defined in the GitHub Copilot format; Claude Code uses the same files:

- manifest: `.github/agents/build-engineer.agent.md` — read it before any command and follow its rules;
- skills: `.github/skills/*/SKILL.md` (+ `templates/`);
- commands: `.github/prompts/*.prompt.md`, exposed as `/git-init`, `/create-project`, `/create-build`,
  `/create-actions`, `/check`, `/init` through the thin wrappers in `.claude/commands/`.

Never commit, push, rewrite history or delete files outside `build/` / `coverage/` without explicit permission.
