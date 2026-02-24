---
name: raise-pr-gh-cli
description: Creates a new pull request using the GitHub CLI (gh). Use when the user wants to open a PR, raise a PR, create a PR, or push and open a PR with gh.
---

# Raise a PR with GitHub CLI

## When to Use

Apply this skill when the user asks to:

- Raise a new PR
- Create a PR with gh / GitHub CLI
- Open a pull request from the current branch

## Prerequisites

- GitHub CLI (`gh`) installed and authenticated (`gh auth status`)
- Current branch has commits not yet on the remote (or user intends to push first)

## Workflow

1. **Ensure branch is pushed**
   - If the branch isn’t pushed yet: `git push -u origin <branch>`
   - Use current branch from `git branch --show-current` when not specified.

2. **Create the PR**
   - Default (browser for title/body):  
     `gh pr create`
   - With title and body in terminal:  
     `gh pr create --title "Title" --body "Description"`
   - Draft PR:  
     `gh pr create --draft`
   - Set base branch (e.g. `main`):  
     `gh pr create --base main`

3. **Common combinations**
   - Draft from current branch:  
     `gh pr create --draft`
   - With title only (body in editor):  
     `gh pr create --title "feat: add X"`
   - With web editor for body:  
     `gh pr create --web`

## Options Reference

| Option          | Purpose                           |
| --------------- | --------------------------------- |
| `--title`, `-t` | PR title                          |
| `--body`, `-b`  | PR description                    |
| `--draft`       | Create as draft                   |
| `--base`        | Base branch (default from repo)   |
| `--head`        | Head branch (default: current)    |
| `--web`         | Open form in browser              |
| `--fill`        | Use commit message for title/body |
| `--assignee`    | Assign users (comma-separated)    |
| `--reviewer`    | Request reviewers                 |

## Tips

- Run from the repo root; `gh` uses the current directory to find the repo.
- If the branch isn’t pushed, run `git push -u origin $(git branch --show-current)` then `gh pr create`.
- Use `--fill` to reuse the last commit message for title and body when it’s a single-commit PR.
