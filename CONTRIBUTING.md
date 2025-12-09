# Contributing to MCP Marketplace

Thank you for your interest in contributing to the MCP Marketplace SDK! This document provides guidelines and instructions for contributing.

## Code of Conduct

Please be respectful and inclusive in all interactions.

## Getting Started

### Prerequisites

- Node.js 18.x or 20.x
- npm 9.x or higher
- Git

### Setup

1. Clone the repository:
```bash
git clone https://github.com/ggange/mcp-marketplace.git
cd mcp-marketplace
```

2. Install dependencies:
```bash
npm install
```

3. Build the packages:
```bash
npm run build
```

## Making Changes

### Branching

Create a new branch for your feature or fix:

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-fix-name
```

### Code Style

- Use TypeScript strictly
- Follow the existing code style
- Use meaningful variable and function names
- Add comments for complex logic

### Building and Testing

Before committing, ensure your changes build successfully:

```bash
npm run build
```

## Submitting Changes

### Commit Messages

Use clear, descriptive commit messages:

```bash
git commit -m "feat: add new feature description"
git commit -m "fix: resolve issue with..."
git commit -m "docs: update README"
git commit -m "refactor: improve code structure"
```

### Pull Requests

1. Ensure your changes are up-to-date with main:
```bash
git fetch origin
git rebase origin/main
```

2. Push your branch:
```bash
git push origin your-branch-name
```

3. Open a Pull Request on GitHub with:
   - Clear title describing the changes
   - Description of what and why you changed
   - Reference to any related issues
   - Screenshots for UI changes (if applicable)

### PR Review Process

- Automated tests must pass
- Code review will be conducted
- Changes may be requested
- Once approved, your PR will be merged

## Reporting Bugs

1. Check if the bug has already been reported in [Issues](https://github.com/ggange/mcp-marketplace/issues)
2. If not, create a new issue with:
   - Clear title
   - Detailed description
   - Steps to reproduce
   - Expected vs. actual behavior
   - Your environment (OS, Node.js version, etc.)

## Suggesting Enhancements

1. Check if the enhancement has already been suggested
2. Create a new issue with:
   - Clear title
   - Description of the proposed enhancement
   - Motivation and use cases
   - Possible implementation approaches

## Release Process

Releases are created by maintainers and follow [Semantic Versioning](https://semver.org/):

- MAJOR: Breaking changes
- MINOR: New features (backward compatible)
- PATCH: Bug fixes (backward compatible)

## Questions?

Feel free to ask questions by:
- Opening an issue with the `question` label
- Starting a discussion on GitHub

Thank you for contributing! 🎉

