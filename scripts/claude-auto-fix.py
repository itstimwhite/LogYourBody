#!/usr/bin/env python3
"""
Claude Auto-Fix System

This script uses Claude to analyze GitHub issues and create fixes automatically.
It's triggered by the AI triage system for complex issues requiring deep analysis.
"""

import os
import json
import argparse
import subprocess
from typing import Dict, List, Optional
from github import Github
import anthropic

class ClaudeAutoFixer:
    def __init__(self, github_token: str, anthropic_api_key: str):
        self.github = Github(github_token)
        self.anthropic = anthropic.Anthropic(api_key=anthropic_api_key)
        
    def analyze_issue(self, repo_name: str, issue_number: int) -> Dict:
        """Fetch and analyze the GitHub issue"""
        repo = self.github.get_repo(repo_name)
        issue = repo.get_issue(issue_number)
        
        # Get repository context
        try:
            # Get recent commits for context
            commits = list(repo.get_commits()[:5])
            recent_changes = [f"- {c.commit.message}" for c in commits]
            
            # Get repository structure
            contents = repo.get_contents("")
            structure = [content.path for content in contents]
        except:
            recent_changes = []
            structure = []
        
        return {
            'issue': {
                'number': issue.number,
                'title': issue.title,
                'body': issue.body or "",
                'labels': [label.name for label in issue.labels],
                'created_at': issue.created_at.isoformat(),
            },
            'repo': {
                'name': repo.name,
                'description': repo.description,
                'language': repo.language,
                'recent_changes': recent_changes,
                'structure': structure[:20]  # First 20 files/dirs
            }
        }
    
    def generate_fix_plan(self, issue_data: Dict) -> Dict:
        """Use Claude to generate a fix plan"""
        prompt = f"""You are an expert software engineer tasked with fixing a GitHub issue.

Repository: {issue_data['repo']['name']}
Main Language: {issue_data['repo']['language']}

Issue Title: {issue_data['issue']['title']}
Issue Description: {issue_data['issue']['body']}

Repository Structure (top-level):
{json.dumps(issue_data['repo']['structure'], indent=2)}

Recent Changes:
{json.dumps(issue_data['repo']['recent_changes'], indent=2)}

Please analyze this issue and provide a detailed fix plan. Format your response as JSON:
{{
    "analysis": "Brief analysis of the issue",
    "fix_type": "bug|feature|refactor|documentation",
    "complexity": "low|medium|high",
    "files_to_modify": ["list", "of", "files"],
    "implementation_steps": [
        {{
            "step": 1,
            "description": "What to do",
            "code_changes": "Optional code snippet"
        }}
    ],
    "testing_required": true/false,
    "test_plan": "How to test the fix"
}}"""

        response = self.anthropic.messages.create(
            model="claude-3-opus-20240229",
            max_tokens=2000,
            messages=[{"role": "user", "content": prompt}]
        )
        
        # Extract JSON from response
        import re
        content = response.content[0].text
        json_match = re.search(r'\{.*\}', content, re.DOTALL)
        
        if json_match:
            try:
                return json.loads(json_match.group())
            except:
                return {"error": "Failed to parse Claude's response", "raw": content}
        
        return {"error": "No JSON found in response", "raw": content}
    
    def create_fix_branch(self, repo_name: str, issue_number: int) -> str:
        """Create a new branch for the fix"""
        branch_name = f"fix/issue-{issue_number}-claude-auto-fix"
        
        # Use git commands to create branch
        subprocess.run(["git", "checkout", "-b", branch_name], check=True)
        
        return branch_name
    
    def apply_fixes(self, fix_plan: Dict) -> List[str]:
        """Apply the fixes based on the plan"""
        modified_files = []
        
        for step in fix_plan.get('implementation_steps', []):
            # This is a simplified version - in reality, you'd need more sophisticated
            # code modification logic
            description = step.get('description', '')
            code_changes = step.get('code_changes', '')
            
            print(f"Step {step.get('step', 0)}: {description}")
            
            # Log what would be done
            if code_changes:
                print(f"Code changes suggested:\n{code_changes}")
        
        return modified_files
    
    def create_pull_request(self, repo_name: str, issue_number: int, 
                          branch_name: str, fix_plan: Dict) -> Optional[int]:
        """Create a pull request with the fixes"""
        repo = self.github.get_repo(repo_name)
        
        title = f"Fix #{issue_number}: {fix_plan.get('analysis', 'Automated fix')[:50]}"
        
        body = f"""## Automated Fix for Issue #{issue_number}

This PR was automatically generated by Claude AI to fix the reported issue.

### Analysis
{fix_plan.get('analysis', 'N/A')}

### Fix Type
- Type: {fix_plan.get('fix_type', 'unknown')}
- Complexity: {fix_plan.get('complexity', 'unknown')}

### Implementation Steps
"""
        
        for step in fix_plan.get('implementation_steps', []):
            body += f"\n{step.get('step', 0)}. {step.get('description', '')}"
        
        body += f"""

### Testing
- Testing Required: {fix_plan.get('testing_required', False)}
- Test Plan: {fix_plan.get('test_plan', 'N/A')}

### Files Modified
{chr(10).join(['- ' + f for f in fix_plan.get('files_to_modify', [])])}

---
*Generated by Claude AI Auto-Fix System*
Fixes #{issue_number}
"""
        
        try:
            # In a real implementation, you would:
            # 1. Commit the changes
            # 2. Push the branch
            # 3. Create the PR
            
            # For now, just add a comment to the issue
            issue = repo.get_issue(issue_number)
            issue.create_comment(f"""## 🤖 Claude Analysis Complete

{fix_plan.get('analysis', 'Analysis failed')}

**Fix Type:** {fix_plan.get('fix_type', 'unknown')}
**Complexity:** {fix_plan.get('complexity', 'unknown')}

### Suggested Implementation:
{chr(10).join([f"{s.get('step', 0)}. {s.get('description', '')}" for s in fix_plan.get('implementation_steps', [])])}

**Note:** Automatic PR creation is not yet implemented. A developer should implement these changes manually.
""")
            
            return None
        except Exception as e:
            print(f"Error creating PR: {e}")
            return None
    
    def fix_issue(self, repo_name: str, issue_number: int):
        """Main method to fix an issue"""
        print(f"Analyzing issue #{issue_number} in {repo_name}")
        
        # Analyze the issue
        issue_data = self.analyze_issue(repo_name, issue_number)
        
        # Generate fix plan
        print("Generating fix plan with Claude...")
        fix_plan = self.generate_fix_plan(issue_data)
        
        if 'error' in fix_plan:
            print(f"Error: {fix_plan['error']}")
            return
        
        print(f"Fix plan generated: {fix_plan.get('analysis', 'No analysis')}")
        
        # Create a comment with the analysis
        repo = self.github.get_repo(repo_name)
        issue = repo.get_issue(issue_number)
        issue.create_comment(f"""## 🧠 Claude AI Analysis

I've analyzed this issue and here's my assessment:

**Analysis:** {fix_plan.get('analysis', 'Analysis failed')}

**Fix Type:** {fix_plan.get('fix_type', 'unknown')}
**Complexity:** {fix_plan.get('complexity', 'unknown')}
**Files to Modify:** {', '.join(fix_plan.get('files_to_modify', ['Unknown']))}

### Implementation Plan:
{chr(10).join([f"{s.get('step', 0)}. {s.get('description', '')}" for s in fix_plan.get('implementation_steps', [])])}

### Testing:
{fix_plan.get('test_plan', 'No specific test plan provided')}

---
*This analysis was generated by Claude AI. A human developer should review and implement these suggestions.*
""")


def main():
    parser = argparse.ArgumentParser(description='Fix GitHub issues using Claude AI')
    parser.add_argument('--issue-number', type=int, required=True, help='Issue number to fix')
    parser.add_argument('--repo', required=True, help='Repository in format owner/name')
    args = parser.parse_args()
    
    # Get API keys from environment
    github_token = os.environ.get('GITHUB_TOKEN')
    anthropic_api_key = os.environ.get('ANTHROPIC_API_KEY')
    
    if not github_token or not anthropic_api_key:
        print("Error: Missing required API keys")
        return 1
    
    # Create fixer and process issue
    fixer = ClaudeAutoFixer(github_token, anthropic_api_key)
    fixer.fix_issue(args.repo, args.issue_number)
    
    return 0


if __name__ == '__main__':
    exit(main())