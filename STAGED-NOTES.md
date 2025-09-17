# Staged Notes System

The Staged Notes System addresses the core limitation identified in AI commit message generators: **the lack of context beyond the code diff**. This feature allows developers to add business context, issue references, and reasoning that the diff alone cannot provide.

## The Problem

AI tools that only analyze diffs miss crucial context:

**Example:** Changing `"foolib": "^1.0.0"` to `"foolib": "1.0.0"` (one character change)

**AI would generate:** `"chore: pin foolib dependency version"`

**Human would write:**
```
Fix $x in $browser

Upgrading to $lib v1.0.1 causes $x in $browser. We're pinning to v1.0.0 until
upstream bug #123 is fixed. Unpinning this dependency is tracked as #789.

See: https://example.com/some-blog/article-about-bug
See: https://github.com/them/upstream-repo/issues/123
See: https://github.com/us/our-repo/issues/789

Resolves: #456
```

## The Solution: Staged Notes

The Staged Notes System allows developers to add contextual information before committing, which the AI then incorporates into the commit message generation.

## Usage

### Adding Notes

```bash
# Add context about why the change was made
genius --note "Pinning foolib to v1.0.0 due to browser bug in v1.0.1"

# Add issue references
genius --note "See upstream issue: https://github.com/them/repo/issues/123"

# Add resolution information
genius --note "Resolves: #456"

# Add browser/environment context
genius --note "Affects Chrome users on macOS"
```

### Managing Notes

```bash
# List all staged notes
genius --list-notes

# Clear all notes
genius --clear-notes
```

### Generating Commits with Notes

```bash
# Generate commit message using staged notes for context
genius

# The AI will incorporate your notes into the commit message
```

## Workflow Examples

### Example 1: Dependency Bug Fix

```bash
# Make the change
echo '"foolib": "1.0.0"' > package.json
git add package.json

# Add context notes
genius --note "Pinning foolib to v1.0.0 due to browser bug in v1.0.1"
genius --note "Bug affects Chrome users on login page"
genius --note "See upstream issue: https://github.com/foolib/issues/123"
genius --note "Resolves: #456"

# Generate contextual commit
genius
# Output: "fix: pin foolib to v1.0.0 due to Chrome login bug"
```

### Example 2: Feature Implementation

```bash
# Make changes
git add src/auth/

# Add context
genius --note "Implements OAuth2 flow for enterprise customers"
genius --note "Supports SAML and OIDC providers"
genius --note "Closes: #789"

# Generate commit
genius
# Output: "feat: implement OAuth2 authentication for enterprise"
```

### Example 3: Performance Fix

```bash
# Make optimization changes
git add src/database/

# Add context
genius --note "Optimizes query performance for large datasets"
genius --note "Reduces load time from 5s to 500ms"
genius --note "Addresses customer complaints in #234"

# Generate commit
genius
# Output: "perf: optimize database queries for large datasets"
```

## How It Works

1. **Storage**: Notes are stored in `.git/commit-genius-notes.json` (git-specific, not committed)
2. **Repository-specific**: Notes are tied to the current repository
3. **AI Integration**: Notes are included in the AI prompt for context
4. **Auto-cleanup**: Notes are cleared after successful commit
5. **Persistence**: Notes persist across command calls until commit or manual clear

## Advanced Usage

### Workflow Integration

```bash
# Team workflow with Jira
git checkout -b feature/JR-1234-auth-fix
git add .
genius --note "Fixes authentication timeout in production"
genius --note "Affects enterprise customers using SSO"
genius --note "Resolves: JR-1234"
genius
# Output: "[JR-1234] fix: resolve authentication timeout for SSO users"
```

### Multiple Context Sources

```bash
# Add various types of context
genius --note "Business context: Critical for Q4 launch"
genius --note "Technical context: Refactors legacy authentication"
genius --note "Issue reference: Closes #456, #789"
genius --note "Testing: Verified on staging environment"
genius --note "Documentation: Updated in /docs/auth.md"
```

## Benefits

### For Developers
- ✅ **Rich context**: Add business reasoning, not just technical changes
- ✅ **Issue tracking**: Link commits to tickets, bugs, documentation
- ✅ **Team communication**: Explain decisions for future developers
- ✅ **Workflow integration**: Works with existing git/issue tracking workflows

### For Teams
- ✅ **Better commit history**: Meaningful messages that explain "why"
- ✅ **Improved debugging**: Context helps when investigating issues
- ✅ **Knowledge transfer**: Captures reasoning for future team members
- ✅ **Compliance**: Links to requirements, tickets, and documentation

### For AI Generation
- ✅ **Context-aware**: AI has business context, not just code changes
- ✅ **Accurate messages**: Incorporates human knowledge and reasoning
- ✅ **Relevant details**: Includes browser, environment, and impact information
- ✅ **Proper attribution**: Links to issues, documentation, and upstream sources

## Technical Details

### File Location
- **Path**: `.git/commit-genius-notes.json`
- **Format**: JSON with notes array and repository path
- **Cleanup**: Automatically removed after successful commit
- **Scope**: Repository-specific, not shared across projects

### Note Structure
```json
{
  "notes": [
    {
      "message": "Pinning foolib to v1.0.0 due to browser bug in v1.0.1",
      "timestamp": "2024-01-15T10:30:00.000Z"
    }
  ],
  "repository": "/path/to/current/repo"
}
```

### AI Prompt Enhancement
When notes exist, the AI prompt includes:
```
ADDITIONAL CONTEXT FROM DEVELOPER NOTES:
- Pinning foolib to v1.0.0 due to browser bug in v1.0.1
- See upstream issue: https://github.com/them/repo/issues/123
- Resolves: #456

Use this context to write a more meaningful commit message that explains WHY the change was made, not just WHAT changed.
```

## Comparison: Before vs After

### Before (Diff-only Analysis)
```bash
# Change: "foolib": "^1.0.0" → "foolib": "1.0.0"
genius
# Output: "chore: pin foolib dependency version"
```

### After (With Staged Notes)
```bash
# Same change, but with context
genius --note "Pinning due to Chrome bug in v1.0.1"
genius --note "Resolves: #456"
genius
# Output: "fix: pin foolib to v1.0.0 due to Chrome bug"
```

The Staged Notes System transforms AI commit message generation from mechanical diff description to contextual, meaningful commit messages that capture the full story behind code changes.
