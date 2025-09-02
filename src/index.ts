#!/usr/bin/env node

import { GoogleGenerativeAI } from '@google/generative-ai';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

// Load environment variables
dotenv.config();

const execAsync = promisify(exec);

interface Config {
  apiKey?: string;
  model?: string;
  prefixFormat?: 'brackets' | 'colon';
  autoPrefixFromBranch?: boolean;
}

function loadGlobalConfig(): Config {
  const configPaths = [
    path.join(os.homedir(), '.commit-genius.json'),
    path.join(os.homedir(), '.config', 'commit-genius', 'config.json'),
    path.join(os.homedir(), '.config', 'commit-genius.json')
  ];

  for (const configPath of configPaths) {
    try {
      if (fs.existsSync(configPath)) {
        const configContent = fs.readFileSync(configPath, 'utf8');
        const config = JSON.parse(configContent);
        console.log(`📄 Using config from: ${configPath}`);
        return config;
      }
    } catch (error) {
      console.warn(`⚠️  Warning: Failed to parse config file ${configPath}:`, error instanceof Error ? error.message : error);
    }
  }

  return {};
}

function getApiKey(): string | undefined {
  // Precedence: env vars > global config
  return process.env.COMMIT_GENIUS_API_KEY ||
         process.env.GEMINI_API_KEY ||
         loadGlobalConfig().apiKey;
}

function getDefaultModel(): string {
  // Precedence: env vars > global config > hardcoded default
  return process.env.COMMIT_GENIUS_MODEL ||
         process.env.GEMINI_MODEL ||
         loadGlobalConfig().model ||
         'gemini-2.5-flash-lite';
}

async function getCurrentBranch(): Promise<string | null> {
  try {
    const { stdout } = await execAsync('git branch --show-current');
    return stdout.trim() || null;
  } catch (error) {
    return null;
  }
}

function extractPrefixFromBranch(branchName: string): string | null {
  // Common patterns for extracting prefix from branch names
  const patterns = [
    /^(?:feature|bugfix|hotfix|chore)\/([A-Z]+-\d+)/i,  // feature/JR-1234-description
    /^([A-Z]+-\d+)/i,                                   // JR-1234 or JR-1234-description
    /^(?:feature|bugfix|hotfix|chore)\/([A-Z]+\d+)/i,  // feature/PROJ567-description
    /^([A-Z]+\d+)/i                                     // PROJ567
  ];

  for (const pattern of patterns) {
    const match = branchName.match(pattern);
    if (match) {
      return match[1].toUpperCase();
    }
  }

  return null;
}

function validatePrefix(prefix: string): { valid: boolean; message?: string } {
  // Basic validation for common prefix formats
  const validPatterns = [
    /^[A-Z]+-\d+$/,     // JR-1234, PROJ-567
    /^[A-Z]+\d+$/,      // PROJ567, JR1234
    /^#\d+$/,           // #123 (GitHub issues)
    /^[A-Z]{2,}-\d+$/   // JIRA-1234
  ];

  const isValid = validPatterns.some(pattern => pattern.test(prefix));

  if (!isValid) {
    return {
      valid: false,
      message: `Prefix "${prefix}" doesn't match common patterns (e.g., JR-1234, PROJ567, #123)`
    };
  }

  return { valid: true };
}

async function getPrefix(cliPrefix?: string): Promise<string | null> {
  // Precedence: CLI flag > branch detection > none

  // 1. CLI flag (highest priority)
  if (cliPrefix) {
    const validation = validatePrefix(cliPrefix);
    if (!validation.valid) {
      console.warn(`⚠️  ${validation.message}`);
    }
    return cliPrefix;
  }

  // 2. Branch detection (if enabled in config or by default)
  const config = loadGlobalConfig();
  const autoPrefixFromBranch = config.autoPrefixFromBranch !== false; // Default to true
  if (autoPrefixFromBranch) {
    const currentBranch = await getCurrentBranch();
    if (currentBranch) {
      const branchPrefix = extractPrefixFromBranch(currentBranch);
      if (branchPrefix) {
        console.log(`🌿 Auto-detected prefix from branch "${currentBranch}": ${branchPrefix}`);
        return branchPrefix;
      }
    }
  }

  // 3. No prefix
  return null;
}

function formatCommitMessage(message: string, prefix: string | null, format: 'brackets' | 'colon' = 'brackets'): string {
  if (!prefix) {
    return message;
  }

  switch (format) {
    case 'brackets':
      return `[${prefix}] ${message}`;
    case 'colon':
      return `${prefix}: ${message}`;
    default:
      return `[${prefix}] ${message}`;
  }
}

