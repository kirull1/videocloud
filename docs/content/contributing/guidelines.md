---
sidebar_position: 1
---

# Contributing Guidelines

Thank you for your interest in contributing to VideoCloud! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. Please read it before contributing.

## How to Contribute

### 1. Reporting Bugs

Before creating bug reports, please check the issue list as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

- Use a clear and descriptive title
- Describe the exact steps to reproduce the problem
- Provide specific examples to demonstrate the steps
- Describe the behavior you observed after following the steps
- Explain which behavior you expected to see instead and why
- Include screenshots if applicable
- Include relevant logs and error messages

### 2. Suggesting Enhancements

If you have a suggestion for a new feature or enhancement, please:

- Use a clear and descriptive title
- Provide a detailed description of the proposed functionality
- Explain why this enhancement would be useful
- List any similar features in other applications
- Include mockups or examples if applicable

### 3. Pull Requests

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and ensure they pass
5. Commit your changes (`git commit -m 'feat: add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## Development Process

### 1. Setting Up Development Environment

Follow the [Getting Started](../development/getting-started) guide to set up your development environment.

### 2. Branch Strategy

We follow a simplified Git Flow:

- `main` - Production-ready code
- `develop` - Development branch
- `feature/*` - Feature branches
- `fix/*` - Bug fix branches
- `release/*` - Release preparation branches

### 3. Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

Types:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Test changes
- `chore:` - Build process or auxiliary tool changes

### 4. Code Style

#### Frontend (Vue.js)

- Follow Vue.js style guide
- Use Composition API
- Use TypeScript
- Use CSS Modules
- Follow component naming conventions
- Write unit tests for components

#### Backend (NestJS)

- Follow NestJS best practices
- Use TypeScript
- Follow SOLID principles
- Write unit and integration tests
- Document API endpoints

### 5. Testing

#### Frontend Testing

- Write unit tests for components
- Write integration tests for features
- Write E2E tests for critical paths
- Maintain test coverage above 80%

```bash
# Run frontend tests
cd frontend
pnpm test
pnpm test:e2e
```

#### Backend Testing

- Write unit tests for services
- Write integration tests for controllers
- Write E2E tests for API endpoints
- Maintain test coverage above 80%

```bash
# Run backend tests
cd backend
pnpm test
pnpm test:e2e
```

### 6. Documentation

- Update documentation for new features
- Update API documentation
- Add comments for complex code
- Update README if needed

## Review Process

1. **Code Review**
   - All PRs require at least one review
   - Address review comments
   - Keep PRs focused and small
   - Update PR description if needed

2. **CI/CD Checks**
   - All tests must pass
   - Code style must be valid
   - No security vulnerabilities
   - Documentation must be updated

3. **Merge Process**
   - Squash commits if needed
   - Use conventional commit messages
   - Update changelog
   - Tag releases

## Release Process

1. Create release branch
2. Update version numbers
3. Update changelog
4. Run final tests
5. Create release PR
6. Merge to main
7. Tag release
8. Deploy

## Communication

### Channels

- GitHub Issues - Bug reports and feature requests
- GitHub Discussions - General discussion
- Slack - Real-time communication
- Email - Private or sensitive matters

### Meetings

- Weekly development sync
- Monthly roadmap review
- Quarterly planning

## Recognition

Contributors will be recognized in:

- Project README
- Release notes
- Contributor hall of fame
- Special mentions in documentation

## Getting Help

- Check the [FAQ](../faq)
- Search existing issues
- Ask in GitHub Discussions
- Contact maintainers

## License

By contributing to VideoCloud, you agree that your contributions will be licensed under the project's license.

## Thank You!

Thank you for contributing to VideoCloud! Your contributions help make the project better for everyone. 