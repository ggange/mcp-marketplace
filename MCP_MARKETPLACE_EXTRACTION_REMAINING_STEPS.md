# MCP Marketplace Extraction - Remaining Steps

**Status:** Phases 1-5 Complete ✅  
**Next:** Complete Phases 6-13 to finish open source setup

---

## Phase 6: Add Open Source Infrastructure

### Step 6.1: Create Root README.md
Create `README.md` in repo root with:
- Project description
- Installation instructions for both packages
- Links to individual package docs
- Development setup instructions

### Step 6.2: Create Types Package README.md
Create `packages/types/README.md` with:
- Package description
- Installation: `npm install @mcp-marketplace/types`
- Basic usage example showing type imports

### Step 6.3: Create Marketplace Client README.md
Create `packages/marketplace-client/README.md` with:
- Full API documentation
- Browser and Node.js usage examples
- All method descriptions
- Configuration options

### Step 6.4: Create LICENSE File
Create `LICENSE` in repo root:
- Use MIT License (standard open source license)
- Include copyright year and your name/org

### Step 6.5: Create .npmignore Files
Create `.npmignore` in both packages:
- Exclude: `src/`, `tsconfig.json`, `*.tsbuildinfo`, `node_modules/`, `.git/`, `.env*`, `*.log`

### Step 6.6: Create .gitignore
Create `.gitignore` in repo root:
- Standard Node.js ignores: `node_modules/`, `dist/`, `*.tsbuildinfo`
- IDE files: `.DS_Store`, `.idea/`, `.vscode/`
- Environment: `.env`, `.env.local`
- Logs: `*.log`, `coverage/`

---

## Phase 7: Setup CI/CD

### Step 7.1: Create GitHub Actions CI
Create `.github/workflows/ci.yml`:
- Trigger on push/PR to main
- Setup Node.js 18
- Run `npm ci` and `npm run build`
- Verify no build artifacts are modified

### Step 7.2: Create GitHub Actions Publish
Create `.github/workflows/publish.yml`:
- Trigger on GitHub release creation
- Setup Node.js with npm registry
- Build all packages
- Publish both packages to npm using `NPM_TOKEN` secret

---

## Phase 8: Initial Setup & Test

### Step 8.1: Install Dependencies
```bash
cd mcp-marketplace
npm install
```

### Step 8.2: Build Packages
```bash
npm run build
```

### Step 8.3: Verify Build Output
Check that `dist/` folders are created in both packages:
- `packages/types/dist/` should contain compiled JS and .d.ts files
- `packages/marketplace-client/dist/` should contain compiled JS and .d.ts files

### Step 8.4: Test Locally (Optional)
```bash
# Option 1: npm link
cd packages/types && npm link
cd ../marketplace-client && npm link

# Option 2: npm pack (creates tarballs for testing)
cd packages/types && npm pack
cd ../marketplace-client && npm pack
```

---

## Phase 9: Initial Commit & Push

### Step 9.1: Add All Files
```bash
git add .
git commit -m "Initial open source release: MCP Marketplace SDK"
```

### Step 9.2: Push to GitHub
```bash
git branch -M main
git remote add origin https://github.com/yourorg/mcp-marketplace.git
git push -u origin main
```

---

## Phase 10: Publish to npm

### Step 10.1: Login to npm
```bash
npm login
# Use your npm account that has access to @mcp-marketplace org
```

### Step 10.2: Publish Types Package First
```bash
cd packages/types
npm publish --access public
```
**Note:** Client SDK depends on types, so publish types first!

### Step 10.3: Publish Client SDK
```bash
cd ../marketplace-client
npm publish --access public
```

### Step 10.4: Verify on npm
- Check: https://www.npmjs.com/package/@mcp-marketplace/types
- Check: https://www.npmjs.com/package/@mcp-marketplace/client-sdk

---

## Phase 11: Setup GitHub Secrets

