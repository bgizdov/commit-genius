# Commit Genius

A TypeScript-based command-line tool that generates AI-powered commit messages using Google's Gemini model and automatically commits your staged changes.

## Features

- 🤖 **AI-Powered**: Uses Google Gemini 2.5 models to generate contextually relevant commit messages
- 📝 **Conventional Commits**: Follows conventional commit message format (type(scope): description)
- 🔍 **Context Aware**: Analyzes your actual git diff to understand what changed
- ⚡ **Fast & Simple**: One command to generate and commit
- 🛡️ **Type Safe**: Built with TypeScript for reliability
- 🔧 **Configurable**: Supports dry-run mode and various options

## Installation

### Local Installation

1. Clone or create the project:
```bash
git clone <repository-url>
cd commit-genius
```

2. Install dependencies:
```bash
npm install
```

3. Set up your environment:
```bash
cp .env.example .env
# Edit .env and add your Gemini API key
```

### Global Installation

```bash
npm install -g .
```

**Important**: When using the global installation, you need to export the API key as an environment variable since there's no local `.env` file:

```bash
# Add to your shell profile (~/.bashrc, ~/.zshrc, etc.)
export COMMIT_GENIUS_API_KEY="your_gemini_api_key_here"
export COMMIT_GENIUS_MODEL="gemini-2.5-flash-lite"  # Optional: set default model

# Or set temporarily for current session
export COMMIT_GENIUS_API_KEY="your_gemini_api_key_here"
```

## Setup

1. **Get a Gemini API Key**:
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Copy the key

2. **Configure Environment**:

   **For Local Installation:**
   - Copy `.env.example` to `.env`
   - Add your API key: `COMMIT_GENIUS_API_KEY=your_api_key_here`
   - Optionally set your preferred model: `COMMIT_GENIUS_MODEL=gemini-2.5-pro`

   **For Global Installation:**
   - Export environment variables in your shell:
   ```bash
   # Add to ~/.bashrc, ~/.zshrc, or ~/.bash_profile
   export COMMIT_GENIUS_API_KEY="your_gemini_api_key_here"
   export COMMIT_GENIUS_MODEL="gemini-2.5-pro"  # Optional

   # Then reload your shell or run:
   source ~/.zshrc  # or ~/.bashrc
   ```

## Usage

### Quick Start (Global Installation)

If you installed globally, make sure your API key is exported:
```bash
# Check if API key is set
echo $COMMIT_GENIUS_API_KEY

# If not set, export it
export COMMIT_GENIUS_API_KEY="your_api_key_here"

# Then use anywhere
cd /path/to/your/project
git add .
genius
```

### Basic Usage

1. Stage your changes:
```bash
git add .
```

2. Generate and commit:
```bash
# If installed locally
npm run commit

# If installed globally
genius
```

### Options

```bash
# Dry run - generate message without committing
genius --dry-run
genius -d

# Use specific Gemini model
genius --model gemini-2.5-pro
genius -m gemini-2.5-flash

# Show help
genius --help
genius -h
```

### Example Workflow

```bash
# Make your changes
echo "console.log('Hello World');" > hello.js

# Stage the changes
git add hello.js

# Generate AI commit message and commit
npm run commit
```

Output:
```
🔍 Checking for staged changes...
🤖 Generating commit message with AI...

📝 Generated commit message:
   feat: add hello world console log

🚀 Committing changes...
✅ Successfully committed changes!
```

## Shell Aliases

For even faster workflow, you can create shell aliases that combine `git add .` and `genius`:

### Recommended Aliases

Add any of these to your shell profile (`~/.bashrc`, `~/.zshrc`, etc.):

```bash
# Short and sweet
alias ag="git add . && genius"          # "add genius"
alias gadd="git add . && genius"        # "git add genius"

# Creative and memorable
alias magic="git add . && genius"       # Magic commit
alias brain="git add . && genius"       # Brain-powered commit
alias ai="git add . && genius"          # AI commit
alias zen="git add . && genius"         # Zen commit
```

### Usage with Aliases

```bash
# Make your changes
echo "new feature" >> app.js

# One command to stage and commit with AI
ag          # or magic, brain, ai, zen, gadd

# Output:
# 🔍 Checking for staged changes...
# 🌿 Auto-detected prefix from branch "feature/JR-1234-add-auth": JR-1234
# 🤖 Generating commit message with AI...
# 📝 Generated commit message: [JR-1234] feat: add new authentication feature
# 🚀 Committing changes...
# ✅ Successfully committed changes!
```

### Setting Up Aliases

```bash
# Add to your shell profile
echo 'alias ag="git add . && genius"' >> ~/.zshrc
echo 'alias magic="git add . && genius"' >> ~/.zshrc

# Reload your shell
source ~/.zshrc
```

## Available Gemini Models

The tool supports multiple Gemini 2.5 models with different capabilities:

| Model | Description | Use Case |
|-------|-------------|----------|
| `gemini-2.5-flash-lite` | **Default** - Fast and efficient | Quick commits, daily development |
| `gemini-2.5-flash` | Balanced performance and quality | General purpose commit messages |
| `gemini-2.5-pro` | Most capable and detailed | Complex changes, detailed analysis |
| `gemini-2.5-flash-image-preview` | Includes image understanding | Projects with visual assets |

