# Dynamic Prefixes Design Decision

## 🎯 **Why Prefixes Are Dynamic, Not Static**

Commit Genius uses a **dynamic prefix approach** where prefixes are determined per-commit rather than stored in configuration files. This design decision reflects the reality of how development teams work with issue tracking systems.

### **What Remains (Dynamic)**
- ✅ `--prefix "JR-1234"` CLI flag for per-commit specification
- ✅ Automatic branch detection (e.g., `feature/JR-1234-description`)
- ✅ `prefixFormat` and `autoPrefixFromBranch` configuration options

## 🧠 **Rationale**

### **1. Prefixes Correspond to Specific Work Items**
```bash
# Different commits = Different tickets
git commit -m "[JR-1234] feat: add user authentication"
git commit -m "[JR-5678] fix: resolve login bug"  
git commit -m "[JR-9999] docs: update API documentation"
```

Each commit typically relates to a specific:
- Jira ticket (JR-1234)
- GitHub issue (#123)
- Linear story (LIN-456)
- Azure DevOps work item (AB-789)

### **2. Static Configuration Creates Problems**

#### **Problem: One Prefix Per Repository**
```bash
# BAD: Static config forces same prefix for all commits
export COMMIT_GENIUS_PREFIX="JR-1234"
git commit -m "[JR-1234] feat: add auth"      # Correct
git commit -m "[JR-1234] fix: unrelated bug"  # Wrong ticket!
```

#### **Problem: Forgotten Updates**
```bash
# Developer forgets to update static config
export COMMIT_GENIUS_PREFIX="JR-1234"  # Set weeks ago

# Now working on different ticket but commits still use old prefix
git commit -m "[JR-1234] fix: payment processing"  # Should be JR-5678!
```

#### **Problem: Multi-Developer Conflicts**
```bash
# Developer A working on JR-1234
export COMMIT_GENIUS_PREFIX="JR-1234"

# Developer B working on JR-5678 on same machine
export COMMIT_GENIUS_PREFIX="JR-5678"  # Overwrites A's setting

# Developer A's next commit gets wrong prefix
```

### **3. Dynamic Approach Solves These Issues**

#### **Branch-Based Detection (Recommended)**
```bash
# Branch name encodes the ticket
git checkout -b feature/JR-1234-add-auth
genius  # Auto-detects JR-1234

git checkout -b bugfix/JR-5678-fix-payment  
genius  # Auto-detects JR-5678
```

#### **Explicit Per-Commit Control**
```bash
# Override when branch detection isn't enough
genius --prefix "HOTFIX-999"  # Emergency fix
genius --prefix "#123"        # GitHub issue
genius --prefix "PROJ-567"    # Different project
```

## 🔄 **Workflow Comparison**

### **❌ Static Configuration (Problematic)**
```bash
# Setup (error-prone)
export COMMIT_GENIUS_PREFIX="JR-1234"

# Development
git add .
genius  # Always uses JR-1234

# Switch to different ticket (easy to forget)
export COMMIT_GENIUS_PREFIX="JR-5678"  # Manual update required
git add .
genius  # Now uses JR-5678
```

### **✅ Dynamic Configuration (Robust)**
```bash
# Setup (one-time)
git checkout -b feature/JR-1234-add-auth

# Development
git add .
genius  # Auto-detects JR-1234 from branch

# Switch to different ticket (automatic)
git checkout -b bugfix/JR-5678-fix-payment
git add .
genius  # Auto-detects JR-5678 from new branch
```

## 🎯 **Best Practices with Dynamic Prefixes**

### **1. Use Consistent Branch Naming**
```bash
# Team conventions
feature/TICKET-123-description
bugfix/TICKET-456-description  
hotfix/TICKET-789-description
chore/TICKET-999-description
```

### **2. CLI Override for Edge Cases**
```bash
# Multiple tickets in one commit
genius --prefix "JR-1234,JR-5678"

# Emergency fixes without proper branch
genius --prefix "HOTFIX-$(date +%Y%m%d)"

# Cross-project work
genius --prefix "SHARED-COMPONENT-123"
```

### **3. Configure Format Preferences**
```json
{
  "prefixFormat": "brackets",        // [JR-1234] or JR-1234:
  "autoPrefixFromBranch": true      // Enable/disable detection
}
```

## 🏆 **Benefits of Dynamic Approach**

1. **✅ Accuracy**: Each commit gets the correct prefix for its work item
2. **✅ Automation**: Branch naming conventions enable automatic detection  
3. **✅ Flexibility**: CLI override available for special cases
4. **✅ Team Friendly**: No shared configuration to manage or conflict
5. **✅ Scalability**: Works across multiple projects and repositories
6. **✅ Maintainability**: No stale configuration to update or remember

## 🔧 **Migration Guide**

### **If You Were Using Static Configuration**

#### **Old Way (Remove This)**
```bash
# Remove from shell profile
export COMMIT_GENIUS_PREFIX="JR-1234"

# Remove from .env files  
COMMIT_GENIUS_PREFIX=JR-1234
```

#### **New Way (Adopt This)**
```bash
# Option 1: Use branch naming
git checkout -b feature/JR-1234-description
genius  # Auto-detects

# Option 2: Use CLI flag
genius --prefix "JR-1234"

# Option 3: Configure format only
echo '{"prefixFormat": "brackets", "autoPrefixFromBranch": true}' > ~/.commit-genius.json
```

This design ensures that commit prefixes accurately reflect the work being done, reducing errors and improving traceability in issue tracking systems.