### Step 11.1: Create npm Automation Token
1. Go to: https://www.npmjs.com/settings/YOUR_USERNAME/tokens
2. Click "Generate New Token"
3. Select "Automation" type
4. Copy the token (you'll only see it once!)

### Step 11.2: Add GitHub Secret
1. Go to your GitHub repo: `https://github.com/yourorg/mcp-marketplace`
2. Navigate: Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Name: `NPM_TOKEN`
5. Value: Paste your npm token
6. Click "Add secret"

---

## Phase 12: Update Your Monorepo

### Step 12.1: Update Package Dependencies
In your original monorepo (`/Users/giuseppe/Documents/xyz`), update all `package.json` files that reference:
- `@llm-platform/marketplace-client-sdk` → `@mcp-marketplace/client-sdk`
- `@llm-platform/shared` (for types only) → `@mcp-marketplace/types`

**Files to update:**
- `packages/electron-app/package.json`
- `packages/marketplace-ui/package.json`
- `services/web-client/package.json`
- Any other packages using the SDK

### Step 12.2: Update Import Statements
Find and replace imports across your monorepo:

```bash
# From your monorepo root
# Replace marketplace SDK imports
find . -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' \
  's/@llm-platform\/marketplace-client-sdk/@mcp-marketplace\/client-sdk/g' {} +

# Replace shared type imports (where only types are used)
find . -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' \
  's/from '\''@llm-platform\/shared'\''/from '\''@mcp-marketplace\/types'\''/g' {} +
find . -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' \
  's/from "@llm-platform\/shared"/from "@mcp-marketplace\/types"/g' {} +
```

**Manual review needed for:**
- Files that import config utilities from `@llm-platform/shared` (keep those as-is)
- Only replace type imports, not config imports

### Step 12.3: Install New Packages
```bash
cd /Users/giuseppe/Documents/xyz
npm install @mcp-marketplace/types @mcp-marketplace/client-sdk
```

### Step 12.4: Test Build
```bash
npm run build
# Fix any import errors
```

### Step 12.5: Remove Old Package (After Verification)
```bash
# Only after everything works!
rm -rf packages/marketplace-client-sdk

# Update root package.json to remove references
# Update build scripts if needed
```

**Note:** Keep `packages/shared` if other parts of monorepo still use config utilities!

---

## Phase 13: Create First Release

### Step 13.1: Create Git Tag
```bash
cd mcp-marketplace
git tag -a v1.0.0 -m "Initial release: v1.0.0"
git push origin v1.0.0
```

### Step 13.2: Create GitHub Release (Alternative)
1. Go to: `https://github.com/yourorg/mcp-marketplace/releases`
2. Click "Create a new release"
3. Tag: `v1.0.0`
4. Title: `v1.0.0 - Initial Release`
5. Description: Brief summary of what's included
6. Click "Publish release"

**This will automatically trigger the publish workflow!**

### Step 13.3: Verify Publication
- Check npm packages are published
- Check GitHub Actions workflow completed successfully
- Test installing packages in a fresh project

---

## Quick Checklist

- [ ] Phase 6: Create all README, LICENSE, .npmignore, .gitignore files
- [ ] Phase 7: Setup GitHub Actions CI/CD workflows
- [ ] Phase 8: Build and test locally
- [ ] Phase 9: Initial commit and push to GitHub
- [ ] Phase 10: Publish both packages to npm
- [ ] Phase 11: Setup GitHub secrets for automated publishing
- [ ] Phase 12: Update monorepo to use published packages
- [ ] Phase 13: Create first release

---

## Troubleshooting

### Build Errors
- Check TypeScript configs extend correctly
- Verify all imports use correct package names
- Ensure workspace dependencies are correct

### Publishing Errors
- Verify npm org access: `npm whoami`
- Check package.json has `"publishConfig": { "access": "public" }`
- Ensure version numbers are correct

### Import Errors in Monorepo
- Double-check import paths are updated
- Verify packages are installed: `npm list @mcp-marketplace/types`
- Clear node_modules and reinstall if needed

---

## Next Steps After Completion

1. **Announce the open source release**
   - Blog post
   - Social media
   - Developer communities

2. **Monitor and maintain**
   - Watch for issues/PRs
   - Respond to community questions
   - Plan next features

3. **Update documentation**
   - Add to main project README
   - Update developer guides
   - Create migration guide if needed

---

**Last Updated:** After Phase 5 completion

