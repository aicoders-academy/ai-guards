import * as fs from 'fs-extra';
import * as path from 'path';
import * as glob from 'glob';

/**
 * Generates a unique plan ID in the format "plan-XXX"
 * where XXX is a three-digit number (e.g., plan-001)
 * Ensures the ID doesn't clash with existing plans
 */
export function generatePlanId(): string {
  // Find existing plan IDs
  const plansDir = path.join(process.cwd(), '.ai-guards', 'plans');
  
  // Create plans directory if it doesn't exist
  if (!fs.existsSync(plansDir)) {
    fs.mkdirSync(plansDir, { recursive: true });
    return 'plan-001'; // First plan
  }
  
  try {
    // Get existing plan files
    const planFiles = glob.sync('*.mdc', { cwd: plansDir });
    
    // Extract existing IDs
    const existingIds = new Set<number>();
    
    planFiles.forEach(file => {
      const match = file.match(/plan-(\d{3})/);
      if (match && match[1]) {
        existingIds.add(parseInt(match[1], 10));
      }
    });
    
    // Find the next available ID
    let nextId = 1;
    while (existingIds.has(nextId) && nextId <= 999) {
      nextId++;
    }
    
    // Ensure we haven't exceeded the limit
    if (nextId > 999) {
      throw new Error('Maximum number of plans (999) reached. Archive some plans.');
    }
    
    // Format the ID with leading zeros
    const paddedId = nextId.toString().padStart(3, '0');
    return `plan-${paddedId}`;
  } catch (error) {
    console.error('Error generating plan ID:', error);
    
    // Fallback to random ID if there's an error
    const randomNum = Math.floor(Math.random() * 999) + 1;
    const paddedNum = randomNum.toString().padStart(3, '0');
    return `plan-${paddedNum}`;
  }
} 