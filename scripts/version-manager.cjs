#!/usr/bin/env node

/**
 * Automated Version Manager for LogYourBody
 * Uses calendar-based semantic versioning: YYYY.MM.PATCH
 * 
 * Version format:
 * - YYYY: Current year (e.g., 2025)
 * - MM: Current month (01-12)
 * - PATCH: Incremental number for releases within the same month
 * 
 * Examples:
 * - 2025.01.0 - First release in January 2025
 * - 2025.01.1 - Second release in January 2025
 * - 2025.02.0 - First release in February 2025
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class VersionManager {
  constructor() {
    this.packageJsonPath = path.join(process.cwd(), 'package.json');
    this.currentDate = new Date();
  }

  getCurrentVersion() {
    const packageJson = JSON.parse(fs.readFileSync(this.packageJsonPath, 'utf8'));
    return packageJson.version || '0.0.0';
  }

  parseVersion(version) {
    const parts = version.split('.');
    return {
      year: parseInt(parts[0]) || 0,
      month: parseInt(parts[1]) || 0,
      patch: parseInt(parts[2]) || 0
    };
  }

  calculateNewVersion(currentVersion, bumpType = 'patch') {
    const current = this.parseVersion(currentVersion);
    const year = this.currentDate.getFullYear();
    const month = String(this.currentDate.getMonth() + 1).padStart(2, '0');

    let newVersion;

    // If we're in a new year or month, reset patch to 0
    if (current.year !== year || current.month !== parseInt(month)) {
      newVersion = `${year}.${month}.0`;
    } else {
      // Same year and month, increment patch
      newVersion = `${year}.${month}.${current.patch + 1}`;
    }

    return newVersion;
  }

  getCommitType(message) {
    const lowerMessage = message.toLowerCase();
    
    // Breaking changes - would normally be major, but we'll handle differently
    if (lowerMessage.includes('breaking change') || lowerMessage.includes('breaking:')) {
      return 'breaking';
    }
    
    // Features - new functionality
    if (lowerMessage.startsWith('feat:') || lowerMessage.startsWith('feature:')) {
      return 'feature';
    }
    
    // Fixes
    if (lowerMessage.startsWith('fix:') || lowerMessage.startsWith('bugfix:')) {
      return 'fix';
    }
    
    // Everything else is a patch
    return 'patch';
  }

  getLastTag() {
    try {
      return execSync('git describe --tags --abbrev=0', { encoding: 'utf8' }).trim();
    } catch (error) {
      // No tags found
      return null;
    }
  }

  getCommitsSinceLastTag() {
    const lastTag = this.getLastTag();
    const command = lastTag 
      ? `git log ${lastTag}..HEAD --pretty=format:"%s"`
      : 'git log --pretty=format:"%s"';
    
    try {
      const commits = execSync(command, { encoding: 'utf8' }).trim();
      return commits ? commits.split('\n') : [];
    } catch (error) {
      return [];
    }
  }

  updatePackageJson(newVersion) {
    const packageJson = JSON.parse(fs.readFileSync(this.packageJsonPath, 'utf8'));
    packageJson.version = newVersion;
    fs.writeFileSync(this.packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
  }

  updateChangelog(newVersion, commits) {
    const changelogPath = path.join(process.cwd(), 'CHANGELOG.md');
    const date = this.currentDate.toISOString().split('T')[0];
    
    let changelog = '';
    if (fs.existsSync(changelogPath)) {
      changelog = fs.readFileSync(changelogPath, 'utf8');
    }

    const features = commits.filter(c => this.getCommitType(c) === 'feature');
    const fixes = commits.filter(c => this.getCommitType(c) === 'fix');
    const breaking = commits.filter(c => this.getCommitType(c) === 'breaking');
    const other = commits.filter(c => !['feature', 'fix', 'breaking'].includes(this.getCommitType(c)));

    let newEntry = `## [${newVersion}] - ${date}\n\n`;

    if (breaking.length > 0) {
      newEntry += '### ⚠️ Breaking Changes\n';
      breaking.forEach(commit => {
        newEntry += `- ${commit}\n`;
      });
      newEntry += '\n';
    }

    if (features.length > 0) {
      newEntry += '### 🎉 Features\n';
      features.forEach(commit => {
        newEntry += `- ${commit}\n`;
      });
      newEntry += '\n';
    }

    if (fixes.length > 0) {
      newEntry += '### 🐛 Bug Fixes\n';
      fixes.forEach(commit => {
        newEntry += `- ${commit}\n`;
      });
      newEntry += '\n';
    }

    if (other.length > 0) {
      newEntry += '### 🔧 Other Changes\n';
      other.forEach(commit => {
        newEntry += `- ${commit}\n`;
      });
      newEntry += '\n';
    }

    // Prepend new entry to changelog
    const updatedChangelog = newEntry + '\n' + changelog;
    fs.writeFileSync(changelogPath, updatedChangelog);
  }

  createGitTag(version, message) {
    try {
      execSync(`git tag -a v${version} -m "${message}"`, { encoding: 'utf8' });
      console.log(`✅ Created git tag: v${version}`);
    } catch (error) {
      console.error('❌ Failed to create git tag:', error.message);
      throw error;
    }
  }

  run(options = {}) {
    const currentVersion = this.getCurrentVersion();
    console.log(`📦 Current version: ${currentVersion}`);

    const commits = this.getCommitsSinceLastTag();
    if (commits.length === 0 && !options.force) {
      console.log('ℹ️ No new commits since last version. Use --force to create a new version anyway.');
      return;
    }

    const newVersion = this.calculateNewVersion(currentVersion);
    console.log(`🚀 New version: ${newVersion}`);

    // Update package.json
    this.updatePackageJson(newVersion);
    console.log('✅ Updated package.json');

    // Update changelog
    this.updateChangelog(newVersion, commits);
    console.log('✅ Updated CHANGELOG.md');

    // Commit version bump
    try {
      execSync('git add package.json CHANGELOG.md', { encoding: 'utf8' });
      execSync(`git commit -m "chore: bump version to ${newVersion}"`, { encoding: 'utf8' });
      console.log('✅ Committed version bump');
    } catch (error) {
      console.warn('⚠️ Could not commit version bump (may already be committed)');
    }

    // Create git tag
    if (!options.skipTag) {
      const tagMessage = `Release ${newVersion}\n\n${commits.join('\n')}`;
      this.createGitTag(newVersion, tagMessage);
    }

    console.log(`\n🎉 Version ${newVersion} created successfully!`);
    console.log('\nNext steps:');
    console.log('1. Push commits: git push');
    console.log('2. Push tags: git push --tags');
  }
}

// CLI handling
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {
    force: args.includes('--force'),
    skipTag: args.includes('--skip-tag')
  };

  const manager = new VersionManager();
  try {
    manager.run(options);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

module.exports = VersionManager;