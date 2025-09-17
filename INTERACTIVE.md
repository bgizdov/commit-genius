# Interactive Mode

Interactive mode (`--interactive` / `-i`) provides a guided experience for adding context to your commit messages. Instead of remembering the `--note` syntax, you'll be prompted with specific questions to help capture the "why" behind your changes.

## Usage

```bash
# Basic interactive mode
genius --interactive
genius -i

# Interactive mode with dry run (preview only)
genius --interactive --dry-run
genius -i -d

# Interactive mode with specific model
genius -i -m gemini-2.5-pro
```

## How It Works

When you run interactive mode, Commit Genius will:

1. **Check for staged changes** (same as normal mode)
2. **Prompt you with guided questions** to gather context
3. **Save your responses as staged notes** automatically
4. **Generate commit message** using both diff and context
5. **Clear notes after successful commit** (as usual)

## Interactive Prompts

The interactive mode asks 5 focused questions to help you add meaningful context:

### 1. **Problem/Issue** ❓
- **Question**: "What issue or problem does this change solve?"
- **Example**: "Fixes login timeout for enterprise users"
- **Purpose**: Explains the root cause or motivation

### 2. **Environment/System** 🎯
- **Question**: "Which browser, environment, or system is affected?"
- **Example**: "Chrome on macOS", "Production environment", "Mobile Safari"
- **Purpose**: Specifies scope and impact

### 3. **References** 🔗
- **Question**: "Any issue numbers, tickets, or references?"
- **Example**: "Resolves #456", "Closes JIRA-1234", "See upstream bug #789"
- **Purpose**: Links to tracking systems and documentation

### 4. **Business Context** 💼
- **Question**: "Any business context or reasoning?"
- **Example**: "Critical for Q4 launch", "Customer requirement", "Security compliance"
- **Purpose**: Explains business importance and urgency

### 5. **Technical Details** 🔧
- **Question**: "Any technical details worth noting?"
- **Example**: "Temporary workaround until upstream fix", "Breaking change", "Performance improvement"
- **Purpose**: Captures technical nuances and implications

## Example Session

```bash
$ genius --interactive

🔍 Checking for staged changes...
📁 Files changed: 2

🤔 Interactive mode: Let's add context to make your commit message more meaningful!
💡 This helps explain WHY the change was made, not just WHAT changed.
📝 Press Enter to skip any question, or type "done" to finish early.

❓ What issue or problem does this change solve?
   e.g., "Fixes login timeout for enterprise users"
   > Fixes authentication crash when using SSO

   ✅ Added!

🎯 Which browser, environment, or system is affected?
   e.g., "Chrome on macOS", "Production environment", "Mobile Safari"
   > Chrome and Firefox on production

   ✅ Added!

🔗 Any issue numbers, tickets, or references?
   e.g., "Resolves #456", "Closes JIRA-1234", "See upstream bug #789"
   > Resolves #1234

   ✅ Added!

💼 Any business context or reasoning?
   e.g., "Critical for Q4 launch", "Customer requirement", "Security compliance"
   > Critical for enterprise customers

   ✅ Added!

🔧 Any technical details worth noting?
   e.g., "Temporary workaround until upstream fix", "Breaking change", "Performance improvement"
   > 

   ⏭️  Skipped.

🎉 Added 4 context notes! This will help generate a more meaningful commit message.

📝 Using 4 staged notes for context
🤖 Generating commit message with AI...

📝 Generated commit message:
   fix: resolve SSO authentication crash in Chrome/Firefox (resolves #1234)

🚀 Committing changes...
✅ Successfully committed changes!
🗑️  Cleared staged notes after successful commit
```

## Benefits

### 🎯 **User Experience**
- ✅ **Guided process**: No need to remember `--note` syntax
- ✅ **Focused questions**: Structured prompts for better context
- ✅ **Skip flexibility**: Press Enter to skip irrelevant questions
- ✅ **Early exit**: Type "done" to finish early
- ✅ **Visual feedback**: Clear confirmation when notes are added

### 📝 **Better Commit Messages**
- ✅ **Rich context**: Captures business and technical reasoning
- ✅ **Consistent format**: Structured approach ensures completeness
- ✅ **Issue linking**: Prompts for ticket numbers and references
- ✅ **Environment details**: Captures browser/system specifics

### 🔄 **Workflow Integration**
- ✅ **Works with all modes**: Compatible with `--dry-run`, `--regenerate`, etc.
- ✅ **Automatic cleanup**: Notes cleared after successful commit
- ✅ **Prefix detection**: Still works with branch-based prefixes
- ✅ **Model selection**: Can specify AI model as usual

## Use Cases

### 🚀 **New Developers**
- Learn what context makes commit messages meaningful
- Guided approach to writing better commits
- No need to memorize command-line options

### 👥 **Team Standardization**
- Consistent approach to gathering commit context
- Ensures important details aren't forgotten
- Improves overall commit message quality

### 🔧 **Complex Changes**
- Multi-faceted changes that affect different systems
- Changes requiring business justification
- Bug fixes with specific environmental conditions

### ⚡ **Quick Context Addition**
- Faster than multiple `--note` commands
- Interactive prompts remind you of important details
- Skip irrelevant questions with Enter

## Comparison: Manual vs Interactive

### Manual Note Addition
```bash
genius --note "Fixes authentication crash when using SSO"
genius --note "Chrome and Firefox on production"
genius --note "Resolves #1234"
genius --note "Critical for enterprise customers"
genius
```

### Interactive Mode
```bash
genius --interactive
# Guided prompts walk you through the same information
# More user-friendly and less error-prone
```

## Advanced Usage

### Combine with Other Options
```bash
# Interactive mode with dry run
genius -i -d

# Interactive mode with specific model
genius -i -m gemini-2.5-pro

# Interactive mode with prefix override
genius -i -p "HOTFIX-123"

# Interactive regeneration (prompts for additional context)
genius -r -i
```

### Early Exit
```bash
# Type "done" at any prompt to finish early
❓ What issue or problem does this change solve?
   > Fixes login bug
   ✅ Added!

🎯 Which browser, environment, or system is affected?
   > done
✋ Finishing interactive mode early.
```

### Timeout Handling
- Each prompt has a 30-second timeout
- If no input is provided, the question is automatically skipped
- Prevents hanging in automated environments

Interactive mode makes it easy to add rich context to your commits, ensuring your git history tells the complete story of why changes were made, not just what was changed.