### Model Selection Examples

```bash
# Use default model (flash-lite) or from GEMINI_MODEL env var
genius

# Use Pro model for complex changes (overrides env var)
genius --model gemini-2.5-pro

# Use Flash for balanced performance
genius --model gemini-2.5-flash
```

## Model Configuration

You can configure your preferred model in three ways, with the following precedence order:

1. **CLI Flag** (highest priority): `--model gemini-2.5-pro`
2. **Environment Variable**: `GEMINI_MODEL=gemini-2.5-pro` in your `.env` file
3. **Default**: `gemini-2.5-flash-lite` (if nothing else is specified)

### Setting a Default Model

To avoid specifying the model with every command, set it in your `.env` file:

```bash
# .env file
COMMIT_GENIUS_API_KEY=your_api_key_here
COMMIT_GENIUS_MODEL=gemini-2.5-pro
```

Now `genius` will use `gemini-2.5-pro` by default, but you can still override it:

```bash
genius                                 # Uses gemini-2.5-pro (from .env)
genius --model gemini-2.5-flash       # Overrides to use flash model
```

## How It Works

1. **Checks for staged changes** using `git diff --cached`
2. **Analyzes the diff** to understand what code changed
3. **Sends the diff to Gemini** with a carefully crafted prompt
4. **Generates a conventional commit message** following best practices
5. **Automatically commits** using `git commit -m "generated message"`

## Commit Message Format

The tool generates commit messages following the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
type(scope): description

Examples:
feat: add user authentication
fix: resolve memory leak in data processing
docs: update API documentation
refactor: simplify error handling logic
```

## Supported Commit Types

- `feat`: New features
- `fix`: Bug fixes
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements
- `ci`: CI/CD changes
- `build`: Build system changes

## Error Handling

The tool handles various error scenarios gracefully:

- ❌ Missing API key
- ❌ No staged changes
- ❌ Git command failures
- ❌ API request failures
- ❌ Invalid responses

## Development

### Build

```bash
npm run build
```

### Development Mode

```bash
npm run dev
```

### Project Structure

```
commit-genius/
├── src/
│   └── index.ts          # Main CLI application
├── dist/                 # Compiled JavaScript (generated)
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── .env.example          # Environment template
└── README.md            # This file
```

## Requirements

- Node.js >= 18.0.0
- Git repository
- Google Gemini API key

## License

MIT

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Troubleshooting

### "No staged changes found"
Make sure to stage your changes first:
```bash
git add <files>
```

### "API key environment variable is required"

**For Local Installation:**
1. Create a `.env` file in the project root
2. Add your API key: `COMMIT_GENIUS_API_KEY=your_key_here`
3. Optionally set your preferred model: `COMMIT_GENIUS_MODEL=gemini-2.5-pro`

**For Global Installation:**
1. Export the environment variable:
```bash
export COMMIT_GENIUS_API_KEY="your_key_here"
export COMMIT_GENIUS_MODEL="gemini-2.5-pro"  # Optional
```
2. Add to your shell profile to make it permanent:
```bash
echo 'export COMMIT_GENIUS_API_KEY="your_key_here"' >> ~/.zshrc
source ~/.zshrc
```

**Legacy Support:**
The old `GEMINI_API_KEY` and `GEMINI_MODEL` variables still work for backward compatibility, but `COMMIT_GENIUS_*` variables take precedence.

### "Failed to get git diff"
Ensure you're in a git repository:
```bash
git init  # If not already a git repo
```

## Future Enhancements

We're planning to expand the AI model support to give you more options for generating commit messages. Here's our roadmap:

### 🤖 Additional AI Provider Support

- [ ] **OpenAI Integration**
  - [ ] GPT-4 support
  - [ ] GPT-3.5-turbo support
  - [ ] Configurable model selection

- [ ] **DeepSeek Models**
  - [ ] DeepSeek Coder integration
  - [ ] DeepSeek Chat support

- [ ] **Local LLM Support**
  - [ ] Ollama integration for local models
  - [ ] Support for popular local models (CodeLlama, Mistral, etc.)
  - [ ] Offline commit message generation

### 🔧 Configuration Enhancements

- [ ] **Multi-provider Configuration**
  - [ ] Provider selection via CLI flags (`--provider openai`)
  - [ ] Default provider configuration in `.env`
  - [ ] Fallback provider support

- [ ] **Advanced Features**
  - [ ] Custom commit message templates
  - [ ] Multi-language commit messages
  - [ ] Integration with conventional commit scopes
  - [ ] Commit message history and learning

### 📋 Planned Usage

Once implemented, you'll be able to use different providers like:

```bash
# Use OpenAI GPT-4
genius --provider openai --model gpt-4

# Use local Ollama model
genius --provider ollama --model codellama

# Use DeepSeek
genius --provider deepseek --model deepseek-coder
```

**Note**: These features are planned for future releases. Currently, only Google Gemini is supported.
