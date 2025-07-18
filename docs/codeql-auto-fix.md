# CodeQL Auto-Fix with Claude AI

This repository includes automated workflows to fix CodeQL security issues using Claude AI.

## Overview

We have three approaches for fixing CodeQL issues:

### 1. Manual Script (`scripts/fix-codeql-issues.py`)
A Python script that can be run locally to fix CodeQL issues:

```bash
# Install dependencies
pip install anthropic

# Set API key
export ANTHROPIC_API_KEY=your_api_key

# Run the script
python scripts/fix-codeql-issues.py --sarif path/to/results.sarif --limit 5
```

Options:
- `--sarif`: Path to SARIF file with CodeQL results
- `--limit`: Maximum number of issues to fix (default: 10)
- `--dry-run`: Show fixes without applying them
- `--api-key`: Anthropic API key (or use env var)

### 2. Automated Workflow (`codeql-auto-fix.yml`)
Runs automatically after CodeQL analysis completes:
- Triggers on successful CodeQL scans
- Fixes only high/critical severity issues
- Creates a PR with fixes for review
- Limited to 5 fixes per run to keep PRs manageable

### 3. On-Demand Workflow (`codeql-claude-fix.yml`)
A more comprehensive workflow that can be triggered manually:
- Supports fixing up to 10 issues at once
- Includes detailed explanations for each fix
- Runs tests after applying fixes
- Creates detailed PRs with fix summaries

## Setup

1. **Add Anthropic API Key**:
   ```bash
   gh secret set ANTHROPIC_API_KEY
   ```

2. **Enable Workflows**:
   The workflows are already in `.github/workflows/`

3. **Configure Permissions**:
   Ensure the repository has:
   - Code scanning alerts: Read
   - Contents: Write
   - Pull requests: Write

## How It Works

1. **Issue Detection**:
   - Reads CodeQL alerts from GitHub Security tab
   - Prioritizes by severity (critical > high > medium > low)
   - Focuses on actual security issues, not style issues

2. **Analysis with Claude**:
   - Sends code context to Claude AI
   - Claude analyzes the security vulnerability
   - Provides minimal, focused fixes

3. **Fix Application**:
   - Applies only the necessary changes
   - Preserves functionality
   - Follows secure coding practices

4. **Review Process**:
   - Creates a PR with all fixes
   - Includes explanations for each change
   - Requires human review before merging

## Security Considerations

- API keys are stored as GitHub secrets
- Claude only sees code snippets, not entire files
- Fixes are reviewed before merging
- Original code is preserved in git history

## Best Practices

1. **Review All Changes**: Always review automated fixes carefully
2. **Test Thoroughly**: Ensure fixes don't break functionality
3. **Incremental Fixes**: Fix a few issues at a time
4. **Monitor Results**: Check that issues are actually resolved

## Limitations

- Cannot fix all types of security issues
- Some fixes may require architectural changes
- Complex issues need human intervention
- Rate limited by API quotas

## Troubleshooting

If fixes fail:
1. Check the workflow logs
2. Verify API key is set correctly
3. Ensure files are accessible
4. Check if the issue requires manual intervention

## Examples

### Example Fix for SQL Injection:
```python
# Before (vulnerable)
query = f"SELECT * FROM users WHERE id = {user_id}"

# After (fixed by Claude)
query = "SELECT * FROM users WHERE id = ?"
cursor.execute(query, (user_id,))
```

### Example Fix for XSS:
```javascript
// Before (vulnerable)
element.innerHTML = userInput;

// After (fixed by Claude)
element.textContent = userInput;
```

## Contributing

To improve the auto-fix system:
1. Enhance prompt engineering in the scripts
2. Add more test cases
3. Improve error handling
4. Add support for more languages

## Support

For issues with the auto-fix system:
- Check workflow logs
- Review created PRs
- Open an issue if fixes are incorrect