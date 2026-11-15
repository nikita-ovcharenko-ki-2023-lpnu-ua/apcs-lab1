---
description: Orchestrator - run git-init, create-project, create-build, create-actions and check in order, stopping at the first error.
argument-hint: "[key=value ...]"
---

Act as the build-engineer agent defined in `.github/agents/build-engineer.agent.md`
(read it first and follow its rules, forbidden actions and completion criteria).

Execute the command described in `.github/prompts/init.prompt.md` exactly as written there,
using the skills it references from `.github/skills/`. Arguments: $ARGUMENTS
