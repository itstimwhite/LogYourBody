#!/usr/bin/env python3
"""
Fix CodeQL issues using Claude AI
"""

import os
import sys
import json
import subprocess
import argparse
from pathlib import Path
from typing import List, Dict, Any

try:
    import anthropic
except ImportError:
    print("Error: anthropic package not installed")
    print("Run: pip install anthropic")
    sys.exit(1)

def get_codeql_results(sarif_file: str = None) -> List[Dict[str, Any]]:
    """Parse CodeQL SARIF results"""
    if not sarif_file:
        # Try to find the latest SARIF file
        sarif_files = list(Path('.').glob('**/*.sarif'))
        if not sarif_files:
            print("No SARIF files found")
            return []
        sarif_file = max(sarif_files, key=os.path.getctime)
    
    with open(sarif_file, 'r') as f:
        sarif = json.load(f)
    
    issues = []
    for run in sarif.get('runs', []):
        for result in run.get('results', []):
            rule = result.get('ruleId', 'unknown')
            message = result.get('message', {}).get('text', '')
            
            for location in result.get('locations', []):
                physical_location = location.get('physicalLocation', {})
                artifact = physical_location.get('artifactLocation', {})
                region = physical_location.get('region', {})
                
                issue = {
                    'rule': rule,
                    'message': message,
                    'file': artifact.get('uri', ''),
                    'line': region.get('startLine', 0),
                    'column': region.get('startColumn', 0),
                    'severity': result.get('level', 'warning')
                }
                issues.append(issue)
    
    return issues

def get_file_context(file_path: str, line: int, context_lines: int = 10) -> str:
    """Get code context around a specific line"""
    try:
        with open(file_path, 'r') as f:
            lines = f.readlines()
        
        start = max(0, line - context_lines - 1)
        end = min(len(lines), line + context_lines)
        
        context = []
        for i in range(start, end):
            prefix = ">>> " if i == line - 1 else "    "
            context.append(f"{i+1:4d}{prefix}{lines[i].rstrip()}")
        
        return '\n'.join(context)
    except Exception as e:
        return f"Error reading file: {str(e)}"

def fix_issue_with_claude(client: anthropic.Anthropic, issue: Dict[str, Any]) -> Dict[str, Any]:
    """Use Claude to analyze and fix a security issue"""
    
    context = get_file_context(issue['file'], issue['line'])
    
    prompt = f"""You are a security expert fixing CodeQL issues.

File: {issue['file']}
Line: {issue['line']}
Rule: {issue['rule']}
Message: {issue['message']}
Severity: {issue['severity']}

Code context (>>> marks the problematic line):
```
{context}
```

Please analyze this security issue and provide a fix. Consider:
1. What is the security vulnerability?
2. How can it be exploited?
3. What is the secure way to fix it?

Provide your response in this JSON format:
{{
    "vulnerability": "Brief description of the security issue",
    "impact": "Potential security impact",
    "fix_explanation": "How to fix it",
    "old_code": "The exact line(s) to replace",
    "new_code": "The secure replacement code"
}}

Important: Only include the minimal code changes needed. Keep the fix focused and don't change unrelated code."""

    try:
        response = client.messages.create(
            model="claude-3-sonnet-20241022",
            max_tokens=1500,
            temperature=0,
            messages=[{"role": "user", "content": prompt}]
        )
        
        # Extract JSON from response
        response_text = response.content[0].text
        
        # Try to parse JSON from the response
        import re
        json_match = re.search(r'\{[\s\S]*\}', response_text)
        if json_match:
            fix_data = json.loads(json_match.group())
            return {
                'success': True,
                'issue': issue,
                'fix': fix_data
            }
        else:
            return {
                'success': False,
                'issue': issue,
                'error': 'Could not parse JSON response'
            }
            
    except Exception as e:
        return {
            'success': False,
            'issue': issue,
            'error': str(e)
        }

def apply_fix(file_path: str, old_code: str, new_code: str) -> bool:
    """Apply a code fix to a file"""
    try:
        with open(file_path, 'r') as f:
            content = f.read()
        
        if old_code not in content:
            print(f"Warning: Could not find code to replace in {file_path}")
            return False
        
        new_content = content.replace(old_code, new_code, 1)
        
        with open(file_path, 'w') as f:
            f.write(new_content)
        
        return True
    except Exception as e:
        print(f"Error applying fix to {file_path}: {str(e)}")
        return False

def main():
    parser = argparse.ArgumentParser(description='Fix CodeQL issues with Claude AI')
    parser.add_argument('--sarif', help='Path to SARIF file with CodeQL results')
    parser.add_argument('--limit', type=int, default=10, help='Maximum number of issues to fix')
    parser.add_argument('--dry-run', action='store_true', help='Show fixes without applying them')
    parser.add_argument('--api-key', help='Anthropic API key (or set ANTHROPIC_API_KEY env var)')
    
    args = parser.parse_args()
    
    # Get API key
    api_key = args.api_key or os.environ.get('ANTHROPIC_API_KEY')
    if not api_key:
        print("Error: No API key provided. Set ANTHROPIC_API_KEY or use --api-key")
        sys.exit(1)
    
    # Initialize Claude client
    client = anthropic.Anthropic(api_key=api_key)
    
    # Get CodeQL issues
    issues = get_codeql_results(args.sarif)
    if not issues:
        print("No issues found in SARIF file")
        return
    
    print(f"Found {len(issues)} CodeQL issues")
    
    # Limit issues to process
    issues_to_fix = issues[:args.limit]
    print(f"Processing {len(issues_to_fix)} issues...")
    
    # Process each issue
    fixes_applied = []
    fixes_failed = []
    
    for i, issue in enumerate(issues_to_fix, 1):
        print(f"\n[{i}/{len(issues_to_fix)}] Processing {issue['file']}:{issue['line']} - {issue['rule']}")
        
        # Skip if file doesn't exist
        if not os.path.exists(issue['file']):
            print(f"  Skipping - file not found")
            fixes_failed.append({'issue': issue, 'error': 'File not found'})
            continue
        
        # Get fix from Claude
        result = fix_issue_with_claude(client, issue)
        
        if not result['success']:
            print(f"  Failed to get fix: {result['error']}")
            fixes_failed.append(result)
            continue
        
        fix = result['fix']
        print(f"  Vulnerability: {fix['vulnerability']}")
        print(f"  Impact: {fix['impact']}")
        print(f"  Fix: {fix['fix_explanation']}")
        
        if args.dry_run:
            print("  [DRY RUN] Would apply fix:")
            print(f"  Old: {fix['old_code']}")
            print(f"  New: {fix['new_code']}")
        else:
            # Apply the fix
            if apply_fix(issue['file'], fix['old_code'], fix['new_code']):
                print("  ✓ Fix applied successfully")
                fixes_applied.append(result)
            else:
                print("  ✗ Failed to apply fix")
                fixes_failed.append(result)
    
    # Summary
    print(f"\n{'='*60}")
    print(f"Summary:")
    print(f"  Total issues found: {len(issues)}")
    print(f"  Issues processed: {len(issues_to_fix)}")
    print(f"  Fixes applied: {len(fixes_applied)}")
    print(f"  Fixes failed: {len(fixes_failed)}")
    
    # Save results
    results = {
        'fixes_applied': fixes_applied,
        'fixes_failed': fixes_failed
    }
    
    with open('codeql_fixes_summary.json', 'w') as f:
        json.dump(results, f, indent=2)
    
    print(f"\nResults saved to codeql_fixes_summary.json")

if __name__ == '__main__':
    main()