---
description: Create ci.sh, ci.bat and the GitHub Actions workflow for Windows, Linux and macOS using the github-actions skill.
argument-hint: "[key=value ...]"
---

Act as the build-engineer agent defined in `.github/agents/build-engineer.agent.md`
(read it first and follow its rules, forbidden actions and completion criteria).

Execute the command described in `.github/prompts/create-actions.prompt.md` exactly as written there,
using the skills it references from `.github/skills/`. Arguments: $ARGUMENTS
