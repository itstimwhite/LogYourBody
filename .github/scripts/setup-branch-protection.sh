#!/bin/bash

# Script to set up branch protection rules for dev branch
# Run with: gh api graphql -f query=@setup-branch-protection.graphql

cat > setup-branch-protection.graphql << 'EOF'
mutation {
  createBranchProtectionRule(input: {
    repositoryId: "REPLACE_WITH_REPO_ID",
    pattern: "dev",
    requiresApprovingReviews: true,
    requiredApprovingReviewCount: 1,
    dismissesStaleReviews: true,
    requiresStatusChecks: true,
    requiresStrictStatusChecks: true,
    requiredStatusCheckContexts: [
      "iOS PR Verify / Rapid Checks",
      "CodeQL / Analyze (javascript)",
      "lint"
    ],
    requiresConversationResolution: true,
    requiresLinearHistory: false,
    allowsForcePushes: false,
    allowsDeletions: false,
    isAdminEnforced: false,
    requiresCodeOwnerReviews: false,
    requiresCommitSignatures: false,
    requiresDeployments: false,
    viewerCannotUpdateReasons: []
  }) {
    branchProtectionRule {
      id
      pattern
    }
  }
}
EOF

echo "To apply branch protection rules:"
echo "1. Get your repository ID: gh api repos/:owner/:repo --jq .node_id"
echo "2. Replace REPLACE_WITH_REPO_ID in setup-branch-protection.graphql"
echo "3. Run: gh api graphql -f query=@setup-branch-protection.graphql"