function createGlobalConfig(apiKey: string, model?: string): void {
  const configPath = path.join(os.homedir(), '.commit-genius.json');
  const config: Config = {
    apiKey,
    ...(model && { model })
  };

  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log(`✅ Global config created at: ${configPath}`);
    console.log('📄 Config contents:');
    console.log(JSON.stringify(config, null, 2));
  } catch (error) {
    console.error('❌ Failed to create config file:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

interface CommitMessageOptions {
  dryRun?: boolean;
  model?: string;
  prefix?: string;
}

class AICommitGenerator {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(apiKey: string, modelName?: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    // Precedence: provided modelName > env vars > global config > default
    const selectedModel = modelName || getDefaultModel();
    this.model = this.genAI.getGenerativeModel({ model: selectedModel });
  }

  async getFileChangeSummary(): Promise<string> {
    try {
      // Get file change summary (much smaller than full diff)
      const { stdout } = await execAsync('git diff --cached --name-status');
      return stdout.trim();
    } catch (error) {
      throw new Error(`Failed to get file changes: ${error instanceof Error ? error.message : error}`);
    }
  }

  async checkStagedChanges(): Promise<string> {
    try {
      // First, get file change summary for large commits
      const fileChanges = await this.getFileChangeSummary();

      if (!fileChanges) {
        return '';
      }

      console.log('📁 Files changed:', fileChanges.split('\n').length);

      // Try to get the full diff, but handle large diffs intelligently
      try {
        const { stdout } = await execAsync('git diff --cached', { maxBuffer: 1024 * 1024 * 10 });
        const diff = stdout.trim();

        // If diff is very large, use file summary + limited diff
        const maxDiffLength = 30000; // ~30KB limit for AI processing
        if (diff.length > maxDiffLength) {
          console.log(`⚠️  Large diff detected (${Math.round(diff.length / 1024)}KB). Using file summary + limited diff for AI analysis...`);

          // Get a more concise diff with just file names and stats
          const { stdout: statDiff } = await execAsync('git diff --cached --stat');
          const { stdout: shortDiff } = await execAsync('git diff --cached --name-only');

          return `Files changed:
${fileChanges}

File statistics:
${statDiff}

Files modified:
${shortDiff}

Note: This is a large commit with ${Math.round(diff.length / 1024)}KB of changes.
The commit message is generated based on file changes rather than detailed diff content.`;
        }

        return diff;
      } catch (bufferError) {
        // If diff is too large even with increased buffer, fall back to file summary
        console.log('⚠️  Diff too large for processing. Using file change summary for AI analysis...');

        const { stdout: statDiff } = await execAsync('git diff --cached --stat');

        return `Files changed:
${fileChanges}

File statistics:
${statDiff}

Note: This is a very large commit. The commit message is generated based on file changes and statistics.`;
      }

    } catch (error) {
      throw new Error(`Failed to get git diff: ${error instanceof Error ? error.message : error}. Make sure you are in a git repository.`);
    }
  }

  async generateCommitMessage(diff: string): Promise<string> {
    const isFileSummary = diff.includes('Files changed:') || diff.includes('Note: This is a');

    const prompt = `
You are an expert developer who writes clear, concise commit messages following conventional commit format.

${isFileSummary ?
  'Analyze the following file changes and statistics to generate a single, well-formatted commit message.' :
  'Analyze the following git diff and generate a single, well-formatted commit message.'
}

Rules:
1. Use conventional commit format: type(scope): description
2. Types: feat, fix, docs, style, refactor, test, chore, perf, ci, build
3. Keep the description under 50 characters for the first line
4. Be specific about what changed based on ${isFileSummary ? 'file names and change types' : 'the actual code changes'}
5. Use present tense ("add" not "added")
6. Don't include "git commit -m" or quotes
7. Return ONLY the commit message, nothing else
8. ${isFileSummary ? 'Focus on the overall purpose based on file patterns (e.g., "docs: add README files", "feat: add new components")' : 'Focus on the specific code changes'}

${isFileSummary ? 'File changes and statistics:' : 'Git diff:'}
${diff}

Commit message:`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();
      
      // Clean up the response to ensure it's just the commit message
      const lines = text.split('\n');
      const commitMessage = lines[0].trim();
      
      // Remove any potential quotes or prefixes
      return commitMessage.replace(/^["']|["']$/g, '').replace(/^git commit -m\s*/, '');
    } catch (error) {
      throw new Error(`Failed to generate commit message: ${error}`);
    }
  }

  async commitChanges(message: string): Promise<void> {
    try {
      await execAsync(`git commit -m "${message}"`);
    } catch (error) {
      throw new Error(`Failed to commit changes: ${error}`);
    }
  }

  async run(options: CommitMessageOptions = {}): Promise<void> {
    try {
      console.log('🔍 Checking for staged changes...');

      const diff = await this.checkStagedChanges();

      if (!diff) {
        console.log('❌ No staged changes found. Please stage your changes first with:');
        console.log('   git add <files>');
        process.exit(1);
      }

      console.log('🤖 Generating commit message with AI...');

      let commitMessage = await this.generateCommitMessage(diff);

      // Get prefix and apply it to the commit message
      const prefix = await getPrefix(options.prefix);
      const config = loadGlobalConfig();
      const prefixFormat = config.prefixFormat || 'brackets';

      const finalMessage = formatCommitMessage(commitMessage, prefix, prefixFormat);

      console.log('\n📝 Generated commit message:');
      console.log(`   ${finalMessage}`);

      if (prefix) {
        console.log(`🏷️  Applied prefix: ${prefix} (format: ${prefixFormat})`);
      }

      if (options.dryRun) {
        console.log('\n🔍 Dry run mode - not committing changes');
        return;
      }

      console.log('\n🚀 Committing changes...');
      await this.commitChanges(finalMessage);

      console.log('✅ Successfully committed changes!');

    } catch (error) {
      console.error('❌ Error:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  }
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run') || args.includes('-d');
  const help = args.includes('--help') || args.includes('-h');
  const init = args.includes('--init');

  // Parse model option (CLI flag takes precedence over env var)
  const modelIndex = args.findIndex(arg => arg === '--model' || arg === '-m');
  const model = modelIndex !== -1 && args[modelIndex + 1] ? args[modelIndex + 1] : undefined;

  // Parse prefix option
  const prefixIndex = args.findIndex(arg => arg === '--prefix' || arg === '-p');
  const cliPrefix = prefixIndex !== -1 && args[prefixIndex + 1] ? args[prefixIndex + 1] : undefined;

  if (init) {
    console.log('🔧 Creating global config file...');
    console.log('');

    // Simple prompt for API key (in a real implementation, you might want to use a proper prompt library)
    console.log('Please provide your Gemini API key:');
    console.log('Get it from: https://makersuite.google.com/app/apikey');
    console.log('');
    console.log('You can also create the file manually at ~/.commit-genius.json:');
    console.log('{');
    console.log('  "apiKey": "your_gemini_api_key_here",');
    console.log('  "model": "gemini-2.5-flash-lite",');
    console.log('  "prefixFormat": "brackets",');
    console.log('  "autoPrefixFromBranch": true');
    console.log('}');
    console.log('');
    console.log('Note: Prefixes are dynamic per commit, not stored in config.');
    console.log('Use --prefix flag or branch naming conventions.');
    return;
  }

  if (help) {
    console.log(`
Commit Genius

Usage:
  genius [options]
  npm run commit [options]

Options:
  --dry-run, -d         Generate commit message without committing
  --model, -m <model>   Specify Gemini model to use (default: gemini-2.5-flash-lite)
  --prefix, -p <prefix> Prepend prefix to commit message (e.g., JR-1234)
  --init                Create global config file (~/.commit-genius.json)
  --help, -h            Show this help message

Available Models:
  gemini-2.5-flash-lite         # Default - Fast and efficient
  gemini-2.5-flash              # Balanced performance
  gemini-2.5-pro                # Most capable
  gemini-2.5-flash-image-preview # With image support

Configuration (in order of precedence):
  1. CLI flags (--model, --prefix)
  2. Environment variables:
     COMMIT_GENIUS_API_KEY    Your Google Gemini API key (required)
     COMMIT_GENIUS_MODEL      Default model to use (optional)
  3. Global config file (~/.commit-genius.json):
     { "apiKey": "your_key", "model": "gemini-2.5-pro", "prefixFormat": "brackets" }
  4. Branch detection (auto-extract from branch name like feature/JR-1234-desc)
  5. Legacy environment variables (still supported):
     GEMINI_API_KEY          Your Google Gemini API key
     GEMINI_MODEL            Default model

Prefix Configuration:
  --prefix, -p             Per-commit prefix (e.g., JR-1234, PROJ-567)
  Branch detection         Automatic extraction from branch names
  No static config         Prefixes are dynamic, not stored in config files

Examples:
  genius                                 # Auto-detect prefix from branch, use default model
  genius --dry-run                       # Generate message only
  genius --prefix "JR-1234"              # Add specific prefix to this commit
  genius --model gemini-2.5-pro         # Override with Pro model
  genius -p "PROJ-567" -m gemini-2.5-pro # Custom prefix and model for this commit
  npm run commit                         # Generate and commit
`);
    return;
  }

  const apiKey = getApiKey();

  if (!apiKey) {
    console.error('❌ Error: API key is required');
    console.error('Please set your Gemini API key using one of these methods:');
    console.error('');
    console.error('1. Environment variables:');
    console.error('   export COMMIT_GENIUS_API_KEY="your_api_key_here"');
    console.error('   export GEMINI_API_KEY="your_api_key_here"  # Legacy');
    console.error('');
    console.error('2. Global config file (~/.commit-genius.json):');
    console.error('   {');
    console.error('     "apiKey": "your_api_key_here",');
    console.error('     "model": "gemini-2.5-flash-lite",');
    console.error('     "prefixFormat": "brackets"');
    console.error('   }');
    console.error('');
    console.error('3. Local .env file (for project-specific setup):');
    console.error('   COMMIT_GENIUS_API_KEY=your_api_key_here');
    process.exit(1);
  }

  const generator = new AICommitGenerator(apiKey, model);
  await generator.run({ dryRun, model, prefix: cliPrefix });
}

// Run the main function
if (require.main === module) {
  main().catch((error) => {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  });
}

export { AICommitGenerator };
