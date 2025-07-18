# AI Issue Triage System

This repository uses an intelligent AI-powered issue triage system that automatically analyzes new issues and recommends the most appropriate AI tool for resolution.

## Overview

When you create a new issue, our triage system will:
1. Analyze the issue title and description
2. Score it against criteria for each AI tool
3. Use Claude AI for nuanced analysis
4. Add appropriate labels
5. Comment with recommendations and instructions

## Available AI Tools

### 🧹 Sweep
**Best for:** Code refactoring, cleanup, and maintenance tasks
- Refactoring code for better readability
- Removing duplicate code
- Updating dependencies
- Adding tests
- Improving code organization

**How to use:** Comment `@sweep` followed by specific instructions

### 🤖 GitHub Copilot
**Best for:** Implementing new features and generating code
- Creating new components or services
- Implementing API endpoints
- Adding new features
- Building integrations
- Scaffolding boilerplate code

**How to use:** Open your IDE with Copilot enabled and start coding

### 🧠 Claude
**Best for:** Complex debugging, architectural decisions, and deep analysis
- Debugging difficult issues
- Analyzing performance problems
- Designing system architecture
- Security analysis
- Explaining complex code behavior

**How to use:** Visit [claude.ai](https://claude.ai) or use the Claude API

## How It Works

### 1. Keyword Analysis
The system looks for specific keywords in your issue:
- Words like "refactor", "cleanup" → Sweep
- Words like "implement", "create" → Copilot  
- Words like "debug", "analyze" → Claude

### 2. Pattern Matching
It also uses regex patterns to identify intent:
- "make X more readable" → Sweep
- "create new component" → Copilot
- "fix bug in production" → Claude

### 3. AI Analysis
Claude AI provides additional analysis considering:
- Issue complexity
- Context and nuance
- Best tool fit

### 4. Scoring
Each tool gets points based on matches:
- Keyword match: 2 points
- Pattern match: 3 points
- Title keywords: 1.5x multiplier
- Complex issues (>500 chars): +1 for Claude

## Labels

The system automatically adds labels:
- `ai:sweep` - Recommended for Sweep
- `ai:copilot` - Recommended for Copilot
- `ai:claude` - Recommended for Claude
- Additional context labels like `refactoring`, `enhancement`, or `needs-analysis`

## Configuration

The triage rules can be customized in `.github/ai-triage-config.yml`:
- Add new keywords
- Define new patterns
- Adjust scoring weights
- Add custom rules

## Examples

### Issue: "Refactor auth module to use async/await"
- **Triaged to:** Sweep
- **Why:** Contains "refactor" keyword, maintenance task

### Issue: "Implement user dashboard with charts"
- **Triaged to:** Copilot
- **Why:** Contains "implement" keyword, new feature

### Issue: "Debug memory leak in production servers"
- **Triaged to:** Claude
- **Why:** Contains "debug" and "memory leak", complex issue

## Manual Override

The triage is just a recommendation. You can:
- Use any tool you prefer
- Remove/change labels
- Ignore the recommendation

## Privacy & Security

- Issue content is sent to Claude AI for analysis
- Only public issue data is processed
- API keys are stored as GitHub secrets
- No sensitive data is logged

## Troubleshooting

If the triage seems incorrect:
1. Check if the issue description is clear
2. Review the scoring breakdown in the comment
3. Manually select the appropriate tool
4. Consider updating the config file

## Contributing

To improve the triage system:
1. Edit `.github/ai-triage-config.yml` 
2. Add new keywords or patterns
3. Submit a PR with your improvements

The triage system learns from patterns, so well-written issues get better recommendations!