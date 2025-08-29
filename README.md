# AI Commit Message Generator

A TypeScript-based command-line tool that generates AI-powered commit messages using Google's Gemini model and automatically commits your staged changes.

## Features

- 🤖 **AI-Powered**: Uses Google Gemini 1.5 Flash to generate contextually relevant commit messages
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
cd ai-commit-message
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

## Setup

1. **Get a Gemini API Key**:
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Copy the key

2. **Configure Environment**:
   - Copy `.env.example` to `.env`
   - Add your API key: `GEMINI_API_KEY=your_api_key_here`

## Usage

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
ai-commit
```

### Options

```bash
# Dry run - generate message without committing
ai-commit --dry-run
ai-commit -d

# Show help
ai-commit --help
ai-commit -h
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
ai-commit-message/
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

### "GEMINI_API_KEY environment variable is required"
1. Create a `.env` file in the project root
2. Add your API key: `GEMINI_API_KEY=your_key_here`

### "Failed to get git diff"
Ensure you're in a git repository:
```bash
git init  # If not already a git repo
```
