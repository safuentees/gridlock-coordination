# Agent workflow template

A small, framework-neutral starting point for agent-assisted projects. Version 1.0.0.

## Start a project

Use GitHub **Use this template → Create a new repository**, choose a name and **Private**, then clone the new repository. Or run:

```sh
gh repo create safuentees/my-new-project --template safuentees/agent-workflow-template --private --clone
```

Replace `my-new-project`. Open that new project in your coding agent and provide the brief or source materials:

> Read AGENTS.md. Use specs/preflight.md to initialize this project from the attached brief. Plan the full product as concrete features, establish the shared contracts and bare scaffold, then start ready work. Time/usage budget: [budget]. Available workers: [workers or just this chat]. Follow the limited-checking and default-component rules.

An agent can read AGENTS.md even if its client does not load that filename automatically. The main entry point is short; workers load only the relevant project specs.

## What happens

Brief → product roadmap → shared contracts/scaffold → parallel feature worktrees → small PRs → integration → next ready feature.

The coordinator fills in the mission, stack and roadmap once. Each selected feature gets a concise spec. The roadmap has the winner's phase/lane/dependency structure; the initial F00 row is only a bootstrap placeholder, not the intended project scope.

Only one agent performs limited nonvisual milestone checks. There are no installed review bots, CI workflows, browser tests, app dependencies or automatic schedulers. Web UI defaults to documented shadcn components; other projects choose an appropriate stack during setup.

The template's own commit is not a completed application bootstrap. Do not add `changes/F00.md` until the new project's scaffold exists. Use a new project repository rather than pushing application work back to this starter.

## Files

`AGENTS.md` routes work. `specs/mission.md` defines why; `specs/tech-stack.md` defines shared agreements; `specs/roadmap.md` assigns features; `specs/features/` contains task instructions; `specs/overnight.md` defines execution. `changes/` holds short completion records.

Inspired by the [ShellHacks winner's roadmap](https://github.com/fradicus/Shellhacks-2026/blob/9840f7f/specs/roadmap.md). Limited checking, default styling and coordinator merging are deliberate adaptations, not claims about every action that team took.
