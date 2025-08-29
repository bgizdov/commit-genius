#!/usr/bin/env node

import { GoogleGenerativeAI } from '@google/generative-ai';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load environment variables
dotenv.config();

const execAsync = promisify(exec);

interface CommitMessageOptions {
  dryRun?: boolean;
  model?: string;
}

class AICommitGenerator {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(apiKey: string, modelName?: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    // Precedence: provided modelName > GEMINI_MODEL env var > default
    const selectedModel = modelName || process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite';
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
      
      const commitMessage = await this.generateCommitMessage(diff);
      
      console.log('\n📝 Generated commit message:');
      console.log(`   ${commitMessage}`);
      
      if (options.dryRun) {
        console.log('\n🔍 Dry run mode - not committing changes');
        return;
      }

      console.log('\n🚀 Committing changes...');
      await this.commitChanges(commitMessage);
      
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

  // Parse model option (CLI flag takes precedence over env var)
  const modelIndex = args.findIndex(arg => arg === '--model' || arg === '-m');
  const model = modelIndex !== -1 && args[modelIndex + 1] ? args[modelIndex + 1] : undefined;

  if (help) {
    console.log(`
Commit Genius

Usage:
  genius [options]
  npm run commit [options]

Options:
  --dry-run, -d         Generate commit message without committing
  --model, -m <model>   Specify Gemini model to use (default: gemini-2.5-flash-lite)
  --help, -h            Show this help message

Available Models:
  gemini-2.5-flash-lite         # Default - Fast and efficient
  gemini-2.5-flash              # Balanced performance
  gemini-2.5-pro                # Most capable
  gemini-2.5-flash-image-preview # With image support

Environment:
  GEMINI_API_KEY   Your Google Gemini API key (required)
  GEMINI_MODEL     Default model to use (optional, default: gemini-2.5-flash-lite)

Examples:
  genius                                 # Use model from GEMINI_MODEL env or default
  genius --dry-run                       # Generate message only
  genius --model gemini-2.5-pro         # Override with Pro model
  npm run commit                         # Generate and commit
`);
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error('❌ Error: GEMINI_API_KEY environment variable is required');
    console.error('Please create a .env file with your Gemini API key:');
    console.error('   GEMINI_API_KEY=your_api_key_here');
    process.exit(1);
  }

  const generator = new AICommitGenerator(apiKey, model);
  await generator.run({ dryRun, model });
}

// Run the main function
if (require.main === module) {
  main().catch((error) => {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  });
}

export { AICommitGenerator };
