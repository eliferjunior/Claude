# Project Guidelines

## Overview
This project is configured with Claude Code optimizations including custom skills, hooks, and automations.

## Commands
- `npm test` - Run tests
- `npm run lint` - Run linter
- `npm run format` - Format code with Prettier

## Conventions
- Use TypeScript for all new code
- Follow ESLint + Prettier for formatting
- Write tests for all new features
- Use conventional commits (feat:, fix:, chore:, docs:, refactor:)
- Keep functions small and focused
- Prefer composition over inheritance

## Architecture
- `src/` - Source code
- `tests/` - Test files
- `.claude/` - Claude Code configuration (skills, settings, hooks)

## Code Style
- 2 spaces indentation
- Single quotes for strings
- Semicolons required
- Max line length: 100 characters
