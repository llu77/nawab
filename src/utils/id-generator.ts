
// utils/id-generator.ts

/**
 * Generates a unique patient ID in the format XX-###.
 * e.g., AB-123
 */
export function generatePatientId(): string {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  
  const randomLetters = Array.from({ length: 2 }, () => letters[Math.floor(Math.random() * letters.length)]).join('');
  const randomNumbers = Array.from({ length: 3 }, () => numbers[Math.floor(Math.random() * numbers.length)]).join('');

  return `${randomLetters}-${randomNumbers}`;
}

    
