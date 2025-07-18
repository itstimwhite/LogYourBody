import os
import json
import anthropic

# Load alerts
with open('codeql-alerts.json', 'r') as f:
    alerts = json.load(f)

# Filter to high severity issues only
high_severity = [a for a in alerts if a.get('security_severity') in ['critical', 'high'] or a.get('severity') == 'error']

if not high_severity:
    print("No high severity issues to fix")
    exit(0)

print(f"Found {len(high_severity)} high severity issues")

# Initialize Claude
client = anthropic.Anthropic(api_key=os.environ['ANTHROPIC_API_KEY'])

fixes = []

for alert in high_severity[:5]:  # Limit to 5 fixes per run
    print(f"\nProcessing {alert['file']}:{alert['line']} - {alert['rule']}")
    
    # Read file
    try:
        with open(alert['file'], 'r') as f:
            lines = f.readlines()
        
        # Get context
        start = max(0, alert['line'] - 10)
        end = min(len(lines), alert['line'] + 10)
        context = ''.join(lines[start:end])
        
        # Ask Claude for fix
        prompt = f"""Fix this security issue:
Rule: {alert['rule']}
File: {alert['file']}
Line: {alert['line']}
Issue: {alert['message']}

Code context:
```
{context}
```

Provide a minimal fix. Return JSON: {{"old": "exact text to replace", "new": "replacement text", "explanation": "why"}}"""
        
        response = client.messages.create(
            model="claude-3-haiku-20240307",
            max_tokens=500,
            messages=[{"role": "user", "content": prompt}]
        )
        
        # Parse response
        import re
        json_match = re.search(r'\{.*\}', response.content[0].text, re.DOTALL)
        if json_match:
            fix = json.loads(json_match.group())
            
            # Apply fix
            content = ''.join(lines)
            if fix['old'] in content:
                new_content = content.replace(fix['old'], fix['new'], 1)
                with open(alert['file'], 'w') as f:
                    f.write(new_content)
                print(f"✓ Fixed: {fix['explanation']}")
                fixes.append({**alert, 'fix': fix})
            else:
                print("✗ Could not find code to replace")
                
    except Exception as e:
        print(f"✗ Error: {str(e)}")

# Save summary
with open('fixes-applied.json', 'w') as f:
    json.dump(fixes, f, indent=2)

print(f"\nApplied {len(fixes)} fixes")
