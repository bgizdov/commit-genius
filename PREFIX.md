# Commit Message Prefix Feature

Commit Genius supports automatic prefix addition to commit messages, perfect for teams using issue tracking systems like Jira, GitHub Issues, Linear, or Azure DevOps.

## 🎯 **Output Examples**

```bash
# Without prefix
feat: add user authentication

# With prefix (brackets format - default)
[JR-1234] feat: add user authentication

# With prefix (colon format)
JR-1234: feat: add user authentication
```

## ⚙️ **Configuration Methods**

### **1. CLI Flag (Per-Commit Override)**
```bash
genius --prefix "JR-1234"
genius -p "PROJ-567"
genius -p "PROJ-567" -m gemini-2.5-pro  # With custom model
```

### **2. Automatic Branch Detection (Default Behavior)**
The tool automatically extracts prefixes from common branch naming patterns:

| Branch Name | Extracted Prefix |
|-------------|------------------|
| `feature/JR-1234-add-auth` | `JR-1234` |
| `bugfix/PROJ-567-fix-bug` | `PROJ-567` |
| `hotfix/ABC-123-critical` | `ABC-123` |
| `JR-1234-description` | `JR-1234` |
| `PROJ567-feature` | `PROJ567` |

## 🎨 **Prefix Formats**

### **Brackets Format (Default)**
```bash
[JR-1234] feat: add user authentication
[PROJ-567] fix: resolve memory leak
```

### **Colon Format**
```bash
JR-1234: feat: add user authentication
PROJ-567: fix: resolve memory leak
```

Configure format in global config:
```json
{
  "apiKey": "your_api_key_here",
  "model": "gemini-2.5-pro",
  "prefixFormat": "brackets",  // or "colon"
  "autoPrefixFromBranch": true
}
```

## ✅ **Prefix Validation**

The tool validates prefixes against common patterns and warns about invalid formats:

### **Valid Patterns**
- `JR-1234` (Jira-style)
- `PROJ-567` (Project-number)
- `PROJ567` (No hyphen)
- `#123` (GitHub issues)
- `ABC-1234` (Custom format)

### **Invalid Examples**
- `jr-1234` (lowercase - will warn but still use)
- `123` (numbers only - will warn)
- `feature-branch` (no numbers - will warn)

## 🔄 **Precedence Order**

1. **CLI Flag** (`--prefix "JR-1234"`) - Explicit per-commit override
2. **Branch Detection** (automatic extraction from branch name)
3. **No Prefix** - Default when no prefix is detected or specified

**Note**: Prefixes are dynamic per commit and not stored in configuration files or environment variables. This ensures each commit gets the appropriate prefix for its specific ticket/issue.

## 🌿 **Branch Detection Patterns**

The tool recognizes these common Git flow patterns:

```bash
# Standard Git flow
feature/JR-1234-description    → JR-1234
bugfix/PROJ-567-fix-issue      → PROJ-567
hotfix/ABC-123-critical-fix    → ABC-123
chore/DEV-456-update-deps      → DEV-456

# Simple patterns
JR-1234                        → JR-1234
JR-1234-add-feature           → JR-1234
PROJ567-description           → PROJ567

# Custom prefixes
feature/TEAM-999-new-feature  → TEAM-999
```

## 🚀 **Usage Examples**

### **Team Workflow with Jira**
```bash
# 1. Create branch
git checkout -b feature/JR-1234-add-authentication

# 2. Make changes and stage
git add .

# 3. Generate commit (auto-detects JR-1234)
genius
# Output: [JR-1234] feat: add user authentication system

# 4. Override for specific commit
genius --prefix "JR-5678"
# Output: [JR-5678] feat: add user authentication system
```

### **GitHub Issues Workflow**
```bash
# Use CLI flag for specific GitHub issue
genius --prefix "#123"
# Output: [#123] fix: resolve login validation bug

# Or use branch naming for automatic detection
git checkout -b feature/#123-fix-login
genius  # Auto-detects #123
```

### **Multiple Projects with Different Tickets**
```bash
# Project A - working on ticket JR-1234
git checkout -b feature/JR-1234-add-auth
genius  # Auto-detects JR-1234

# Project B - working on different ticket
git checkout -b bugfix/PROJ-567-fix-bug
genius  # Auto-detects PROJ-567

# Override when needed
genius --prefix "HOTFIX-999"  # For emergency fixes
```

## 🔧 **Configuration Examples**

### **Global Config for Team**
```json
{
  "apiKey": "your_api_key_here",
  "model": "gemini-2.5-pro",
  "prefixFormat": "colon",
  "autoPrefixFromBranch": true
}
```

### **Project-Specific .env**
```bash
# .env file in project root
COMMIT_GENIUS_API_KEY=your_api_key_here
COMMIT_GENIUS_MODEL=gemini-2.5-flash

# Note: No prefix configuration - use branch naming or CLI flags
# Example branch: feature/MYPROJECT-123-add-feature
```

## 🎯 **Best Practices**

1. **Use branch naming conventions** - Let the tool auto-detect prefixes from branch names
2. **Consistent branch naming** - Establish team conventions like `feature/TICKET-123-description`
3. **CLI override for edge cases** - Use `--prefix` for hotfixes or special commits
4. **Configure prefix format** - Set team-wide preference for brackets vs colon format
5. **No static configuration** - Avoid storing prefixes in config files; keep them dynamic per commit

## 🔍 **Troubleshooting**

### **Prefix not detected from branch**
- Check branch name matches supported patterns
- Enable debug: the tool shows what it detects
- Manually specify with `--prefix`

### **Wrong prefix format**
- Set `prefixFormat` in global config
- Use `brackets` or `colon` format

### **Validation warnings**
- Warnings don't prevent usage
- Consider adjusting prefix to match common patterns
- Team can define custom validation rules

This feature makes Commit Genius perfect for teams that need to track commits against specific tickets, issues, or stories in their project management tools!
