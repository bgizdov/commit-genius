# Regenerate Last Commit Message

The `--regenerate` feature allows you to improve the last commit message using AI analysis. This is useful when you realize after committing that your message could be clearer, more descriptive, or include additional context.

## Usage

### Basic Regeneration
```bash
# Regenerate the last commit message
genius --regenerate
genius -r
```

### Preview Mode
```bash
# See what the new message would be without changing the commit
genius --regenerate --dry-run
genius -r -d
```

### With Additional Context
```bash
# Add context notes before regenerating
genius --note "This fixes the critical production bug"
genius --note "Resolves: #456"
genius --regenerate
```

## How It Works

1. **Analyzes last commit**: Retrieves the diff and current message from `git show HEAD`
2. **Applies staged notes**: Uses any existing staged notes for additional context
3. **Generates new message**: Creates an improved commit message with AI
4. **Amends commit**: Uses `git commit --amend` to update the message
5. **Clears notes**: Removes staged notes after successful amendment (if any were used)

## Workflow Examples

### Example 1: Improve Vague Message
```bash
# You made a hasty commit
git commit -m "fix stuff"

# Later, regenerate with better AI analysis
genius --regenerate

# Before: "fix stuff"
# After:  "fix: resolve authentication timeout in user login flow"
```

### Example 2: Add Missing Context
```bash
# Original commit
git log --oneline -1
# abc1234 update dependencies

# Add context and regenerate
genius --note "Resolves security vulnerability CVE-2024-1234"
genius --note "Closes: #789"
genius --regenerate

# Before: "update dependencies"
# After:  "fix(deps): update dependencies to resolve CVE-2024-1234 (closes #789)"
```

### Example 3: Preview Before Committing
```bash
# See what the regenerated message would look like
genius --note "Performance optimization for large datasets"
genius --regenerate --dry-run

# Output shows proposed new message
# If satisfied, run without --dry-run to apply
genius --regenerate
```

### Example 4: Fix Conventional Commit Format
```bash
# Original non-conventional commit
git commit -m "added new feature for users"

# Regenerate to follow conventional commits
genius --regenerate

# Before: "added new feature for users"
# After:  "feat: add user profile management system"
```

## Use Cases

### 🔧 **Development Workflow**
- **Hasty commits**: Fix messages written in a hurry during development
- **Missing details**: Add technical context that wasn't obvious initially
- **Format consistency**: Ensure commits follow conventional commit format

### 👥 **Team Collaboration**
- **Code review prep**: Improve messages before pushing to shared branches
- **Documentation**: Make commit history more readable for team members
- **Issue tracking**: Add missing ticket references and links

### 🚀 **Release Management**
- **Changelog generation**: Ensure commits are descriptive for automated changelogs
- **Git history**: Maintain clean, professional commit history
- **Debugging**: Make it easier to understand changes when investigating issues

## Benefits

- ✅ **Retroactive improvement**: Fix poor commit messages after committing
- ✅ **Context integration**: Works with staged notes for rich context
- ✅ **Safe preview**: Use `--dry-run` to see changes before applying
- ✅ **AI-powered**: Leverages same AI analysis as regular commits
- ✅ **Git integration**: Uses proper `git commit --amend` for clean history
- ✅ **Flexible**: Works with or without additional context notes

## Safety and Limitations

### ✅ **Safe Operations**
- **Local only**: Only affects your local repository
- **Reflog backup**: Original commit is preserved in git reflog
- **Preview mode**: `--dry-run` lets you see changes before applying
- **Single commit**: Only affects the most recent commit

### ⚠️ **Important Notes**
- **Unpushed commits**: Best used on commits not yet pushed to remote
- **Shared branches**: Be cautious when amending commits on shared branches
- **History rewriting**: Uses `git commit --amend` which rewrites commit hash
- **Staged changes**: Requires clean working directory (no staged changes)

### 🚫 **Limitations**
- **Last commit only**: Cannot regenerate older commits in history
- **No merge commits**: Does not work with merge commits
- **Requires git repo**: Must be run in a valid git repository

## Integration with Other Features

### Staged Notes System
```bash
# Add context notes first
genius --note "Fixes critical bug affecting enterprise customers"
genius --note "See internal ticket: JIRA-1234"

# Then regenerate with context
genius --regenerate
```

### Prefix Detection
```bash
# Works with branch-based prefix detection
git checkout -b feature/JR-1234-auth-fix
git commit -m "fix auth"

# Regenerate will include detected prefix
genius --regenerate
# Result: "[JR-1234] fix: resolve authentication timeout issue"
```

### Model Selection
```bash
# Use different AI model for regeneration
genius --regenerate --model gemini-2.5-pro

# Preview with specific model
genius -r -d -m gemini-2.5-flash
```

## Command Reference

```bash
# Basic usage
genius --regenerate              # Regenerate last commit message
genius -r                        # Short form

# With options
genius -r -d                     # Preview mode (dry run)
genius -r -m gemini-2.5-pro     # Use specific AI model
genius -r -p "PROJ-123"          # Override prefix detection

# With staged notes
genius -n "Context note"         # Add context
genius -r                        # Regenerate with context

# Combined workflow
genius -n "Fix for production bug" -r -d  # Add note and preview
```

The regenerate feature ensures you can maintain a clean, professional git history even when initial commits are written hastily or lack proper context.
