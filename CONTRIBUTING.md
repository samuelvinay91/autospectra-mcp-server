# Contributing to AutoSpectra MCP Server

Thank you for your interest in contributing to AutoSpectra MCP Server! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Pull Request Process](#pull-request-process)
- [Versioning](#versioning)
- [Style Guide](#style-guide)
- [Testing](#testing)
- [Documentation](#documentation)
- [Community](#community)

## Code of Conduct

This project adheres to a Code of Conduct that all contributors are expected to follow. Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md).

## Getting Started

1. **Fork the Repository**: Start by forking the repository to your GitHub account.
2. **Clone the Repository**: Clone your fork to your local machine.
3. **Install Dependencies**: Run `npm install` to install all dependencies.
4. **Build the Project**: Run `npm run build` to build the project.
5. **Run the Server**: Run `npm start` to start the server.

## Development Workflow

1. **Create a Branch**: Always create a new branch for your changes.
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Your Changes**: Write your code and make changes.

3. **Commit Your Changes**: Commit your changes with a clear commit message.
   ```bash
   git commit -m "feat: add new browser automation feature"
   ```

   We follow [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat`: New feature
   - `fix`: Bug fix
   - `docs`: Documentation changes
   - `style`: Changes that don't affect code meaning (formatting, etc.)
   - `refactor`: Code change that neither fixes a bug nor adds a feature
   - `perf`: Performance improvement
   - `test`: Adding or fixing tests
   - `chore`: Changes to build process or auxiliary tools

4. **Push Your Changes**: Push your changes to your fork.
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create a Pull Request**: Create a pull request from your fork to the main repository.

## Pull Request Process

1. **PR Title**: Use a descriptive title that follows the Conventional Commits format.
2. **PR Description**: Fill out the pull request template with details about your changes.
3. **Link Issues**: Link any related issues to your PR.
4. **Pass CI Checks**: Ensure your PR passes all CI checks.
5. **Code Review**: Address any comments from reviewers.
6. **Merge**: Once approved, your PR will be merged.

## Versioning

We use [Semantic Versioning](https://semver.org/) for releases. Version numbers are automatically managed through GitHub Actions:

1. **Patch Version** (`1.0.x`): Bug fixes and minor changes that don't affect compatibility.
2. **Minor Version** (`1.x.0`): New features or enhancements that maintain backward compatibility.
3. **Major Version** (`x.0.0`): Breaking changes that require significant updates for users.

To create a new release, use the "Semantic Versioning" workflow in GitHub Actions.

## Style Guide

We use ESLint and Prettier to maintain code quality and consistent style:

- **TypeScript**: We follow the [TypeScript Style Guide](https://github.com/basarat/typescript-book/blob/master/docs/styleguide/styleguide.md).
- **Line Length**: Maximum line length is 100 characters.
- **Indentation**: Use 2 spaces for indentation.
- **Quotes**: Use single quotes for strings.
- **Semicolons**: Always use semicolons.

Run `npm run lint` to check your code style before submitting a PR.

## Testing

- Write tests for all new features and bug fixes.
- Run tests using `npm test` before submitting a PR.
- Ensure your changes don't break existing tests.
- We aim for high test coverage to maintain code quality.

## Documentation

- Update documentation for any changes you make.
- Document new features, APIs, and configuration options.
- Use JSDoc comments for code documentation.
- Update the README.md if necessary.

## Community

- Join our discussions on [GitHub Discussions](https://github.com/autospectra/autospectra-mcp-server/discussions).
- Report bugs and request features using [GitHub Issues](https://github.com/autospectra/autospectra-mcp-server/issues).
- Get help from the community on [Discord](https://discord.gg/autospectra).

Thank you for contributing to AutoSpectra MCP Server!
