# Commit Genius Configuration

Commit Genius supports multiple configuration methods with the following precedence order:

## Configuration Precedence (Highest to Lowest)

1. **CLI Flags** - `--model gemini-2.5-pro`
2. **Environment Variables** - `COMMIT_GENIUS_API_KEY`, `COMMIT_GENIUS_MODEL`
3. **Global Config File** - `~/.commit-genius.json`
4. **Legacy Environment Variables** - `GEMINI_API_KEY`, `GEMINI_MODEL`
5. **Default Values** - `gemini-2.5-flash-lite`

## Global Config File

### Location Options
The tool looks for config files in these locations (in order):
- `~/.commit-genius.json`
- `~/.config/commit-genius/config.json`
- `~/.config/commit-genius.json`

### Creating Config File

#### Option 1: Use --init command
```bash
genius --init
```

#### Option 2: Create manually
```bash
# Create the config file
cat > ~/.commit-genius.json << EOF
{
  "apiKey": "your_gemini_api_key_here",
  "model": "gemini-2.5-pro"
}
EOF
```

### Config File Format
```json
{
  "apiKey": "your_gemini_api_key_here",
  "model": "gemini-2.5-flash-lite"
}
```

### Available Models
- `gemini-2.5-flash-lite` (default)
- `gemini-2.5-flash`
- `gemini-2.5-pro`
- `gemini-2.5-flash-image-preview`

## Environment Variables

### New (Recommended)
```bash
export COMMIT_GENIUS_API_KEY="your_api_key_here"
export COMMIT_GENIUS_MODEL="gemini-2.5-pro"
```

### Legacy (Still Supported)
```bash
export GEMINI_API_KEY="your_api_key_here"
export GEMINI_MODEL="gemini-2.5-pro"
```

## Usage Examples

### Global Installation with Config File
```bash
# 1. Install globally
npm install -g commit-genius

# 2. Create config file
genius --init
# or manually create ~/.commit-genius.json

# 3. Use anywhere
cd /any/project
git add .
genius
```

### Local Installation with .env
```bash
# 1. In your project
npm install commit-genius

# 2. Create .env file
cp .env.example .env
# Edit .env with your API key

# 3. Use in project
npm run commit
```

### Override with CLI
```bash
# Use different model for this commit
genius --model gemini-2.5-pro

# Dry run with specific model
genius --dry-run --model gemini-2.5-flash
```

## Benefits of Global Config File

✅ **No environment variables needed** - Clean shell profile
✅ **Persistent settings** - Survives shell restarts
✅ **Easy to edit** - Simple JSON format
✅ **Multiple locations** - Flexible placement
✅ **Version control friendly** - Can be shared across machines
✅ **Secure** - File permissions can be restricted

## Troubleshooting

### Config file not found
The tool will work without a config file, falling back to environment variables and defaults.

### Invalid JSON
If the config file has invalid JSON, the tool will show a warning and continue with other configuration methods.

### Permission issues
Make sure the config file is readable:
```bash
chmod 600 ~/.commit-genius.json
```
