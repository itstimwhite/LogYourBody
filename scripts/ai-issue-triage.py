#!/usr/bin/env python3
"""
AI Issue Triage System

This script analyzes GitHub issues and triages them to the most appropriate AI tool:
- Sweep: For refactoring, code cleanup, and simple feature additions
- Copilot: For code generation and implementation tasks
- Claude: For complex architectural decisions, debugging, and analysis
"""

import os
import json
import argparse
import re
import yaml
from typing import Dict, List, Tuple, Optional
from github import Github
import anthropic

class IssueTriager:
    def __init__(self, github_token: str, anthropic_api_key: str, config_path: Optional[str] = None):
        self.github = Github(github_token)
        self.anthropic = anthropic.Anthropic(api_key=anthropic_api_key)
        
        # Load configuration
        if config_path and os.path.exists(config_path):
            with open(config_path, 'r') as f:
                config = yaml.safe_load(f)
                self.tool_criteria = self._parse_config(config)
                self.scoring_config = config.get('scoring', {})
                self.rules = config.get('rules', [])
        else:
            # Fallback to default configuration
            self.tool_criteria = self._get_default_config()
            self.scoring_config = {
                'keyword_match': 2,
                'pattern_match': 3,
                'title_weight': 1.5,
                'complexity_threshold': 500
            }
            self.rules = []
    
    def _parse_config(self, config: Dict) -> Dict:
        """Parse the YAML configuration into tool criteria"""
        criteria = {}
        for tool_name, tool_config in config.get('tools', {}).items():
            criteria[tool_name] = {
                'keywords': tool_config.get('keywords', []),
                'patterns': tool_config.get('patterns', []),
                'description': tool_config.get('description', ''),
                'label': tool_config.get('label', f'ai:{tool_name}'),
                'examples': tool_config.get('examples', [])
            }
        return criteria
    
    def _get_default_config(self) -> Dict:
        """Get default configuration if no config file is provided"""
        return {
            'sweep': {
                'keywords': ['refactor', 'cleanup', 'organize', 'rename', 'move', 'extract', 
                           'simplify', 'optimize performance', 'remove duplicate', 'update dependencies'],
                'patterns': [
                    r'make.*more.*readable',
                    r'improve.*code.*quality',
                    r'follow.*best.*practices',
                    r'add.*tests.*for',
                    r'update.*documentation'
                ],
                'description': 'Best for code refactoring, cleanup, and maintenance tasks',
                'label': 'ai:sweep'
            },
            'copilot': {
                'keywords': ['implement', 'create', 'add feature', 'build', 'generate', 
                           'new component', 'api endpoint', 'integrate'],
                'patterns': [
                    r'create.*new.*(?:component|service|function)',
                    r'implement.*(?:feature|functionality)',
                    r'add.*support.*for',
                    r'generate.*code.*for'
                ],
                'description': 'Best for implementing new features and generating code',
                'label': 'ai:copilot'
            },
            'claude': {
                'keywords': ['debug', 'fix bug', 'analyze', 'investigate', 'architecture', 
                           'design', 'complex', 'performance issue', 'security', 'explain'],
                'patterns': [
                    r'(?:debug|fix).*(?:error|bug|issue)',
                    r'analyze.*(?:performance|security|architecture)',
                    r'investigate.*problem',
                    r'design.*system',
                    r'explain.*how.*works'
                ],
                'description': 'Best for complex debugging, architectural decisions, and deep analysis',
                'label': 'ai:claude'
            }
        }
    
    def analyze_issue(self, issue_title: str, issue_body: str) -> Dict:
        """Analyze issue content and determine the best AI tool"""
        combined_text = f"{issue_title} {issue_body}".lower()
        title_text = issue_title.lower()
        
        # Initialize scores for all tools
        scores = {tool: 0 for tool in self.tool_criteria.keys()}
        
        # Score based on keywords
        for tool, criteria in self.tool_criteria.items():
            for keyword in criteria['keywords']:
                # Check title (weighted higher)
                if keyword in title_text:
                    scores[tool] += self.scoring_config.get('keyword_match', 2) * self.scoring_config.get('title_weight', 1.5)
                # Check body
                elif keyword in combined_text:
                    scores[tool] += self.scoring_config.get('keyword_match', 2)
            
            # Score based on patterns
            for pattern in criteria['patterns']:
                if re.search(pattern, combined_text, re.IGNORECASE):
                    scores[tool] += self.scoring_config.get('pattern_match', 3)
        
        # Apply custom rules
        for rule in self.rules:
            if self._evaluate_rule_condition(rule['condition'], combined_text, issue_body):
                if rule['action'] == 'add_points':
                    tool = rule['tool']
                    if tool in scores:
                        scores[tool] += rule.get('points', 1)
        
        # Complexity bonus
        if len(issue_body) > self.scoring_config.get('complexity_threshold', 500):
            if 'claude' in scores:
                scores['claude'] += 1
        
        # Use Claude to provide a more nuanced analysis
        prompt = f"""Analyze this GitHub issue and determine which AI tool would be most appropriate:

Issue Title: {issue_title}
Issue Body: {issue_body}

Available tools:
1. Sweep: {self.tool_criteria['sweep']['description']}
2. Copilot: {self.tool_criteria['copilot']['description']}
3. Claude: {self.tool_criteria['claude']['description']}

Current scores based on keyword analysis:
- Sweep: {scores['sweep']}
- Copilot: {scores['copilot']}
- Claude: {scores['claude']}

Provide a brief analysis and recommendation. Format your response as JSON:
{{
    "recommended_tool": "sweep|copilot|claude",
    "confidence": "high|medium|low",
    "reasoning": "brief explanation",
    "alternative_tool": "optional second choice"
}}"""

        try:
            response = self.anthropic.messages.create(
                model="claude-3-haiku-20240307",
                max_tokens=500,
                messages=[{"role": "user", "content": prompt}]
            )
            
            # Extract JSON from response
            content = response.content[0].text
            json_match = re.search(r'\{.*\}', content, re.DOTALL)
            if json_match:
                ai_analysis = json.loads(json_match.group())
                return {
                    'scores': scores,
                    'ai_analysis': ai_analysis,
                    'recommended_tool': ai_analysis.get('recommended_tool', max(scores, key=scores.get))
                }
        except Exception as e:
            print(f"Error getting AI analysis: {e}")
        
        # Fallback to highest score
        recommended = max(scores, key=scores.get)
        return {
            'scores': scores,
            'recommended_tool': recommended
        }
    
    def _evaluate_rule_condition(self, condition: str, combined_text: str, issue_body: str) -> bool:
        """Evaluate a custom rule condition"""
        if condition == 'contains_error_logs':
            return '```' in issue_body and ('error' in combined_text or 'exception' in combined_text)
        elif condition == 'mentions_tests':
            return 'test' in combined_text or 'spec' in combined_text
        elif condition == 'has_code_snippet':
            return '```' in issue_body
        elif condition == 'mentions_ui_ux':
            return any(term in combined_text for term in ['ui', 'ux', 'frontend', 'component', 'design'])
        return False
    
    def generate_triage_comment(self, analysis: Dict, issue_title: str) -> str:
        """Generate a comment explaining the triage decision"""
        tool = analysis['recommended_tool']
        scores = analysis['scores']
        ai_analysis = analysis.get('ai_analysis', {})
        
        comment = f"""## 🤖 AI Issue Triage

This issue has been automatically analyzed and triaged.

**Recommended AI Tool: `{tool.upper()}`**

"""
        
        if ai_analysis:
            comment += f"**Confidence:** {ai_analysis.get('confidence', 'medium').capitalize()}\n\n"
            comment += f"**Analysis:** {ai_analysis.get('reasoning', 'Based on keyword and pattern matching.')}\n\n"
            
            if ai_analysis.get('alternative_tool'):
                comment += f"**Alternative:** You might also consider using `{ai_analysis['alternative_tool'].upper()}` for this issue.\n\n"
        
        comment += "### Scoring Breakdown\n"
        for t, score in scores.items():
            emoji = "✅" if t == tool else "◻️"
            comment += f"- {emoji} **{t.capitalize()}**: {score} points\n"
        
        comment += f"\n### How to use {tool.capitalize()}\n\n"
        
        if tool == 'sweep':
            comment += """To use Sweep for this issue:
1. Comment `@sweep` followed by instructions
2. Sweep will create a PR with the requested changes
3. Review and merge the PR

Example: `@sweep refactor the authentication module to use async/await`"""
        
        elif tool == 'copilot':
            comment += """To use GitHub Copilot for this issue:
1. Open the relevant files in your IDE with Copilot enabled
2. Start typing a comment describing what you want to implement
3. Copilot will suggest code completions
4. Use Copilot Chat for more complex implementations"""
        
        elif tool == 'claude':
            comment += """To use Claude for this issue:
1. Visit https://claude.ai or use the Claude API
2. Provide the issue context and any relevant code
3. Ask Claude to analyze the problem and suggest solutions
4. Iterate on the solution with follow-up questions"""
        
        comment += "\n\n---\n*This is an automated triage. Feel free to use a different tool if you prefer.*"
        
        return comment
    
    def get_labels_for_tool(self, tool: str) -> List[str]:
        """Get appropriate labels for the recommended tool"""
        labels = []
        
        # Add tool-specific label from config
        if tool in self.tool_criteria:
            label = self.tool_criteria[tool].get('label', f'ai:{tool}')
            labels.append(label)
        
        # Add additional context labels
        if tool == 'sweep':
            labels.append('refactoring')
        elif tool == 'copilot':
            labels.append('enhancement')
        elif tool == 'claude':
            labels.append('needs-analysis')
        
        return labels
    
    def triage_issue(self, repo_name: str, issue_number: int) -> Dict:
        """Main method to triage an issue"""
        repo = self.github.get_repo(repo_name)
        issue = repo.get_issue(issue_number)
        
        # Analyze the issue
        analysis = self.analyze_issue(issue.title, issue.body or "")
        
        # Generate comment
        comment = self.generate_triage_comment(analysis, issue.title)
        
        # Get labels
        labels = self.get_labels_for_tool(analysis['recommended_tool'])
        
        return {
            'recommended_tool': analysis['recommended_tool'],
            'analysis': analysis,
            'comment': comment,
            'labels': labels,
            'issue_number': issue_number,
            'issue_title': issue.title,
            'issue_body': issue.body or ""
        }


def main():
    parser = argparse.ArgumentParser(description='Triage GitHub issues to appropriate AI tools')
    parser.add_argument('--issue-number', type=int, required=True, help='Issue number to triage')
    parser.add_argument('--repo', required=True, help='Repository in format owner/name')
    args = parser.parse_args()
    
    # Get API keys from environment
    github_token = os.environ.get('GITHUB_TOKEN')
    anthropic_api_key = os.environ.get('ANTHROPIC_API_KEY')
    
    if not github_token or not anthropic_api_key:
        print("Error: Missing required API keys")
        return 1
    
    # Look for config file
    config_path = '.github/ai-triage-config.yml'
    if not os.path.exists(config_path):
        # Try from script directory perspective
        config_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.github/ai-triage-config.yml')
    
    # Create triager and process issue
    triager = IssueTriager(github_token, anthropic_api_key, config_path)
    result = triager.triage_issue(args.repo, args.issue_number)
    
    # Write result to file for the workflow to read
    with open('triage-result.json', 'w') as f:
        json.dump(result, f, indent=2)
    
    print(f"Issue triaged to: {result['recommended_tool']}")
    return 0


if __name__ == '__main__':
    exit(main())