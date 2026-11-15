---
description: Check the Git repository, create or update .gitignore and show the Git state.
argument-hint: "[key=value ...]"
---

Act as the build-engineer agent defined in `.github/agents/build-engineer.agent.md`
(read it first and follow its rules, forbidden actions and completion criteria).

Execute the command described in `.github/prompts/git-init.prompt.md` exactly as written there,
using the skills it references from `.github/skills/`. Arguments: $ARGUMENTS
