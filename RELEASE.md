# Release Process

This document describes the process for releasing new versions of AI-Guards.

## Prerequisites

1. **NPM Token**: You need to set up an NPM token as a GitHub secret:
   - Go to [npmjs.com](https://www.npmjs.com) and sign in
   - Go to Access Tokens in your account settings
   - Generate a new token with "Automation" type
   - Add it as `NPM_TOKEN` in your GitHub repository secrets:
     - Go to Settings → Secrets and variables → Actions
     - Click "New repository secret"
     - Name: `NPM_TOKEN`
     - Value: Your npm token

2. **Permissions**: Ensure you have write access to the repository

## Release Steps

1. **Update Version**: 
   ```bash
   npm version patch  # or minor/major
   ```
   This will update the version in package.json and create a commit.

2. **Push Changes**:
   ```bash
   git push origin main
   ```

3. **Create and Push Tag**:
   ```bash
   git tag v0.0.8  # Replace with your version
   git push origin v0.0.8
   ```

4. **Automated Process**: Once the tag is pushed, three GitHub Actions workflows will run:
   - **release-and-publish.yml** (Recommended): Combined workflow that:
     - Runs tests
     - Builds the project
     - Publishes to npm with provenance
     - Creates a GitHub release
   - **npm-publish.yml**: Only publishes to npm
   - **release.yml**: Only creates GitHub release
   
   The combined workflow ensures both npm publishing and GitHub release creation happen together.

5. **Verify Release**:
   - Check [npm package page](https://www.npmjs.com/package/ai-guards)
   - Check GitHub releases page
   - Test installation: `npm install -g ai-guards@latest`

## Version Naming

Follow semantic versioning:
- **Patch** (0.0.X): Bug fixes, minor updates
- **Minor** (0.X.0): New features, backwards compatible
- **Major** (X.0.0): Breaking changes

## Troubleshooting

- **NPM Publish Failed**: Check that NPM_TOKEN is set correctly
- **Tests Failed**: Fix failing tests before creating tag
- **Build Failed**: Ensure `npm run build` works locally