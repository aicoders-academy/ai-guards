import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Get the current git user's name and email
 * @returns A promise that resolves to an object containing the user's name and email
 */
export async function getGitUser(): Promise<{ name: string; email: string }> {
  try {
    // Get the user's name from git config
    const { stdout: nameStdout } = await execAsync('git config user.name');
    const name = nameStdout.trim();

    // Get the user's email from git config
    const { stdout: emailStdout } = await execAsync('git config user.email');
    const email = emailStdout.trim();

    return { name, email };
  } catch (error) {
    // Return empty strings if git commands fail
    console.warn('Failed to get git user information:', error);
    return { name: '', email: '' };
  }
} 